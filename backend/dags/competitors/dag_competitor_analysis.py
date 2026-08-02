"""Monthly aggregation of weekly competitor scrapes."""

from __future__ import annotations

import json
import logging
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path

from airflow import DAG
from airflow.operators.python import PythonOperator
from sqlalchemy import func
from sqlalchemy.orm import Session

_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from db.models import CompetitorData
from db.session import SessionLocal

logger = logging.getLogger(__name__)


def aggregate_data() -> dict[str, object]:
    session: Session = SessionLocal()
    try:
        total = session.query(func.count(CompetitorData.id)).scalar() or 0
        by_company = (
            session.query(CompetitorData.company_name, func.count(CompetitorData.id))
            .group_by(CompetitorData.company_name)
            .all()
        )
        return {
            "total_rows": int(total),
            "by_company": {name: int(cnt) for name, cnt in by_company},
            "as_of": datetime.now(tz=UTC).isoformat(),
        }
    finally:
        session.close()


def generate_report(**context: object) -> str:
    ti = context["ti"]
    agg = ti.xcom_pull(task_ids="aggregate_data")
    if not isinstance(agg, dict):
        agg = {}
    lines = [
        "# Competitor monitoring — monthly rollup",
        f"Total stored snapshots: {agg.get('total_rows', 0)}",
        f"By company: {json.dumps(agg.get('by_company', {}), ensure_ascii=False)}",
    ]
    return "\n".join(lines)


def store_report(**context: object) -> None:
    ti = context["ti"]
    body = ti.xcom_pull(task_ids="generate_report")
    if not isinstance(body, str):
        body = str(body)
    logger.info("Monthly competitor report:\n%s", body)
    session: Session = SessionLocal()
    now = datetime.now(tz=UTC)
    try:
        session.add(
            CompetitorData(
                company_name="AGGREGATE",
                product="monthly_report",
                price_range="n/a",
                location="internal",
                last_updated=now,
            )
        )
        session.commit()
    except Exception:
        session.rollback()
        logger.exception("store_report failed")
        raise
    finally:
        session.close()


with DAG(
    dag_id="competitor_analysis_monthly",
    default_args={
        "owner": "swaroop",
        "retries": 2,
        "retry_delay": timedelta(minutes=5),
    },
    description="Aggregate weekly competitor scrapes monthly",
    schedule="@monthly",
    start_date=datetime(2026, 3, 25, tzinfo=UTC),
    catchup=False,
    tags=["competitors", "analytics"],
) as dag:
    t_agg = PythonOperator(task_id="aggregate_data", python_callable=aggregate_data)
    t_report = PythonOperator(task_id="generate_report", python_callable=generate_report)
    t_store = PythonOperator(task_id="store_report", python_callable=store_report)
    t_agg >> t_report >> t_store
