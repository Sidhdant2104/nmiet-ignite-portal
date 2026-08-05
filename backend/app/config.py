from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")
ADMIN_JWT_SECRET = os.getenv("ADMIN_JWT_SECRET")
ADMIN_BOOTSTRAP_EMAIL = os.getenv("ADMIN_BOOTSTRAP_EMAIL")
ADMIN_BOOTSTRAP_PASSWORD_HASH = os.getenv("ADMIN_BOOTSTRAP_PASSWORD_HASH")
PPT_STORAGE_DIR = os.getenv("PPT_STORAGE_DIR", "/tmp/nmiet-sih-private-ppts")
PPT_SUBMISSION_DEADLINE = os.getenv("PPT_SUBMISSION_DEADLINE")
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM = os.getenv("SMTP_FROM", "NMIET SIH Portal <no-reply@nmiet.edu.in>")
PORTAL_URL = os.getenv("PORTAL_URL", "https://nmietsihportal.vercel.app")
