from fastapi import HTTPException

from app.mongodb import registration_collection


class RegistrationValidator:

    async def validate_registration(self, registration: dict):

        errors = []

        participants = [
            registration["leader"],
            *registration["members"]
        ]

        # Check emails
        for index, participant in enumerate(participants):

            existing = await registration_collection.find_one(
                {
                    "$or": [
                        {"leader.email": participant["email"]},
                        {"members.email": participant["email"]}
                    ]
                }
            )

            if existing:
                field = (
                    "leader.email"
                    if index == 0
                    else f"members[{index-1}].email"
                )

                errors.append({
                    "field": field,
                    "message": f'{participant["email"]} is already registered.'
                })

        # Check mobiles
        for index, participant in enumerate(participants):

            existing = await registration_collection.find_one(
                {
                    "$or": [
                        {"leader.mobile": participant["mobile"]},
                        {"members.mobile": participant["mobile"]}
                    ]
                }
            )

            if existing:
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