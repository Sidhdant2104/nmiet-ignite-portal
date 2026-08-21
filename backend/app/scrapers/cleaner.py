"""Text cleaning and normalization utilities for SIH problem statement data.

Handles mojibake encoding issues, HTML-to-text conversion, whitespace
normalization, and structured link extraction from BeautifulSoup elements.
"""

import html
import re
from typing import Optional

from bs4 import Tag


# ── Mojibake / smart-quote repair table ────────────────────────────────────

_ENCODING_FIXES: dict[str, str] = {
    "â\x80\x99": "'",     # right single quotation mark
    "â\x80\x93": "–",     # en dash
    "â\x80\x94": "—",     # em dash
    "Â°C": "°C",          # degree Celsius
    "â\x80\x9c": '"',     # left double quotation mark
    "â\x80\x9d": '"',     # right double quotation mark
    "â\x80¦": "…",        # horizontal ellipsis
    "â\x80\x98": "'",     # left single quotation mark
    "\xa0": " ",           # non-breaking space → regular space
}


def fix_encoding(text: str) -> str:
    """Replace common mojibake sequences produced by Windows-1252/UTF-8
    round-trip corruption with their correct Unicode characters."""
    if not text:
        return ""
    for bad, good in _ENCODING_FIXES.items():
        text = text.replace(bad, good)
    return text.strip()


# ── HTML → plain text ──────────────────────────────────────────────────────

def clean_html_to_text(value: str) -> str:
    """Convert an HTML fragment to clean plain text.

    Steps:
    1. Decode HTML entities (&amp; → &, etc.)
    2. Replace <br>, <br/>, </p>, </li> with newlines to preserve
       intentional line breaks.
    3. Strip all remaining HTML tags.
    4. Fix mojibake encoding.
    5. Normalize whitespace.
    """
    if not value:
        return ""

    # Decode HTML entities first
    text = html.unescape(value)

    # Preserve intentional line breaks
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = re.sub(r"</(?:p|li|div|tr)>", "\n", text, flags=re.I)

    # Strip all remaining HTML tags
    text = re.sub(r"<[^>]+>", "", text)

    text = fix_encoding(text)
    return normalize_whitespace(text)


# ── Whitespace normalization ───────────────────────────────────────────────

def normalize_whitespace(text: str) -> str:
    """Collapse runs of spaces/tabs within each line, strip leading/trailing
    whitespace from each line, and collapse 3+ consecutive blank lines to 2.
    """
    if not text:
        return ""

    # Collapse horizontal whitespace within each line
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.splitlines()]

    # Remove completely empty leading/trailing lines
    result = "\n".join(lines).strip()

    # Collapse excessive blank lines (3+ → 2)
    result = re.sub(r"\n{3,}", "\n\n", result)

    return result


# ── Link extraction ───────────────────────────────────────────────────────

def extract_link_href(td: Tag) -> Optional[str]:
    """Extract the href from the first <a> tag inside a <td> element.

    Returns the URL string or None if no link is present or if the link
    text is a placeholder like 'NA', 'N/A', '-', or is empty.
    """
    if td is None:
        return None

    anchor = td.find("a")
    if anchor is None:
        return None

    href = (anchor.get("href") or "").strip()
    if not href or href in ("#", "javascript:void(0)", "javascript:;"):
        return None

    # Check link text for placeholders
    link_text = anchor.get_text(strip=True).lower()
    if link_text in ("na", "n/a", "-", "nil", "none", ""):
        return None

    return href


def extract_text_or_link(td: Tag) -> str:
    """Extract plain text from a <td>. If the cell contains an <a> tag,
    prefer the href over the display text (useful for contact info)."""
    if td is None:
        return ""

    # For cells that contain only a link, return the href
    anchor = td.find("a")
    if anchor:
        href = (anchor.get("href") or "").strip()
        mail_match = re.match(r"mailto:(.+)", href, re.I)
        if mail_match:
            return mail_match.group(1).strip()

    # Default: return cleaned text
    return clean_html_to_text(td.decode_contents())


# ── Bullet / label prefix removal ─────────────────────────────────────────

def strip_label_prefix(text: str) -> str:
    """Remove leading bullet characters (•, -, *) and label-like colons."""
    if not text:
        return ""
    return re.sub(r"^[\s•\-\*]+", "", text).strip()
