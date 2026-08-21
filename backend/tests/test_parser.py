"""Unit tests for the SIH problem statement parser.

Tests DOM-based extraction using realistic HTML fixtures that mirror
the actual structure of the SIH portal's DataTable and modal tables.
"""

import pytest
from datetime import datetime, timezone

from app.scrapers.problem_parser import ProblemParser
from app.scrapers.cleaner import (
    clean_html_to_text,
    extract_link_href,
    extract_text_or_link,
    fix_encoding,
    normalize_whitespace,
)
from app.scrapers.validator import validate_problem


# ═══════════════════════════════════════════════════════════════════════════
#  HTML Fixtures — realistic mock data matching the SIH portal structure
# ═══════════════════════════════════════════════════════════════════════════

def _make_modal_html(
    ps_number: str = "SIH26001",
    title: str = "AI-Based early warning and landslide Risk Monitoring System in NER",
    description: str = "Develop an AI-based system for early warning and monitoring of landslides in the North Eastern Region.",
    organization: str = "Ministry of Development of North Eastern Region (MDoNER)",
    department: str = "Ministry of Development of North Eastern Region",
    category: str = "Software",
    theme: str = "Disaster Management",
    youtube_link: str = "",
    dataset_link: str = "",
    contact_info: str = "contact@example.gov.in",
) -> str:
    """Build a realistic HTML string for column 2 (Problem Statement Title)
    that mirrors the actual SIH portal structure."""

    youtube_row = ""
    if youtube_link:
        youtube_row = f'<tr><th>Youtube Link</th><td><a href="{youtube_link}" target="_blank">Link</a></td></tr>'
    else:
        youtube_row = '<tr><th>Youtube Link</th><td>NA</td></tr>'

    dataset_row = ""
    if dataset_link:
        dataset_row = f'<tr><th>Dataset Link</th><td><a href="{dataset_link}" target="_blank">Link</a></td></tr>'
    else:
        dataset_row = '<tr><th>Dataset Link</th><td>NA</td></tr>'

    return f'''
    <a href="#" data-toggle="modal" data-target="#{ps_number}">
        {title}
    </a>
    <div class="modal fade" id="{ps_number}" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{ps_number}</h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <table id="settings" class="table table-striped">
                        <tr>
                            <th>Problem Statement Title</th>
                            <td>{title}</td>
                        </tr>
                        <tr>
                            <th>Description</th>
                            <td>{description}</td>
                        </tr>
                        <tr>
                            <th>Organization</th>
                            <td>{organization}</td>
                        </tr>
                        <tr>
                            <th>Department</th>
                            <td>{department}</td>
                        </tr>
                        <tr>
                            <th>Category</th>
                            <td>{category}</td>
                        </tr>
                        <tr>
                            <th>Theme</th>
                            <td>{theme}</td>
                        </tr>
                        {youtube_row}
                        {dataset_row}
                        <tr>
                            <th>Contact info</th>
                            <td>{contact_info}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </div>
    '''


def _make_row(
    serial: int = 1,
    organization: str = "Ministry of Development of North Eastern Region (MDoNER)",
    modal_html: str = "",
    category: str = "Software",
    ps_number: str = "SIH26001",
    submitted_ideas: str = "0/500",
    theme: str = "Disaster Management",
    deadline: str = "20 September 2026",
) -> list[str]:
    """Build a complete DataTable row (list of 8 HTML cell strings)."""
    if not modal_html:
        modal_html = _make_modal_html(
            ps_number=ps_number,
            organization=organization,
            category=category,
            theme=theme,
        )
    return [
        str(serial),
        organization,
        modal_html,
        category,
        ps_number,
        submitted_ideas,
        theme,
        deadline,
    ]


# ═══════════════════════════════════════════════════════════════════════════
#  Cleaner tests
# ═══════════════════════════════════════════════════════════════════════════

class TestFixEncoding:

    def test_smart_quotes(self):
        assert fix_encoding("â\x80\x99") == "'"

    def test_em_dash(self):
        assert fix_encoding("â\x80\x94") == "—"

    def test_degree_celsius(self):
        assert fix_encoding("Â°C") == "°C"

    def test_empty_string(self):
        assert fix_encoding("") == ""

    def test_none_passthrough(self):
        # None should not crash
        assert fix_encoding(None) == ""

    def test_normal_text_unchanged(self):
        assert fix_encoding("Hello World") == "Hello World"


