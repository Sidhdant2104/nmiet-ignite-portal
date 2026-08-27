from bson import ObjectId
from fastapi import BackgroundTasks, HTTPException

from app.mongodb import registration_collection, settings_collection
from app.validators.registration_validator import registration_validator
import re
import logging
import time
from datetime import datetime
from app.config import PORTAL_URL
import math

logger = logging.getLogger(__name__)

class RegistrationService:



    async def create_registration(self, registration: dict, background_tasks: BackgroundTasks | None = None):
        t_start = time.monotonic()

        control = await settings_collection.find_one({"key": "registration_control"})
        if control and control.get("is_open") is False:
            raise HTTPException(status_code=403, detail="Registrations are currently closed. Please check back later or contact the SIH Coordinators.")

        print(f"\n{'='*60}")
        print(f"📋 REGISTRATION START")

        t0 = time.monotonic()
        await registration_validator.validate_registration(registration)
        print(f"   ✓ VALIDATION COMPLETE: {time.monotonic() - t0:.3f}s")

        t0 = time.monotonic()
        registration["registration_id"] = await self.generate_registration_id()
        print(f"   ✓ ID GENERATED ({registration['registration_id']}): {time.monotonic() - t0:.3f}s")

        registration["created_at"] = datetime.utcnow()
        registration["updated_at"] = datetime.utcnow()
        registration["email_status"] = "pending"

        t0 = time.monotonic()
        result = await registration_collection.insert_one(registration)
        print(f"   ✓ DATABASE INSERT COMPLETE: {time.monotonic() - t0:.3f}s")

        # Schedule email as a background task — runs AFTER response is sent
        inserted_id = result.inserted_id
        reg_id = registration["registration_id"]
        team = registration.get("team", {})
        leader = registration.get("leader", {})
        mentor = registration.get("mentor")
        members = registration.get("members", [])
        created_at = registration["created_at"]

        if background_tasks is not None:
            # 1. Email to Team Leader
            background_tasks.add_task(
                self._send_confirmation_email_background,
                inserted_id=inserted_id,
                registration_id=reg_id,
                recipient_email=leader.get("email", ""),
                team_name=team.get("teamName", ""),
                team_leader=leader.get("name", "Team Leader"),
                problem_statement={
                    "psId": team.get("psId", ""),
                    "psTitle": team.get("psTitle", ""),
                    "theme": team.get("theme", ""),
                    "category": team.get("category", ""),
                },
                members=members,
                mentor=mentor,
                created_at=created_at,
                recipient_name=leader.get("name", "Team Leader"),
            )
            
            # 2. Email to other Team Members
            for member in members:
                member_email = member.get("email", "")
                if member_email:
                    background_tasks.add_task(
                        self._send_confirmation_email_background,
                        inserted_id=inserted_id,
                        registration_id=reg_id,
                        recipient_email=member_email,
                        team_name=team.get("teamName", ""),
                        team_leader=leader.get("name", "Team Leader"),
                        problem_statement={
                            "psId": team.get("psId", ""),
                            "psTitle": team.get("psTitle", ""),
                            "theme": team.get("theme", ""),
                            "category": team.get("category", ""),
                        },
                        members=members,
                        mentor=mentor,
                        created_at=created_at,
                        recipient_name=member.get("name", "Team Member"),
                    )

            # 3. Email to Mentor (if provided)
            if mentor and mentor.get("email"):
                background_tasks.add_task(
                    self._send_confirmation_email_background,
                    inserted_id=inserted_id,
                    registration_id=reg_id,
                    recipient_email=mentor.get("email"),
                    team_name=team.get("teamName", ""),
                    team_leader=leader.get("name", "Team Leader"),
                    problem_statement={
                        "psId": team.get("psId", ""),
                        "psTitle": team.get("psTitle", ""),
                        "theme": team.get("theme", ""),
                        "category": team.get("category", ""),
                    },
                    members=members,
                    mentor=mentor,
                    created_at=created_at,
                    recipient_name=mentor.get("name", "Faculty Mentor"),
                )
            print(f"   ✓ EMAIL TASKS QUEUED (background): {1 + len(members) + (1 if mentor and mentor.get('email') else 0)} emails")
        else:
            print(f"   ⚠️ No BackgroundTasks — email skipped")

        total = time.monotonic() - t_start
        print(f"   ✓ RESPONSE SENT: {total:.3f}s total")
        print(f"{'='*60}\n")

        return {
            "id": str(inserted_id),
            "registration_id": reg_id
        }

    async def _send_confirmation_email_background(
        self,
        inserted_id,
        registration_id: str,
        recipient_email: str,
        team_name: str,
        team_leader: str,
        problem_statement: dict,
        members: list,
        mentor: dict | None,
        created_at: datetime,
        recipient_name: str | None = None,
    ):
        """Runs as a FastAPI BackgroundTask — after the HTTP response is already sent."""
        print(f"\n📧 BACKGROUND EMAIL START: {registration_id} → {recipient_email}")
        t0 = time.monotonic()
        try:
            from app.services.email_service import send_registration_confirmation_email

            email_sent = await send_registration_confirmation_email(
                recipient_email=recipient_email,
                team_name=team_name,
                team_leader=team_leader,
                problem_statement=problem_statement,
                members=members,
                mentor=mentor,
                registration_id=registration_id,
                created_at=created_at,
                recipient_name=recipient_name,
            )

            elapsed = time.monotonic() - t0
            if email_sent:
                print(f"✅ BACKGROUND EMAIL SENT: {registration_id} ({elapsed:.2f}s)")
                await registration_collection.update_one(
                    {"_id": inserted_id},
                    {"$set": {"email_status": "sent", "email_sent_at": datetime.utcnow()}},
                )
            else:
                print(f"❌ BACKGROUND EMAIL FAILED: {registration_id} — send returned False ({elapsed:.2f}s)")
                await registration_collection.update_one(
                    {"_id": inserted_id},
                    {"$set": {"email_status": "failed"}},
                )
        except Exception as error:
            elapsed = time.monotonic() - t0
            print(f"❌ BACKGROUND EMAIL FAILED: {registration_id} — {error} ({elapsed:.2f}s)")
            logger.error("Background email failed for %s: %s", registration_id, error)
            try:
                await registration_collection.update_one(
                    {"_id": inserted_id},
                    {"$set": {"email_status": "failed"}},
                )
            except Exception:
                pass

    async def get_all_registrations(
        self,
        page: int,
        limit: int,
        search: str | None,
        status: str | None
    ):

        query = {}

        if status:
            query["status"] = status

        if search:

            query["$or"] = [
                {"team.teamName": {"$regex": search, "$options": "i"}},
                {"leader.name": {"$regex": search, "$options": "i"}},
                {"leader.email": {"$regex": search, "$options": "i"}},
                {"team.psId": {"$regex": search, "$options": "i"}},
                {"team.psTitle": {"$regex": search, "$options": "i"}}
            ]

        total = await registration_collection.count_documents(query)

        registrations = []

        cursor = (
            registration_collection.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
        )

        async for registration in cursor:

            registration["_id"] = str(registration["_id"])

            registrations.append(registration)

        return {
            "success": True,
            "data": registrations,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "total_pages": math.ceil(total / limit) if total else 1
            }
        }

    async def get_registration_by_id(self, registration_id: str):

        try:
            object_id = ObjectId(registration_id)
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Invalid Registration ID."
            )

        registration = await registration_collection.find_one(
            {"_id": object_id}
        )

        if registration is None:
            raise HTTPException(
                status_code=404,
                detail="Registration not found."
            )

        registration["_id"] = str(registration["_id"])

        return registration

    async def update_registration(
        self,
        registration_id: str,
        data: dict
    ):

        try:
            object_id = ObjectId(registration_id)
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Invalid Registration ID."
            )

        data["updated_at"] = datetime.utcnow()

        result = await registration_collection.update_one(
            {"_id": object_id},
            {
               "$set": data
            }
)

        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Registration not found."
            )

        registration = await registration_collection.find_one(
            {"_id": object_id}
        )

        registration["_id"] = str(registration["_id"])

        return registration
    async def generate_registration_id(self):

        year = datetime.now().year

        latest = await registration_collection.find_one(
            {},
            sort=[("registration_id", -1)]
        )

        if latest and latest.get("registration_id"):

            match = re.search(r"(\d+)$", latest["registration_id"])

            if match:
                number = int(match.group(1)) + 1
            else:
                number = 1

        else:
            number = 1

        return f"SIH{year}-{number:04d}"

    async def delete_registration(self, registration_id: str):

        try:
            object_id = ObjectId(registration_id)
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Invalid Registration ID."
            )

        result = await registration_collection.delete_one(
            {"_id": object_id}
        )

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Registration not found."
            )

        return {
            "success": True,
            "message": "Registration deleted successfully."
        }
registration_service = RegistrationService()
