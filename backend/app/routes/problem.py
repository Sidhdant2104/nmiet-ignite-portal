from typing import Optional
from time import perf_counter

from fastapi import APIRouter, HTTPException, Query
from app.services.problem_services import problem_service

router = APIRouter(
    prefix="/problems",
    tags=["Problems"]
)


@router.get("/")
async def get_problems(
    search: Optional[str] = Query(None, description="Search by title, PS number, org, or theme"),
    theme: Optional[str] = Query(None, description="Filter by theme name"),
    category: Optional[str] = Query(None, description="Filter by category (Software/Hardware)"),
    organization: Optional[str] = Query(None, description="Filter by organization"),
):
    started_at = perf_counter()
    problems = await problem_service.get_problems_filtered(
        search=search,
        theme=theme,
        category=category,
        organization=organization,
    )

    print(f"PROBLEM LIST RESPONSE: {perf_counter() - started_at:.3f}s ({len(problems)} results)")
    return {
        "success": True,
        "count": len(problems),
        "data": problems
    }


@router.get("/themes")
async def get_unique_themes():
    """Return a unique, deduplicated, and cleanly formatted list of all problem themes."""
    themes = await problem_service.get_unique_themes()
    return {
        "success": True,
        "count": len(themes),
        "data": themes
    }


@router.get("/{ps_number}")
async def get_problem(ps_number: str):
    started_at = perf_counter()
    problem = await problem_service.get_problem_by_ps_number(ps_number)

    if not problem:
        raise HTTPException(status_code=404, detail="Problem statement not found.")

    print(f"PROBLEM DETAIL RESPONSE: {perf_counter() - started_at:.3f}s")
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


@router.post("/normalize")
async def normalize_data():
    result = await problem_service.ensure_normalized_data()

    return {
        "success": True,
        **result
    }
