"""GenAI investor report drafting via Groq (ChatGroq)."""

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from config import get_settings

REPORT_SYSTEM = """You are a senior communications advisor for Swaroop Formulation Industries Pvt. Ltd.,
a PLA-based biodegradable packaging manufacturer in Unnao, Uttar Pradesh, India.

Write a concise, professional investor update in Markdown only. Use clear headings and bullets where helpful.
Do not invent specific figures; use only those provided in the structured data blocks. If a figure is missing,
say "Not provided" for that line item rather than guessing.

Required sections (in this order):
1. ## Executive Summary
2. ## Financial Highlights
3. ## Market Trends
4. ## Outlook

Tone: confident, factual, suitable for existing and prospective investors."""


def _format_data_block(name: str, payload: dict) -> str:
    lines = [f"### {name}"]
    for key, value in payload.items():
        lines.append(f"- {key}: {value}")
    return "\n".join(lines)


async def generate_investor_report(financial_data: dict, market_data: dict) -> str:
    """
    Draft a Markdown investor update from structured financial and market inputs.

    Uses Groq ChatGroq with a fixed section template (executive summary, financials, market, outlook).
    """
    settings = get_settings()
    user_content = "\n\n".join(
        [
            _format_data_block("Financial data", financial_data),
            _format_data_block("Market data", market_data),
            "Produce the full Markdown report now.",
        ]
    )
    llm = ChatGroq(
        groq_api_key=settings.groq_api_key,
        model_name=settings.llm_model,
        temperature=0.25,
    )
    response = await llm.ainvoke(
        [
            SystemMessage(content=REPORT_SYSTEM),
            HumanMessage(content=user_content),
        ]
    )
    text = response.content if isinstance(response.content, str) else str(response.content)
    return text.strip()
