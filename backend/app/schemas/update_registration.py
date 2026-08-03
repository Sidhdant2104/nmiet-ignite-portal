from datetime import datetime
from typing import Optional
from app.schemas.registration_status import RegistrationStatus


from pydantic import BaseModel, Field


class UpdateRegistration(BaseModel):
    status: Optional[RegistrationStatus] = None
    remarks: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)