class TestCleanHtmlToText:

    def test_strips_tags(self):
        assert clean_html_to_text("<p>Hello <b>World</b></p>") == "Hello World"

    def test_preserves_br_as_newline(self):
        result = clean_html_to_text("Line 1<br/>Line 2")
        assert "Line 1" in result
        assert "Line 2" in result

    def test_decodes_entities(self):
        assert clean_html_to_text("&amp; &lt; &gt;") == "& < >"

    def test_empty_string(self):
        assert clean_html_to_text("") == ""

    def test_complex_html(self):
        html = """
        <ul>
            <li>Item 1</li>
            <li>Item 2</li>
        </ul>
        """
        result = clean_html_to_text(html)
        assert "Item 1" in result
        assert "Item 2" in result


class TestNormalizeWhitespace:

    def test_collapses_spaces(self):
        assert normalize_whitespace("Hello    World") == "Hello World"

    def test_strips_lines(self):
        assert normalize_whitespace("  Hello  \n  World  ") == "Hello\nWorld"

    def test_collapses_blank_lines(self):
        result = normalize_whitespace("A\n\n\n\n\nB")
        assert result == "A\n\nB"

    def test_empty(self):
        assert normalize_whitespace("") == ""


class TestExtractLinkHref:

    def test_extracts_href(self):
        from bs4 import BeautifulSoup
        td = BeautifulSoup(
            '<td><a href="https://example.com">Link</a></td>',
            "html.parser"
        ).find("td")
        assert extract_link_href(td) == "https://example.com"

    def test_returns_none_for_na(self):
        from bs4 import BeautifulSoup
        td = BeautifulSoup(
            '<td><a href="#">NA</a></td>',
            "html.parser"
        ).find("td")
        assert extract_link_href(td) is None

    def test_returns_none_for_no_link(self):
        from bs4 import BeautifulSoup
        td = BeautifulSoup(
            '<td>No link here</td>',
            "html.parser"
        ).find("td")
        assert extract_link_href(td) is None

    def test_returns_none_for_none(self):
        assert extract_link_href(None) is None


class TestExtractTextOrLink:

    def test_mailto_extraction(self):
        from bs4 import BeautifulSoup
        td = BeautifulSoup(
            '<td><a href="mailto:test@example.com">test@example.com</a></td>',
            "html.parser"
        ).find("td")
        assert extract_text_or_link(td) == "test@example.com"

    def test_plain_text(self):
        from bs4 import BeautifulSoup
        td = BeautifulSoup(
            '<td>Some contact info</td>',
            "html.parser"
        ).find("td")
        assert extract_text_or_link(td) == "Some contact info"


# ═══════════════════════════════════════════════════════════════════════════
#  Parser tests
# ═══════════════════════════════════════════════════════════════════════════

