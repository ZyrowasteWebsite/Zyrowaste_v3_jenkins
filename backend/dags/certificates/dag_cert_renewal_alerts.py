"""Daily certificate surveillance / expiry alerts (ISO 9001:2015 and ISO 13485:2016)."""

from __future__ import annotations

import logging
from datetime import UTC, date, datetime, timedelta

from airflow import DAG
from airflow.operators.python import PythonOperator

logger = logging.getLogger(__name__)

ALERT_LEAD_DAYS = 90

CERT_EVENTS: list[dict[str, str]] = [
    {"standard": "ISO 9001:2015", "kind": "surveillance", "on": "2027-03-22"},
    {"standard": "ISO 9001:2015", "kind": "surveillance", "on": "2028-03-22"},
    {"standard": "ISO 9001:2015", "kind": "expiry", "on": "2029-03-22"},
    {"standard": "ISO 13485:2016", "kind": "surveillance", "on": "2027-03-24"},
    {"standard": "ISO 13485:2016", "kind": "surveillance", "on": "2028-03-24"},
    {"standard": "ISO 13485:2016", "kind": "expiry", "on": "2029-03-24"},
]


def _parse_iso(d: str) -> date:
    y, m, day = d.split("-")
    return date(int(y), int(m), int(day))


def check_expiry_dates() -> list[dict[str, str]]:
    today = datetime.now(tz=UTC).date()
    due: list[dict[str, str]] = []
    for ev in CERT_EVENTS:
        on = _parse_iso(ev["on"])
        if (on - today).days <= ALERT_LEAD_DAYS and (on - today).days >= 0:
            due.append(
                {
                    "standard": ev["standard"],
                    "kind": ev["kind"],
                    "date": ev["on"],
                    "days_remaining": str((on - today).days),
                }
            )
    return due


def send_alerts(**context: object) -> None:
    ti = context["ti"]
    due = ti.xcom_pull(task_ids="check_expiry_dates")
    if not isinstance(due, list):
        return
    if not due:
        logger.info("No certificate alerts within %s days", ALERT_LEAD_DAYS)
        return
    for item in due:
        logger.warning(
            "CERT ALERT | %s | %s | %s | days=%s",
            item.get("standard"),
            item.get("kind"),
            item.get("date"),
            item.get("days_remaining"),
        )


with DAG(
    dag_id="certificate_renewal_tracker",
    default_args={
        "owner": "swaroop",
        "retries": 2,
        "retry_delay": timedelta(minutes=5),
    },
    description="Alert 90 days before surveillance/expiry milestones",
    schedule="@daily",
    start_date=datetime(2026, 3, 25, tzinfo=UTC),
    catchup=False,
    tags=["certificates", "compliance"],
) as dag:
    t_check = PythonOperator(task_id="check_expiry_dates", python_callable=check_expiry_dates)
    t_alert = PythonOperator(task_id="send_alerts", python_callable=send_alerts)
    t_check >> t_alert
