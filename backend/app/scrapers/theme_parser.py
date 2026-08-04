from app.schemas.theme import Theme


class ThemeParser:

    async def parse(self, page):

        rows = page.locator("table.partnerTable tbody tr")

        themes = []

        for i in range(await rows.count()):

            row = rows.nth(i)

            name = (
                await row.locator(".themesTitle h3").inner_text()
            ).strip()

            description = (
                await row.locator(".themesDetails p").inner_text()
            ).strip()

            icon = await row.locator(".themeImg2022 img").get_attribute("src")

            if icon:
                icon = f"https://sih.gov.in{icon}"

            themes.append(
                Theme(
                    name=name,
                    description=description,
                    icon=icon,
                ).model_dump()
            )

        return themes