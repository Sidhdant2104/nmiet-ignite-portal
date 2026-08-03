from playwright.async_api import async_playwright


class BaseScraper:

    def __init__(self):
        self.playwright = None
        self.browser = None
        self.page = None

    async def start(self):

        self.playwright = await async_playwright().start()

        self.browser = await self.playwright.chromium.launch(
            headless=False
        )

        self.page = await self.browser.new_page()

    async def goto(self, url: str):

        await self.page.goto(
            url,
            wait_until="domcontentloaded",
            timeout = 60000
        )
        await self.page.wait_for_timeout(3000)

    async def screenshot(self, filename: str):

        await self.page.screenshot(
            path=filename,
            full_page=True
        )

    async def html(self):

        return await self.page.content()

    async def close(self):

        await self.browser.close()
        await self.playwright.stop()