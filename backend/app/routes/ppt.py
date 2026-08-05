"""Private PPT submission endpoints. Files never live under a static/public path."""
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional
import os, shutil, smtplib, uuid
from email.message import EmailMessage

import jwt
from bson import ObjectId
from fastapi import APIRouter, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse, StreamingResponse
from io import BytesIO
from zipfile import ZIP_DEFLATED, ZipFile
from pydantic import BaseModel, EmailStr

from app.config import ADMIN_JWT_SECRET, PORTAL_URL, PPT_STORAGE_DIR, PPT_SUBMISSION_DEADLINE, SMTP_FROM, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USERNAME
from app.mongodb import audit_collection, email_collection, registration_collection

router = APIRouter(prefix="/ppt", tags=["PPT submissions"])
MAX_BYTES = 25 * 1024 * 1024
ALLOWED = {".ppt", ".pptx", ".pdf"}
STATUS = {"Awaiting PPT", "PPT Submitted", "Under Review", "Revision Requested", "Approved", "Rejected", "Qualified"}

class VerifyPayload(BaseModel):
    reference_id: str
    leader_email: EmailStr

def secret():
    if not ADMIN_JWT_SECRET or len(ADMIN_JWT_SECRET) < 32:
        raise HTTPException(503, "PPT signing is not configured.")
    return ADMIN_JWT_SECRET

def deadline():
    if not PPT_SUBMISSION_DEADLINE: return None
    try: return datetime.fromisoformat(PPT_SUBMISSION_DEADLINE.replace("Z", "+00:00"))
    except ValueError: return None

def team_summary(item):
    team, leader = item.get("team", {}), item.get("leader", {})
    return {"id": str(item["_id"]), "team_name": team.get("teamName"), "reference_id": item.get("registration_id"), "ps_id": team.get("psId"), "theme": team.get("theme"), "category": team.get("category"), "leader_name": leader.get("name"), "leader_email": leader.get("email")}

async def log_email(to: str, subject: str, body: str):
    event = {"to": to, "subject": subject, "body": body, "created_at": datetime.now(timezone.utc), "delivery": "queued" if SMTP_HOST else "not_configured"}
    await email_collection.insert_one(event)
    if not SMTP_HOST: return
    msg = EmailMessage(); msg["From"] = SMTP_FROM; msg["To"] = to; msg["Subject"] = subject; msg.set_content(body)
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.starttls()
            if SMTP_USERNAME: server.login(SMTP_USERNAME, SMTP_PASSWORD or "")
            server.send_message(msg)
        await email_collection.update_one({"_id": event.get("_id")}, {"$set": {"delivery": "sent", "sent_at": datetime.now(timezone.utc)}})
    except Exception as error:
        await email_collection.update_one({"to": to, "subject": subject, "created_at": event["created_at"]}, {"$set": {"delivery": "failed", "error": str(error)}})

def upload_token(item):
    return jwt.encode({"sub": str(item["_id"]), "purpose": "ppt_upload", "exp": datetime.now(timezone.utc) + timedelta(minutes=30)}, secret(), algorithm="HS256")

async def item_from_upload_token(authorization: Optional[str]):
    token = authorization.removeprefix("Bearer ") if authorization else ""
    try: payload = jwt.decode(token, secret(), algorithms=["HS256"])
    except jwt.PyJWTError: raise HTTPException(401, "Upload session is invalid or has expired.")
    if payload.get("purpose") != "ppt_upload": raise HTTPException(401, "Invalid upload session.")
    item = await registration_collection.find_one({"_id": ObjectId(payload["sub"]), "isDeleted": {"$ne": True}})
    if not item: raise HTTPException(404, "Registration not found.")
    return item

