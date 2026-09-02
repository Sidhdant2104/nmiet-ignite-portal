from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGODB_URI, DATABASE_NAME

client = AsyncIOMotorClient(
    MONGODB_URI,
    maxPoolSize=20,
    minPoolSize=5
)

db = client[DATABASE_NAME]

registration_collection = db["registrations"]
problem_collection = db["problems"]
theme_collection = db["themes"]
guideline_collection = db["guidelines"]
settings_collection = db["settings"]
admin_users_collection = db["admin_users"]
audit_collection = db["admin_audit"]
announcement_collection = db["announcements"]
email_collection = db["email_events"]
evaluation_track_collection = db["evaluation_tracks"]
judge_collection = db["judges"]
track_coordinator_collection = db["track_coordinators"]
presentation_queue_collection = db["presentation_queues"]
evaluation_criteria_collection = db["evaluation_criteria"]
evaluation_collection = db["evaluations"]
evaluation_option_collection = db["evaluation_options"]
