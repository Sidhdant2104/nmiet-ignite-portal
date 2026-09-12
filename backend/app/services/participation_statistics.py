"""Participation statistics for the existing registration Excel export.

All figures are computed from the registrations passed into the export.
Gender is taken only from the stored gender field — never inferred from names.
"""

from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime, timezone
from statistics import mean, median
from typing import Any, Optional

from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.workbook.workbook import Workbook
from openpyxl.worksheet.worksheet import Worksheet

HEADER_FILL = PatternFill("solid", fgColor="F97316")
SECTION_FILL = PatternFill("solid", fgColor="1F2937")
ALT_FILL = PatternFill("solid", fgColor="FFF7ED")
THIN = Border(
    top=Side(style="thin", color="D1D5DB"),
    bottom=Side(style="thin", color="D1D5DB"),
    left=Side(style="thin", color="D1D5DB"),
    right=Side(style="thin", color="D1D5DB"),
)
# SIH teams are expected to have 6 students (1 leader + 5 members).
USUAL_TEAM_SIZE = 6
UNUSUAL_MIN = 4
UNUSUAL_MAX = 6


def _text(value: Any) -> str:
    return str(value or "").strip()


def _blank(value: Any) -> bool:
    return not _text(value)


def _norm_email(value: Any) -> str:
    return _text(value).casefold()


def _norm_phone(value: Any) -> str:
    return "".join(ch for ch in _text(value) if ch.isdigit())


def classify_gender(value: Any) -> str:
    """Map only an explicit stored gender. Never infer from a name."""
    raw = _text(value)
    if not raw:
        return "Unknown"
    key = raw.casefold()
    if key in {"male", "m"}:
        return "Male"
    if key in {"female", "f"}:
        return "Female"
    if key in {"other", "prefer not to say", "non-binary", "nonbinary"}:
        return "Other"
    return "Unknown"


def student_identity(person: dict) -> Optional[tuple[str, str]]:
    """Unique key from email, then phone. Roll is not unique across the college."""
    email = _norm_email(person.get("email"))
    if email:
        return ("email", email)
    phone = _norm_phone(person.get("mobile") or person.get("phone"))
    if phone:
        return ("phone", phone)
    return None


def iter_students(registration: dict) -> list[tuple[str, dict]]:
    people: list[tuple[str, dict]] = []
    leader = registration.get("leader")
    if isinstance(leader, dict):
        people.append(("Leader", leader))
    for index, member in enumerate(registration.get("members") or [], start=1):
        if isinstance(member, dict):
            people.append((f"Member {index}", member))
    return people


def collect_unique_students(registrations: list[dict]) -> tuple[dict[tuple[str, str], dict], list[dict]]:
    """Return unique students keyed by email/phone, plus unidentified instances."""
    unique: dict[tuple[str, str], dict] = {}
    unidentified: list[dict] = []
    for registration in registrations:
        team = registration.get("team") or {}
        registration_id = registration.get("registration_id") or str(registration.get("_id", ""))
        for role, person in iter_students(registration):
            record = {
                "role": role,
                "name": _text(person.get("name")),
                "gender": classify_gender(person.get("gender")),
                "gender_raw": _text(person.get("gender")),
                "year": _text(person.get("year")),
                "department": _text(person.get("department")),
                "email": _norm_email(person.get("email")),
                "phone": _norm_phone(person.get("mobile") or person.get("phone")),
                "roll": _text(person.get("roll")),
                "registration_id": registration_id,
                "team_name": _text(team.get("teamName")),
            }
            key = student_identity(person)
            if key is None:
                unidentified.append(record)
                continue
            existing = unique.get(key)
            if existing is None:
                unique[key] = {**record, "appearances": 1, "teams": {registration_id}}
            else:
                existing["appearances"] += 1
                existing["teams"].add(registration_id)
                if _blank(existing["gender_raw"]) and not _blank(record["gender_raw"]):
                    existing["gender"] = record["gender"]
                    existing["gender_raw"] = record["gender_raw"]
                if _blank(existing["year"]) and not _blank(record["year"]):
                    existing["year"] = record["year"]
                if _blank(existing["department"]) and not _blank(record["department"]):
                    existing["department"] = record["department"]
    return unique, unidentified


def _pct(part: int, whole: int) -> Optional[float]:
    if whole <= 0:
        return None
    return part / whole


def _label_or_na(value: str) -> str:
    return value or "N/A"


def _track_matches(registration: dict, tracks: list[dict]) -> list[dict]:
    if not tracks:
        return []
    try:
        from app.routes.evaluation import match
    except Exception:
        return []
    return [track for track in tracks if match(registration, track)]