@router.get("/template")
async def download_template():
    """A compact, valid starter deck; organizers can override the URL with VITE_PPT_TEMPLATE_URL."""
    parts = {
        "[Content_Types].xml": '''<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/></Types>''',
        "_rels/.rels": '''<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>''',
        "ppt/presentation.xml": '''<?xml version="1.0" encoding="UTF-8"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldIdLst><p:sldId id="256" r:id="rId1"/></p:sldIdLst><p:sldSz cx="12192000" cy="6858000" type="screen16x9"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>''',
        "ppt/_rels/presentation.xml.rels": '''<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/></Relationships>''',
        "ppt/slides/slide1.xml": '''<?xml version="1.0" encoding="UTF-8"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/><p:sp><p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" sz="3200" b="1"/><a:t>NMIET SIH 2026</a:t></a:r><a:endParaRPr lang="en-US"/></a:p><a:p><a:r><a:rPr lang="en-US" sz="1800"/><a:t>Team Name | PS ID | Theme</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>''',
    }
    out = BytesIO()
    with ZipFile(out, "w", ZIP_DEFLATED) as archive:
        for name, content in parts.items(): archive.writestr(name, content)
    out.seek(0)
    return StreamingResponse(out, media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation", headers={"Content-Disposition": 'attachment; filename="NMIET-SIH-2026-PPT-Template.pptx"'})

@router.post("/verify")
async def verify(payload: VerifyPayload):
    item = await registration_collection.find_one({"registration_id": payload.reference_id.strip().upper(), "leader.email": payload.leader_email.lower(), "isDeleted": {"$ne": True}})
    if not item: raise HTTPException(404, "No active registration matches that Reference ID and leader email.")
    until = deadline()
    if until and datetime.now(timezone.utc) > until: raise HTTPException(403, "The PPT submission deadline has passed.")
    summary = team_summary(item)
    return {**summary, "token": upload_token(item), "deadline": until, "submission": item.get("ppt", {}).get("current")}

@router.post("/upload")
async def upload(file: UploadFile = File(...), authorization: Optional[str] = Header(default=None)):
    item = await item_from_upload_token(authorization)
    until = deadline()
    if until and datetime.now(timezone.utc) > until: raise HTTPException(403, "The PPT submission deadline has passed.")
    original = Path(file.filename or "").name
    ext = Path(original).suffix.lower()
    if ext not in ALLOWED: raise HTTPException(415, "Only .ppt, .pptx and .pdf files are accepted.")
    storage = Path(PPT_STORAGE_DIR); storage.mkdir(parents=True, exist_ok=True)
    target = storage / f"{uuid.uuid4().hex}{ext}"
    size = 0
    try:
        with target.open("wb") as out:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_BYTES: raise HTTPException(413, "File must be 25 MB or smaller.")
                out.write(chunk)
        signature = target.read_bytes()[:8]
        valid = (ext == ".pdf" and signature.startswith(b"%PDF")) or (ext == ".ppt" and signature.startswith(bytes.fromhex("D0CF11E0"))) or (ext == ".pptx" and signature.startswith(b"PK"))
        if not valid: raise HTTPException(415, "The file content does not match its extension.")
    except Exception:
        target.unlink(missing_ok=True); raise
    now = datetime.now(timezone.utc); history = item.get("ppt", {}).get("history", []); version = len(history) + 1
    reason = "Resubmission" if history else "Initial submission"
    entry = {"version": version, "filename": original, "storage_key": target.name, "content_type": file.content_type or "application/octet-stream", "size": size, "uploaded_at": now, "reason": reason, "status": "PPT Submitted"}
    current = {**entry, "last_modified": now, "reviewer_remarks": "", "internal_notes": ""}
    await registration_collection.update_one({"_id": item["_id"]}, {"$set": {"ppt": {"current": current, "history": [*history, entry]}, "status": "PPT Submitted", "updated_at": now}})
    await audit_collection.insert_one({"admin_id": "team", "admin_name": item.get("leader", {}).get("name", "Team leader"), "action": "Re-uploaded PPT" if version > 1 else "Uploaded PPT", "registration_id": str(item["_id"]), "detail": f"Version {version}: {original}", "timestamp": now})
    summary = team_summary(item)
    await log_email(summary["leader_email"], "PPT submission received", f"Hello {summary['leader_name']},\n\nWe received Version {version} of {summary['team_name']}'s PPT on {now:%d %b %Y, %I:%M %p UTC}.\nReference ID: {summary['reference_id']}\n\nYou may re-upload before the deadline, if required.\n{PORTAL_URL}/ppt-submission")
    return {"success": True, "version": version, "uploaded_at": now, "status": "PPT Submitted"}

@router.get("/download/{registration_id}/{version}")
async def signed_download(registration_id: str, version: int, token: str):
    try: payload = jwt.decode(token, secret(), algorithms=["HS256"])
    except jwt.PyJWTError: raise HTTPException(401, "Download link is invalid or expired.")
    if payload.get("purpose") != "ppt_download" or payload.get("registration_id") != registration_id or payload.get("version") != version: raise HTTPException(403, "Download link is not authorized.")
    item = await registration_collection.find_one({"_id": ObjectId(registration_id)})
    entry = next((x for x in item.get("ppt", {}).get("history", []) if x["version"] == version), None) if item else None
    path = Path(PPT_STORAGE_DIR) / entry["storage_key"] if entry else None
    if not path or not path.is_file(): raise HTTPException(404, "The requested upload is unavailable.")
    return FileResponse(path, media_type=entry.get("content_type"), filename=entry["filename"])