class TestProblemParser:

    def setup_method(self):
        self.parser = ProblemParser()

    def test_parse_well_formed_row(self):
        """All fields should be correctly extracted from a well-formed row."""
        row = _make_row(
            ps_number="SIH26001",
            organization="Ministry of Development of North Eastern Region (MDoNER)",
            category="Software",
            theme="Disaster Management",
        )
        result = self.parser._parse_row(row)

        assert result is not None
        assert result["ps_number"] == "SIH26001"
        assert result["title"] == "AI-Based early warning and landslide Risk Monitoring System in NER"
        assert result["organization"] == "Ministry of Development of North Eastern Region (MDoNER)"
        assert result["category"] == "Software"
        assert result["theme"] == "Disaster Management"
        assert len(result["description"]) > 0

    def test_title_not_empty(self):
        """The title should never be empty — reproduces the SIH26160 bug."""
        modal = _make_modal_html(
            ps_number="SIH26160",
            title="Secure Data Transfer using Blockchain",
            theme="Blockchain & Cybersecurity",
        )
        row = _make_row(ps_number="SIH26160", modal_html=modal)
        result = self.parser._parse_row(row)

        assert result is not None
        assert result["title"] == "Secure Data Transfer using Blockchain"
        assert result["title"] != ""

    def test_theme_no_label_contamination(self):
        """Theme should be clean — reproduces the label bleed bug where
        theme contained 'Blockchain & Cybersecurity\\nYoutube Link\\n...'."""
        modal = _make_modal_html(
            ps_number="SIH26160",
            theme="Blockchain & Cybersecurity",
        )
        row = _make_row(ps_number="SIH26160", modal_html=modal, theme="Blockchain & Cybersecurity")
        result = self.parser._parse_row(row)

        assert result is not None
        assert result["theme"] == "Blockchain & Cybersecurity"
        assert "Youtube Link" not in result["theme"]
        assert "Dataset Link" not in result["theme"]
        assert "Contact info" not in result["theme"]

    def test_category_not_description(self):
        """Category should be 'Software' or 'Hardware', never a description.
        Reproduces the SIH26192 field-shift bug."""
        modal = _make_modal_html(
            ps_number="SIH26192",
            category="Software",
            theme="Smart Automation",
        )
        row = _make_row(ps_number="SIH26192", modal_html=modal, category="Software")
        result = self.parser._parse_row(row)

        assert result is not None
        assert result["category"] == "Software"
        # Category should never contain description-like content
        assert len(result["category"]) < 30

    def test_description_with_words_like_labels(self):
        """Description content containing words like 'Description' or
        'Theme' should not cause field misalignment."""
        tricky_description = (
            "The Description of this system involves a Theme-based "
            "approach where the Organization provides Background "
            "data for the Category of problems."
        )
        modal = _make_modal_html(
            ps_number="SIH26200",
            title="Test Problem",
            description=tricky_description,
            theme="Smart Automation",
            category="Hardware",
        )
        row = _make_row(
            ps_number="SIH26200",
            modal_html=modal,
            category="Hardware",
            theme="Smart Automation",
        )
        result = self.parser._parse_row(row)

        assert result is not None
        assert result["theme"] == "Smart Automation"
        assert result["category"] == "Hardware"
        assert "Theme-based" in result["description"]

    def test_missing_optional_fields(self):
        """Optional fields (youtube, dataset, contact) should gracefully
        default to None or empty string."""
        modal = _make_modal_html(
            ps_number="SIH26300",
            youtube_link="",
            dataset_link="",
            contact_info="",
        )
        row = _make_row(ps_number="SIH26300", modal_html=modal)
        result = self.parser._parse_row(row)

        assert result is not None
        assert result.get("youtube_link") is None
        assert result.get("dataset_link") is None

    def test_youtube_link_extraction(self):
        """Youtube links should be extracted as URLs, not text."""
        modal = _make_modal_html(
            ps_number="SIH26400",
            youtube_link="https://www.youtube.com/watch?v=abc123",
        )
        row = _make_row(ps_number="SIH26400", modal_html=modal)
        result = self.parser._parse_row(row)

        assert result is not None
        assert result["youtube_link"] == "https://www.youtube.com/watch?v=abc123"

    def test_dataset_link_extraction(self):
        """Dataset links should be extracted as URLs."""
        modal = _make_modal_html(
            ps_number="SIH26500",
            dataset_link="https://data.gov.in/dataset/xyz",
        )
        row = _make_row(ps_number="SIH26500", modal_html=modal)
        result = self.parser._parse_row(row)

        assert result is not None
        assert result["dataset_link"] == "https://data.gov.in/dataset/xyz"

    def test_fallback_title_from_anchor(self):
        """If the modal table is missing the title row, fall back to
        the <a> tag text in column 2."""
        # Build modal HTML without a title row in the settings table
        modal_html = '''
        <a href="#" data-toggle="modal" data-target="#SIH26600">
            Fallback Title from Anchor
        </a>
        <div class="modal fade" id="SIH26600">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-body">
                        <table id="settings">
                            <tr><th>Description</th><td>Some description</td></tr>
                            <tr><th>Organization</th><td>Test Org</td></tr>
                            <tr><th>Category</th><td>Software</td></tr>
                            <tr><th>Theme</th><td>Smart Automation</td></tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        '''
        row = _make_row(ps_number="SIH26600", modal_html=modal_html)
        result = self.parser._parse_row(row)

        assert result is not None
        assert result["title"] == "Fallback Title from Anchor"

    def test_fallback_to_outer_columns(self):
        """If the modal has no settings table, outer columns should be
        used as fallback for organization, category, and theme."""
        modal_html = '''
        <a href="#">Some Title</a>
        <div class="modal fade">
            <div class="modal-body">
                <p>No table here</p>
            </div>
        </div>
        '''
        row = _make_row(
            ps_number="SIH26700",
            modal_html=modal_html,
            organization="Fallback Org",
            category="Hardware",
            theme="Space Technology",
        )
        result = self.parser._parse_row(row)

        assert result is not None
        assert result["organization"] == "Fallback Org"
        assert result["category"] == "Hardware"
        assert result["theme"] == "Space Technology"

    def test_malformed_row_returns_none(self):
        """Rows with fewer than 7 cells should be skipped."""
        result = self.parser._parse_row(["only", "two"])
        assert result is None

    def test_row_without_ps_number_returns_none(self):
        """Rows with no SIH number in any cell should be skipped."""
        row = ["1", "Org", "html", "Cat", "NO_NUMBER", "0/500", "Theme", "2026"]
        result = self.parser._parse_row(row)
        assert result is None

    def test_html_entities_in_description(self):
        """HTML entities in description should be properly decoded."""
        modal = _make_modal_html(
            ps_number="SIH26800",
            description="Temperature should be maintained at 25&deg;C &amp; humidity &lt; 80%",
        )
        row = _make_row(ps_number="SIH26800", modal_html=modal)
        result = self.parser._parse_row(row)

        assert result is not None
        assert "25°C" in result["description"]
        assert "&amp;" not in result["description"]
        assert "&lt;" not in result["description"]

    def test_deadline_parsing(self):
        """Deadline column should be parsed to datetime."""
        row = _make_row(
            ps_number="SIH26900",
            deadline="20 September 2026",
        )
        result = self.parser._parse_row(row)

        assert result is not None
        assert result["deadline"] is not None
        assert result["deadline"].year == 2026
        assert result["deadline"].month == 9
        assert result["deadline"].day == 20

    def test_submitted_ideas_parsing(self):
        """Submitted ideas should be parsed as an integer."""
        row = _make_row(ps_number="SIH27000", submitted_ideas="42/500")
        result = self.parser._parse_row(row)

        assert result is not None
        assert result["submitted_ideas"] == 42


