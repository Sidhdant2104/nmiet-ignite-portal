from fastapi import APIRouter

from app.services.theme_service import theme_service

router = APIRouter(
    prefix="/themes",
    tags=["Themes"]
)


@router.get("/")
async def get_themes():

    themes = await theme_service.get_all_themes()

    for theme in themes:
        theme["_id"] = str(theme["_id"])

    return {
        "success": True,
        "count": len(themes),
        "data": themes
    }


@router.post("/sync")
async def sync_themes():

    return await theme_service.sync()