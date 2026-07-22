"""Weekly GenAI digest over scraped operational/market signals."""

from __future__ import annotations

import logging
import os
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path

from airflow import DAG
from airflow.operators.python import PythonOperator
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from sqlalchemy import func

_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from db.models import CompetitorData, MarketPrice, RegulatoryUpdate  # noqa: E402
from db.session import SessionLocal  # noqa: E402

logger = logging.getLogger(__name__)


def gather_week_data() -> dict[str, object]:
    session = SessionLocal()
    try:
        mp = session.query(func.count(MarketPrice.id)).scalar() or 0
        ru = session.query(func.count(RegulatoryUpdate.id)).scalar() or 0
        cd = session.query(func.count(CompetitorData.id)).scalar() or 0
        return {
            "market_price_rows": int(mp),
            "regulatory_rows": int(ru),
            "competitor_rows": int(cd),
            "window": "last_7d_placeholder",
        }
    finally:
        session.close()


def generate_summary(**context: object) -> str:
    ti = context["ti"]
    stats = ti.xcom_pull(task_ids="gather_week_data")
    if not isinstance(stats, dict):
        stats = {}
    api_key = os.environ.get("GROQ_API_KEY", "")
    if not api_key:
        logger.warning("GROQ_API_KEY not set; returning template summary")
        return (
            "Weekly intelligence (offline): "
            f"market_price_rows={stats.get('market_price_rows')}, "
            f"regulatory_rows={stats.get('regulatory_rows')}, "
            f"competitor_rows={stats.get('competitor_rows')}."
        )
    model = os.environ.get("LLM_MODEL", "llama-3.3-70b-versatile")
    llm = ChatGroq(groq_api_key=api_key, model_name=model, temperature=0.2)
    prompt = (
        "Write a concise weekly executive summary (max 180 words) for a biodegradable "
        "PLA bag manufacturer in India using ONLY the stats JSON below. "
        f"Stats: {stats}"
    )
    resp = llm.invoke(
        [
            SystemMessage(content="You are a disciplined business analyst."),
            HumanMessage(content=prompt),
        ]
    )
    text = resp.content if isinstance(resp.content, str) else str(resp.content)
    return text.strip()


def save_summary(**context: object) -> None:
    ti = context["ti"]
    summary = ti.xcom_pull(task_ids="generate_summary")
    logger.info("Weekly AI summary saved to logs:\n%s", summary)


with DAG(
    dag_id="weekly_ai_summary",
    default_args={
        "owner": "swaroop",
        "retries": 2,
        "retry_delay": timedelta(minutes=5),
    },
    description="Groq-generated weekly intelligence summary",
    schedule="@weekly",
    start_date=datetime(2026, 3, 25, tzinfo=UTC),
    catchup=False,
    tags=["genai", "groq"],
) as dag:
    t_gather = PythonOperator(task_id="gather_week_data", python_callable=gather_week_data)
    t_gen = PythonOperator(task_id="generate_summary", python_callable=generate_summary)
    t_save = PythonOperator(task_id="save_summary", python_callable=save_summary)
    t_gather >> t_gen >> t_save