def _write_title(sheet: Worksheet, row: int, text: str, end_column: int = 8) -> int:
    cell = sheet.cell(row, 1, text)
    cell.font = Font(bold=True, size=16, color="1F2937")
    sheet.merge_cells(start_row=row, start_column=1, end_row=row, end_column=end_column)
    return row + 1


def _write_note(sheet: Worksheet, row: int, text: str, end_column: int = 8) -> int:
    cell = sheet.cell(row, 1, text)
    cell.font = Font(italic=True, color="6B7280", size=10)
    cell.alignment = Alignment(wrap_text=True, vertical="center")
    sheet.merge_cells(start_row=row, start_column=1, end_row=row, end_column=end_column)
    sheet.row_dimensions[row].height = 32
    return row + 1


def _write_section(sheet: Worksheet, row: int, title: str, end_column: int = 8) -> int:
    cell = sheet.cell(row, 1, title)
    cell.font = Font(bold=True, color="FFFFFF", size=12)
    cell.fill = SECTION_FILL
    cell.alignment = Alignment(vertical="center")
    for column in range(2, end_column + 1):
        sheet.cell(row, column).fill = SECTION_FILL
    sheet.merge_cells(start_row=row, start_column=1, end_row=row, end_column=end_column)
    sheet.row_dimensions[row].height = 20
    return row + 1


def _write_table(sheet: Worksheet, row: int, headers: list[str], data: list[list[Any]], percent_columns: Optional[set[int]] = None) -> int:
    percent_columns = percent_columns or set()
    for index, header in enumerate(headers, start=1):
        cell = sheet.cell(row, index, header)
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = HEADER_FILL
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = THIN
    row += 1
    if not data:
        cell = sheet.cell(row, 1, "N/A")
        cell.font = Font(italic=True, color="6B7280")
        return row + 2
    for offset, values in enumerate(data):
        is_total = values and values[0] == "Total"
        for index, value in enumerate(values, start=1):
            cell = sheet.cell(row, index, "N/A" if value is None else value)
            cell.border = THIN
            cell.alignment = Alignment(vertical="center", wrap_text=True, horizontal="right" if index > 1 else "left")
            if offset % 2 == 1 and not is_total:
                cell.fill = ALT_FILL
            if is_total:
                cell.font = Font(bold=True)
                cell.fill = PatternFill("solid", fgColor="FED7AA")
            if index in percent_columns and isinstance(value, (int, float)):
                cell.number_format = "0.0%"
        row += 1
    return row + 1


def _count_table(counter: Counter, total: int, empty_label: str = "N/A") -> list[list[Any]]:
    rows = []
    for label, count in counter.most_common():
        rows.append([label or empty_label, count, _pct(count, total)])
    return rows


