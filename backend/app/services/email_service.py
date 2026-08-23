"""
Email service for NMIET SIH Portal.

Handles sending professional HTML confirmation emails after registration.
Designed to be extended for reminders, approvals, certificates, etc.
"""

import logging
from datetime import datetime, timezone

from app.config import PORTAL_URL
from app.routes.ppt import log_email

logger = logging.getLogger(__name__)


async def send_registration_confirmation_email(
    recipient_email: str,
    team_name: str,
    team_leader: str,
    problem_statement: dict,
    members: list[dict],
    mentor: dict | None,
    registration_id: str,
    created_at: datetime | None = None,
) -> bool:
    """
    Send a professional HTML confirmation email after successful registration.

    Returns True if the email was handed off successfully, False otherwise.
    This function never raises — callers can rely on it being safe.
    """
    try:
        subject = "NMIET SIH 2026 Internal Hackathon Registration Confirmed"

        # Build plain-text fallback
        plain = _build_plain_text(
            team_leader=team_leader,
            team_name=team_name,
            problem_statement=problem_statement,
            members=members,
            mentor=mentor,
            registration_id=registration_id,
            created_at=created_at,
        )

        # Build HTML body
        html = _build_registration_html(
            team_leader=team_leader,
            team_name=team_name,
            problem_statement=problem_statement,
            members=members,
            mentor=mentor,
            registration_id=registration_id,
            created_at=created_at,
        )

        await log_email(
            to=recipient_email,
            subject=subject,
            body=plain,
            html=html,
        )
        return True

    except Exception as error:
        logger.error(
            "Failed to send registration confirmation email to %s: %s",
            recipient_email,
            error,
            exc_info=True,
        )
        return False


# ---------------------------------------------------------------------------
# Template builders
# ---------------------------------------------------------------------------

def _build_plain_text(
    team_leader: str,
    team_name: str,
    problem_statement: dict,
    members: list[dict],
    mentor: dict | None,
    registration_id: str,
    created_at: datetime | None = None,
) -> str:
    """Plain-text fallback for email clients that don't render HTML."""
    ps_id = problem_statement.get("psId", "N/A")
    ps_title = problem_statement.get("psTitle", "N/A")
    theme = problem_statement.get("theme", "N/A")

    member_lines = "\n".join(
        f"  {i}. {m.get('name', 'N/A')} ({m.get('department', '')}, {m.get('year', '')})"
        for i, m in enumerate(members, 1)
    )
    mentor_name = mentor.get("name", "Not assigned") if mentor else "Not assigned"

    date_str = ""
    if created_at:
        date_str = f"\nRegistration Date: {created_at.strftime('%d %b %Y, %I:%M %p')}"

    return f"""Dear {team_leader},

Congratulations!

Your registration for the NMIET SIH 2026 Internal Hackathon has been successfully received.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Registration Details
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Team Name: {team_name}
Problem Statement: {ps_id} - {ps_title}
Theme: {theme}
Team Leader: {team_leader}

Team Members:
{member_lines}

Mentor: {mentor_name}
Registration ID: {registration_id}{date_str}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT DEADLINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Internal Hackathon Date: 4th September 2026
Registration Deadline: 2nd September 2026

Important Notice:
Your registration will be considered incomplete without PPT submission.

Every team must submit:
1. Complete Registration Form
2. Problem Statement Selection
3. Team Details
4. PPT Presentation

Both registration and PPT submission must be completed before 2nd September 2026.

PPT Template: {PORTAL_URL}/ppt-template
Submit PPT: {PORTAL_URL}/ppt-submission

Please ensure your PPT follows the given template format and is submitted before the deadline.

For further updates, stay connected with NMIET SIH Team.

Regards,
NMIET SIH 2026 Team
"""


