from fastapi import HTTPException

from app.mongodb import registration_collection


class RegistrationValidator:

    async def validate_registration(self, registration: dict):

        errors = []

        participants = [
            registration["leader"],
            *registration["members"]
        ]

        # Batch check: collect all emails and mobiles, query once each
        all_emails = [p["email"] for p in participants]
        all_mobiles = [p["mobile"] for p in participants]

        # One indexed query checks all e-mail and mobile collisions. This avoids
        # adding a second Atlas round trip to every registration submission.
        duplicate_cursor = registration_collection.find(
            {
                "$or": [
                    {"leader.email": {"$in": all_emails}},
                    {"members.email": {"$in": all_emails}},
                    {"leader.mobile": {"$in": all_mobiles}},
                    {"members.mobile": {"$in": all_mobiles}},
                ]
            },
            {"leader.email": 1, "members.email": 1, "leader.mobile": 1, "members.mobile": 1}
        )
        existing_emails = set()
        existing_mobiles = set()
        async for doc in duplicate_cursor:
            existing_emails.add(doc.get("leader", {}).get("email"))
            for m in doc.get("members", []):
                existing_emails.add(m.get("email"))
            existing_mobiles.add(doc.get("leader", {}).get("mobile"))
            for m in doc.get("members", []):
                existing_mobiles.add(m.get("mobile"))

        for index, participant in enumerate(participants):
            if participant["email"] in existing_emails:
                field = (
                    "leader.email"
                    if index == 0
                    else f"members[{index-1}].email"
                )
                errors.append({
                    "field": field,
                    "message": f'{participant["email"]} is already registered.'
                })

        for index, participant in enumerate(participants):
            if participant["mobile"] in existing_mobiles:
                field = (
                    "leader.mobile"
                    if index == 0
                    else f"members[{index-1}].mobile"
                )
                errors.append({
                    "field": field,
                    "message": f'{participant["mobile"]} is already registered.'
                })

        if errors:
            raise HTTPException(
                status_code=409,
                detail=errors
            )


registration_validator = RegistrationValidator()