def build_statistics_rows(registrations: list[dict], tracks: Optional[list[dict]] = None) -> dict:
    """Compute every statistic from the provided registrations."""
    active = [item for item in registrations if not item.get("isDeleted", False)]
    unique, unidentified = collect_unique_students(active)
    unique_list = list(unique.values())
    unique_students = len(unique_list) + len(unidentified)
    student_instances = sum(len(iter_students(item)) for item in active)

    gender_counts = Counter(item["gender"] for item in unique_list)
    for item in unidentified:
        gender_counts[item["gender"]] += 1
    year_counts = Counter(_label_or_na(item["year"]) for item in unique_list + unidentified)
    dept_counts = Counter(_label_or_na(item["department"]) for item in unique_list + unidentified)

    sizes = [len(iter_students(item)) for item in active]
    size_counts = Counter(sizes)
    unusual = [item for item, size in zip(active, sizes) if size < UNUSUAL_MIN or size > UNUSUAL_MAX]

    status_counts = Counter(_label_or_na(_text(item.get("status"))) for item in active)
    category_counts = Counter(_label_or_na(_text((item.get("team") or {}).get("category"))) for item in active)
    theme_counts = Counter(_label_or_na(_text((item.get("team") or {}).get("theme"))) for item in active)
    problem_counts: Counter = Counter()
    problem_students: Counter = Counter()
    for item in active:
        team = item.get("team") or {}
        ps_id = _text(team.get("psId"))
        ps_title = _text(team.get("psTitle"))
        if not ps_id and not ps_title:
            label = "N/A"
        else:
            label = f"{ps_id} — {ps_title}" if ps_id and ps_title else (ps_id or ps_title)
        problem_counts[label] += 1
        problem_students[label] += len(iter_students(item))

    category_students = Counter()
    theme_students = Counter()
    status_students = Counter()
    for item in active:
        n = len(iter_students(item))
        category_students[_label_or_na(_text((item.get("team") or {}).get("category")))] += n
        theme_students[_label_or_na(_text((item.get("team") or {}).get("theme")))] += n
        status_students[_label_or_na(_text(item.get("status")))] += n

    track_team_counts: Counter = Counter()
    track_student_counts: Counter = Counter()
    multi_track = 0
    unmatched = 0
    track_available = bool(tracks)
    if track_available:
        for item in active:
            matched = _track_matches(item, tracks or [])
            n = len(iter_students(item))
            if not matched:
                unmatched += 1
                track_team_counts["Unassigned"] += 1
                track_student_counts["Unassigned"] += n
                continue
            if len(matched) > 1:
                multi_track += 1
            for track in matched:
                name = _text(track.get("name")) or track.get("track_id") or "N/A"
                track_team_counts[name] += 1
                track_student_counts[name] += n

    year_dept: dict[tuple[str, str], int] = defaultdict(int)
    gender_year: dict[tuple[str, str], int] = defaultdict(int)
    gender_dept: dict[tuple[str, str], int] = defaultdict(int)
    for item in unique_list + unidentified:
        year = _label_or_na(item["year"])
        dept = _label_or_na(item["department"])
        gender = item["gender"]
        year_dept[(year, dept)] += 1
        gender_year[(gender, year)] += 1
        gender_dept[(gender, dept)] += 1

    missing_gender = sum(1 for item in unique_list + unidentified if item["gender"] == "Unknown")
    missing_year = sum(1 for item in unique_list + unidentified if _blank(item["year"]))
    missing_dept = sum(1 for item in unique_list + unidentified if _blank(item["department"]))
    missing_email = sum(1 for item in unique_list + unidentified if _blank(item["email"]))
    missing_phone = sum(1 for item in unique_list + unidentified if _blank(item["phone"]))
    duplicate_email = sum(1 for key, item in unique.items() if key[0] == "email" and (item["appearances"] > 1 or len(item["teams"]) > 1))
    duplicate_phone = sum(1 for key, item in unique.items() if key[0] == "phone" and (item["appearances"] > 1 or len(item["teams"]) > 1))
    # Also count emails that appear as the fallback identity after another email... already covered.
    email_seen: Counter = Counter()
    phone_seen: Counter = Counter()
    for item in unique_list + unidentified:
        if item["email"]:
            email_seen[item["email"]] += item.get("appearances", 1)
        if item["phone"]:
            phone_seen[item["phone"]] += item.get("appearances", 1)
    duplicate_email = sum(1 for count in email_seen.values() if count > 1)
    duplicate_phone = sum(1 for count in phone_seen.values() if count > 1)

    return {
        "generated_at": datetime.now(timezone.utc),
        "teams": len(active),
        "deleted_in_export": sum(1 for item in registrations if item.get("isDeleted", False)),
        "unique_students": unique_students,
        "student_instances": student_instances,
        "unidentified": len(unidentified),
        "gender_counts": gender_counts,
        "year_counts": year_counts,
        "dept_counts": dept_counts,
        "sizes": sizes,
        "size_counts": size_counts,
        "unusual": unusual,
        "status_counts": status_counts,
        "status_students": status_students,
        "category_counts": category_counts,
        "category_students": category_students,
        "theme_counts": theme_counts,
        "theme_students": theme_students,
        "problem_counts": problem_counts,
        "problem_students": problem_students,
        "track_available": track_available,
        "track_team_counts": track_team_counts,
        "track_student_counts": track_student_counts,
        "multi_track": multi_track,
        "unmatched": unmatched,
        "year_dept": year_dept,
        "gender_year": gender_year,
        "gender_dept": gender_dept,
        "missing_gender": missing_gender,
        "missing_year": missing_year,
        "missing_dept": missing_dept,
        "missing_email": missing_email,
        "missing_phone": missing_phone,
        "duplicate_email": duplicate_email,
        "duplicate_phone": duplicate_phone,
        "gender_field_present": any(item.get("gender_raw") for item in unique_list + unidentified),
    }


