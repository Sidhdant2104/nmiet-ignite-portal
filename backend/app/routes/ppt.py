"""Private PPT submission endpoints. Files never live under a static/public path."""
from datetime import datetime, timezone, timedelta
from typing import Optional
import smtplib
from email.message import EmailMessage

import jwt
from bson import ObjectId
from fastapi import APIRouter, File, Header, HTTPException, UploadFile
from pydantic import BaseModel, EmailStr

from app.config import (
    ADMIN_JWT_SECRET, PORTAL_URL, PPT_SUBMISSION_DEADLINE,
    SMTP_FROM, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USERNAME,
)
from app.mongodb import audit_collection, email_collection, registration_collection
from app.services.storage import (
    original_key, preview_key, sha256_hex,
    upload_file as storage_upload,
    convert_to_pdf_if_needed,
    SUPABASE_BUCKET,
)

router = APIRouter(prefix="/ppt", tags=["PPT submissions"])
MAX_BYTES = 25 * 1024 * 1024
ALLOWED = {".ppt", ".pptx", ".pdf"}
STATUS = {
    "Awaiting PPT", "PPT Submitted", "Under Review",
    "Revision Requested", "Approved", "Rejected", "Qualified",
}

CONTENT_TYPES = {
    "pdf":  "application/pdf",
    "ppt":  "application/vnd.ms-powerpoint",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
}


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class VerifyPayload(BaseModel):
    reference_id: str
    leader_email: EmailStr


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def secret():
    if not ADMIN_JWT_SECRET or len(ADMIN_JWT_SECRET) < 32:
        raise HTTPException(503, "PPT signing is not configured.")
    return ADMIN_JWT_SECRET


def deadline():
    if not PPT_SUBMISSION_DEADLINE:
        return None
    try:
        return datetime.fromisoformat(PPT_SUBMISSION_DEADLINE.replace("Z", "+00:00"))
    except ValueError:
        return None


def team_summary(item):
    team, leader = item.get("team", {}), item.get("leader", {})
    return {
        "id": str(item["_id"]),
        "team_name": team.get("teamName"),
        "reference_id": item.get("registration_id"),
        "ps_id": team.get("psId"),
        "theme": team.get("theme"),
        "category": team.get("category"),
        "leader_name": leader.get("name"),
        "leader_email": leader.get("email"),
    }


def _parse_from_header(from_str: str):
    import re
    match = re.match(r"^(.*?)\s*<(.*?)>$", from_str)
    if match:
        name = match.group(1).strip()
        email = match.group(2).strip()
        if name.startswith('"') and name.endswith('"'):
            name = name[1:-1].strip()
        return name, email
    return "NMIET SIH 2026", from_str.strip()


