from app.mongodb import db
from app.scrapers.problem_scraper import ProblemScraper


class ProblemService:

    def __init__(self):
        self.collection = db["problems"]

    async def get_all_problems(self):
        return await self.collection.find().to_list(length=None)

    async def get_problem_by_ps_number(self, ps_number: str):
        return await self.collection.find_one({
            "ps_number": ps_number
        })

    async def search_problems(self, query: str):
        return await self.collection.find({
            "$or": [
                {
                    "title": {
                        "$regex": query,
                        "$options": "i"
                    }
                },
                {
                    "organization": {
                        "$regex": query,
                        "$options": "i"
                    }
                },
                {
                    "theme": {
                        "$regex": query,
                        "$options": "i"
                    }
                }
            ]
        }).to_list(length=None)

    async def get_by_theme(self, theme: str):
        return await self.collection.find({
            "theme": theme
        }).to_list(length=None)

    async def sync(self):
        scraper = ProblemScraper()

        problems = await scraper.run()

        inserted = 0
        updated = 0

        for problem in problems:

            existing = await self.collection.find_one(
                {"ps_number": problem["ps_number"]}
            )

            if existing:

                await self.collection.update_one(
                    {"_id": existing["_id"]},
                    {"$set": problem}
                )

                updated += 1

            else:

                await self.collection.insert_one(problem)

                inserted += 1

        return {
            "inserted": inserted,
            "updated": updated,
            "total": len(problems),
        }


problem_service = ProblemService()