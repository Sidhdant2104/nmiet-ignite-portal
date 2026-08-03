from playwright.async_api import Page

from app.schemas.problem import Problem


class ProblemParser:

    async def parse(self, page: Page) -> list[Problem]:
        """
        Parse the SIH problem statement table and return Problem objects.
        """

        problems: list[Problem] = []

        table = page.locator("table").first

        if await table.count() == 0:
            return problems

        rows = table.locator("tbody tr")

        row_count = await rows.count()

        print(f"📄 Found {row_count} table rows")

        for i in range(row_count):

            row = rows.nth(i)

            cells = await row.locator("td").all_inner_texts()

            # Skip empty rows
            if not cells:
                continue

            # SIH currently shows this when no problems are published
            if "No data available" in cells[0]:
                print("⚠️ No problem statements available.")
                continue

            problem = Problem(
                ps_number=cells[4].strip(),
                title=cells[2].strip(),
                organization=cells[1].strip(),
                department=None,
                theme=cells[6].strip(),
                category=cells[3].strip(),
                description=None,
            )

            problems.append(problem)

        return problems