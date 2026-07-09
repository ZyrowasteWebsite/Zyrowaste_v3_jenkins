"""LangGraph agent: classify → execute tools → synthesize."""

from __future__ import annotations

import json
from typing import Any, Literal, TypedDict

from langgraph.graph import END, START, StateGraph

from agents.tools import cert_lookup, financial_calc, vector_search, web_search

ToolName = Literal[
    "search_documents",
    "financial_calculator",
    "certification_lookup",
    "web_search",
]

_TOOL_REGISTRY: dict[str, Any] = {
    "search_documents": vector_search,
    "financial_calculator": financial_calc,
    "certification_lookup": cert_lookup,
    "web_search": web_search,
}


class AgentState(TypedDict, total=False):
    """Graph state for the Swaroop agent."""

    query: str
    chat_history: list[dict[str, Any]]
    tools_to_run: list[str]
    tool_outputs: list[str]
    tools_used: list[str]
    sources: list[dict[str, Any]]
    reply: str


def _classify_tools(query: str) -> list[ToolName]:
    """Rule-based routing (deterministic; no external LLM call)."""
    q = query.lower()

    if any(
        w in q
        for w in (
            "iso",
            "certif",
            "qsr",
            "13485",
            "9001",
            "accredit",
            "audit",
        )
    ):
        return ["certification_lookup"]

    if any(
        w in q
        for w in (
            "roi",
            "ebitda",
            "margin",
            "dscr",
            "profit",
            "sales",
            "lakhs",
            "financial",
            "break-even",
            "breakeven",
            "cagr",
            "growth",
        )
    ):
        return ["financial_calculator"]

    if any(
        w in q
        for w in (
            "news",
            "price",
            "market today",
            "current",
            "serp",
            "google",
            "pla price",
            "live",
        )
    ):
        return ["web_search", "search_documents"]

    return ["search_documents"]


async def _node_classify(state: AgentState) -> dict[str, Any]:
    query = (state.get("query") or "").strip()
    chosen = [t for t in _classify_tools(query) if t in _TOOL_REGISTRY]
    if not chosen:
        chosen = ["search_documents"]
    return {"tools_to_run": list(chosen)}


async def _node_execute_tool(state: AgentState) -> dict[str, Any]:
    query = (state.get("query") or "").strip()
    tools_to_run = state.get("tools_to_run") or ["search_documents"]
    outputs: list[str] = []
    used: list[str] = []
    sources: list[dict[str, Any]] = []

    for name in tools_to_run:
        tool = _TOOL_REGISTRY.get(name)
        if tool is None:
            continue
        used.append(name)
        try:
            if name == "search_documents":
                from agents.tools.vector_search import search_documents_with_sources

                text, src = search_documents_with_sources(query)
                sources.extend(src)
            elif name == "financial_calculator":
                raw = await tool.ainvoke({"request": query})
                text = raw if isinstance(raw, str) else str(raw)
            else:
                raw = await tool.ainvoke({"query": query})
                text = raw if isinstance(raw, str) else str(raw)
        except Exception as exc:  # noqa: BLE001
            text = f"Tool {name} failed: {exc}"

        outputs.append(f"## {name}\n{text}")

        if name == "certification_lookup":
            try:
                data = json.loads(text)
                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict):
                            sources.append(
                                {
                                    "type": "certificate",
                                    "standard": item.get("standard"),
                                    "certificate_number": item.get("certificate_number"),
                                }
                            )
            except json.JSONDecodeError:
                pass

    return {
        "tool_outputs": outputs,
        "tools_used": used,
        "sources": sources,
    }


async def _node_synthesize(state: AgentState) -> dict[str, Any]:
    query = (state.get("query") or "").strip()
    blocks = state.get("tool_outputs") or []
    body = "\n\n".join(blocks) if blocks else "No tool output was produced."

    reply = (
        f"### Answer\n"
        f"Your question: **{query}**\n\n"
        f"{body}\n\n"
        f"_Tools used: {', '.join(state.get('tools_used') or []) or 'none'}_"
    )
    return {"reply": reply}


def _build_graph() -> Any:
    graph = StateGraph(AgentState)
    graph.add_node("classify", _node_classify)
    graph.add_node("execute_tool", _node_execute_tool)
    graph.add_node("synthesize", _node_synthesize)
    graph.add_edge(START, "classify")
    graph.add_edge("classify", "execute_tool")
    graph.add_edge("execute_tool", "synthesize")
    graph.add_edge("synthesize", END)
    return graph.compile()


_COMPILED = _build_graph()


async def run_agent(query: str, chat_history: list[dict]) -> dict:
    """
    Run the Swaroop agent pipeline.

    Returns
    -------
    dict
        ``{"reply": str, "sources": list, "tools_used": list[str]}``
    """
    q = (query or "").strip()
    hist = chat_history if isinstance(chat_history, list) else []

    initial: AgentState = {
        "query": q,
        "chat_history": hist,
        "tool_outputs": [],
        "tools_used": [],
        "sources": [],
    }

    out = await _COMPILED.ainvoke(initial)
    return {
        "reply": str(out.get("reply") or "").strip(),
        "sources": list(out.get("sources") or []),
        "tools_used": list(out.get("tools_used") or []),
    }
