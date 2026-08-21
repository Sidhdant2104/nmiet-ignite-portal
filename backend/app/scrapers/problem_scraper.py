"""SIH Problem Statement scraper — orchestrates fetching and parsing.

Uses Playwright to load the SIH portal's DataTable, then delegates to
ProblemParser for DOM-based extraction and validation.
"""

import logging

from app.scrapers.base_scraper import BaseScraper
from app.scrapers.problem_parser import ProblemParser
from app.scrapers.validator import log_validation_results, validate_problem

logger = logging.getLogger("sih_scraper")


class ProblemScraper(BaseScraper):

    URL = "https://sih.gov.in/sih2026PS"

    async def run(self, *, debug: bool = False) -> list[dict]:
        """Scrape all problem statements from the SIH portal.

        Args:
            debug: If True, print a diagnostic block for each entry
                   showing extracted fields and validation status.

        Returns:
            A list of problem statement dicts ready for persistence.
        """
        await self.start()

        logger.info("🌐 Opening SIH Problem Statement Portal...")
        print("🌐 Opening SIH Problem Statement Portal...")

        await self.goto(self.URL)

        # Wait extra time for DataTable to initialize with all data
        await self.page.wait_for_timeout(3000)

        logger.info("📄 Page loaded, starting extraction...")
        print("📄 Page loaded, starting extraction...")

        parser = ProblemParser()
        problems = await parser.parse(self.page, debug=debug)

        # Run validation summary
        results = [validate_problem(p) for p in problems]
        valid, invalid = log_validation_results(results)

        print(f"\n{'=' * 50}")
        print(f"  ✅ Parsed: {len(problems)} problem statements")
        print(f"  ✅ Valid:  {valid}")
        print(f"  ⚠️  Issues: {invalid}")
        print(f"{'=' * 50}")

        await self.close()

        # Strip internal validation metadata before returning
        for p in problems:
            p.pop("_validation_errors", None)
            p.pop("_validation_warnings", None)

        return problems


async def main():
    """Run the scraper standalone with debug output enabled."""
    import sys

    # Enable debug mode via --debug flag
    debug = "--debug" in sys.argv

    # Configure logging
    logging.basicConfig(
        level=logging.DEBUG if debug else logging.INFO,
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
        datefmt="%H:%M:%S",
    )

    scraper = ProblemScraper()
    problems = await scraper.run(debug=debug)

    print(f"\n{'=' * 50}")
    print(f"Total Problems: {len(problems)}")
    print(f"{'=' * 50}")

    if debug:
        # In debug mode the per-entry output is already printed
        pass
    else:
        # Print a compact summary
        for p in problems[:10]:
            print(
                f"  {p['ps_number']} | "
                f"{p['title'][:60]} | "
                f"{p['theme']}"
            )
        if len(problems) > 10:
            print(f"  ... and {len(problems) - 10} more")


if __name__ == "__main__":

    import asyncio

    asyncio.run(main())