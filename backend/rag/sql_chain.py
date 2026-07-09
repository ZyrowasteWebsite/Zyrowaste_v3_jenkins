"""SQL-style RAG over hardcoded financial projections (project report data)."""

from __future__ import annotations

import re
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from config import get_settings

FINANCIAL_DATA: dict[str, Any] = {
    "projections": [
        {
            "year": 1,
            "sales_lakhs": 95.76,
            "ebitda_lakhs": 10.5,
            "net_profit_lakhs": 4.74,
            "roi_pct": 20.0,
            "dscr": 3.05,
        },
        {
            "year": 2,
            "sales_lakhs": 111.5,
            "ebitda_lakhs": 12.2,
            "net_profit_lakhs": 6.65,
            "roi_pct": 25.0,
            "dscr": 3.08,
        },
        {
            "year": 3,
            "sales_lakhs": 127.98,
            "ebitda_lakhs": 14.2,
            "net_profit_lakhs": 8.93,
            "roi_pct": 32.0,
            "dscr": 3.13,
        },
        {
            "year": 4,
            "sales_lakhs": 143.2,
            "ebitda_lakhs": 16.35,
            "net_profit_lakhs": 11.12,
            "roi_pct": 38.0,
            "dscr": 4.02,
        },
        {
            "year": 5,
            "sales_lakhs": 158.63,
            "ebitda_lakhs": 18.5,
            "net_profit_lakhs": 13.31,
            "roi_pct": 45.0,
            "dscr": 4.91,
        },
    ],
    "capex_breakdown_lakhs": {
        "extrusion_lines": 85.0,
        "blown_film": 45.0,
        "facility": 30.0,
        "working_capital": 40.0,
    },
    "capex_total_lakhs": 200.0,
    "sensitivity": {
        "base": {"npv_crores": 12.4, "irr_pct": 22.5},
        "pessimistic": {"npv_crores": 7.1, "irr_pct": 16.8},
        "optimistic": {"npv_crores": 18.6, "irr_pct": 28.3},
    },
    "notes": (
        "Figures in INR Lakhs unless noted. ROI and DSCR are model estimates. "
        "NPV/IRR sensitivity in INR Crores and percent respectively."
    ),
}


def _relevant_slice(query: str) -> str:
    q = query.lower()
    parts: list[str] = []

    if any(k in q for k in ("capex", "capital", "extrusion", "blown", "facility", "working")):
        parts.append("CAPEX (INR Lakhs): " + str(FINANCIAL_DATA["capex_breakdown_lakhs"]))
        parts.append(f"Total CAPEX (INR Lakhs): {FINANCIAL_DATA['capex_total_lakhs']}")

    if any(
        k in q
        for k in (
            "sales",
            "revenue",
            "ebitda",
            "profit",
            "roi",
            "dscr",
            "projection",
            "year",
            "y1",
            "y2",
            "y3",
            "y4",
            "y5",
        )
    ):
        parts.append("Yearly projections: " + str(FINANCIAL_DATA["projections"]))

    if any(k in q for k in ("sensitivity", "npv", "irr", "pessimistic", "optimistic", "base case")):
        parts.append("Sensitivity: " + str(FINANCIAL_DATA["sensitivity"]))

    if not parts:
        parts.append(str(FINANCIAL_DATA))

    return "\n".join(parts)


_SQL_FORMAT_PROMPT = """You are a financial analyst assistant for Swaroop Formulation Industries.
Answer ONLY using the DATA block. If the data does not contain the answer, say so briefly.
Use INR Lakhs for sales/EBITDA/net profit/CAPEX unless the data specifies otherwise.
Be concise; use bullets or a short paragraph.

DATA:
{data}

USER QUESTION:
{query}
"""


async def sql_rag_response(query: str) -> dict[str, Any]:
    """
    Answer financial / numeric questions using hardcoded report data and the LLM for phrasing.

    Returns:
        {"reply": str, "sources": list[dict]}
    """
    settings = get_settings()
    data_block = _relevant_slice(query.strip())
    sources = [{"type": "financial_snapshot", "content": data_block}]

    llm = ChatGroq(
        groq_api_key=settings.groq_api_key,
        model_name=settings.llm_model,
        temperature=0.1,
    )
    prompt = _SQL_FORMAT_PROMPT.format(data=data_block, query=query.strip())
    resp = await llm.ainvoke(
        [
            SystemMessage(content="You format verified numeric answers from structured data."),
            HumanMessage(content=prompt),
        ]
    )
    text = resp.content if isinstance(resp.content, str) else str(resp.content)
    return {"reply": text.strip(), "sources": sources}


def match_financial_keywords(query: str) -> bool:
    """Heuristic: whether the query looks financial (used optionally by callers)."""
    q = query.lower()
    tokens = r"sales|ebitda|profit|roi|dscr|capex|npv|irr|projection|revenue|lakhs|crores"
    return bool(re.search(tokens, q))
