"""Adaptive RAG router: LangGraph classifies queries and runs vector, SQL, web, or direct paths."""

from __future__ import annotations

import json
import operator
import re
from typing import Annotated, Any, Literal, TypedDict

import httpx
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from langgraph.graph import END, StateGraph

from config import get_settings
from rag.vectorstore import get_vectorstore, similarity_search
from rag.chain import _last_user_query, get_rag_response
from rag.sql_chain import sql_rag_response


class _State(TypedDict, total=False):
    """Graph state for adaptive RAG."""

    messages: list[dict[str, str]]
    strategy: Literal["vector", "sql", "web", "direct"]
    reply: str
    sources: Annotated[list[Any], operator.add]


CLASSIFIER_SYSTEM = """You are a routing classifier. Output a single JSON object with one key "strategy" whose value is exactly one of:
- "vector" — company documents, certifications, products, processes, standards, locations
- "sql" — financial figures: sales, EBITDA, net profit, ROI, DSCR, CAPEX, NPV, IRR, projections, sensitivity
- "web" — live/real-time market, news, today's prices, competitors' latest announcements
- "direct" — greetings, thanks, small talk, or generic chat with no retrieval need

Rules: Prefer "sql" for any numeric financial question. Prefer "web" only when freshness or external news is clearly needed. Prefer "vector" for Swaroop-specific factual questions not purely numeric tables. Use "direct" for hi/hello/thanks.

Respond with JSON only, no markdown."""


def _normalize_strategy(raw: str) -> Literal["vector", "sql", "web", "direct"]:
    t = raw.strip().lower()
    for s in ("vector", "sql", "web", "direct"):
        if s in t:
            return s  # type: ignore[return-value]
    if "{" in t:
        try:
            obj = json.loads(t[t.find("{") : t.rfind("}") + 1])
            v = str(obj.get("strategy", "")).lower()
            if v in ("vector", "sql", "web", "direct"):
                return v  # type: ignore[return-value]
        except json.JSONDecodeError:
            pass
    m = re.search(r"\b(vector|sql|web|direct)\b", t)
    if m:
        return m.group(1)  # type: ignore[return-value]
    return "vector"


async def _classify_node(state: _State) -> dict[str, Any]:
    settings = get_settings()
    query = _last_user_query(state.get("messages", []))
    llm = ChatGroq(
        groq_api_key=settings.groq_api_key,
        model_name=settings.llm_model,
        temperature=0.0,
    )
    resp = await llm.ainvoke(
        [
            SystemMessage(content=CLASSIFIER_SYSTEM),
            HumanMessage(
                content=f'Latest user message:\n"""{query or "(empty)"}"""\nReturn {{"strategy": "..."}} only.'
            ),
        ]
    )
    text = resp.content if isinstance(resp.content, str) else str(resp.content)
    strategy = _normalize_strategy(text)
    return {"strategy": strategy, "sources": [{"type": "router", "strategy": strategy}]}


async def _vector_node(state: _State) -> dict[str, Any]:
    get_vectorstore()
    if not callable(similarity_search):
        raise RuntimeError("rag.vectorstore.similarity_search is not callable")
    out = await get_rag_response(state.get("messages", []))
    return {"reply": out["reply"], "sources": list(out.get("sources", []))}


async def _sql_node(state: _State) -> dict[str, Any]:
    query = _last_user_query(state.get("messages", []))
    out = await sql_rag_response(query or "Summarize key financial projections.")
    return {"reply": out["reply"], "sources": list(out.get("sources", []))}


async def _web_node(state: _State) -> dict[str, Any]:
    """DuckDuckGo instant answer + Groq summary (no API key)."""
    settings = get_settings()
    query = _last_user_query(state.get("messages", [])) or "biodegradable plastics market India"
    abstract = ""
    related: list[str] = []
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.get(
                "https://api.duckduckgo.com/",
                params={"q": query, "format": "json", "no_html": 1},
            )
            r.raise_for_status()
            data = r.json()
            abstract = (data.get("Abstract") or "").strip()
            related = [str(t.get("Text", "")) for t in (data.get("RelatedTopics") or [])[:5] if t]
    except Exception as exc:  # noqa: BLE001 — best-effort web fallback
        abstract = f"(Web fetch unavailable: {exc})"

    bundle = "\n".join(
        [abstract] + [f"- {x}" for x in related if x],
    ).strip() or "(No instant summary returned; answer from general knowledge cautiously.)"

    llm = ChatGroq(
        groq_api_key=settings.groq_api_key,
        model_name=settings.llm_model,
        temperature=0.2,
    )
    resp = await llm.ainvoke(
        [
            SystemMessage(
                content=(
                    "Summarize the following web snapshot for a business user. "
                    "Note if data may be stale. Keep under 8 sentences."
                )
            ),
            HumanMessage(content=f"Query: {query}\n\nWeb snapshot:\n{bundle}"),
        ]
    )
    reply = resp.content if isinstance(resp.content, str) else str(resp.content)
    sources = [{"type": "web_snapshot", "content": bundle}]
    return {"reply": reply.strip(), "sources": sources}


async def _direct_node(state: _State) -> dict[str, Any]:
    settings = get_settings()
    msgs = state.get("messages", [])
    llm_messages: list[SystemMessage | HumanMessage | AIMessage] = [
        SystemMessage(
            content=(
                "You are a concise assistant for Swaroop Formulation Industries "
                "(biodegradable PLA bags, Unnao, UP). Reply briefly and professionally."
            )
        )
    ]
    for m in msgs:
        role = str(m.get("role", "")).lower()
        content = str(m.get("content", ""))
        if role == "user":
            llm_messages.append(HumanMessage(content=content))
        elif role == "assistant":
            llm_messages.append(AIMessage(content=content))
    if len(llm_messages) == 1:
        llm_messages.append(HumanMessage(content="Hello"))
    llm = ChatGroq(
        groq_api_key=settings.groq_api_key,
        model_name=settings.llm_model,
        temperature=0.4,
    )
    resp = await llm.ainvoke(llm_messages)
    reply = resp.content if isinstance(resp.content, str) else str(resp.content)
    return {"reply": reply.strip(), "sources": []}


def _route_after_classify(state: _State) -> str:
    s = state.get("strategy", "direct")
    if s in ("vector", "sql", "web", "direct"):
        return s
    return "direct"


def _build_graph() -> Any:
    g = StateGraph(_State)
    g.add_node("classify", _classify_node)
    g.add_node("vector", _vector_node)
    g.add_node("sql", _sql_node)
    g.add_node("web", _web_node)
    g.add_node("direct", _direct_node)
    g.set_entry_point("classify")
    g.add_conditional_edges(
        "classify",
        _route_after_classify,
        {
            "vector": "vector",
            "sql": "sql",
            "web": "web",
            "direct": "direct",
        },
    )
    g.add_edge("vector", END)
    g.add_edge("sql", END)
    g.add_edge("web", END)
    g.add_edge("direct", END)
    return g.compile()


_graph = _build_graph()


async def adaptive_rag_response(messages: list[dict[str, str]]) -> dict[str, Any]:
    """
    Run adaptive RAG: classify then execute vector, SQL, web, or direct strategy.

    Returns:
        {"reply": str, "sources": list, "strategy": str}
    """
    initial: _State = {"messages": messages, "sources": []}
    out = await _graph.ainvoke(initial)
    strategy = str(out.get("strategy", "direct"))
    return {
        "reply": str(out.get("reply", "")),
        "sources": list(out.get("sources", [])),
        "strategy": strategy,
    }
