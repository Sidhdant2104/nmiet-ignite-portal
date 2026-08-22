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


# ── Reusable text normalization & regex helpers ───────────────────────────

def normalize_text(value: Optional[str]) -> str:
    """Normalize text: convert to lowercase, strip, and collapse multiple whitespace
    characters into a single space."""
    if not value:
        return ""
    fixed = fix_encoding(str(value))
    cleaned = re.sub(r"\s+", " ", fixed).strip()
    return cleaned.lower()


def canonicalize_name(name: Optional[str]) -> str:
    """Standardize theme, category, or organization formatting:
    - Clean encoding & collapse whitespace
    - Standardize spacing around delimiters (e.g. ' / ', ' & ')
    - Capitalize / title-case cleanly while preserving abbreviations.
    """
    if not name:
        return ""
    fixed = fix_encoding(str(name))
    cleaned = re.sub(r"\s+", " ", fixed).strip()
    cleaned = re.sub(r"\s*/\s*", " / ", cleaned)
    cleaned = re.sub(r"\s*&\s*", " & ", cleaned)

    if cleaned.isupper() or cleaned.islower():
        abbreviations = {
            "AI", "ML", "IOT", "SIH", "DRDO", "ISRO", "NER", "IT", "GIS", "GPS",
            "AICTE", "MIC", "MOE", "ICT", "AR", "VR", "EV", "SMS", "IP",
            "DDOS", "API", "UI", "UX"
        }
        words = cleaned.split()
        formatted_words = []
        for w in words:
            upper_w = w.upper()
            if upper_w in abbreviations:
                formatted_words.append(upper_w)
            elif w.lower() in ("and", "or", "in", "of", "for", "to", "the"):
                formatted_words.append(w.lower())
            elif w in ("&", "/", "-"):
                formatted_words.append(w)
            else:
                formatted_words.append(w.capitalize())
        cleaned = " ".join(formatted_words)
        if cleaned and cleaned[0].islower():
            cleaned = cleaned[0].upper() + cleaned[1:]

    return cleaned


def build_flexible_regex(value: Optional[str], whole_phrase: bool = True) -> str:
    """Build a MongoDB regex pattern that matches across whitespace and delimiter
    variations (e.g. slashes, ampersands, dashes) regardless of casing or extra spaces."""
    if not value:
        return ""
    norm = normalize_text(value)
    tokens = [re.escape(w) for w in re.split(r"[\s/&,-]+", norm) if w]
    if not tokens:
        return ""
    
    inner = r"[\s/&,-]+".join(tokens)
    if whole_phrase:
        return r"^[\s]*" + inner + r"[\s]*$"
    return inner

