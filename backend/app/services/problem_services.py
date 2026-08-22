import re

from app.mongodb import db
from app.scrapers.problem_scraper import ProblemScraper


class ProblemService:

    def __init__(self):
        self.collection = db["problems"]

    @staticmethod
    def _serialize(doc: dict) -> dict:
        """Convert MongoDB _id to string for JSON serialization."""
        if doc and "_id" in doc:
            doc["_id"] = str(doc["_id"])
        return doc

    async def get_all_problems(self):
        docs = await self.collection.find().to_list(length=None)
        return [self._serialize(d) for d in docs]

    async def get_problems_filtered(
        self,
        search: str | None = None,
        theme: str | None = None,
        category: str | None = None,
    ) -> list[dict]:
        """Return problems with optional server-side filtering."""
        conditions = []

        if search:
            conditions.append({
                "$or": [
                    {"title": {"$regex": search, "$options": "i"}},
                    {"organization": {"$regex": search, "$options": "i"}},
                    {"ps_number": {"$regex": search, "$options": "i"}},
                    {"theme": {"$regex": search, "$options": "i"}},
                ]
            })

        if theme:
            conditions.append({
                "theme": {"$regex": re.escape(theme.strip()), "$options": "i"}
            })

        if category:
            conditions.append({"category": category})

        query = {"$and": conditions} if conditions else {}

        docs = await self.collection.find(query).to_list(length=None)
        return [self._serialize(d) for d in docs]

    async def get_problem_by_ps_number(self, ps_number: str):
        doc = await self.collection.find_one({
            "ps_number": ps_number.upper()
        })
        return self._serialize(doc) if doc else None

    async def search_problems(self, query: str):
        docs = await self.collection.find({
            "$or": [
                {"title": {"$regex": query, "$options": "i"}},
                {"organization": {"$regex": query, "$options": "i"}},
                {"theme": {"$regex": query, "$options": "i"}},
            ]
        }).to_list(length=None)
        return [self._serialize(d) for d in docs]

    async def get_by_theme(self, theme: str):
        docs = await self.collection.find({
            "theme": theme
        }).to_list(length=None)
        return [self._serialize(d) for d in docs]

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

                # Preserve the original created_at timestamp
                problem.pop("created_at", None)

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
