"""DOM-based problem statement parser for the SIH portal.

Extracts structured data from the jQuery DataTable on sih.gov.in/sih2026PS.
Each row's column 2 (Problem Statement Title) contains a hidden modal
<div> with a <table id="settings"> whose <tr> rows have <th> (label)
and <td> (value) pairs.  This parser exploits that structure directly —
no regex-based text extraction is needed.

Architecture:
  Playwright  →  DataTable.rows().data()  →  raw cell HTML strings
      ↓
  BeautifulSoup  →  <table id="settings">  →  <th>/<td> pairs
      ↓
  cleaner  →  normalize text, fix encoding, extract links
      ↓
  validator  →  flag problems before persistence
"""

import logging
import re
from datetime import datetime, timezone
from typing import Any, Optional

from bs4 import BeautifulSoup, Tag
from playwright.async_api import Page

from app.scrapers.cleaner import (
    clean_html_to_text,
    extract_link_href,
    extract_text_or_link,
    fix_encoding,
    normalize_whitespace,
)
from app.scrapers.validator import ValidationResult, validate_problem

logger = logging.getLogger("sih_scraper.parser")


# ── Column indices in the DataTable ────────────────────────────────────────
# These map to the 8 visible columns on the SIH portal table.

COL_SERIAL = 0           # S.No.
COL_ORGANIZATION = 1     # Organization (plain text)
COL_TITLE_MODAL = 2      # Problem Statement Title + hidden modal HTML
COL_CATEGORY = 3          # Category (Software / Hardware)
COL_PS_NUMBER = 4         # PS Number (SIH26xxx)
COL_SUBMITTED_IDEAS = 5   # Submitted Idea(s) Count (e.g. "0/500")
COL_THEME = 6             # Theme (plain text)
COL_DEADLINE = 7          # Deadline for Idea Submission


# ── Field label normalization map ──────────────────────────────────────────
# The <th> text in the modal table may have slight variations; this maps
# them to canonical field names used in our data model.

_LABEL_MAP: dict[str, str] = {
    "problem statement title": "title",
    "title": "title",
    "description": "description",
    "problem description": "description",
    "background": "description",  # some entries use "Background" instead
    "organization": "organization",
    "organisation": "organization",  # British spelling variant
    "department": "department",
    "category": "category",
    "theme": "theme",
    "youtube link": "youtube_link",
    "dataset link": "dataset_link",
    "contact info": "contact_info",
    "contact information": "contact_info",
    "expected solution": "expected_solution",
}


