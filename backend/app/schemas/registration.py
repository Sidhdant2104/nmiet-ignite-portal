from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.person import Person
from app.schemas.team import Team
from app.schemas.mentor import Mentor
from app.schemas.registration_status import RegistrationStatus


class UpdateRegistration(BaseModel):
    status: Optional[str] = None
    remarks: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Registration(BaseModel):
    team: Team

    leader: Person

    members: List[Person]

    mentor: Mentor | None = None

    status: RegistrationStatus = RegistrationStatus.PENDING

    created_at: datetime = Field(default_factory=datetime.utcnow)

    updated_at: datetime = Field(default_factory=datetime.utcnow)