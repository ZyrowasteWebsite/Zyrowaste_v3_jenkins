"""Weekly competitor homepage monitoring (Ecolastic, Biogreen, Truegreen, NaturTrust)."""

from __future__ import annotations

import logging
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path

import requests
from airflow import DAG
from airflow.operators.python import PythonOperator
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session

_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from db.models import CompetitorData  # noqa: E402
from db.session import SessionLocal  # noqa: E402

logger = logging.getLogger(__name__)

COMPETITORS: list[dict[str, str]] = [
    {"name": "Ecolastic", "url": "https://ecolastic.in/", "location": "Hyderabad"},
    {"name": "Biogreen Bags", "url": "https://www.biogreenbags.com/", "location": "Bengaluru"},
    {"name": "Truegreen", "url": "https://truegreenindia.com/", "location": "Mumbai"},
    {"name": "NaturTrust", "url": "https://naturtrust.com/", "location": "Noida"},
]


def scrape_competitors() -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for c in COMPETITORS:
        title = ""
        try:
            r = requests.get(c["url"], timeout=25)
            r.raise_for_status()
            soup = BeautifulSoup(r.text, "html.parser")
            if soup.title and soup.title.string:
                title = soup.title.string.strip()
        except Exception as exc:  # noqa: BLE001
            title = f"fetch_error: {exc}"
        rows.append(
            {
                "company_name": c["name"],
                "product": "homepage_snapshot",
                "price_range": "n/a",
                "location": c["location"],
                "notes": title[:500],
            }
        )
    return rows


def analyze_changes(**context: object) -> list[dict[str, str]]:
    ti = context["ti"]
    rows = ti.xcom_pull(task_ids="scrape_competitors")
    if not isinstance(rows, list):
        return []
    enriched: list[dict[str, str]] = []
    for row in rows:
        enriched.append({**row, "change_signal": "scraped_weekly"})
    return enriched


def store_results(**context: object) -> None:
    ti = context["ti"]
    rows = ti.xcom_pull(task_ids="analyze_changes")
    if not isinstance(rows, list) or not rows:
        return
    session: Session = SessionLocal()
    now = datetime.now(tz=UTC)
    try:
        for row in rows:
            notes = row.get("notes", "")
            session.add(
                CompetitorData(
                    company_name=row["company_name"],
                    product=f"{row['product']}: {notes}"[:255],
                    price_range=row.get("price_range", "n/a")[:128],
                    location=row["location"][:255],
                    last_updated=now,
                )
            )
        session.commit()
    except Exception:
        session.rollback()
        logger.exception("store_results failed")
        raise
    finally:
        session.close()


with DAG(
    dag_id="competitor_monitor_weekly",
    default_args={
        "owner": "swaroop",
        "retries": 2,
        "retry_delay": timedelta(minutes=5),
    },
    description="Scrape competitor sites weekly",
    schedule="@weekly",
    start_date=datetime(2026, 3, 25, tzinfo=UTC),
    catchup=False,
    tags=["competitors"],
) as dag:
    t_scrape = PythonOperator(task_id="scrape_competitors", python_callable=scrape_competitors)
    t_analyze = PythonOperator(task_id="analyze_changes", python_callable=analyze_changes)
    t_store = PythonOperator(task_id="store_results", python_callable=store_results)
    t_scrape >> t_analyze >> t_store
