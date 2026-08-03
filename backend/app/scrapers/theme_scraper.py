from app.scrapers.base_scraper import BaseScraper
from app.scrapers.theme_parser import ThemeParser


class ThemeScraper(BaseScraper):

    URL = "https://sih.gov.in"

    async def run(self):

        await self.start()

        print("🌐 Opening SIH Website...")

        await self.goto(self.URL)

        parser = ThemeParser()

        themes = await parser.parse(self.page)

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