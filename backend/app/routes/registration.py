from fastapi import APIRouter, HTTPException
from app.schemas.update_registration import UpdateRegistration
from app.schemas.registration import Registration
from app.services.registration_service import registration_service
from app.mongodb import settings_collection
from typing import Optional
from fastapi import Query
router = APIRouter(
    prefix="/registrations",
    tags=["Registrations"]
)

@router.get("/status")
async def registration_status():
    control = await settings_collection.find_one({"key": "registration_control"})
    return {"is_open": True if not control else control.get("is_open", True)}


@router.post("/")
async def create_registration(registration: Registration):
    control = await settings_collection.find_one({"key": "registration_control"})
    if control and not control.get("is_open", True):
        raise HTTPException(status_code=403, detail="Registrations are currently closed.")

    # Do not persist optional fields that were not supplied (mentor and psId).
    registration_dict = registration.model_dump(exclude_none=True)

    inserted_id = await registration_service.create_registration(
        registration_dict
    )

    return {
    "success": True,
    "message": "Registration created successfully.",
    "data": inserted_id
}
@router.get("/")
async def get_all_registrations(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None
):

    return await registration_service.get_all_registrations(
        page=page,
        limit=limit,
        search=search,
        status=status
    )
@router.get("/{registration_id}")
async def get_registration(registration_id: str):

    registration = await registration_service.get_registration_by_id(
        registration_id
    )

    return registration
@router.patch("/{registration_id}")
async def update_registration(
    registration_id: str,
    update: UpdateRegistration
):

    registration = await registration_service.update_registration(
        registration_id,
        update.model_dump(exclude_none=True)
    )

    return registration

@router.delete("/{registration_id}")
async def delete_registration(registration_id: str):

    return await registration_service.delete_registration(
        registration_id
    )