async def log_email(to: str, subject: str, body: str, html: str | None = None, attachment_path: str | None = None):
    import os
    resend_api_key = os.getenv("RESEND_API_KEY")
    brevo_api_key = os.getenv("BREVO_API_KEY")
    
    event = {
        "to": to, "subject": subject, "body": body,
        "created_at": datetime.now(timezone.utc),
        "delivery": "queued" if (SMTP_HOST or resend_api_key or brevo_api_key) else "not_configured",
    }
    if html:
        event["has_html"] = True
    await email_collection.insert_one(event)

    # 1. Try Resend HTTP API (Port 443, safe from cloud port blocks)
    if resend_api_key:
        print(f"📧 EMAIL TRIGGER STARTED (Resend HTTP API): To={to}, Subject={subject}")
        payload = {
            "from": SMTP_FROM,
            "to": [to],
            "subject": subject,
            "html": html or body,
            "text": body
        }
        if attachment_path and os.path.exists(attachment_path):
            try:
                import base64
                with open(attachment_path, "rb") as f:
                    file_data = f.read()
                payload["attachments"] = [
                    {
                        "filename": os.path.basename(attachment_path),
                        "content": base64.b64encode(file_data).decode("utf-8")
                    }
                ]
            except Exception as att_err:
                print(f"⚠️ Resend attachment encoding failed: {att_err}")
        
        try:
            import urllib.request
            import json
            headers = {
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json"
            }
            req = urllib.request.Request(
                "https://api.resend.com/emails",
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=15) as response:
                res_body = response.read().decode("utf-8")
                if response.status in [200, 201, 202]:
                    print(f"✅ EMAIL SENT SUCCESSFULLY (Resend): To={to}")
                    await email_collection.update_one(
                        {"_id": event.get("_id")},
                        {"$set": {"delivery": "sent", "sent_at": datetime.now(timezone.utc)}},
                    )
                    return
                else:
                    print(f"⚠️ Resend API responded with status {response.status}: {res_body}")
        except Exception as resend_err:
            print(f"⚠️ Resend HTTP API call failed: {resend_err}")

    # 2. Try Brevo HTTP API (Port 443, safe from cloud port blocks)
    if brevo_api_key:
        print(f"📧 EMAIL TRIGGER STARTED (Brevo HTTP API): To={to}, Subject={subject}")
        from_name, from_email = _parse_from_header(SMTP_FROM)
        payload = {
            "sender": {"name": from_name, "email": from_email},
            "to": [{"email": to}],
            "subject": subject,
            "htmlContent": html or body,
            "textContent": body
        }
        if attachment_path and os.path.exists(attachment_path):
            try:
                import base64
                with open(attachment_path, "rb") as f:
                    file_data = f.read()
                payload["attachment"] = [
                    {
                        "name": os.path.basename(attachment_path),
                        "content": base64.b64encode(file_data).decode("utf-8")
                    }
                ]
            except Exception as att_err:
                print(f"⚠️ Brevo attachment encoding failed: {att_err}")
        
        try:
            import urllib.request
            import json
            headers = {
                "api-key": brevo_api_key,
                "Content-Type": "application/json"
            }
            req = urllib.request.Request(
                "https://api.brevo.com/v3/smtp/email",
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=15) as response:
                res_body = response.read().decode("utf-8")
                if response.status in [200, 201, 202]:
                    print(f"✅ EMAIL SENT SUCCESSFULLY (Brevo): To={to}")
                    await email_collection.update_one(
                        {"_id": event.get("_id")},
                        {"$set": {"delivery": "sent", "sent_at": datetime.now(timezone.utc)}},
                    )
                    return
                else:
                    print(f"⚠️ Brevo API responded with status {response.status}: {res_body}")
        except Exception as brevo_err:
            print(f"⚠️ Brevo HTTP API call failed: {brevo_err}")

    # 3. Fall back to SMTP
    if not SMTP_HOST:
        print(f"⚠️ EMAIL SKIPPED: SMTP_HOST and HTTP APIs not configured. To: {to}")
        await email_collection.update_one(
            {"_id": event.get("_id")},
            {"$set": {"delivery": "not_configured", "error": "SMTP_HOST and HTTP API keys not configured"}},
        )
        return

    msg = EmailMessage()
    msg["From"] = SMTP_FROM
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)
    if html:
        msg.add_alternative(html, subtype="html")

    if attachment_path:
        if os.path.exists(attachment_path):
            import mimetypes
            ctype, encoding = mimetypes.guess_type(attachment_path)
            if ctype is None or encoding is not None:
                ctype = 'application/octet-stream'
            maintype, subtype = ctype.split('/', 1)
            try:
                with open(attachment_path, 'rb') as fp:
                    msg.add_attachment(
                        fp.read(),
                        maintype=maintype,
                        subtype=subtype,
                        filename=os.path.basename(attachment_path)
                    )
                print(f"📎 ATTACHED FILE SUCCESSFULLY: {attachment_path}")
            except Exception as attachment_err:
                print(f"⚠️ ATTACHMENT ERROR for {attachment_path}: {attachment_err}")
        else:
            print(f"⚠️ ATTACHMENT NOT FOUND: {attachment_path}")

    print(f"📧 EMAIL TRIGGER STARTED (SMTP): To={to}, Subject={subject}")
    print(f"   SMTP: host={SMTP_HOST}:{SMTP_PORT}, user={SMTP_USERNAME}, from={SMTP_FROM}")
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            if SMTP_USERNAME:
                server.login(SMTP_USERNAME, SMTP_PASSWORD or "")
            server.send_message(msg)
        print(f"✅ EMAIL SENT SUCCESSFULLY (SMTP): To={to}")
        await email_collection.update_one(
            {"_id": event.get("_id")},
            {"$set": {"delivery": "sent", "sent_at": datetime.now(timezone.utc)}},
        )
    except Exception as error:
        print(f"❌ EMAIL FAILED (SMTP): To={to}, Error={error}")
        await email_collection.update_one(
            {"_id": event.get("_id")},
            {"$set": {"delivery": "failed", "error": str(error)}},
        )
        raise  # Re-raise so callers know email failed


def upload_token(item):
    return jwt.encode(
        {
            "sub": str(item["_id"]),
            "purpose": "ppt_upload",
            "exp": datetime.now(timezone.utc) + timedelta(minutes=30),
        },
        secret(),
        algorithm="HS256",
    )


