from app.mongodb import db
from app.scrapers.theme_scraper import ThemeScraper


class ThemeService:

    def __init__(self):
        self.collection = db["themes"]

    async def get_all_themes(self):
        return await self.collection.find().to_list(length=None)

    async def sync(self):

        scraper = ThemeScraper()

        themes = await scraper.run()

        inserted = 0

        for theme in themes:

            exists = await self.collection.find_one(
                {"name": theme["name"]}
            )

            if exists:
                continue

            await self.collection.insert_one(theme)

            inserted += 1

        return {
            "inserted": inserted,
            "total": len(themes)
        }


theme_service = ThemeService()