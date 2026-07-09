"""Weekly BIS monitoring for IS 17088 and related compostable plastics standards."""

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

_BACKEND_ROOT = Path(__file__).resolve().parents[2] / "backend"
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from db.models import RegulatoryUpdate  # noqa: E402
from db.session import SessionLocal  # noqa: E402

logger = logging.getLogger(__name__)

BIS_SEARCH = "https://www.services.bis.gov.in/cgi-bin/BIS/isss_query_page.cgi"


def check_bis_updates() -> list[dict[str, str]]:
    """Probe BIS portal for IS 17088 mentions (structure may change)."""
    hits: list[dict[str, str]] = []
    try:
        r = requests.get(BIS_SEARCH, params={"search_str": "17088"}, timeout=30)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        text_blob = soup.get_text("\n", strip=True)
        if "17088" in text_blob:
            hits.append(
                {
                    "title": "BIS portal search hit for IS 17088",
                    "body": text_blob[:4000],
                    "url": r.url,
                }
            )
    except Exception as exc:  # noqa: BLE001
        logger.warning("BIS check failed: %s", exc)
        hits.append(
            {
                "title": "BIS check fallback (manual review)",
                "body": str(exc),
                "url": BIS_SEARCH,
            }
        )
    return hits


def store_updates(**context: object) -> None:
    ti = context["ti"]
    rows = ti.xcom_pull(task_ids="check_bis_updates")
    if not isinstance(rows, list) or not rows:
        return
    session: Session = SessionLocal()
    now = datetime.now(tz=UTC)
    try:
        for row in rows:
            session.add(
                RegulatoryUpdate(
                    title=row["title"][:512],
                    body=row.get("body", ""),
                    source_url=row.get("url", BIS_SEARCH)[:1024],
                    published_at=None,
                    scraped_at=now,
                )
            )
        session.commit()
    except Exception:
        session.rollback()
        logger.exception("store_updates failed")
        raise
    finally:
        session.close()


with DAG(
    dag_id="bis_standards_weekly",
    default_args={
        "owner": "swaroop",
        "retries": 2,
        "retry_delay": timedelta(minutes=5),
    },
    description="Monitor BIS for IS 17088 related updates",
    schedule="@weekly",
    start_date=datetime(2026, 3, 25, tzinfo=UTC),
    catchup=False,
    tags=["regulatory", "bis"],
) as dag:
    t_check = PythonOperator(task_id="check_bis_updates", python_callable=check_bis_updates)
    t_store = PythonOperator(task_id="store_updates", python_callable=store_updates)
    t_check >> t_store
