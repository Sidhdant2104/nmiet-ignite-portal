from pydantic import BaseModel, EmailStr


class Person(BaseModel):
    name: str
    gender: str
    email: EmailStr
    mobile: str
    department: str
    year: str
    division: str
    roll: str