"""Daily PLA pricing scrape -> validate -> load into MarketPrice."""

from __future__ import annotations

import logging
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path

import requests
from airflow import DAG
from airflow.operators.python import PythonOperator
from sqlalchemy.orm import Session

_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from db.models import MarketPrice
from db.session import SessionLocal, engine
from sqlalchemy import text

logger = logging.getLogger(__name__)

default_args = {
    "owner": "swaroop",
    "depends_on_past": False,
    "email_on_failure": False,
    "email_on_retry": False,
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
}


def scrape_pla_prices() -> list[dict[str, object]]:
    """
    Fetch indicative PLA / biodegradable resin pricing from a public page or API stub.

    Uses a resilient pattern: try a lightweight JSON endpoint; fall back to demo rows.
    """
    rows: list[dict[str, object]] = []
    try:
        r = requests.get(
            "https://api.metals.live/v1/spot/plastic",
            timeout=20,
        )
        if r.ok:
            data = r.json()
            if isinstance(data, list):
                for item in data:
                    if isinstance(item, dict) and "price" in item:
                        rows.append(
                            {
                                "commodity": str(item.get("name", "PLA resin")),
                                "price": float(item["price"]),
                                "currency": str(item.get("currency", "USD")),
                                "source": "metals.live",
                            }
                        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Primary PLA price fetch failed: %s", exc)

    if not rows:
        rows = [
            {
                "commodity": "PLA resin (indicative)",
                "price": 185.0,
                "currency": "INR",
                "source": "fallback_stub",
            },
            {
                "commodity": "Biodegradable compound (blend)",
                "price": 162.5,
                "currency": "INR",
                "source": "fallback_stub",
            },
        ]
    return rows


def validate_data(**context: object) -> None:
    ti = context["ti"]
    raw = ti.xcom_pull(task_ids="scrape_pla_prices")
    if not isinstance(raw, list) or not raw:
        raise ValueError("No pricing rows to validate")
    for row in raw:
        price = float(row["price"])
        if price <= 0 or price > 1_000_000:
            raise ValueError("Unreasonable price")
        if not str(row.get("commodity", "")).strip():
            raise ValueError("Missing commodity")


def load_to_db(**context: object) -> None:
    ti = context["ti"]
    raw = ti.xcom_pull(task_ids="scrape_pla_prices")
    if not isinstance(raw, list):
        raise TypeError("scrape_pla_prices must return a list")

    session: Session = SessionLocal()
    try:
        if str(engine.url).startswith("postgresql"):
            session.execute(text("SELECT 1"))
        now = datetime.now(tz=UTC)
        for row in raw:
            session.add(
                MarketPrice(
                    commodity=str(row["commodity"]),
                    price=float(row["price"]),
                    currency=str(row.get("currency", "INR")),
                    source=str(row.get("source", "unknown")),
                    scraped_at=now,
                )
            )
        session.commit()
        logger.info("Inserted %d market price rows", len(raw))
    except Exception:
        session.rollback()
        logger.exception("load_to_db failed")
        raise
    finally:
        session.close()


with DAG(
    dag_id="pla_prices_daily",
    default_args=default_args,
    description="Scrape PLA pricing, validate, load to MarketPrice",
    schedule="@daily",
    start_date=datetime(2026, 3, 25, tzinfo=UTC),
    catchup=False,
    tags=["market_data", "pla"],
) as dag:
    t_scrape = PythonOperator(
        task_id="scrape_pla_prices",
        python_callable=scrape_pla_prices,
    )
    t_validate = PythonOperator(
        task_id="validate_data",
        python_callable=validate_data,
    )
    t_load = PythonOperator(
        task_id="load_to_db",
        python_callable=load_to_db,
    )
    t_scrape >> t_validate >> t_load
