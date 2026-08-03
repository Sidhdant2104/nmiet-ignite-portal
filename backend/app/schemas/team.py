from pydantic import BaseModel


class Team(BaseModel):
    teamName: str
    psTitle: str
    psId: str
    category: str
    theme: str