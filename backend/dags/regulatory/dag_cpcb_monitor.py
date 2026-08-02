"""Daily CPCB plastic-waste circular scrape with DB diff + log alerts."""

from __future__ import annotations

import logging
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path
from urllib.parse import urljoin

import requests
from airflow import DAG
from airflow.operators.python import PythonOperator
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session

_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from db.models import RegulatoryUpdate
from db.session import SessionLocal

logger = logging.getLogger(__name__)

CPCB_BASE = "https://cpcb.nic.in"
PLASTIC_PATH = "/plastic-waste/"


def scrape_cpcb() -> list[dict[str, str]]:
    """Fetch listing page links (best-effort; site structure may change)."""
    url = urljoin(CPCB_BASE, PLASTIC_PATH)
    items: list[dict[str, str]] = []
    try:
        r = requests.get(url, timeout=30)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        for a in soup.select("a[href]"):
            title = a.get_text(strip=True)
            href = str(a.get("href", "")).strip()
            if not title or len(title) < 8:
                continue
            if "plastic" not in title.lower() and "waste" not in title.lower():
                continue
            items.append({"title": title[:512], "url": urljoin(CPCB_BASE, href)[:1024]})
    except Exception as exc:  # noqa: BLE001
        logger.warning("CPCB scrape failed: %s", exc)
        items = [
            {
                "title": "CPCB plastic waste hub (fallback)",
                "url": url,
            }
        ]
    return items[:50]


def check_new_updates(**context: object) -> list[dict[str, str]]:
    ti = context["ti"]
    scraped = ti.xcom_pull(task_ids="scrape_cpcb")
    if not isinstance(scraped, list):
        return []

    session: Session = SessionLocal()
    try:
        rows = session.query(RegulatoryUpdate.source_url).limit(5000).all()
        existing = {str(t[0]) for t in rows if t and t[0]}
    finally:
        session.close()

    new_items: list[dict[str, str]] = []
    for row in scraped:
        u = row.get("url", "")
        if u and u not in existing:
            new_items.append(row)
    return new_items


def notify_if_new(**context: object) -> None:
    ti = context["ti"]
    new_items = ti.xcom_pull(task_ids="check_new_updates")
    if not isinstance(new_items, list):
        return
    if not new_items:
        logger.info("No new CPCB circulars detected")
        return
    for item in new_items:
        logger.warning("NEW CPCB ITEM: %s | %s", item.get("title"), item.get("url"))


with DAG(
    dag_id="cpcb_regulatory_daily",
    default_args={
        "owner": "swaroop",
        "retries": 2,
        "retry_delay": timedelta(minutes=5),
    },
    description="Monitor CPCB plastic waste circulars",
    schedule="@daily",
    start_date=datetime(2026, 3, 25, tzinfo=UTC),
    catchup=False,
    tags=["regulatory", "cpcb"],
) as dag:
    t_scrape = PythonOperator(task_id="scrape_cpcb", python_callable=scrape_cpcb)
    t_check = PythonOperator(task_id="check_new_updates", python_callable=check_new_updates)
    t_notify = PythonOperator(task_id="notify_if_new", python_callable=notify_if_new)
    t_scrape >> t_check >> t_notify
