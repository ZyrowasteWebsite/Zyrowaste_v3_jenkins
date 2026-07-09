"""LangChain tool: ISO certification metadata for Swaroop Formulation Industries."""

from __future__ import annotations

import json
from typing import Any

from langchain_core.tools import tool

_CERTIFICATES: list[dict[str, Any]] = [
    {
        "standard": "ISO 9001:2015",
        "certificate_number": "QSR/QS/2603392923",
        "issued_date": "23-03-2026",
        "expiry_date": "22-03-2029",
        "surveillance_dates": "Per certification cycle (annual surveillance as scheduled by QSR)",
        "scope": (
            "Manufacturing of plastic bio-medical and bio-degradable compostable waste bags "
            "and other packaging goods"
        ),
        "issuing_body": "QSR (Quality System Registrars)",
    },
    {
        "standard": "ISO 13485:2016",
        "certificate_number": "IN01232718",
        "issued_date": "25-03-2026",
        "expiry_date": "24-03-2029",
        "surveillance_dates": "Per certification cycle (per US Certification body schedule)",
        "scope": (
            "Manufacturing of plastic bio-medical and bio-degradable compostable waste bags "
            "and other packaging goods (medical device quality management context)"
        ),
        "issuing_body": "US Certification body",
    },
]


@tool("certification_lookup")
def certification_lookup(query: str) -> str:
    """Look up certification details for Swaroop Formulation Industries including ISO 9001:2015 and ISO 13485:2016."""
    q = (query or "").strip().lower()
    selected = _CERTIFICATES
    if "9001" in q:
        selected = [c for c in _CERTIFICATES if "9001" in c["standard"]]
    elif "13485" in q:
        selected = [c for c in _CERTIFICATES if "13485" in c["standard"]]

    return json.dumps(selected, indent=2)


def get_certificate_records() -> list[dict[str, Any]]:
    """Return a copy of certificate records for APIs or the frontend."""
    return [dict(c) for c in _CERTIFICATES]
