"""LangChain tool: financial metrics from project report figures (INR Lakhs)."""

from __future__ import annotations

import re

from langchain_core.tools import tool

# Hardcoded projection data (project report / landing summary)
_SALES_LAKHS = {"y1": 95.76, "y3": 127.98, "y5": 158.63}
_EBITDA_LAKHS = {"y1": 10.5, "y3": 14.2, "y5": 18.5}
_NET_PROFIT_LAKHS = {"y1": 4.74, "y3": 8.93, "y5": 13.31}
_ROI_PCT = {"y1": 20.0, "y3": 32.0, "y5": 45.0}
_DSCR = {"y1": 3.05, "y3": 3.13, "y5": 4.91}

_FIXED_COSTS_Y1 = 55.0
_VARIABLE_COST_RATIO = 0.42


def _margin_pct(numerator: float, denominator: float) -> float:
    if denominator <= 0:
        return 0.0
    return round(100.0 * numerator / denominator, 2)


def _cagr(start: float, end: float, periods: float) -> float:
    if start <= 0 or periods <= 0:
        return 0.0
    return round(100.0 * ((end / start) ** (1.0 / periods) - 1.0), 2)


def _parse_year_key(text: str) -> str | None:
    t = text.lower()
    if "year 5" in t or "y5" in t:
        return "y5"
    if "year 3" in t or "y3" in t:
        return "y3"
    if "year 1" in t or "y1" in t:
        return "y1"
    m = re.search(r"\byear\s*(\d+)\b", t)
    if m:
        n = m.group(1)
        if n in ("1", "3", "5"):
            return f"y{n}"
    return None


@tool("financial_calculator")
def financial_calculator(request: str) -> str:
    """Calculate financial metrics for Swaroop Formulation Industries. Supports: ROI, EBITDA margin, net profit margin, DSCR, break-even analysis."""
    q = (request or "").strip().lower()
    if not q:
        return "Describe what to compute (e.g. EBITDA margin year 5, sales CAGR, break-even year 1)."

    lines: list[str] = []

    if "cagr" in q or ("growth" in q and "sales" in q):
        c = _cagr(_SALES_LAKHS["y1"], _SALES_LAKHS["y5"], 4.0)
        lines.append(f"Sales CAGR (Year 1 → Year 5, 4 intervals): {c}%")

    yk = _parse_year_key(q)
    if yk:
        s = _SALES_LAKHS[yk]
        e = _EBITDA_LAKHS[yk]
        n = _NET_PROFIT_LAKHS[yk]
        lines.append(
            f"{yk.upper()} snapshot — Sales: {s} L, EBITDA: {e} L, Net profit: {n} L, "
            f"ROI (est.): {_ROI_PCT[yk]}%, DSCR: {_DSCR[yk]}"
        )
        if "ebitda" in q and "margin" in q:
            lines.append(f"  EBITDA margin: {_margin_pct(e, s)}%")
        if "net" in q and "margin" in q:
            lines.append(f"  Net profit margin: {_margin_pct(n, s)}%")

    if "roi" in q and yk is None:
        lines.append(
            "ROI (est.) — Y1: 20%, Y3: 32%, Y5: 45% "
            "(from project report; specify year for detail)."
        )

    if "dscr" in q and yk is None:
        lines.append("DSCR — Y1: 3.05, Y3: 3.13, Y5: 4.91")

    if "break" in q and "even" in q:
        s = _SALES_LAKHS["y1"]
        be_sales = (
            _FIXED_COSTS_Y1 / (1.0 - _VARIABLE_COST_RATIO)
            if _VARIABLE_COST_RATIO < 1
            else 0.0
        )
        lines.append(
            f"Break-even illustration (Year 1): assumed fixed costs {_FIXED_COSTS_Y1} L, "
            f"variable cost ratio {_VARIABLE_COST_RATIO:.0%}. "
            f"Implied break-even sales ≈ {be_sales:.2f} L (vs projected {s} L)."
        )

    if not lines:
        lines.append(
            "Supported: EBITDA margin, net profit margin, ROI, DSCR, sales growth/CAGR, break-even (illustrative). "
            "Mention a year (1, 3, or 5) where relevant."
        )

    return "\n".join(lines)
