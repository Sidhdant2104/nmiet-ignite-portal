from app.schemas.theme import Theme


class ThemeParser:

    async def parse(self, page):

        headings = page.locator("h1, h2, h3, h4, h5")

        count = await headings.count()

        collecting = False

        themes = []

        seen = set()

        for i in range(count):

            text = (await headings.nth(i).inner_text()).strip()

            if text == "THEMES":
                collecting = True
                continue

            if text == "SIH PROCESS FLOW AND TIMELINE":
                break

            if not collecting:
                continue

            if text in seen:
                continue

            seen.add(text)

            themes.append(
                Theme(
                    name=text
                ).model_dump()
            )

        return themes