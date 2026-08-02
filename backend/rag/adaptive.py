"""Adaptive RAG router: LangGraph classifies queries and runs vector, SQL, web, or direct paths."""

from __future__ import annotations

import json
import operator
import re
from typing import Annotated, Any, Literal, TypedDict

import httpx
from config import get_settings
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from langgraph.graph import END, StateGraph

from rag.chain import _last_user_query, get_rag_response
from rag.sql_chain import sql_rag_response
from rag.vectorstore import get_vectorstore, similarity_search


class _State(TypedDict, total=False):
    """Graph state for adaptive RAG."""

    messages: list[dict[str, str]]
    strategy: Literal["vector", "sql", "web", "direct"]
    reply: str
    sources: Annotated[list[Any], operator.add]


CLASSIFIER_SYSTEM = """
You are a routing classifier.

Output only JSON:
{"strategy": "value"}

Allowed values:
- vector
- sql
- web
- direct

Rules:
- vector: company documents, certifications, products, processes, standards, locations
- sql: financial figures, sales, EBITDA, ROI, DSCR, CAPEX, projections
- web: live market data, latest news, competitor updates
- direct: greetings, thanks, general conversation

Return JSON only.
"""


def _normalize_strategy(
    raw: str,
) -> Literal["vector", "sql", "web", "direct"]:
    """Normalize classifier output."""

    text = raw.strip().lower()

    for strategy in ("vector", "sql", "web", "direct"):
        if strategy in text:
            return strategy  # type: ignore[return-value]

    if "{" in text:
        try:
            obj = json.loads(text[text.find("{") : text.rfind("}") + 1])
            value = str(obj.get("strategy", "")).lower()

            if value in ("vector", "sql", "web", "direct"):
                return value  # type: ignore[return-value]

        except json.JSONDecodeError:
            pass

    match = re.search(
        r"\b(vector|sql|web|direct)\b",
        text,
    )

    if match:
        return match.group(1)  # type: ignore[return-value]

    return "vector"


async def _classify_node(
    state: _State,
) -> dict[str, Any]:
    settings = get_settings()

    query = _last_user_query(
        state.get("messages", []),
    )

    llm = ChatGroq(
        groq_api_key=settings.groq_api_key,
        model_name=settings.llm_model,
        temperature=0.0,
    )

    response = await llm.ainvoke(
        [
            SystemMessage(
                content=CLASSIFIER_SYSTEM,
            ),
            HumanMessage(
                content=(
                    "Latest user message:\n"
                    f"{query or '(empty)'}\n"
                    'Return {"strategy":"..."} only.'
                ),
            ),
        ],
    )

    text = (
        response.content
        if isinstance(response.content, str)
        else str(response.content)
    )

    strategy = _normalize_strategy(text)

    return {
        "strategy": strategy,
        "sources": [
            {
                "type": "router",
                "strategy": strategy,
            }
        ],
    }


async def _vector_node(
    state: _State,
) -> dict[str, Any]:
    """Execute vector RAG pipeline."""

    get_vectorstore()

    if not callable(similarity_search):
        raise TypeError

    result = await get_rag_response(
        state.get("messages", []),
    )

    return {
        "reply": result["reply"],
        "sources": list(
            result.get("sources", []),
        ),
    }


async def _sql_node(
    state: _State,
) -> dict[str, Any]:

    query = _last_user_query(
        state.get("messages", []),
    )

    result = await sql_rag_response(
        query or "Summarize financial projections.",
    )

    return {
        "reply": result["reply"],
        "sources": list(
            result.get("sources", []),
        ),
    }


