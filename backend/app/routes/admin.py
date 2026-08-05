"""Authenticated internal administration endpoints.

Provision the first organizer with ADMIN_BOOTSTRAP_EMAIL and a bcrypt
ADMIN_BOOTSTRAP_PASSWORD_HASH. Plain-text passwords are never accepted from
environment configuration or written to the database.
"""
from datetime import datetime, timedelta, timezone
from typing import Literal, Optional
import os

import bcrypt
import jwt
from bson import ObjectId
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response
from fastapi.responses import StreamingResponse
from io import BytesIO, StringIO
import csv
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from pydantic import BaseModel, EmailStr, Field

from app.config import ADMIN_BOOTSTRAP_EMAIL, ADMIN_BOOTSTRAP_PASSWORD_HASH, ADMIN_JWT_SECRET
from app.mongodb import admin_users_collection, announcement_collection, audit_collection, registration_collection

router = APIRouter(prefix="/admin", tags=["Administration"])
Role = Literal["super_admin", "faculty", "student_spoc", "student_coordinator"]
COOKIE_NAME = "nmiet_admin_session"

ROLE_PERMISSIONS = {
    "super_admin": {"manage_registrations", "delete_registrations", "manage_announcements", "send_email", "manage_users", "export", "view_dashboard", "view_activity"},
    "faculty": {"manage_registrations", "export", "view_dashboard"},
    "student_spoc": {"manage_registrations", "view_dashboard", "export"},
    "student_coordinator": {"view_dashboard"},
}

class LoginPayload(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=256)

class RegistrationPatch(BaseModel):
    team: Optional[dict] = None
    leader: Optional[dict] = None
    members: Optional[list[dict]] = None
    mentor: Optional[dict] = None
    status: Optional[Literal["Registered", "PPT Submitted", "Under Review", "Shortlisted", "Rejected", "Qualified"]] = None
    remarks: Optional[str] = Field(default=None, max_length=1000)

