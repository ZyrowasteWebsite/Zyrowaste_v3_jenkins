"""Scrape CPCB pages for plastic waste management / circular references."""

from __future__ import annotations

import argparse
import json
import logging
import sys
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

CPCB_BASE = "https://cpcb.nic.in"
CPCB_PLASTIC_HUB = "https://cpcb.nic.in/plastic-waste-management/"
REQUEST_TIMEOUT = 30
MAX_RETRIES = 3
RETRY_BACKOFF_SEC = 2.0
USER_AGENT = (
    "Mozilla/5.0 "
    "(compatible; SwaroopRegulatoryBot/1.0; "
    "+https://swaroop-formulation.example)"
)


def _project_root() -> Path:
    """Return the backend root (data/ lives here in the new layout)."""
    return Path(__file__).resolve().parents[1]


def _scraped_dir() -> Path:
    backend = _project_root()

    new_path = backend / "data" / "scraped" / "regulatory"
    old_path = (
        backend.parent
        / "_0_Resources"
        / "_scraped"
        / "regulatory"
    )

    return new_path if (backend / "data").is_dir() else old_path


def _fetch_with_retries(url: str) -> requests.Response | None:
    """Fetch URL with retry handling."""
    session = requests.Session()
    headers = {"User-Agent": USER_AGENT}

    last_exc: Exception | None = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = session.get(
                url,
                headers=headers,
                timeout=REQUEST_TIMEOUT,
            )
            resp.raise_for_status()

        except requests.RequestException as exc:
            last_exc = exc

            logger.warning(
                "Attempt %s/%s failed for %s: %s",
                attempt,
                MAX_RETRIES,
                url,
                exc,
            )

            if attempt < MAX_RETRIES:
                time.sleep(RETRY_BACKOFF_SEC * attempt)

        else:
            return resp

    logger.error(
        "Giving up on %s after %s tries: %s",
        url,
        MAX_RETRIES,
        last_exc,
    )

    return None


def scrape_cpcb_circulars() -> dict[str, Any]:
    """
    Collect links and titles from CPCB plastic waste management section.

    Site structure may change; parsing is defensive.
    """
    out: dict[str, Any] = {
        "hub_url": CPCB_PLASTIC_HUB,
        "circulars": [],
        "error": None,
    }

    resp = _fetch_with_retries(CPCB_PLASTIC_HUB)

    if resp is None:
        out["error"] = "Failed to fetch CPCB hub after retries"
        return out

    try:
        soup = BeautifulSoup(
            resp.text,
            "html.parser",
        )

        for anchor in soup.find_all("a", href=True):
            href = anchor["href"].strip()
            text = anchor.get_text(
                " ",
                strip=True,
            )

            if not text or len(text) < 4:
                continue

            lower = href.lower()

            matches_href = any(
                key in lower
                for key in (
                    "pdf",
                    "circular",
                    "plastic",
                    "pwm",
                    "notification",
                    "rule",
                )
            )

            matches_text = any(
                key in text.lower()
                for key in (
                    "plastic",
                    "waste",
                    "pwm",
                    "notification",
                )
            )

            if matches_href or matches_text:
                full_url = urljoin(
                    CPCB_BASE,
                    href,
                )

                out["circulars"].append(
                    {
                        "title": text[:500],
                        "url": full_url,
                    }
                )

    except Exception as exc:
        logger.exception("CPCB parse error")
        out["error"] = str(exc)

    return out


def save_regulatory_data(
    payload: dict[str, Any],
    prefix: str = "cpcb",
) -> Path:
    """Persist JSON under data/scraped/regulatory/."""
    out_dir = _scraped_dir()
    out_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    timestamp = datetime.now(UTC).strftime(
        "%Y%m%dT%H%M%SZ"
    )

    path = out_dir / f"{prefix}_{timestamp}.json"

    path.write_text(
        json.dumps(
            payload,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    logger.info(
        "Wrote regulatory scrape to %s",
        path,
    )

    return path


def main(
    argv: list[str] | None = None,
) -> int:
    logging.basicConfig(
        level=logging.INFO,
        format=(
            "%(asctime)s %(levelname)s "
            "%(name)s: %(message)s"
        ),
    )

    parser = argparse.ArgumentParser(
        description="CPCB regulatory links scraper.",
    )

    parser.parse_args(argv)

    data = scrape_cpcb_circulars()

    data["scraped_at_utc"] = datetime.now(
        UTC
    ).isoformat()

    save_regulatory_data(data)

    return 0 if not data.get("error") else 1


if __name__ == "__main__":
    sys.exit(main())