async def _web_node(
    state: _State,
) -> dict[str, Any]:
    """Fetch web snapshot and summarize."""

    settings = get_settings()

    query = (
        _last_user_query(
            state.get("messages", []),
        )
        or "biodegradable plastics market India"
    )

    snapshot = ""

    try:
        async with httpx.AsyncClient(
            timeout=15.0,
        ) as client:

            response = await client.get(
                "https://api.duckduckgo.com/",
                params={
                    "q": query,
                    "format": "json",
                    "no_html": 1,
                },
            )

            response.raise_for_status()

            data = response.json()

            snapshot = str(
                data.get("Abstract", ""),
            ).strip()

    except Exception as exc:  # noqa: BLE001
        snapshot = (
            "Web fetch unavailable: "
            f"{exc}"
        )

    llm = ChatGroq(
        groq_api_key=settings.groq_api_key,
        model_name=settings.llm_model,
        temperature=0.2,
    )

    response = await llm.ainvoke(
        [
            SystemMessage(
                content=(
                    "Summarize web information "
                    "for a business user. "
                    "Mention if data may be stale."
                ),
            ),
            HumanMessage(
                content=(
                    f"Query: {query}\n\n"
                    f"Snapshot:\n{snapshot}"
                ),
            ),
        ],
    )

    reply = (
        response.content
        if isinstance(response.content, str)
        else str(response.content)
    )

    return {
        "reply": reply.strip(),
        "sources": [
            {
                "type": "web_snapshot",
                "content": snapshot,
            }
        ],
    }


async def _direct_node(
    state: _State,
) -> dict[str, Any]:

    settings = get_settings()

    messages = state.get(
        "messages",
        [],
    )

    llm_messages: list[
        SystemMessage | HumanMessage | AIMessage
    ] = [
        SystemMessage(
            content=(
                "You are an assistant for "
                "Swaroop Formulation Industries."
            ),
        )
    ]

    for message in messages:
        role = str(
            message.get("role", ""),
        ).lower()

        content = str(
            message.get("content", ""),
        )

        if role == "user":
            llm_messages.append(
                HumanMessage(content=content),
            )

        elif role == "assistant":
            llm_messages.append(
                AIMessage(content=content),
            )

    llm = ChatGroq(
        groq_api_key=settings.groq_api_key,
        model_name=settings.llm_model,
        temperature=0.4,
    )

    response = await llm.ainvoke(
        llm_messages,
    )

    reply = (
        response.content
        if isinstance(response.content, str)
        else str(response.content)
    )

    return {
        "reply": reply.strip(),
        "sources": [],
    }


def _route_after_classify(
    state: _State,
) -> str:

    strategy = state.get(
        "strategy",
        "direct",
    )

    if strategy in (
        "vector",
        "sql",
        "web",
        "direct",
    ):
        return strategy

    return "direct"


def _build_graph() -> Any:

    graph = StateGraph(_State)

    graph.add_node(
        "classify",
        _classify_node,
    )

    graph.add_node(
        "vector",
        _vector_node,
    )

    graph.add_node(
        "sql",
        _sql_node,
    )

    graph.add_node(
        "web",
        _web_node,
    )

    graph.add_node(
        "direct",
        _direct_node,
    )

    graph.set_entry_point(
        "classify",
    )

    graph.add_conditional_edges(
        "classify",
        _route_after_classify,
        {
            "vector": "vector",
            "sql": "sql",
            "web": "web",
            "direct": "direct",
        },
    )

    for node in (
        "vector",
        "sql",
        "web",
        "direct",
    ):
        graph.add_edge(
            node,
            END,
        )

    return graph.compile()


_graph = _build_graph()


async def adaptive_rag_response(
    messages: list[dict[str, str]],
) -> dict[str, Any]:
    """
    Run adaptive RAG pipeline.

    Returns:
        reply, sources and selected strategy.
    """

    initial: _State = {
        "messages": messages,
        "sources": [],
    }

    result = await _graph.ainvoke(
        initial,
    )

    return {
        "reply": str(
            result.get("reply", ""),
        ),
        "sources": list(
            result.get("sources", []),
        ),
        "strategy": str(
            result.get(
                "strategy",
                "direct",
            ),
        ),
    }