# ═══════════════════════════════════════════════════════════════════════════
#  Validator tests
# ═══════════════════════════════════════════════════════════════════════════

class TestValidator:

    def test_valid_problem(self):
        data = {
            "ps_number": "SIH26001",
            "title": "AI-Based System",
            "organization": "Test Org",
            "category": "Software",
            "theme": "Disaster Management",
            "description": "A comprehensive description of the problem statement.",
        }
        result = validate_problem(data)
        assert result.is_valid
        assert len(result.errors) == 0

    def test_empty_title_is_error(self):
        data = {
            "ps_number": "SIH26002",
            "title": "",
            "category": "Software",
            "theme": "Smart Automation",
        }
        result = validate_problem(data)
        assert not result.is_valid
        assert any("title" in err for err in result.errors)

    def test_missing_ps_number_is_error(self):
        data = {
            "ps_number": "",
            "title": "Some Title",
        }
        result = validate_problem(data)
        assert not result.is_valid

    def test_theme_label_contamination_detected(self):
        """Theme containing only a label like 'Description' should be
        flagged as label contamination."""
        data = {
            "ps_number": "SIH26003",
            "title": "Test",
            "theme": "Description",
            "category": "Software",
        }
        result = validate_problem(data)
        assert not result.is_valid
        assert any("leaked label" in err for err in result.errors)

    def test_theme_multiline_contamination_detected(self):
        """Theme with appended labels on subsequent lines should be flagged."""
        data = {
            "ps_number": "SIH26004",
            "title": "Test",
            "theme": "Blockchain & Cybersecurity\nYoutube Link\nDataset Link",
            "category": "Software",
        }
        result = validate_problem(data)
        assert not result.is_valid
        assert any("contamination" in err for err in result.errors)

    def test_unusual_category_is_warning(self):
        data = {
            "ps_number": "SIH26005",
            "title": "Test",
            "theme": "Disaster Management",
            "category": "UnknownType",
        }
        result = validate_problem(data)
        # Warning, not error — unusual but not invalid
        assert any("standard value" in w for w in result.warnings)

    def test_short_description_is_warning(self):
        data = {
            "ps_number": "SIH26006",
            "title": "Test",
            "description": "Short.",
            "theme": "Smart Automation",
            "category": "Software",
        }
        result = validate_problem(data)
        assert any("short" in w for w in result.warnings)