async def item_from_upload_token(authorization: Optional[str]):
    token = authorization.removeprefix("Bearer ") if authorization else ""
    try:
        payload = jwt.decode(token, secret(), algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(401, "Upload session is invalid or has expired.")
    if payload.get("purpose") != "ppt_upload":
        raise HTTPException(401, "Invalid upload session.")
    item = await registration_collection.find_one(
        {"_id": ObjectId(payload["sub"]), "isDeleted": {"$ne": True}}
    )
    if not item:
        raise HTTPException(404, "Registration not found.")
    return item


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/verify")
async def verify(payload: VerifyPayload):
    item = await registration_collection.find_one(
        {
            "registration_id": payload.reference_id.strip().upper(),
            "leader.email": payload.leader_email.lower(),
            "isDeleted": {"$ne": True},
        }
    )
    if not item:
        raise HTTPException(404, "No active registration matches that Reference ID and leader email.")
    until = deadline()
    if until and datetime.now(timezone.utc) > until:
        raise HTTPException(403, "The PPT submission deadline has passed.")
    summary = team_summary(item)
    return {
        **summary,
        "token": upload_token(item),
        "deadline": until,
        "submission": item.get("ppt", {}).get("current"),
    }


@router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(default=None),
):
    item = await item_from_upload_token(authorization)
    until = deadline()
    if until and datetime.now(timezone.utc) > until:
        raise HTTPException(403, "The PPT submission deadline has passed.")

    # --- Filename + extension ---
    original_filename = (file.filename or "presentation").replace("\\", "/").rsplit("/", 1)[-1]
    ext = f".{original_filename.rsplit('.', 1)[-1].lower()}" if "." in original_filename else ""
    if ext not in ALLOWED:
        raise HTTPException(415, "Only .ppt, .pptx and .pdf files are accepted.")

    # --- Read + size guard ---
    content = await file.read(MAX_BYTES + 1)
    if len(content) > MAX_BYTES:
        raise HTTPException(413, "File must be 25 MB or smaller.")

    # --- Magic-byte validation ---
    signature = content[:8]
    valid = (
        (ext == ".pdf"  and signature.startswith(b"%PDF"))
        or (ext == ".ppt"  and signature.startswith(bytes.fromhex("D0CF11E0")))
        or (ext == ".pptx" and signature.startswith(b"PK"))
    )
    if not valid:
        raise HTTPException(415, "The file content does not match its extension.")

    # --- Version + previous ---
    now = datetime.now(timezone.utc)
    ppt_doc = item.get("ppt", {})
    previous = ppt_doc.get("current") or {}
    history = list(ppt_doc.get("history", []))
    version = int(previous.get("version", 0)) + 1

    reference_id = item["registration_id"]
    extension = ext.removeprefix(".")
    content_type = CONTENT_TYPES.get(extension, "application/octet-stream")

    # --- SHA-256 ---
    checksum = sha256_hex(content)

    # --- Upload original ---
    orig_key = original_key(reference_id, version, extension)
    try:
        storage_upload(orig_key, content, content_type)
    except RuntimeError as error:
        raise HTTPException(502, "Storage could not store the presentation.") from error

    # --- Generate + upload preview PDF ---
    prev_key: Optional[str] = None
    if extension == "pdf":
        # For PDF uploads: preview = same file, but upload separately as preview
        prev_key = preview_key(reference_id, version)
        try:
            storage_upload(prev_key, content, "application/pdf")
        except RuntimeError:
            prev_key = None  # Non-fatal
    else:
        # For PPT/PPTX: attempt LibreOffice conversion
        pdf_bytes = convert_to_pdf_if_needed(content, extension)
        if pdf_bytes:
            prev_key = preview_key(reference_id, version)
            try:
                storage_upload(prev_key, pdf_bytes, "application/pdf")
            except RuntimeError:
                prev_key = None  # Non-fatal

    # --- Push previous into history ---
    if previous:
        history.append(previous)

    # --- Build new current document ---
    current = {
        "version": version,
        "storage": {
            "provider": "supabase",
            "bucket": SUPABASE_BUCKET,
            "original_key": orig_key,
            "preview_key": prev_key,
        },
        "original_filename": original_filename,
        "content_type": content_type,
        "size": len(content),
        "sha256": checksum,
        "uploaded_at": now,
        "uploaded_by": item.get("leader", {}).get("email"),
        "status": "PPT Submitted",
        "reviewer_remarks": "",
        "internal_notes": "",
        "last_modified": now,
    }

    await registration_collection.update_one(
        {"_id": item["_id"]},
        {
            "$set": {
                "ppt": {"current": current, "history": history},
                "status": "PPT Submitted",
                "updated_at": now,
            }
        },
    )

    action = "Team replaced PPT" if previous else "Team uploaded PPT"
    await audit_collection.insert_one({
        "admin_id": "team",
        "admin_name": item.get("leader", {}).get("name", "Team leader"),
        "action": action,
        "registration_id": str(item["_id"]),
        "detail": f"Version {version}: {original_filename}",
        "timestamp": now,
    })

    summary = team_summary(item)
    try:
         await log_email(
                summary["leader_email"],
                "PPT Submission Received",
                (
                    f"Hello {summary['leader_name']},\n\n"
                    f"PPT Submission Received\n"
                    f"Team: {summary['team_name']}\n"
                    f"Reference ID: {summary['reference_id']}\n"
                    f"Upload time: {now:%d %b %Y, %I:%M %p UTC}\n"
                    f"Status: PPT Submitted\n\n"
                    f"The file can be replaced before the submission deadline.\n"
                    f"{PORTAL_URL}/ppt-submission"
                ),
            )
    except Exception as e:
        print(f"EMAIL FAILED BUT UPLOAD SUCCESSFUL: {e}")


   

    return {
        "success": True,
        "version": version,
        "original_filename": original_filename,
        "has_preview": prev_key is not None,
        "uploaded_at": now,
        "status": "PPT Submitted",
    }
