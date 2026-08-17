from typing import Optional

from pydantic import BaseModel, Field


class Team(BaseModel):
    teamName: str
    psTitle: str = Field(min_length=6, max_length=200)
    # Official SIH IDs are not available during the theme-based registration phase.
    # Keep this field for post-release registrations and legacy records.
    psId: Optional[str] = Field(default=None, max_length=40)
    category: str
    theme: str
