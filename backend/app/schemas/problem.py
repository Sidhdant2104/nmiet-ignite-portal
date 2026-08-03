from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class Problem(BaseModel):

    ps_number: str

    title: str

    organization: str
    department: Optional[str] = None

    category: str
    theme: str

    description: Optional[str] = None

    submitted_ideas: int = 0

    deadline: Optional[datetime] = None

    source_url: Optional[str] = None

    is_active: bool = True

    created_at: datetime
    updated_at: datetime