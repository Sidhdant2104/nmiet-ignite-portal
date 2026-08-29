from contextlib import asynccontextmanager

from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI

from app.mongodb import client
from app.routes.registration import router as registration_router
from app.indexes import create_indexes
from app.routes.problem import router as problem_router

from app.routes.theme import router as theme_router
from app.routes.admin import router as admin_router
from app.routes.ppt import router as ppt_router
from app.routes.announcements import router as announcements_router
from app.routes.evaluation import admin as evaluation_admin_router, judge as judge_router, coordinator as coordinator_router

@asynccontextmanager

async def lifespan(app: FastAPI):
    try:
        await client.admin.command("ping")

        await create_indexes()

        print("✅ MongoDB Connected")
        print("✅ Database Indexes Created")

    except Exception as e:
        print(f"❌ MongoDB Error: {e}")


    yield

    client.close()

    print("👋 MongoDB Connection Closed")


app = FastAPI(
    title="NMIET SIH Backend",
    version="1.0.0",
    lifespan=lifespan
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://nmietsihportal.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(problem_router)
app.include_router(registration_router)
app.include_router(theme_router)
app.include_router(admin_router)
app.include_router(ppt_router)
app.include_router(announcements_router)
app.include_router(evaluation_admin_router)
app.include_router(judge_router)
app.include_router(coordinator_router)
@app.get("/")
async def root():

    return {
        "message": "NMIET SIH Backend Running"
    }

# ---------- Temporary debug endpoints (remove after testing) ----------

@app.get("/debug/smtp")
async def debug_smtp():
    """Check SMTP env vars are loaded (no secrets exposed)."""
    from app.config import SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM
    return {
        "smtp_host": SMTP_HOST or "NOT SET",
        "smtp_port": SMTP_PORT,
        "smtp_username": SMTP_USERNAME or "NOT SET",
        "smtp_password_set": bool(SMTP_PASSWORD),
        "smtp_password_length": len(SMTP_PASSWORD) if SMTP_PASSWORD else 0,
        "smtp_from": SMTP_FROM or "NOT SET",
    }

@app.post("/test-email")
async def test_email():
    """Send a minimal test email to verify SMTP works independently."""
    from app.config import SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM
    import smtplib
    from email.message import EmailMessage

    if not SMTP_HOST or not SMTP_USERNAME:
        return {"success": False, "error": "SMTP not configured"}

    msg = EmailMessage()
    msg["From"] = SMTP_FROM
    msg["To"] = SMTP_USERNAME  # Send to self
    msg["Subject"] = "NMIET SIH Portal — SMTP Test"
    msg.set_content("If you received this, SMTP is working correctly.\n\nSent from NMIET SIH Portal test endpoint.")

    try:
        print(f"🧪 TEST EMAIL: Connecting to {SMTP_HOST}:{SMTP_PORT}")
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.set_debuglevel(1)  # Print full SMTP conversation
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(SMTP_USERNAME, SMTP_PASSWORD or "")
            server.send_message(msg)
        print("✅ TEST EMAIL: Sent successfully!")
        return {"success": True, "message": f"Test email sent to {SMTP_USERNAME}"}
    except Exception as error:
        print(f"❌ TEST EMAIL FAILED: {error}")
        return {"success": False, "error": str(error)}
