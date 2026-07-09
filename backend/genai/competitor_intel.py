"""Competitive intelligence briefs from scraped news items (Groq)."""

import json

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from config import get_settings

SYSTEM = """You are a competitive intelligence analyst covering biodegradable plastics and flexible packaging
in India and globally.

You receive a JSON list of news articles. Each item may have keys like: title, url, source, published, summary, body.

Produce a structured Markdown brief for Swaroop Formulation Industries' leadership. Use only information
implied or stated in the articles; if something is unknown, write "Unclear from sources".

Required sections:
## Overview
## New products / offerings
## Pricing / commercial moves
## Partnerships / M&A
## Regulatory / policy
## Implications for Swaroop (bullet list)

Keep the brief scannable; use bullets under each section where appropriate."""


async def summarize_competitor_news(news_items: list[dict]) -> str:
    """Summarize scraped competitor news into a structured Markdown intelligence brief."""
    settings = get_settings()
    payload = json.dumps(news_items, ensure_ascii=False, indent=2)
    user = f"Articles (JSON):\n{payload}\n\nWrite the competitive intelligence brief in Markdown."
    llm = ChatGroq(
        groq_api_key=settings.groq_api_key,
        model_name=settings.llm_model,
        temperature=0.2,
    )
    response = await llm.ainvoke(
        [SystemMessage(content=SYSTEM), HumanMessage(content=user)]
    )
    text = response.content if isinstance(response.content, str) else str(response.content)
    return text.strip()
