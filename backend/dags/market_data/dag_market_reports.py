"""Weekly Google News RSS for biodegradable plastics market -> PostgreSQL summaries."""

from __future__ import annotations

import logging
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path
from time import mktime

import feedparser
import requests
from airflow import DAG
from airflow.operators.python import PythonOperator
from sqlalchemy.orm import Session

_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from db.models import RegulatoryUpdate
from db.session import SessionLocal

logger = logging.getLogger(__name__)

GOOGLE_NEWS_RSS = (
    "https://news.google.com/rss/search?"
    "q=biodegradable+plastics+market&hl=en-IN&gl=IN&ceid=IN:en"
)

default_args = {
    "owner": "swaroop",
    "depends_on_past": False,
    "email_on_failure": False,
    "email_on_retry": False,
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
}


def fetch_rss_feeds() -> str:
    """Download raw RSS XML for the configured Google News query."""
    try:
        r = requests.get(GOOGLE_NEWS_RSS, timeout=30, headers={"User-Agent": "SwaroopMarketBot/1.0"})
        r.raise_for_status()
        return r.text
    except Exception as exc:  # noqa: BLE001
        logger.warning("RSS fetch failed (%s); using empty feed for downstream handling", exc)
        return '<?xml version="1.0"?><rss version="2.0"><channel></channel></rss>'


def parse_summaries(**context: object) -> list[dict[str, object]]:
    """Parse feed entries into rows suitable for `RegulatoryUpdate` (market intel)."""
    ti = context["ti"]
    raw = ti.xcom_pull(task_ids="fetch_rss_feeds")
    if not isinstance(raw, str):
        raise TypeError("fetch_rss_feeds must return str (RSS XML)")

    parsed = feedparser.parse(raw)
    out: list[dict[str, object]] = []
    for entry in getattr(parsed, "entries", [])[:40]:
        title = str(getattr(entry, "title", "") or "")[:512]
        link = str(getattr(entry, "link", "") or "")[:1024]
        summary = (
            str(getattr(entry, "summary", "") or getattr(entry, "description", "") or title or "")
        )[:8000]

        published_at: datetime | None = None
        tm = getattr(entry, "published_parsed", None) or getattr(entry, "updated_parsed", None)
        if tm:
            try:
                published_at = datetime.fromtimestamp(mktime(tm), tz=UTC)
            except (OverflowError, OSError, TypeError, ValueError):
                published_at = None

        if title.strip():
            out.append(
                {
                    "title": title,
                    "body": summary or title,
                    "source_url": link or GOOGLE_NEWS_RSS[:1024],
                    "published_at": published_at,
                }
            )
    return out


def store_reports(**context: object) -> None:
    """Persist parsed summaries to PostgreSQL (via `RegulatoryUpdate`)."""
    ti = context["ti"]
    rows = ti.xcom_pull(task_ids="parse_summaries")
    if not isinstance(rows, list) or not rows:
        logger.info("No market report rows to store")
        return

    session: Session = SessionLocal()
    now = datetime.now(tz=UTC)
    try:
        for row in rows:
            if not isinstance(row, dict):
                continue
            pub = row.get("published_at")
            published_at = pub if isinstance(pub, datetime) else None
            session.add(
                RegulatoryUpdate(
                    title=str(row.get("title", "Market update"))[:512],
                    body=str(row.get("body", "")),
                    source_url=str(row.get("source_url", GOOGLE_NEWS_RSS))[:1024],
                    published_at=published_at,
                    scraped_at=now,
                )
            )
        session.commit()
        logger.info("Stored %d market report rows", len(rows))
    except Exception:
        session.rollback()
        logger.exception("store_reports failed")
        raise
    finally:
        session.close()


with DAG(
    dag_id="market_reports_weekly",
    default_args=default_args,
    description="Google News RSS biodegradable plastics market -> DB",
    schedule="@weekly",
    start_date=datetime(2026, 3, 25, tzinfo=UTC),
    catchup=False,
    tags=["market_data", "rss", "news"],
) as dag:
    t_fetch = PythonOperator(task_id="fetch_rss_feeds", python_callable=fetch_rss_feeds)
    t_parse = PythonOperator(task_id="parse_summaries", python_callable=parse_summaries)
    t_store = PythonOperator(task_id="store_reports", python_callable=store_reports)
    t_fetch >> t_parse >> t_store
