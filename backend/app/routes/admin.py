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
from pydantic import BaseModel, EmailStr, Field

from app.config import ADMIN_BOOTSTRAP_EMAIL, ADMIN_BOOTSTRAP_PASSWORD_HASH, ADMIN_JWT_SECRET
from app.mongodb import admin_users_collection, announcement_collection, audit_collection, registration_collection

router = APIRouter(prefix="/admin", tags=["Administration"])
Role = Literal["super_admin", "faculty", "judge", "iic_member"]
COOKIE_NAME = "nmiet_admin_session"

ROLE_PERMISSIONS = {
    "super_admin": {"manage_registrations", "manage_announcements", "send_email", "score"},
    "faculty": {"manage_registrations"},
    "judge": {"score"},
    "iic_member": {"manage_announcements", "send_email"},
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
    scheduled_for: Optional[datetime] = None
    expires_at: Optional[datetime] = None

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
    return {"metrics": {"total": total, "software": await count({"team.category": "Software"}), "hardware": await count({"team.category": "Hardware"}), "ppt_submitted": await count({"status": "PPT Submitted"}), "pending_ppt": await count({"status": "Registered"}), "shortlisted": await count({"status": "Shortlisted"}), "rejected": await count({"status": "Rejected"}), "qualified": await count({"status": "Qualified"})}, "latest": latest}

@router.get("/registrations")
async def registrations(search: Optional[str] = None, status: Optional[str] = None, theme: Optional[str] = None, user=Depends(current_admin)):
    query = {"isDeleted": {"$ne": True}}
    if status: query["status"] = status
    if theme: query["team.theme"] = theme
    if search: query["$or"] = [{"team.teamName": {"$regex": search, "$options": "i"}}, {"leader.name": {"$regex": search, "$options": "i"}}, {"team.psId": {"$regex": search, "$options": "i"}}]
    result = []
    async for item in registration_collection.find(query).sort("created_at", -1): item["_id"] = str(item["_id"]); result.append(item)
    return {"data": result}

@router.get("/registrations/{registration_id}")
async def registration(registration_id: str, user=Depends(current_admin)):
    item = await registration_collection.find_one({"_id": ObjectId(registration_id), "isDeleted": {"$ne": True}})
    if not item: raise HTTPException(404, "Registration not found.")
    item["_id"] = str(item["_id"]); return item

@router.patch("/registrations/{registration_id}", dependencies=[Depends(csrf_guard)])
async def update_registration(registration_id: str, payload: RegistrationPatch, user=Depends(require("manage_registrations"))):
    changes = payload.model_dump(exclude_none=True); changes["updated_at"] = datetime.now(timezone.utc)
    old = await registration_collection.find_one({"_id": ObjectId(registration_id), "isDeleted": {"$ne": True}})
    if not old: raise HTTPException(404, "Registration not found.")
    await registration_collection.update_one({"_id": old["_id"]}, {"$set": changes})
    await audit(user, "Updated registration", registration_id, f"Status: {old.get('status', 'Registered')} → {changes.get('status', old.get('status', 'Registered'))}")
    return {"success": True}

@router.delete("/registrations/{registration_id}", dependencies=[Depends(csrf_guard)])
async def soft_delete(registration_id: str, user=Depends(require("manage_registrations"))):
    result = await registration_collection.update_one({"_id": ObjectId(registration_id), "isDeleted": {"$ne": True}}, {"$set": {"isDeleted": True, "deleted_at": datetime.now(timezone.utc), "deleted_by": user["_id"]}})
    if not result.matched_count: raise HTTPException(404, "Registration not found.")
    await audit(user, "Soft-deleted registration", registration_id); return {"success": True}

@router.post("/registrations/{registration_id}/restore", dependencies=[Depends(csrf_guard)])
async def restore(registration_id: str, user=Depends(require("manage_registrations"))):
    await registration_collection.update_one({"_id": ObjectId(registration_id), "isDeleted": True}, {"$set": {"isDeleted": False}, "$unset": {"deleted_at": "", "deleted_by": ""}})
    await audit(user, "Restored registration", registration_id); return {"success": True}

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
