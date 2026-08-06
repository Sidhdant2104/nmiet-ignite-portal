from bson import ObjectId
from fastapi import HTTPException

from app.mongodb import registration_collection, settings_collection
from app.validators.registration_validator import registration_validator
import re
from datetime import datetime
from app.routes.ppt import log_email
from app.config import PORTAL_URL
import math

class RegistrationService:



    async def create_registration(self, registration: dict):

        control = await settings_collection.find_one({"key": "registration_control"})
        if control and control.get("is_open") is False:
            raise HTTPException(status_code=403, detail="Registrations are currently closed. Please check back later or contact the SIH Coordinators.")

        await registration_validator.validate_registration(registration)

        registration["registration_id"] = await self.generate_registration_id()
        registration["created_at"] = datetime.utcnow()
        registration["updated_at"] = datetime.utcnow()

        result = await registration_collection.insert_one(registration)

        team, leader = registration.get("team", {}), registration.get("leader", {})
        created = registration["created_at"]
        await log_email(leader.get("email", ""), "NMIET SIH registration confirmed", f"Hello {leader.get('name', 'Team Leader')},\n\nYour NMIET SIH registration is confirmed.\n\nTeam name: {team.get('teamName')}\nReference ID: {registration['registration_id']}\nPS ID: {team.get('psId')}\nTheme: {team.get('theme')}\nRegistration date: {created:%d %b %Y}\n\nPPT Template: {PORTAL_URL}/ppt-template\nSubmission Guidelines: {PORTAL_URL}/submission-guidelines\nUpload PPT: {PORTAL_URL}/ppt-submission")

        return {
            "id": str(result.inserted_id),
            "registration_id": registration["registration_id"]
        }
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