class AnnouncementPayload(BaseModel):
    title: str = Field(min_length=3, max_length=140)
    body: str = Field(min_length=1, max_length=5000)
    is_pinned: bool = False
    is_published: bool = True
    scheduled_for: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class AdminUserPayload(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    role: Role
    password: Optional[str] = Field(default=None, min_length=8, max_length=256)
    is_active: bool = True

class BulkRegistrationPayload(BaseModel):
    ids: list[str] = Field(min_length=1, max_length=500)
    action: Literal["delete", "restore", "status"]
    status: Optional[Literal["Registered", "PPT Submitted", "Under Review", "Shortlisted", "Rejected", "Qualified"]] = None

class InvitePayload(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    role: Role

def _secret() -> str:
    if not ADMIN_JWT_SECRET or len(ADMIN_JWT_SECRET) < 32:
        raise HTTPException(status_code=503, detail="Admin authentication is not configured.")
    return ADMIN_JWT_SECRET

async def _bootstrap_user():
    if not ADMIN_BOOTSTRAP_EMAIL or not ADMIN_BOOTSTRAP_PASSWORD_HASH:
        return None
    email = ADMIN_BOOTSTRAP_EMAIL.lower()
    user = await admin_users_collection.find_one({"email": email})
    if not user:
        await admin_users_collection.insert_one({"email": email, "name": "Super Admin", "role": "super_admin", "password_hash": ADMIN_BOOTSTRAP_PASSWORD_HASH, "created_at": datetime.now(timezone.utc)})
        user = await admin_users_collection.find_one({"email": email})
    return user

async def current_admin(session: Optional[str] = Cookie(default=None, alias=COOKIE_NAME)):
    if not session:
        raise HTTPException(status_code=401, detail="Authentication required.")
    try:
        payload = jwt.decode(session, _secret(), algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Session is invalid or expired.")
    user = await admin_users_collection.find_one({"_id": ObjectId(payload["sub"]), "is_active": {"$ne": False}})
    if not user:
        raise HTTPException(status_code=401, detail="Session is invalid.")
    user["_id"] = str(user["_id"])
    return user

def require(permission: str):
    async def guard(user=Depends(current_admin)):
        if permission not in ROLE_PERMISSIONS.get(user["role"], set()):
            raise HTTPException(status_code=403, detail="You do not have permission for this action.")
        return user
    return guard

async def csrf_guard(request: Request):
    """Require browser mutations to originate from the approved portal origins."""
    origin = request.headers.get("origin")
    allowed = {
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:8080", "http://127.0.0.1:8080",
        "https://nmietsihportal.vercel.app",
    }
    if origin and origin not in allowed:
        raise HTTPException(status_code=403, detail="Cross-site request blocked.")

async def audit(user: dict, action: str, registration_id: Optional[str] = None, detail: Optional[str] = None):
    await audit_collection.insert_one({"admin_id": user["_id"], "admin_name": user.get("name", user["email"]), "action": action, "registration_id": registration_id, "detail": detail, "timestamp": datetime.now(timezone.utc)})

def registration_query(search: Optional[str] = None, status: Optional[str] = None, theme: Optional[str] = None, category: Optional[str] = None, date_from: Optional[datetime] = None, date_to: Optional[datetime] = None, include_deleted: bool = False):
    query = {} if include_deleted else {"isDeleted": {"$ne": True}}
    if status:
        query["status"] = status
    if theme:
        query["team.theme"] = theme
    if category:
        query["team.category"] = category
    if date_from or date_to:
        query["created_at"] = {**({"$gte": date_from} if date_from else {}), **({"$lte": date_to} if date_to else {})}
    if search:
        query["$or"] = [
            {"team.teamName": {"$regex": search, "$options": "i"}},
            {"leader.name": {"$regex": search, "$options": "i"}},
            {"leader.email": {"$regex": search, "$options": "i"}},
            {"team.psId": {"$regex": search, "$options": "i"}},
        ]
    return query

def safe_user(user: dict):
    return {"_id": str(user["_id"]), "name": user.get("name"), "email": user["email"], "role": user["role"], "is_active": user.get("is_active", True), "created_at": user.get("created_at")}

@router.get("/users")
async def users(search: Optional[str] = None, user=Depends(require("manage_users"))):
    query = {"is_deleted": {"$ne": True}}
    if search: query["$or"] = [{"name": {"$regex": search, "$options": "i"}}, {"email": {"$regex": search, "$options": "i"}}, {"role": {"$regex": search, "$options": "i"}}]
    result=[]
    async for item in admin_users_collection.find(query).sort("created_at", -1): result.append(safe_user(item))
    return {"data": result}

@router.post("/users", dependencies=[Depends(csrf_guard)])
async def create_user(payload: AdminUserPayload, user=Depends(require("manage_users"))):
    if await admin_users_collection.find_one({"email": payload.email.lower(), "is_deleted": {"$ne": True}}): raise HTTPException(409, "An admin with this email already exists.")
    if not payload.password: raise HTTPException(422, "Use the invitation workflow to set the password.")
    item=payload.model_dump(); item["email"]=item["email"].lower(); item["password_hash"]=bcrypt.hashpw(item.pop("password").encode(),bcrypt.gensalt()).decode(); item["created_at"]=datetime.now(timezone.utc)
    result=await admin_users_collection.insert_one(item); await audit(user,"Created Admin",detail=item["email"]); return {"id":str(result.inserted_id)}

@router.patch("/users/{user_id}", dependencies=[Depends(csrf_guard)])
async def update_user(user_id: str, payload: AdminUserPayload, user=Depends(require("manage_users"))):
    data=payload.model_dump(exclude={"password"});
    if payload.password: data["password_hash"]=bcrypt.hashpw(payload.password.encode(),bcrypt.gensalt()).decode()
    result=await admin_users_collection.update_one({"_id":ObjectId(user_id),"is_deleted":{"$ne":True}},{"$set":data})
    if not result.matched_count: raise HTTPException(404,"Admin not found.")
    await audit(user,"Changed role" if "role" in data else "Updated Admin",detail=payload.email); return {"success":True}

@router.delete("/users/{user_id}", dependencies=[Depends(csrf_guard)])
async def delete_user(user_id: str, user=Depends(require("manage_users"))):
    if user_id==user["_id"]: raise HTTPException(400,"You cannot delete your own account.")
    result=await admin_users_collection.update_one({"_id":ObjectId(user_id)},{"$set":{"is_deleted":True,"is_active":False,"deleted_at":datetime.now(timezone.utc)}})
    if not result.matched_count: raise HTTPException(404,"Admin not found.")
    await audit(user,"Deleted Admin",detail=user_id); return {"success":True}

@router.post("/users/invite", dependencies=[Depends(csrf_guard)])
async def invite_user(payload: InvitePayload, request: Request, user=Depends(require("manage_users"))):
    if await admin_users_collection.find_one({"email": payload.email.lower(), "is_deleted": {"$ne": True}}): raise HTTPException(409,"An admin with this email already exists.")
    token=jwt.encode({"email":payload.email.lower(),"name":payload.name,"role":payload.role,"purpose":"admin_invite","exp":datetime.now(timezone.utc)+timedelta(hours=24)},_secret(),algorithm="HS256")
    await admin_users_collection.insert_one({"name":payload.name,"email":payload.email.lower(),"role":payload.role,"is_active":False,"invite_token":token,"invite_expires_at":datetime.now(timezone.utc)+timedelta(hours=24),"created_at":datetime.now(timezone.utc)})
    await audit(user,"Invited Admin",detail=payload.email)
    return {"invite_url":f"{request.headers.get('origin','')}/admin/accept-invite?token={token}","expires_in_hours":24}

@router.post("/registrations/bulk", dependencies=[Depends(csrf_guard)])
async def bulk_registrations(payload: BulkRegistrationPayload, user=Depends(require("manage_registrations"))):
    ids=[ObjectId(value) for value in payload.ids]
    if payload.action=="delete":
        if "delete_registrations" not in ROLE_PERMISSIONS.get(user["role"],set()): raise HTTPException(403,"You do not have permission to delete registrations.")
        await registration_collection.update_many({"_id":{"$in":ids}},{"$set":{"isDeleted":True,"deleted_at":datetime.now(timezone.utc),"deleted_by":user["_id"]}})
    elif payload.action=="restore": await registration_collection.update_many({"_id":{"$in":ids}},{"$set":{"isDeleted":False}})
    elif payload.action=="status":
        if not payload.status: raise HTTPException(422,"Status is required.")
        await registration_collection.update_many({"_id":{"$in":ids}},{"$set":{"status":payload.status,"updated_at":datetime.now(timezone.utc)}})
    await audit(user,f"Bulk {payload.action.title()} Registrations",detail=f"{len(ids)} registrations")
    return {"success":True,"count":len(ids)}

@router.get("/registrations/export")
async def export_registrations(format: Literal["csv","xlsx"]="csv", search: Optional[str] = None, status: Optional[str] = None, theme: Optional[str] = None, category: Optional[str] = None, date_from: Optional[datetime] = None, date_to: Optional[datetime] = None, include_deleted: bool = False, sort_by: str = "created_at", sort_order: int = -1, user=Depends(require("export"))):
    header=["Registration Date","Team Name","PS ID","Theme","Category","Status","Leader Name","Leader Email","Leader Phone","Faculty Mentor","College","Department","Year","Team Members","Remarks"]
    rows=[]
    safe_sort = sort_by if sort_by in {"created_at", "status", "team.teamName", "team.theme"} else "created_at"
    async for r in registration_collection.find(registration_query(search, status, theme, category, date_from, date_to, include_deleted)).sort(safe_sort, 1 if sort_order == 1 else -1):
        team = r.get("team", {})
        leader = r.get("leader", {})
        mentor = r.get("mentor") or {}
        members = r.get("members", [])
        team_members = "; ".join(
            " — ".join(filter(None, [member.get("name"), member.get("email"), member.get("mobile"), member.get("department"), member.get("year")]))
            for member in members
        )
        rows.append([
            r.get("created_at").astimezone(timezone.utc).strftime("%Y-%m-%d %H:%M UTC") if isinstance(r.get("created_at"), datetime) else r.get("created_at", ""), team.get("teamName", ""), team.get("psId", ""), team.get("theme", ""), team.get("category", ""), r.get("status", "Registered"),
            leader.get("name", ""), leader.get("email", ""), leader.get("mobile", ""), mentor.get("name", ""), leader.get("college") or leader.get("institute", ""), leader.get("department", ""), leader.get("year", ""), team_members, r.get("remarks", ""),
        ])
    filename=f"registrations-{datetime.now().date()}.{format}"
    await audit(user,f"Exported {format.upper()}",detail=filename)
    if format=="csv":
        stream=StringIO(); writer=csv.writer(stream); writer.writerow(header); writer.writerows(rows); return Response(stream.getvalue(),media_type="text/csv",headers={"Content-Disposition":f'attachment; filename="{filename}"'})
    wb=Workbook(); ws=wb.active; ws.title="Registrations"; ws.freeze_panes="A2"; ws.append(header)
    for cell in ws[1]:
        cell.font = Font(bold=True)
        cell.fill = PatternFill("solid", fgColor="E5E7EB")
        cell.alignment = Alignment(horizontal="center")
    for row in rows:
        ws.append(row)
    for column in ws.columns:
        letter = column[0].column_letter
        ws.column_dimensions[letter].width = min(max(len(str(cell.value or "")) for cell in column) + 2, 60)
    out=BytesIO(); wb.save(out); out.seek(0); return StreamingResponse(out,media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",headers={"Content-Disposition":f'attachment; filename="{filename}"'})

@router.post("/auth/login", dependencies=[Depends(csrf_guard)])
async def login(data: LoginPayload, response: Response):
    await _bootstrap_user()
    user = await admin_users_collection.find_one({"email": data.email.lower(), "is_active": {"$ne": False}})
    if not user or not bcrypt.checkpw(data.password.encode(), user["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = jwt.encode({"sub": str(user["_id"]), "role": user["role"], "exp": datetime.now(timezone.utc) + timedelta(hours=8)}, _secret(), algorithm="HS256")
    production = os.getenv("ENVIRONMENT") == "production"
    response.set_cookie(COOKIE_NAME, token, httponly=True, secure=production, samesite="none" if production else "lax", max_age=28800, path="/")
    await audit({**user, "_id": str(user["_id"])}, "Signed in")
    return {"user": {"name": user.get("name", "Administrator"), "email": user["email"], "role": user["role"]}}

@router.post("/auth/logout", status_code=204, dependencies=[Depends(csrf_guard)])
async def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, path="/")

@router.get("/auth/me")
async def me(user=Depends(current_admin)):
    return {"name": user.get("name", "Administrator"), "email": user["email"], "role": user["role"]}

@router.get("/dashboard")
async def dashboard(user=Depends(current_admin)):
    base = {"isDeleted": {"$ne": True}}
    total = await registration_collection.count_documents(base)
    async def count(query): return await registration_collection.count_documents({**base, **query})
    latest = []
    async for item in registration_collection.find(base).sort("created_at", -1).limit(6):
        item["_id"] = str(item["_id"]); latest.append(item)
    statuses = ["Registered", "PPT Submitted", "Under Review", "Shortlisted", "Rejected", "Qualified"]
    status_distribution = {status: await count({"status": status}) for status in statuses}
    theme_distribution = []
    async for item in registration_collection.aggregate([{"$match": base}, {"$group": {"_id": "$team.theme", "count": {"$sum": 1}}}, {"$sort": {"count": -1}}, {"$limit": 8}]):
        theme_distribution.append({"theme": item["_id"] or "Unspecified", "count": item["count"]})
    activity = []
    async for item in audit_collection.find().sort("timestamp", -1).limit(6):
        item["_id"] = str(item["_id"]); activity.append(item)
    return {"metrics": {"total": total, "software": await count({"team.category": "Software"}), "hardware": await count({"team.category": "Hardware"}), "ppt_submitted": await count({"status": "PPT Submitted"}), "pending_ppt": await count({"status": "Registered"}), "shortlisted": await count({"status": "Shortlisted"}), "rejected": await count({"status": "Rejected"}), "qualified": await count({"status": "Qualified"})}, "status_distribution": status_distribution, "theme_distribution": theme_distribution, "latest": latest, "activity": activity}

@router.get("/registrations")
async def registrations(search: Optional[str] = None, status: Optional[str] = None, theme: Optional[str] = None, category: Optional[str] = None, date_from: Optional[datetime] = None, date_to: Optional[datetime] = None, include_deleted: bool = False, sort_by: str = "created_at", sort_order: int = -1, user=Depends(current_admin)):
    query = registration_query(search, status, theme, category, date_from, date_to, include_deleted)
    safe_sort = sort_by if sort_by in {"created_at", "status", "team.teamName", "team.theme"} else "created_at"
    result = []
    async for item in registration_collection.find(query).sort(safe_sort, 1 if sort_order == 1 else -1): item["_id"] = str(item["_id"]); result.append(item)
    return {"data": result}

@router.get("/registrations/{registration_id}")
async def registration(registration_id: str, include_deleted: bool = False, user=Depends(current_admin)):
    try:
        object_id = ObjectId(registration_id)
    except Exception:
        raise HTTPException(400, "Invalid registration ID.")
    item = await registration_collection.find_one({"_id": object_id, **({} if include_deleted else {"isDeleted": {"$ne": True}})})
    if not item: raise HTTPException(404, "Registration not found.")
    item["_id"] = str(item["_id"]); return item

@router.patch("/registrations/{registration_id}", dependencies=[Depends(csrf_guard)])
async def update_registration(registration_id: str, payload: RegistrationPatch, user=Depends(require("manage_registrations"))):
    changes = payload.model_dump(exclude_none=True); changes["updated_at"] = datetime.now(timezone.utc)
    old = await registration_collection.find_one({"_id": ObjectId(registration_id), "isDeleted": {"$ne": True}})
    if not old: raise HTTPException(404, "Registration not found.")
    await registration_collection.update_one({"_id": old["_id"]}, {"$set": changes})
    if "status" in changes and changes["status"] != old.get("status"):
        await audit(user, "Changed Status", registration_id, f"{old.get('status', 'Registered')} → {changes['status']}")
    else:
        await audit(user, "Updated Registration", registration_id)
    return {"success": True}

@router.delete("/registrations/{registration_id}", dependencies=[Depends(csrf_guard)])
async def soft_delete(registration_id: str, user=Depends(require("manage_registrations"))):
    result = await registration_collection.update_one({"_id": ObjectId(registration_id), "isDeleted": {"$ne": True}}, {"$set": {"isDeleted": True, "deleted_at": datetime.now(timezone.utc), "deleted_by": user["_id"]}})
    if not result.matched_count: raise HTTPException(404, "Registration not found.")
    await audit(user, "Deleted Registration", registration_id); return {"success": True}

@router.post("/registrations/{registration_id}/restore", dependencies=[Depends(csrf_guard)])
async def restore(registration_id: str, user=Depends(require("manage_registrations"))):
    await registration_collection.update_one({"_id": ObjectId(registration_id), "isDeleted": True}, {"$set": {"isDeleted": False}, "$unset": {"deleted_at": "", "deleted_by": ""}})
    await audit(user, "Restored Registration", registration_id); return {"success": True}

@router.get("/activity")
async def activity(user=Depends(current_admin)):
    items=[]
    async for item in audit_collection.find().sort("timestamp", -1).limit(100): item["_id"] = str(item["_id"]); items.append(item)
    return {"data": items}

@router.get("/announcements")
async def get_announcements(user=Depends(current_admin)):
    items=[]
    async for item in announcement_collection.find().sort("created_at", -1): item["_id"] = str(item["_id"]); items.append(item)
    return {"data": items}

@router.post("/announcements", dependencies=[Depends(csrf_guard)])
async def create_announcement(payload: AnnouncementPayload, user=Depends(require("manage_announcements"))):
    item=payload.model_dump(); item.update({"created_at": datetime.now(timezone.utc), "created_by": user["_id"]})
    result=await announcement_collection.insert_one(item); await audit(user, "Created announcement", detail=item["title"])
    return {"id": str(result.inserted_id)}

@router.patch("/announcements/{announcement_id}", dependencies=[Depends(csrf_guard)])
async def update_announcement(announcement_id: str, payload: AnnouncementPayload, user=Depends(require("manage_announcements"))):
    result = await announcement_collection.update_one({"_id": ObjectId(announcement_id)}, {"$set": payload.model_dump()})
    if not result.matched_count: raise HTTPException(404, "Announcement not found.")
    await audit(user, "Updated announcement", announcement_id, payload.title)
    return {"success": True}

@router.delete("/announcements/{announcement_id}", dependencies=[Depends(csrf_guard)])
async def delete_announcement(announcement_id: str, user=Depends(require("manage_announcements"))):
    result = await announcement_collection.delete_one({"_id": ObjectId(announcement_id)})
    if not result.deleted_count: raise HTTPException(404, "Announcement not found.")
    await audit(user, "Deleted announcement", announcement_id)
    return {"success": True}
