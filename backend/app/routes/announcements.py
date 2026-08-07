"""Public, Mongo-backed announcement feed used by the home-page ticker."""
from datetime import datetime, timezone

from fastapi import APIRouter

from app.mongodb import announcement_collection

router = APIRouter(prefix="/api/announcements", tags=["Announcements"])


def serialize_announcement(item: dict) -> dict:
    """Return the shape consumed by the existing sliding announcement UI."""
    created_at = item.get("created_at")
    date = created_at.date().isoformat() if isinstance(created_at, datetime) else ""
    return {
        "id": str(item["_id"]),
        "date": date,
        "tag": item.get("tag") or "Update",
        "title": item.get("title", ""),
        "body": item.get("body", ""),
    }


@router.get("")
async def active_announcements():
    """Return only currently enabled, non-archived announcements."""
    now = datetime.now(timezone.utc)
    query = {
        "is_published": {"$ne": False},
        "is_archived": {"$ne": True},
        "$and": [
            {"$or": [{"scheduled_for": None}, {"scheduled_for": {"$exists": False}}, {"scheduled_for": {"$lte": now}}]},
            {"$or": [{"expires_at": None}, {"expires_at": {"$exists": False}}, {"expires_at": {"$gt": now}}]},
        ],
    }
    items = []
    async for item in announcement_collection.find(query).sort([("is_pinned", -1), ("created_at", -1)]):
        items.append(serialize_announcement(item))
    return {"announcements": items}