def _build_registration_html(
    team_leader: str,
    team_name: str,
    problem_statement: dict,
    members: list[dict],
    mentor: dict | None,
    registration_id: str,
    created_at: datetime | None = None,
) -> str:
    """Professional HTML email with SIH branding."""
    ps_id = problem_statement.get("psId", "N/A")
    ps_title = problem_statement.get("psTitle", "N/A")
    theme = problem_statement.get("theme", "N/A")
    category = problem_statement.get("category", "N/A")
    mentor_name = mentor.get("name", "Not assigned") if mentor else "Not assigned"
    mentor_dept = mentor.get("department", "") if mentor else ""

    date_str = ""
    if created_at:
        date_str = created_at.strftime("%d %b %Y, %I:%M %p")

    # Build member rows
    member_rows = ""
    for i, m in enumerate(members, 1):
        member_rows += f"""
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;color:#6b7280;font-size:13px;">{i}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-weight:600;color:#1f2937;font-size:13px;">{_esc(m.get('name', 'N/A'))}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;color:#4b5563;font-size:13px;">{_esc(m.get('department', '—'))}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;color:#4b5563;font-size:13px;">{_esc(m.get('year', '—'))}</td>
        </tr>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Registration Confirmed - NMIET SIH 2026</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#f97316 0%,#ea580c 50%,#c2410c 100%);border-radius:16px 16px 0 0;padding:40px 36px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:rgba(255,255,255,0.2);border-radius:12px;padding:10px 20px;margin-bottom:16px;">
                      <span style="color:#ffffff;font-size:14px;font-weight:700;letter-spacing:2px;">NMIET x SIH 2026</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:8px;">
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;line-height:1.3;">
                      Registration Confirmed
                    </h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">
                      Internal Hackathon Selection Round
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:36px;">

              <!-- Greeting -->
              <p style="margin:0 0 6px;color:#1f2937;font-size:16px;">
                Dear <strong>{_esc(team_leader)}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.6;">
                Congratulations! Your team has been successfully registered for the
                <strong>NMIET SIH 2026 Internal Hackathon</strong>. Below are your registration details.
              </p>

              <!-- Registration Details Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#ea580c;letter-spacing:1.5px;text-transform:uppercase;">
                      Registration Details
                    </p>
                    {_detail_row("Team Name", team_name)}
                    {_detail_row("Problem Statement", f"{ps_id} - {ps_title}")}
                    {_detail_row("Theme", theme)}
                    {_detail_row("Category", category)}
                    {_detail_row("Team Leader", team_leader)}
                    {_detail_row("Mentor", f"{mentor_name}" + (f" ({mentor_dept})" if mentor_dept else ""))}
                    {_detail_row("Registration ID", registration_id, bold_value=True)}
                    {_detail_row("Registration Date", date_str) if date_str else ""}
                  </td>
                </tr>
              </table>

              <!-- Team Members Table -->
              <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#ea580c;letter-spacing:1.5px;text-transform:uppercase;">
                Team Members
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:28px;">
                <tr style="background:#f9fafb;">
                  <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e5e7eb;">#</th>
                  <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e5e7eb;">Name</th>
                  <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e5e7eb;">Dept</th>
                  <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e5e7eb;">Year</th>
                </tr>
                {member_rows}
              </table>

              <!-- Deadline Alert -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#dc2626;letter-spacing:1.5px;text-transform:uppercase;">
                      Important Deadlines
                    </p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;color:#4b5563;font-size:14px;">Internal Hackathon Date</td>
                        <td style="padding:6px 0;color:#1f2937;font-size:14px;font-weight:700;text-align:right;">4th September 2026</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#4b5563;font-size:14px;">Registration Deadline</td>
                        <td style="padding:6px 0;color:#dc2626;font-size:14px;font-weight:700;text-align:right;">2nd September 2026</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- PPT Notice -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#1d4ed8;">
                      PPT Submission Required
                    </p>
                    <p style="margin:0 0 12px;color:#4b5563;font-size:14px;line-height:1.6;">
                      Your registration will be considered <strong>incomplete</strong> without PPT submission.
                      Every team must submit:
                    </p>
                    <ol style="margin:0 0 14px;padding-left:20px;color:#4b5563;font-size:14px;line-height:1.8;">
                      <li>Complete Registration Form</li>
                      <li>Problem Statement Selection</li>
                      <li>Team Details</li>
                      <li>PPT Presentation</li>
                    </ol>
                    <p style="margin:0;color:#4b5563;font-size:14px;">
                      Both registration and PPT submission must be completed before
                      <strong style="color:#dc2626;">2nd September 2026</strong>.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Buttons -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center" style="padding:0 0 10px;">
                    <a href="{PORTAL_URL}/ppt-submission" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:0.3px;">
                      Submit Your PPT
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="{PORTAL_URL}/ppt-template" style="display:inline-block;background:#ffffff;color:#f97316;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:600;border:2px solid #f97316;">
                      Download PPT Template
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Closing -->
              <p style="margin:0 0 4px;color:#4b5563;font-size:14px;line-height:1.6;">
                For further updates, stay connected with the NMIET SIH Team.
              </p>
              <p style="margin:0;color:#4b5563;font-size:14px;">
                Keep your Registration ID <strong style="color:#f97316;">{_esc(registration_id)}</strong> for future reference.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1f2937;border-radius:0 0 16px 16px;padding:28px 36px;text-align:center;">
              <p style="margin:0 0 6px;color:#f97316;font-size:13px;font-weight:700;letter-spacing:1.5px;">
                NMIET SIH 2026
              </p>
              <p style="margin:0 0 12px;color:#9ca3af;font-size:12px;">
                Nutan Maharashtra Institute of Engineering and Technology
              </p>
              <p style="margin:0;color:#6b7280;font-size:11px;">
                This is an automated confirmation email. Please do not reply to this message.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>"""


def _detail_row(label: str, value: str, bold_value: bool = False) -> str:
    """Generate a single key-value row for the details card."""
    weight = "font-weight:700;" if bold_value else ""
    color = "color:#ea580c;" if bold_value else "color:#1f2937;"
    return f"""
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:5px 0;color:#6b7280;font-size:13px;width:40%;">{_esc(label)}</td>
        <td style="padding:5px 0;{color}{weight}font-size:13px;">{_esc(value)}</td>
      </tr>
    </table>"""


def _esc(text: str) -> str:
    """Minimal HTML escaping for dynamic values."""
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )
