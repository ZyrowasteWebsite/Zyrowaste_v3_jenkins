"""LangChain tool: semantic search via ``rag.vectorstore.similarity_search``."""

from __future__ import annotations

import logging
from typing import Any

from langchain_core.tools import tool

logger = logging.getLogger(__name__)


def _vectorstore_similarity_search(query: str, k: int) -> list[Any]:
    from rag.vectorstore import similarity_search

    return similarity_search(query, k=k)


def _format_documents(docs: list[Any]) -> tuple[str, list[dict[str, Any]]]:
    lines: list[str] = []
    sources: list[dict[str, Any]] = []
    for i, doc in enumerate(docs, start=1):
        meta = getattr(doc, "metadata", None) or {}
        src = meta.get("source") or meta.get("file") or meta.get("path") or "unknown"
        sources.append({"index": i, "source": str(src), "metadata": dict(meta)})
        excerpt = (getattr(doc, "page_content", "") or "").strip()
        if len(excerpt) > 1200:
            excerpt = excerpt[:1200] + "…"
        lines.append(f"[{i}] (source: {src})\n{excerpt}")
    text = "\n\n---\n\n".join(lines) if lines else ""
    return text, sources


@tool("search_documents")
def search_documents(query: str, k: int = 4) -> str:
    """Search the Swaroop Formulation Industries knowledge base for information about products, manufacturing, standards, and company details."""
    k = max(1, min(int(k), 20))
    try:
        docs = _vectorstore_similarity_search(query.strip(), k=k)
    except Exception as exc:
        logger.exception("Vector search failed")
        return f"Knowledge base search failed: {exc}"

    if not docs:
        return (
            "No matching documents were found in the knowledge base. "
            "Try rephrasing or ensure documents have been ingested."
        )
    formatted, _ = _format_documents(docs)
    return formatted


def search_documents_with_sources(query: str, k: int = 4) -> tuple[str, list[dict[str, Any]]]:
    """Internal helper for the agent: formatted text + structured sources."""
    k = max(1, min(int(k), 20))
    try:
        docs = _vectorstore_similarity_search(query.strip(), k=k)
    except Exception as exc:
        logger.exception("Vector search failed")
        return (f"Knowledge base search failed: {exc}", [])

    if not docs:
        return ("No matching documents were found in the knowledge base.", [])
    return _format_documents(docs)
