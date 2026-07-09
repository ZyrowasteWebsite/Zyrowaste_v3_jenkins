"""Scrape biodegradable plastics market signals (IndiaMART stub + Google News RSS)."""

from __future__ import annotations

import argparse
import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import feedparser
import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

INDIAMART_PLA_URL = "https://dir.indiamart.com/search/mpcat/pla-plastic.html"
GOOGLE_NEWS_RSS = (
    "https://news.google.com/rss/search?q=biodegradable+plastics+India&hl=en-IN&gl=IN&ceid=IN:en"
)
REQUEST_TIMEOUT = 25
USER_AGENT = (
    "Mozilla/5.0 (compatible; SwaroopMarketBot/1.0; +https://swaroop-formulation.example)"
)


def _project_root() -> Path:
    return Path(__file__).resolve().parents[2]


def scrape_indiamart_pla() -> dict[str, Any]:
    """
    Fetch IndiaMART PLA-related listing page and extract basic text snippets.

    HTML structure varies; failures are logged and returned as empty snippets.
    """
    out: dict[str, Any] = {"source": INDIAMART_PLA_URL, "items": [], "error": None}
    try:
        resp = requests.get(
            INDIAMART_PLA_URL,
            headers={"User-Agent": USER_AGENT},
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
    except requests.RequestException as exc:
        logger.warning("IndiaMART request failed: %s", exc)
        out["error"] = str(exc)
        return out

    try:
        soup = BeautifulSoup(resp.text, "html.parser")
        cards = soup.select(".lst-clist, .product-list, .prd-card")[:15]
        if not cards:
            cards = soup.find_all("a", href=True, string=True)[:20]
        for el in cards:
            text = el.get_text(" ", strip=True)
            if text and len(text) > 20:
                out["items"].append({"text": text[:500]})
    except Exception as exc:  # noqa: BLE001
        logger.exception("IndiaMART parse error: %s", exc)
        out["error"] = str(exc)

    return out


def scrape_news_rss() -> dict[str, Any]:
    """Parse Google News RSS for 'biodegradable plastics India'."""
    out: dict[str, Any] = {"feed": GOOGLE_NEWS_RSS, "entries": [], "error": None}
    try:
        resp = requests.get(
            GOOGLE_NEWS_RSS,
            headers={"User-Agent": USER_AGENT},
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        parsed = feedparser.parse(resp.content)
        if getattr(parsed, "bozo_exception", None):
            logger.warning("RSS bozo: %s", parsed.bozo_exception)
        for entry in parsed.entries[:30]:
            out["entries"].append(
                {
                    "title": getattr(entry, "title", ""),
                    "link": getattr(entry, "link", ""),
                    "published": getattr(entry, "published", ""),
                    "summary": getattr(entry, "summary", "")[:800],
                }
            )
    except Exception as exc:  # noqa: BLE001
        logger.exception("RSS parse failed: %s", exc)
        out["error"] = str(exc)

    return out


def save_scraped_data(payload: dict[str, Any], prefix: str = "market") -> Path:
    """Write JSON under ``_0_Resources/_scraped/`` with a UTC timestamp in the filename."""
    root = _project_root()
    out_dir = root / "_0_Resources" / "_scraped"
    out_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    path = out_dir / f"{prefix}_{ts}.json"
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    logger.info("Wrote scraped data to %s", path)
    return path


def main(argv: list[str] | None = None) -> int:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    parser = argparse.ArgumentParser(description="Market data scraper (PLA + news RSS).")
    parser.add_argument(
        "--skip-indiamart",
        action="store_true",
        help="Skip IndiaMART HTML fetch",
    )
    parser.add_argument(
        "--skip-rss",
        action="store_true",
        help="Skip Google News RSS",
    )
    args = parser.parse_args(argv)

    combined: dict[str, Any] = {
        "scraped_at_utc": datetime.now(timezone.utc).isoformat(),
        "indiamart": None,
        "news_rss": None,
    }
    if not args.skip_indiamart:
        combined["indiamart"] = scrape_indiamart_pla()
    if not args.skip_rss:
        combined["news_rss"] = scrape_news_rss()

    save_scraped_data(combined, prefix="market_data")
    return 0


if __name__ == "__main__":
    sys.exit(main())
