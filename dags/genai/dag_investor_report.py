"""Monthly investor-style update drafted with Groq and logged for distribution."""

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

_BACKEND_ROOT = Path(__file__).resolve().parents[2]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from db.models import MarketPrice  # noqa: E402
from db.session import SessionLocal  # noqa: E402

logger = logging.getLogger(__name__)


def collect_metrics() -> dict[str, object]:
    session = SessionLocal()
    try:
        mp = session.query(func.count(MarketPrice.id)).scalar() or 0
        return {
            "market_price_observations": int(mp),
            "narrative_seed": (
                "Swaroop Formulation Industries — PLA biodegradable bags, Unnao UP. "
                "Highlight compliance posture, capacity roadmap, and margin outlook."
            ),
        }
    finally:
        session.close()


def draft_report(**context: object) -> str:
    ti = context["ti"]
    metrics = ti.xcom_pull(task_ids="collect_metrics")
    if not isinstance(metrics, dict):
        metrics = {}
    api_key = os.environ.get("GROQ_API_KEY", "")
    if not api_key:
        logger.warning("GROQ_API_KEY not set; using static investor skeleton")
        return (
            "# Investor update (draft)\n\n"
            f"- Metrics snapshot: {metrics}\n"
            "- PLA pricing pipeline: monitoring active\n"
            "- Next steps: finalize capex drawdown schedule\n"
        )
    model = os.environ.get("LLM_MODEL", "llama-3.3-70b-versatile")
    llm = ChatGroq(groq_api_key=api_key, model_name=model, temperature=0.15)
    resp = llm.invoke(
        [
            SystemMessage(
                content=(
                    "You draft factual, cautious investor memos for Indian manufacturing SMEs. "
                    "No fabricated financials beyond the JSON hints."
                )
            ),
            HumanMessage(
                content=(
                    "Produce a 1-page markdown investor memo (sections: Highlights, "
                    "Operations, Market, Risks, Ask). "
                    f"Use this JSON as hints only: {metrics}"
                )
            ),
        ]
    )
    text = resp.content if isinstance(resp.content, str) else str(resp.content)
    return text.strip()


def format_pdf(**context: object) -> str:
    ti = context["ti"]
    md = ti.xcom_pull(task_ids="draft_report")
    if not isinstance(md, str):
        md = str(md)
    logger.info("PDF formatting stub — markdown length=%s", len(md))
    return md


def store_report(**context: object) -> None:
    ti = context["ti"]
    payload = ti.xcom_pull(task_ids="format_pdf")
    logger.info("Investor report stored to logs (PDF export TODO):\n%s", payload)


with DAG(
    dag_id="investor_report_monthly",
    default_args={
        "owner": "swaroop",
        "retries": 2,
        "retry_delay": timedelta(minutes=5),
    },
    description="Monthly investor memo via Groq + placeholder PDF",
    schedule="@monthly",
    start_date=datetime(2026, 3, 25, tzinfo=UTC),
    catchup=False,
    tags=["genai", "investor"],
) as dag:
    t_collect = PythonOperator(task_id="collect_metrics", python_callable=collect_metrics)
    t_draft = PythonOperator(task_id="draft_report", python_callable=draft_report)
    t_pdf = PythonOperator(task_id="format_pdf", python_callable=format_pdf)
    t_store = PythonOperator(task_id="store_report", python_callable=store_report)
    t_collect >> t_draft >> t_pdf >> t_store
