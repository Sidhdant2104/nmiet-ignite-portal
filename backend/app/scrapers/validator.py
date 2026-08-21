"""Validation layer for parsed SIH problem statements.

Validates extracted data before it gets persisted. Logs warnings for
entries that fail validation so they can be investigated without
silently corrupting the database.
"""

import logging
import re
from typing import Optional

logger = logging.getLogger("sih_scraper.validator")


# Labels that should NEVER appear inside field values — indicates
# the parser leaked an adjacent field's label into the value.
_LEAKED_LABELS = frozenset({
    "description",
    "background",
    "problem description",
    "problem statement title",
    "organization",
    "department",
    "category",
    "theme",
    "youtube link",
    "dataset link",
    "contact info",
    "expected solution",
})


class ValidationResult:
    """Container for validation outcome of a single problem statement."""

    def __init__(self, ps_number: str) -> None:
        self.ps_number: str = ps_number
        self.errors: list[str] = []
        self.warnings: list[str] = []

    @property
    def is_valid(self) -> bool:
        return len(self.errors) == 0

    def add_error(self, message: str) -> None:
        self.errors.append(message)

    def add_warning(self, message: str) -> None:
        self.warnings.append(message)

    def __repr__(self) -> str:
        status = "VALID" if self.is_valid else "INVALID"
        parts = [f"[{status}] {self.ps_number}"]
        for err in self.errors:
            parts.append(f"  ❌ {err}")
        for warn in self.warnings:
            parts.append(f"  ⚠️  {warn}")
        return "\n".join(parts)


def validate_problem(data: dict) -> ValidationResult:
    """Validate a parsed problem statement dictionary.

    Checks:
    - ps_number must exist and match SIH\d+ format
    - title must not be empty
    - theme must not contain leaked labels from adjacent fields
    - category must not contain leaked labels
    - description should have reasonable length (> 20 chars)
    - organization should not be empty

    Returns a ValidationResult with errors (hard failures that should
    prevent saving) and warnings (suspicious data worth investigating).
    """
    ps_number = data.get("ps_number", "UNKNOWN")
    result = ValidationResult(ps_number)

    # ── PS Number ──────────────────────────────────────────────────────
    if not ps_number or ps_number == "UNKNOWN":
        result.add_error("ps_number is missing")
    elif not re.match(r"^SIH\d{4,6}$", ps_number):
        result.add_warning(f"ps_number '{ps_number}' has unexpected format")

    # ── Title ──────────────────────────────────────────────────────────
    title = data.get("title", "")
    if not title:
        result.add_error("title is empty")
    elif len(title) < 5:
        result.add_warning(f"title is suspiciously short: '{title}'")

    # ── Theme — check for label contamination ──────────────────────────
    theme = data.get("theme", "")
    if theme:
        _check_label_contamination(result, "theme", theme)
    else:
        result.add_warning("theme is empty")

    # ── Category — check for label contamination ───────────────────────
    category = data.get("category", "")
    if category:
        _check_label_contamination(result, "category", category)
        if category not in ("Software", "Hardware", "Software & Hardware"):
            result.add_warning(
                f"category '{category}' is not a standard value"
            )
    else:
        result.add_warning("category is empty")

    # ── Description ────────────────────────────────────────────────────
    description = data.get("description", "")
    if not description:
        result.add_warning("description is empty")
    elif len(description) < 20:
        result.add_warning(
            f"description is suspiciously short ({len(description)} chars)"
        )

    # ── Organization ───────────────────────────────────────────────────
    organization = data.get("organization", "")
    if not organization:
        result.add_warning("organization is empty")

    return result


def _check_label_contamination(
    result: ValidationResult, field_name: str, value: str
) -> None:
    """Detect if a field value contains text that looks like a leaked
    label from an adjacent field (e.g., theme='Blockchain & Cybersecurity
    Youtube Link Dataset Link Contact info')."""

    # Check if the value exactly matches a label
    if value.strip().lower() in _LEAKED_LABELS:
        result.add_error(
            f"{field_name} contains only a leaked label: '{value}'"
        )
        return

    # Check for newline-separated label contamination
    lines = value.strip().splitlines()
    if len(lines) > 1:
        contaminated_lines = [
            line.strip()
            for line in lines[1:]
            if line.strip().lower() in _LEAKED_LABELS
        ]
        if contaminated_lines:
            result.add_error(
                f"{field_name} has label contamination: "
                f"{contaminated_lines}"
            )


def log_validation_results(
    results: list[ValidationResult],
) -> tuple[int, int]:
    """Log all validation results and return counts of (valid, invalid)."""
    valid_count = 0
    invalid_count = 0

    for result in results:
        if result.is_valid:
            valid_count += 1
            for warn in result.warnings:
                logger.warning("%s: %s", result.ps_number, warn)
        else:
            invalid_count += 1
            for err in result.errors:
                logger.error("%s: %s", result.ps_number, err)
            for warn in result.warnings:
                logger.warning("%s: %s", result.ps_number, warn)

    logger.info(
        "Validation summary: %d valid, %d invalid out of %d total",
        valid_count,
        invalid_count,
        valid_count + invalid_count,
    )

    return valid_count, invalid_count
