from pydantic import BaseModel, EmailStr
from typing import Optional

class Mentor(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    department: Optional[str] = None