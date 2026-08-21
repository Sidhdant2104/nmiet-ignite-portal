from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from app.services.problem_services import problem_service

router = APIRouter(
    prefix="/problems",
    tags=["Problems"]
)


@router.get("/")
async def get_problems(
    search: Optional[str] = Query(None, description="Search by title, PS number, org, or theme"),
    theme: Optional[str] = Query(None, description="Filter by exact theme name"),
    category: Optional[str] = Query(None, description="Filter by category (Software/Hardware)"),
):
    problems = await problem_service.get_problems_filtered(
        search=search,
        theme=theme,
        category=category,
    )

    return {
        "success": True,
        "count": len(problems),
        "data": problems
    }


@router.get("/{ps_number}")
async def get_problem(ps_number: str):
    problem = await problem_service.get_problem_by_ps_number(ps_number)

    if not problem:
        raise HTTPException(status_code=404, detail="Problem statement not found.")

    return {
        "success": True,
        "data": problem
    }


@router.post("/sync")
async def sync():

    result = await problem_service.sync()

    return {
        "success": True,
        **result
    }