class ProblemParser:
    """Parses SIH problem statements from the live portal via Playwright.

    Uses a two-layer extraction strategy:
    1. **Outer table columns** — reliable for organization, category,
       PS number, theme, and deadline (simple text cells).
    2. **Inner modal table** — provides title, description, department,
       and optional fields (youtube, dataset, contact) via structured
       <th>/<td> rows.

    Layer 1 values are used as fallbacks when the modal is missing or
    incomplete.
    """

    async def parse(self, page: Page, *, debug: bool = False) -> list[dict]:
        """Extract all problem statements from the DataTable.

        Args:
            page: A Playwright page that has already navigated to the
                  SIH problem statement URL and waited for load.
            debug: If True, print a diagnostic block for each entry.

        Returns:
            A list of validated problem statement dicts ready for
            database insertion.
        """
        rows = await self._fetch_datatable_rows(page)
        logger.info("DataTable returned %d rows", len(rows))

        problems: list[dict] = []
        validation_results: list[ValidationResult] = []

        for row in rows:
            try:
                parsed = self._parse_row(row)
                if parsed is None:
                    continue

                result = validate_problem(parsed)
                validation_results.append(result)

                if debug:
                    self._print_debug(parsed, result)

                if not result.is_valid:
                    logger.warning(
                        "Skipping invalid entry: %s", result
                    )
                    # Still include it but log the issues — the caller
                    # can decide whether to persist partial data.
                    parsed["_validation_errors"] = result.errors
                    parsed["_validation_warnings"] = result.warnings

                problems.append(parsed)

            except Exception as exc:
                logger.error(
                    "Unhandled error parsing row: %s — %s",
                    _safe_ps_number(row),
                    exc,
                    exc_info=True,
                )

        logger.info(
            "Parsed %d problems (%d valid, %d with issues)",
            len(problems),
            sum(1 for r in validation_results if r.is_valid),
            sum(1 for r in validation_results if not r.is_valid),
        )

        return problems

    # ── DataTable row fetching ─────────────────────────────────────────

    @staticmethod
    async def _fetch_datatable_rows(page: Page) -> list[list[str]]:
        """Use the jQuery DataTable API to retrieve ALL rows at once,
        bypassing client-side pagination.

        Returns a list of rows, where each row is a list of 8 cell
        HTML strings corresponding to the table columns.
        """
        rows: list[list[str]] = await page.evaluate("""
        () => {
            const table = document.querySelector("table");
            if (!table) return [];

            // Try the DataTable API first (handles pagination)
            if (window.jQuery && $.fn.DataTable && $.fn.DataTable.isDataTable(table)) {
                return $(table).DataTable().rows().data().toArray();
            }

            // Fallback: read rows directly from the DOM
            const result = [];
            const tbody = table.querySelector("tbody");
            if (!tbody) return [];
            for (const tr of tbody.querySelectorAll("tr")) {
                const cells = [];
                for (const td of tr.querySelectorAll("td")) {
                    cells.push(td.innerHTML);
                }
                if (cells.length > 0) result.push(cells);
            }
            return result;
        }
        """)

        return rows

    # ── Single row parsing ─────────────────────────────────────────────

    def _parse_row(self, row: list[Any]) -> Optional[dict]:
        """Parse a single DataTable row into a problem statement dict.

        Returns None if the row is malformed or missing critical data.
        """
        if not isinstance(row, list) or len(row) < 7:
            return None

        cells = [str(cell) for cell in row]

        # ── Step 1: Extract PS number (required) ───────────────────────
        ps_number = self._extract_ps_number(cells)
        if not ps_number:
            return None

        # ── Step 2: Extract outer table metadata (reliable fallbacks) ──
        outer = self._extract_outer_columns(cells)

        # ── Step 3: Extract inner modal table (rich structured data) ───
        inner = self._extract_modal_fields(cells[COL_TITLE_MODAL])

        # ── Step 4: Extract title from the <a> tag in column 2 ─────────
        link_title = self._extract_link_title(cells[COL_TITLE_MODAL])

        # ── Step 5: Merge with inner > outer > link fallback priority ──
        now = datetime.now(timezone.utc)

        problem = {
            "ps_number": ps_number,
            "title": (
                inner.get("title")
                or link_title
                or outer.get("title", "")
            ),
            "organization": (
                inner.get("organization")
                or outer.get("organization", "")
            ),
            "department": inner.get("department", ""),
            "category": (
                inner.get("category")
                or outer.get("category", "")
            ),
            "theme": (
                inner.get("theme")
                or outer.get("theme", "")
            ),
            "description": inner.get("description", ""),
            "expected_solution": inner.get("expected_solution", ""),
            "youtube_link": inner.get("youtube_link"),
            "dataset_link": inner.get("dataset_link"),
            "contact_info": inner.get("contact_info", ""),
            "submitted_ideas": outer.get("submitted_ideas", 0),
            "deadline": outer.get("deadline"),
            "source_url": None,
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        }

        return problem

    # ── PS number extraction ───────────────────────────────────────────

    @staticmethod
    def _extract_ps_number(cells: list[str]) -> Optional[str]:
        """Find the SIH problem statement number from any cell.

        Preferably uses column 4 (PS Number), but will scan all cells
        as a fallback.
        """
        # Try the dedicated PS Number column first
        if len(cells) > COL_PS_NUMBER:
            match = re.search(r"SIH\d+", cells[COL_PS_NUMBER])
            if match:
                return match.group()

        # Fallback: scan all cells
        for cell in cells:
            match = re.search(r"SIH\d+", cell)
            if match:
                return match.group()

        return None

    # ── Outer column extraction (reliable metadata) ────────────────────

    @staticmethod
    def _extract_outer_columns(cells: list[str]) -> dict:
        """Extract metadata from the plain-text outer table columns.

        These are simple text cells that don't contain nested HTML
        structures (except column 2), so they're very reliable.
        """
        result: dict = {}

        # Organization (column 1) — plain text
        if len(cells) > COL_ORGANIZATION:
            org_soup = BeautifulSoup(cells[COL_ORGANIZATION], "html.parser")
            result["organization"] = normalize_whitespace(
                fix_encoding(org_soup.get_text(strip=True))
            )

        # Category (column 3) — plain text: "Software" or "Hardware"
        if len(cells) > COL_CATEGORY:
            cat_soup = BeautifulSoup(cells[COL_CATEGORY], "html.parser")
            result["category"] = normalize_whitespace(
                fix_encoding(cat_soup.get_text(strip=True))
            )

        # Theme (column 6) — plain text
        if len(cells) > COL_THEME:
            theme_soup = BeautifulSoup(cells[COL_THEME], "html.parser")
            result["theme"] = normalize_whitespace(
                fix_encoding(theme_soup.get_text(strip=True))
            )

        # Submitted ideas count (column 5) — e.g. "0/500"
        if len(cells) > COL_SUBMITTED_IDEAS:
            ideas_text = BeautifulSoup(
                cells[COL_SUBMITTED_IDEAS], "html.parser"
            ).get_text(strip=True)
            match = re.match(r"(\d+)", ideas_text)
            result["submitted_ideas"] = int(match.group(1)) if match else 0

        # Deadline (column 7) — e.g. "20 September 2026"
        if len(cells) > COL_DEADLINE:
            deadline_text = BeautifulSoup(
                cells[COL_DEADLINE], "html.parser"
            ).get_text(strip=True)
            result["deadline"] = _parse_deadline(deadline_text)

        return result

    # ── Link title extraction ──────────────────────────────────────────

    @staticmethod
    def _extract_link_title(cell_html: str) -> str:
        """Extract the visible title text from the <a> tag in column 2.

        The title cell contains something like:
        <a href="#" data-toggle="modal" data-target="#SIH26001">
            AI-Based early warning and landslide Risk Monitoring System
        </a>
        <div class="modal ..."> ... </div>

        We want the <a> tag's text content as a fallback title.
        """
        if not cell_html:
            return ""

        soup = BeautifulSoup(cell_html, "html.parser")
        anchor = soup.find("a")
        if anchor:
            return normalize_whitespace(fix_encoding(anchor.get_text(strip=True)))

        return ""

    # ── Modal field extraction (the core fix) ──────────────────────────

    def _extract_modal_fields(self, cell_html: str) -> dict:
        """Parse the hidden modal's <table id="settings"> to extract
        all fields via structured <th>/<td> DOM traversal.

        This is the key improvement over the old regex approach.
        The modal table has rows like:
            <tr><th>Problem Statement Title</th><td>...</td></tr>
            <tr><th>Description</th><td>...</td></tr>

        We iterate these rows and map <th> text to canonical field
        names via _LABEL_MAP, then extract the <td> value using the
        appropriate strategy (plain text, HTML-to-text, or link href).
        """
        if not cell_html:
            return {}

        soup = BeautifulSoup(cell_html, "html.parser")

        # Find the settings table inside the modal
        # Try id="settings" first, then fall back to any table in a modal div
        settings_table = soup.find("table", id="settings")

        if not settings_table:
            # Fallback: look for any table inside a modal div
            modal = soup.find("div", class_=lambda x: x and "modal" in x)
            if modal:
                settings_table = modal.find("table")

        if not settings_table:
            logger.debug("No settings table found in modal HTML")
            return {}

        fields: dict = {}

        for tr in settings_table.find_all("tr"):
            th = tr.find("th")
            td = tr.find("td")

            if th is None or td is None:
                continue

            # Normalize the label
            label_text = normalize_whitespace(
                fix_encoding(th.get_text(strip=True))
            ).lower()

            field_name = _LABEL_MAP.get(label_text)
            if field_name is None:
                # Unknown label — log and skip
                logger.debug("Unknown modal field label: '%s'", label_text)
                continue

            # Extract value based on field type
            if field_name in ("youtube_link", "dataset_link"):
                # These should be URLs — extract the href
                href = extract_link_href(td)
                if href:
                    fields[field_name] = href
                else:
                    # Fall back to text (might be "NA" or similar)
                    text = clean_html_to_text(td.decode_contents())
                    if text.lower() not in ("na", "n/a", "-", "nil", "none", ""):
                        fields[field_name] = text

            elif field_name == "contact_info":
                # Contact info may contain email links or plain text
                fields[field_name] = extract_text_or_link(td)

            elif field_name == "description":
                # Descriptions often contain structured HTML (lists,
                # paragraphs) — preserve some formatting
                fields[field_name] = clean_html_to_text(
                    td.decode_contents()
                )

            else:
                # Standard text fields (title, organization, etc.)
                fields[field_name] = normalize_whitespace(
                    fix_encoding(td.get_text(strip=True))
                )

        return fields

    # ── Debug output ───────────────────────────────────────────────────

    @staticmethod
    def _print_debug(problem: dict, result: ValidationResult) -> None:
        """Print a diagnostic block for a single problem statement."""
        status = "✅" if result.is_valid else "❌"
        desc_len = len(problem.get("description", ""))

        print(f"\n{'─' * 50}")
        print(f"  {status} PS NUMBER   : {problem.get('ps_number', '?')}")
        print(f"     TITLE        : {problem.get('title', '')[:80]}")
        print(f"     ORGANIZATION : {problem.get('organization', '')[:60]}")
        print(f"     CATEGORY     : {problem.get('category', '')}")
        print(f"     THEME        : {problem.get('theme', '')}")
        print(f"     DESC LENGTH  : {desc_len} chars")
        if problem.get("youtube_link"):
            print(f"     YOUTUBE      : {problem['youtube_link'][:60]}")
        if problem.get("dataset_link"):
            print(f"     DATASET      : {problem['dataset_link'][:60]}")
        if problem.get("contact_info"):
            print(f"     CONTACT      : {problem['contact_info'][:60]}")
        if not result.is_valid:
            for err in result.errors:
                print(f"     ❌ ERROR     : {err}")
        for warn in result.warnings:
            print(f"     ⚠️  WARN      : {warn}")
        print(f"{'─' * 50}")


# ── Module-level helpers ───────────────────────────────────────────────────

def _parse_deadline(text: str) -> Optional[datetime]:
    """Parse a deadline string like '20 September 2026' into a datetime."""
    if not text:
        return None

    formats = [
        "%d %B %Y",      # "20 September 2026"
        "%d %b %Y",      # "20 Sep 2026"
        "%Y-%m-%d",      # "2026-09-20"
        "%d/%m/%Y",      # "20/09/2026"
    ]

    cleaned = normalize_whitespace(text)
    for fmt in formats:
        try:
            return datetime.strptime(cleaned, fmt).replace(
                tzinfo=timezone.utc
            )
        except ValueError:
            continue

    logger.debug("Could not parse deadline: '%s'", text)
    return None


def _safe_ps_number(row: Any) -> str:
    """Safely extract a PS number from a row for error logging."""
    if isinstance(row, list):
        for cell in row:
            match = re.search(r"SIH\d+", str(cell))
            if match:
                return match.group()
    return "UNKNOWN"