def add_statistics_sheet(workbook: Workbook, registrations: list[dict], tracks: Optional[list[dict]] = None) -> None:
    stats = build_statistics_rows(registrations, tracks)
    sheet = workbook.create_sheet("Statistics")
    teams = stats["teams"]
    students = stats["unique_students"]
    row = 1
    row = _write_title(sheet, row, "NMIET SIH — Student Participation Statistics")
    row = _write_note(
        sheet,
        row,
        f"Calculated from this export at {stats['generated_at'].strftime('%Y-%m-%d %H:%M UTC')}. "
        "Unique students are identified by email, then phone. Gender is taken only from the stored field.",
    )
    row += 1

    row = _write_section(sheet, row, "Overview")
    male = stats["gender_counts"].get("Male", 0)
    female = stats["gender_counts"].get("Female", 0)
    other = stats["gender_counts"].get("Other", 0)
    unknown = stats["gender_counts"].get("Unknown", 0)
    other_unknown = other + unknown
    overview = [
        ["Total Teams Participated", teams, None],
        ["Total Students Participated (unique)", students, None],
        ["Student records (leader + members)", stats["student_instances"], None],
        ["Male Participants", male if stats["gender_field_present"] else None, _pct(male, students) if stats["gender_field_present"] else None],
        ["Female Participants", female if stats["gender_field_present"] else None, _pct(female, students) if stats["gender_field_present"] else None],
        ["Other/Unknown Gender", other_unknown if stats["gender_field_present"] else None, _pct(other_unknown, students) if stats["gender_field_present"] else None],
    ]
    if stats["deleted_in_export"]:
        overview.append(["Deleted teams included in this export", stats["deleted_in_export"], None])
    row = _write_table(sheet, row, ["Metric", "Count", "Percentage of unique students"], overview, {3})

    row = _write_section(sheet, row, "Team size")
    size_rows = []
    if stats["sizes"]:
        size_rows.append(["Minimum", min(stats["sizes"]), None])
        size_rows.append(["Maximum", max(stats["sizes"]), None])
        size_rows.append(["Mean", round(mean(stats["sizes"]), 2), None])
        size_rows.append(["Median", median(stats["sizes"]), None])
        for size, count in sorted(stats["size_counts"].items()):
            size_rows.append([f"Teams with {size} students", count, _pct(count, teams)])
        size_rows.append([f"Unusual team sizes (<{UNUSUAL_MIN} or >{UNUSUAL_MAX})", len(stats["unusual"]), _pct(len(stats["unusual"]), teams)])
    else:
        size_rows.append(["N/A", None, None])
    row = _write_table(sheet, row, ["Statistic", "Value", "Percentage of teams"], size_rows, {3})

    row = _write_section(sheet, row, "Year-wise students")
    row = _write_table(sheet, row, ["Year", "Students", "Percentage"], _count_table(stats["year_counts"], students), {3})

    row = _write_section(sheet, row, "Department-wise students")
    row = _write_table(sheet, row, ["Department", "Students", "Percentage"], _count_table(stats["dept_counts"], students), {3})

    row = _write_section(sheet, row, "Track-wise teams and students")
    if not stats["track_available"]:
        row = _write_table(sheet, row, ["Track", "Teams", "Students", "Percentage of teams"], [])
    else:
        row = _write_note(sheet, row, "A team is counted in every evaluation track whose theme and domain match. Totals can therefore exceed the number of teams.")
        track_rows = []
        for name, count in stats["track_team_counts"].most_common():
            track_rows.append([name, count, stats["track_student_counts"].get(name, 0), _pct(count, teams)])
        track_rows.append(["Teams matching more than one track", stats["multi_track"], None, _pct(stats["multi_track"], teams)])
        track_rows.append(["Teams matching no track", stats["unmatched"], None, _pct(stats["unmatched"], teams)])
        row = _write_table(sheet, row, ["Track", "Teams", "Students", "Percentage of teams"], track_rows, {4})

    row = _write_section(sheet, row, "Domain / category-wise")
    category_rows = [
        [label, stats["category_counts"][label], stats["category_students"].get(label, 0), _pct(stats["category_counts"][label], teams)]
        for label, _ in stats["category_counts"].most_common()
    ]
    row = _write_table(sheet, row, ["Domain / Category", "Teams", "Students", "Percentage of teams"], category_rows, {4})

    row = _write_section(sheet, row, "Theme-wise")
    theme_rows = [
        [label, stats["theme_counts"][label], stats["theme_students"].get(label, 0), _pct(stats["theme_counts"][label], teams)]
        for label, _ in stats["theme_counts"].most_common()
    ]
    row = _write_table(sheet, row, ["Theme", "Teams", "Students", "Percentage of teams"], theme_rows, {4})

    row = _write_section(sheet, row, "Status-wise teams")
    status_rows = [
        [label, stats["status_counts"][label], stats["status_students"].get(label, 0), _pct(stats["status_counts"][label], teams)]
        for label, _ in stats["status_counts"].most_common()
    ]
    row = _write_table(sheet, row, ["Status", "Teams", "Students", "Percentage of teams"], status_rows, {4})

    row = _write_section(sheet, row, "Problem-statement-wise")
    if not stats["problem_counts"] or (len(stats["problem_counts"]) == 1 and "N/A" in stats["problem_counts"]):
        has_ps = any(label != "N/A" for label in stats["problem_counts"])
        if not has_ps:
            row = _write_table(sheet, row, ["Problem Statement", "Teams", "Students", "Percentage of teams"], [])
        else:
            problem_rows = [
                [label, stats["problem_counts"][label], stats["problem_students"].get(label, 0), _pct(stats["problem_counts"][label], teams)]
                for label, _ in stats["problem_counts"].most_common()
            ]
            row = _write_table(sheet, row, ["Problem Statement", "Teams", "Students", "Percentage of teams"], problem_rows, {4})
    else:
        problem_rows = [
            [label, stats["problem_counts"][label], stats["problem_students"].get(label, 0), _pct(stats["problem_counts"][label], teams)]
            for label, _ in stats["problem_counts"].most_common()
        ]
        row = _write_table(sheet, row, ["Problem Statement", "Teams", "Students", "Percentage of teams"], problem_rows, {4})

    years = sorted({year for year, _ in stats["year_dept"]}, key=str.casefold)
    depts = sorted({dept for _, dept in stats["year_dept"]}, key=str.casefold)
    cross_width = max(8, len(depts) + 2)
    row = _write_section(sheet, row, "Year × Department", cross_width)
    if years and depts:
        headers = ["Year \\ Department"] + depts + ["Total"]
        cross = []
        for year in years:
            values = [stats["year_dept"].get((year, dept), 0) for dept in depts]
            cross.append([year, *values, sum(values)])
        totals = ["Total"] + [sum(stats["year_dept"].get((year, dept), 0) for year in years) for dept in depts]
        totals.append(sum(stats["year_dept"].values()))
        cross.append(totals)
        row = _write_table(sheet, row, headers, cross)
    else:
        row = _write_table(sheet, row, ["Year \\ Department"], [])

    genders = ["Male", "Female", "Other", "Unknown"]
    row = _write_section(sheet, row, "Gender × Year", max(8, len(years) + 2))
    if stats["gender_field_present"] and years:
        headers = ["Gender \\ Year"] + years + ["Total"]
        cross = []
        for gender in genders:
            values = [stats["gender_year"].get((gender, year), 0) for year in years]
            if gender == "Unknown" and not any(values):
                continue
            if gender == "Other" and not any(values):
                continue
            cross.append([gender, *values, sum(values)])
        row = _write_table(sheet, row, headers, cross)
    else:
        row = _write_table(sheet, row, ["Gender \\ Year"], [])

    row = _write_section(sheet, row, "Gender × Department", cross_width)
    if stats["gender_field_present"] and depts:
        headers = ["Gender \\ Department"] + depts + ["Total"]
        cross = []
        for gender in genders:
            values = [stats["gender_dept"].get((gender, dept), 0) for dept in depts]
            if gender in {"Unknown", "Other"} and not any(values):
                continue
            cross.append([gender, *values, sum(values)])
        row = _write_table(sheet, row, headers, cross)
    else:
        row = _write_table(sheet, row, ["Gender \\ Department"], [])

    row = _write_section(sheet, row, "Data quality")
    quality = [
        ["Missing gender", stats["missing_gender"], _pct(stats["missing_gender"], students)],
        ["Missing year", stats["missing_year"], _pct(stats["missing_year"], students)],
        ["Missing department", stats["missing_dept"], _pct(stats["missing_dept"], students)],
        ["Missing email", stats["missing_email"], _pct(stats["missing_email"], students)],
        ["Missing phone", stats["missing_phone"], _pct(stats["missing_phone"], students)],
        ["Students without email or phone (cannot uniquely identify)", stats["unidentified"], _pct(stats["unidentified"], students)],
        ["Duplicate students by email", stats["duplicate_email"], None],
        ["Duplicate students by phone", stats["duplicate_phone"], None],
        [f"Unusual team sizes (<{UNUSUAL_MIN} or >{UNUSUAL_MAX})", len(stats["unusual"]), _pct(len(stats["unusual"]), teams)],
    ]
    row = _write_table(sheet, row, ["Check", "Count", "Percentage"], quality, {3})

    sheet.freeze_panes = "A3"
    sheet.column_dimensions["A"].width = 48
    for index in range(2, 16):
        letter = get_column_letter(index)
        sheet.column_dimensions[letter].width = 16
    sheet.page_setup.fitToPage = True
    sheet.page_setup.fitToWidth = 1
    sheet.page_setup.orientation = "landscape"
    sheet.sheet_properties.pageSetUpPr.fitToPage = True
    sheet.print_title_rows = "1:2"
