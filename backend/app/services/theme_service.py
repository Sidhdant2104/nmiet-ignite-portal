from app.mongodb import db
from app.scrapers.cleaner import canonicalize_name, normalize_text


class ThemeService:

    def __init__(self):
        self.collection = db["themes"]

    async def get_all_themes(self) -> list[dict]:
        """Return a clean, deduplicated list of all themes with canonical formatting."""
        raw_themes = await self.collection.find().to_list(length=None)
        
        # Deduplicate themes case-insensitively and standardize formatting
        unique_themes: dict[str, dict] = {}

        for theme in raw_themes:
            canonical_name = canonicalize_name(theme.get("name", ""))
            norm_key = normalize_text(canonical_name)
            if not norm_key:
                continue

            if norm_key not in unique_themes:
                theme_copy = dict(theme)
                theme_copy["_id"] = str(theme_copy.get("_id", ""))
                theme_copy["name"] = canonical_name
                unique_themes[norm_key] = theme_copy
            else:
                # Merge description / icon if current is richer
                existing = unique_themes[norm_key]
                if not existing.get("icon") and theme.get("icon"):
                    existing["icon"] = theme.get("icon")
                if not existing.get("description") and theme.get("description"):
                    existing["description"] = theme.get("description")

        # Also ensure any themes present in problems are included
        problem_themes = await db["problems"].distinct("theme")
        for pt in problem_themes:
            if not pt:
                continue
            canonical_name = canonicalize_name(pt)
            norm_key = normalize_text(canonical_name)
            if norm_key and norm_key not in unique_themes:
                unique_themes[norm_key] = {
                    "_id": norm_key,
                    "name": canonical_name,
                    "description": f"Problem statements under the {canonical_name} domain.",
                    "icon": "",
                }

        # Sort alphabetically by canonical name
        return sorted(unique_themes.values(), key=lambda x: x.get("name", ""))

    async def sync(self):
        from app.scrapers.theme_scraper import ThemeScraper
        scraper = ThemeScraper()
        themes = await scraper.run()

        inserted = 0

        for theme in themes:
            canonical_name = canonicalize_name(theme.get("name", ""))
            theme["name"] = canonical_name

            exists = await self.collection.find_one(
                {"name": {"$regex": f"^{normalize_text(canonical_name)}$", "$options": "i"}}
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