import logging
import re
from typing import Optional

from app.mongodb import db
from app.scrapers.cleaner import (
    build_flexible_regex,
    canonicalize_name,
    normalize_text,
)
from app.services.search_service import (
    build_searchable_text,
    calculate_relevance_score,
    expand_query_terms,
)

logger = logging.getLogger("problem_service")


class ProblemService:

    def __init__(self):
        self.collection = db["problems"]

    @staticmethod
    def _serialize(doc: dict) -> dict:
        """Convert MongoDB _id to string for JSON serialization."""
        if doc and "_id" in doc:
            doc["_id"] = str(doc["_id"])
        return doc

    async def get_all_problems(self) -> list[dict]:
        docs = await self.collection.find().to_list(length=None)
        return [self._serialize(d) for d in docs]

    async def get_problems_filtered(
        self,
        search: Optional[str] = None,
        theme: Optional[str] = None,
        category: Optional[str] = None,
        organization: Optional[str] = None,
    ) -> list[dict]:
        """Return problems with server-side normalization and AI keyword-expanded search."""
        conditions = []

        # 1. Theme Filter (Normalized and case/whitespace-insensitive)
        if theme and theme.strip() and theme.strip().lower() != "all":
            theme_regex = build_flexible_regex(theme, whole_phrase=True)
            if theme_regex:
                conditions.append({"theme": {"$regex": theme_regex, "$options": "i"}})

        # 2. Category Filter (Software/Hardware)
        if category and category.strip() and category.strip().lower() != "all":
            cat_regex = build_flexible_regex(category, whole_phrase=True)
            if cat_regex:
                conditions.append({"category": {"$regex": cat_regex, "$options": "i"}})

        # 3. Organization Filter
        if organization and organization.strip() and organization.strip().lower() != "all":
            org_regex = build_flexible_regex(organization, whole_phrase=True)
            if org_regex:
                conditions.append({"organization": {"$regex": org_regex, "$options": "i"}})

        # 4. Search Filter (AI-based semantic keyword expansion & ranking)
        expanded_terms: list[str] = []
        if search and search.strip():
            clean_search = search.strip()
            expanded_terms = expand_query_terms(clean_search)

            search_clauses = []
            # Exact search across core fields
            search_clauses.append({"ps_number": {"$regex": re.escape(clean_search), "$options": "i"}})
            search_clauses.append({"title": {"$regex": re.escape(clean_search), "$options": "i"}})
            search_clauses.append({"theme": {"$regex": re.escape(clean_search), "$options": "i"}})
            search_clauses.append({"organization": {"$regex": re.escape(clean_search), "$options": "i"}})
            search_clauses.append({"category": {"$regex": re.escape(clean_search), "$options": "i"}})
            search_clauses.append({"description": {"$regex": re.escape(clean_search), "$options": "i"}})
            search_clauses.append({"expected_solution": {"$regex": re.escape(clean_search), "$options": "i"}})
            search_clauses.append({"searchable_text": {"$regex": re.escape(clean_search), "$options": "i"}})

            # Add expanded semantic terms clauses
            for term in expanded_terms[:25]:  # Limit top terms for query performance
                if len(term) >= 3 and term.lower() != clean_search.lower():
                    search_clauses.append({"title": {"$regex": r"\b" + re.escape(term) + r"\b", "$options": "i"}})
                    search_clauses.append({"theme": {"$regex": r"\b" + re.escape(term) + r"\b", "$options": "i"}})
                    search_clauses.append({"description": {"$regex": r"\b" + re.escape(term) + r"\b", "$options": "i"}})
                    search_clauses.append({"searchable_text": {"$regex": r"\b" + re.escape(term) + r"\b", "$options": "i"}})

            conditions.append({"$or": search_clauses})

        query = {"$and": conditions} if conditions else {}

        docs = await self.collection.find(query).to_list(length=None)
        serialized = [self._serialize(d) for d in docs]

        # 5. Compute Relevance Ranking if search was performed
        if search and search.strip():
            clean_search = search.strip()
            scored_docs = []
            for doc in serialized:
                score = calculate_relevance_score(doc, clean_search, expanded_terms)
                doc["relevance_score"] = score
                scored_docs.append(doc)

            # Sort descending by relevance score, then by PS Number ascending
            scored_docs.sort(key=lambda d: (d.get("relevance_score", 0), d.get("ps_number", "")), reverse=True)
            return scored_docs

        return serialized

    async def get_unique_themes(self) -> list[str]:
        """Aggregate and return a clean, deduplicated list of unique themes."""
        raw_themes = await self.collection.distinct("theme")
        unique_map: dict[str, str] = {}

        for t in raw_themes:
            if not t:
                continue
            canonical = canonicalize_name(t)
            norm_key = normalize_text(canonical)
            if norm_key and norm_key not in unique_map:
                unique_map[norm_key] = canonical

        return sorted(unique_map.values())

    async def get_problem_by_ps_number(self, ps_number: str):
        value = ps_number.strip()
        # The normal path is an indexed exact lookup. Legacy records with a
        # differently-cased identifier still retain the previous fallback.
        doc = await self.collection.find_one({"ps_number": value})
        if not doc:
            doc = await self.collection.find_one({
                "ps_number": {"$regex": f"^{re.escape(value)}$", "$options": "i"}
            })
        return self._serialize(doc) if doc else None

    async def search_problems(self, query: str):
        return await self.get_problems_filtered(search=query)

    async def get_by_theme(self, theme: str):
        return await self.get_problems_filtered(theme=theme)

    async def ensure_normalized_data(self) -> dict:
        """Backfill and normalize existing problem statement records in MongoDB."""
        docs = await self.collection.find().to_list(length=None)
        updated_count = 0

        for doc in docs:
            needs_update = False
            updates = {}

            theme = doc.get("theme", "")
            cat = doc.get("category", "")
            org = doc.get("organization", "")

            canonical_theme = canonicalize_name(theme)
            if canonical_theme != theme:
                updates["theme"] = canonical_theme
                needs_update = True

            canonical_cat = canonicalize_name(cat)
            if canonical_cat != cat:
                updates["category"] = canonical_cat
                needs_update = True

            canonical_org = canonicalize_name(org)
            if canonical_org != org:
                updates["organization"] = canonical_org
                needs_update = True

            current_searchable = doc.get("searchable_text")
            expected_searchable = build_searchable_text({**doc, **updates})
            if current_searchable != expected_searchable:
                updates["searchable_text"] = expected_searchable
                needs_update = True

            if needs_update:
                await self.collection.update_one(
                    {"_id": doc["_id"]},
                    {"$set": updates}
                )
                updated_count += 1

        logger.info("Ensured data normalization: updated %d documents", updated_count)
        return {"total": len(docs), "normalized": updated_count}

    async def sync(self):
        from app.scrapers.problem_scraper import ProblemScraper
        scraper = ProblemScraper()
        problems = await scraper.run()

        inserted = 0
        updated = 0

        for problem in problems:
            # Normalize fields before saving
            problem["theme"] = canonicalize_name(problem.get("theme", ""))
            problem["category"] = canonicalize_name(problem.get("category", ""))
            problem["organization"] = canonicalize_name(problem.get("organization", ""))
            problem["searchable_text"] = build_searchable_text(problem)

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
