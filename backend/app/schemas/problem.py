from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class Problem(BaseModel):
    """Schema for an SIH problem statement.

    Core fields are required; optional fields gracefully handle
    entries that are incomplete or have different structures on
    the portal.
    """

    ps_number: str

    title: str

    organization: str
    department: Optional[str] = None

    category: str
    theme: str

    description: Optional[str] = None
    expected_solution: Optional[str] = None

    # Optional resource links — not all problem statements include these
    youtube_link: Optional[str] = None
    dataset_link: Optional[str] = None
    contact_info: Optional[str] = None

    submitted_ideas: int = 0

    deadline: Optional[datetime] = None

    source_url: Optional[str] = None

    # Search & relevance metadata
    searchable_text: Optional[str] = None
    relevance_score: Optional[float] = None

    is_active: bool = True

    created_at: datetime
    updated_at: datetime