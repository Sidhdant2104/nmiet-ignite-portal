from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, Field, model_validator

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

    @model_validator(mode="before")
    @classmethod
    def normalize_empty_mentor(cls, value: Any):
        """Treat an untouched optional mentor form section as no mentor."""
        if not isinstance(value, dict):
            return value

        mentor = value.get("mentor")
        if isinstance(mentor, dict) and not any(
            item is not None and str(item).strip() for item in mentor.values()
        ):
            value = {**value}
            value.pop("mentor", None)
        return value
