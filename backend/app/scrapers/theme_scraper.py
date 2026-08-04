from app.scrapers.base_scraper import BaseScraper
from app.scrapers.theme_parser import ThemeParser
from app.mongodb import theme_collection


class ThemeScraper(BaseScraper):

    URL = "https://sih.gov.in/SIH_Themes"

    async def run(self):

        await self.start()

        print("🌐 Opening SIH Website...")

        await self.goto(self.URL)
        await self.page.wait_for_timeout(5000)

       
        parser = ThemeParser()

        themes = await parser.parse(self.page)

        # Refresh themes collection
        await theme_collection.delete_many({})

        if themes:
            await theme_collection.insert_many(themes)
            print(f"✅ Saved {len(themes)} themes to MongoDB")

        await self.close()

        return themes


async def main():

    scraper = ThemeScraper()

    themes = await scraper.run()

    print(f"\nFound {len(themes)} themes\n")

    for theme in themes:
        print(theme)


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())