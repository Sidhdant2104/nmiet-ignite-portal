from app.scrapers.base_scraper import BaseScraper
from app.scrapers.problem_parser import ProblemParser


class ProblemScraper(BaseScraper):

    URL = "https://sih.gov.in/sih2025PS"

    async def run(self):

        await self.start()

        print("🌐 Opening SIH Problem Statement Portal...")

        await self.goto(self.URL)

        print("📸 Taking Screenshot...")

        await self.screenshot("sih_homepage.png")

        html = await self.html()

        print(f"📄 Downloaded {len(html)} characters")

        parser = ProblemParser()

        problems = await parser.parse(self.page)

        print(f"✅ Parsed {len(problems)} problems")

        await self.close()

        return problems


async def main():

    scraper = ProblemScraper()

    problems = await scraper.run()

    print("\n==============================")
    print(f"Total Problems: {len(problems)}")
    print("==============================")

    for problem in problems:
        print(problem)


if __name__ == "__main__":

    import asyncio

    asyncio.run(main())