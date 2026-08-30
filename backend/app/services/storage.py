"""Supabase Storage service — the single source of truth for all file I/O.

Routes must never call Supabase directly.  Every upload, download, preview,
and delete goes through this module.

Bucket structure
----------------
ppt-submissions/
  team_<registration_id>/
    original/
      v1.pptx
      v2.pdf
    preview/
      v1.pdf   ← auto-generated from v1.pptx; same file for PDF uploads
      v2.pdf
"""
from __future__ import annotations

import hashlib
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Optional

from supabase import create_client, Client

from app.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_BUCKET

# ---------------------------------------------------------------------------
# Client — initialised once at import time
# ---------------------------------------------------------------------------

def _make_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment."
        )
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


_client: Client = _make_client()


# ---------------------------------------------------------------------------
# Bucket handle
# ---------------------------------------------------------------------------

def _bucket():
    """Return the storage bucket handle, raising clearly if unconfigured."""
    if not SUPABASE_BUCKET:
        raise RuntimeError("SUPABASE_BUCKET must be set in the environment.")
    return _client.storage.from_(SUPABASE_BUCKET)


# ---------------------------------------------------------------------------
# Key helpers  (public — routes may use these to build paths)
# ---------------------------------------------------------------------------

def original_key(registration_id: str, version: int, extension: str) -> str:
    """Return the canonical object key for an original uploaded file.

    Example: team_NMIET-001/original/v3.pptx
    """
    return f"team_{registration_id}/original/v{version}.{extension}"


def preview_key(registration_id: str, version: int) -> str:
    """Return the canonical object key for a preview PDF.

    Example: team_NMIET-001/preview/v3.pdf
    """
    return f"team_{registration_id}/preview/v{version}.pdf"


# Legacy helper kept for backwards compatibility with old flat keys.
def storage_key_for(registration_id: str, version: int, extension: str) -> str:  # noqa: D401
    """(Legacy) Flat key used by pre-upgrade submissions.

    New code should use original_key() + preview_key() instead.
    """
    return f"team_{registration_id}/v{version}.{extension}"


# ---------------------------------------------------------------------------
# SHA-256 utility
# ---------------------------------------------------------------------------

def sha256_hex(content: bytes) -> str:
    """Return the hex-encoded SHA-256 digest of *content*."""
    return hashlib.sha256(content).hexdigest()


# ---------------------------------------------------------------------------
# PDF conversion  (best-effort — never raises)
# ---------------------------------------------------------------------------

def _find_libreoffice() -> Optional[str]:
    """Return the path to the LibreOffice binary, or None if not found."""
    candidates = [
        "libreoffice",
        "soffice",
        "/usr/bin/libreoffice",
        "/usr/bin/soffice",
        "/usr/lib/libreoffice/program/soffice",
        "/Applications/LibreOffice.app/Contents/MacOS/soffice",
    ]
    for candidate in candidates:
        if shutil.which(candidate):
            return candidate
    return None


def convert_to_pdf_if_needed(content: bytes, extension: str) -> Optional[bytes]:
    """Convert PPT/PPTX *content* to PDF using LibreOffice headless.

    Returns the PDF bytes on success, or None if:
    - LibreOffice is not installed
    - Conversion fails for any reason

    Never raises an exception — a missing preview is acceptable.
    PDF files are returned as-is (no conversion needed).
    """
    ext = extension.lower().lstrip(".")

    # PDF uploads don't need conversion
    if ext == "pdf":
        return content

    # PPT / PPTX → try LibreOffice
    lo = _find_libreoffice()
    if not lo:
        return None  # graceful: no preview

    tmp_dir = tempfile.mkdtemp(prefix="ppt_preview_")
    try:
        src_path = Path(tmp_dir) / f"presentation.{ext}"
        src_path.write_bytes(content)

        result = subprocess.run(
            [
                lo,
                "--headless",
                "--convert-to", "pdf",
                "--outdir", tmp_dir,
                str(src_path),
            ],
            capture_output=True,
            timeout=120,  # 2 min max
        )

        if result.returncode != 0:
            return None

        pdf_path = Path(tmp_dir) / "presentation.pdf"
        if not pdf_path.exists():
            return None

        return pdf_path.read_bytes()

    except Exception:  # noqa: BLE001
        return None
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


# ---------------------------------------------------------------------------
# Core storage API
# ---------------------------------------------------------------------------

def upload_file(
    storage_key: str,
    content: bytes,
    content_type: str,
) -> str:
    """Upload *content* to *storage_key* inside the configured bucket.

    Returns the storage_key on success so callers can store it in MongoDB.
    Raises RuntimeError on failure.
    """
    try:
        _bucket().upload(
            path=storage_key,
            file=content,
            file_options={"content-type": content_type, "upsert": "false"},
        )
        return storage_key
    except Exception as exc:
        raise RuntimeError(f"Storage upload failed: {exc}") from exc


def download_file(storage_key: str) -> bytes:
    """Download and return the raw bytes for *storage_key*.

    Raises RuntimeError if the object does not exist or the download fails.
    """
    try:
        return _bucket().download(storage_key)
    except Exception as exc:
        raise RuntimeError(f"Storage download failed: {exc}") from exc


def delete_file(storage_key: str) -> None:
    """Permanently delete a single *storage_key* from the bucket.

    Silently ignores missing keys.
    """
    try:
        _bucket().remove([storage_key])
    except Exception:  # noqa: BLE001
        pass


def delete_files(storage_keys: list[str]) -> None:
    """Permanently delete multiple *storage_keys* in one call.

    Used when an admin explicitly deletes an entire submission (original + preview).
    Previous versions must never be deleted by the upload flow.
    """
    keys = [k for k in storage_keys if k]
    if not keys:
        return
    try:
        _bucket().remove(keys)
    except Exception as exc:
        raise RuntimeError(f"Storage delete failed: {exc}") from exc


def create_signed_download(storage_key: str, expires_in: int = 60) -> str:
    """Return a short-lived signed URL for downloading *storage_key* (internal use only)."""
    try:
        result = _bucket().create_signed_url(storage_key, expires_in)
        url = result.get("signedURL") or result.get("signed_url") or result.get("signedUrl")
        if not url:
            raise ValueError(f"Unexpected signed-URL response: {result}")
        print("SUPABASE PPT SIGNED URL request result: true")
        return url
    except Exception as exc:
        print("SUPABASE PPT SIGNED URL request result: false")
        raise RuntimeError(f"Could not create signed download URL: {exc}") from exc


def create_signed_preview(storage_key: str, expires_in: int = 60) -> str:
    """Return a short-lived signed URL suitable for inline browser preview (internal use only)."""
    return create_signed_download(storage_key, expires_in)


def list_versions(folder: str) -> list[dict]:
    """List all objects inside *folder* (e.g. 'team_NMIET-001').

    Returns a list of dicts as provided by Supabase Storage.
    """
    try:
        return _bucket().list(folder) or []
    except Exception as exc:
        raise RuntimeError(f"Storage list failed: {exc}") from exc
