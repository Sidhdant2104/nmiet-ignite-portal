from pydantic import BaseModel
from typing import Optional

class Theme(BaseModel):
    name: str
    description: str
    icon: Optional[str] = None