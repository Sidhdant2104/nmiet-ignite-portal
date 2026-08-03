from enum import Enum


class RegistrationStatus(str, Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    SELECTED = "selected"
    WAITLISTED = "waitlisted"
    REJECTED = "rejected"