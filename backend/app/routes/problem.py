from fastapi import APIRouter
from app.services.problem_services import problem_service

router = APIRouter(
    prefix="/problems",
    tags=["Problems"]
)


@router.get("/")
async def get_problems():

    problems = await problem_service.get_all_problems()

    return {
        "success": True,
        "count": len(problems),
        "data": problems
    }
@router.post("/sync")
async def sync():

    result = await problem_service.sync()

    return {
        "success": True,
        **result
    }