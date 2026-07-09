"""LangChain tool stub: web search (full API integration planned for Level 4)."""

from __future__ import annotations

from langchain_core.tools import tool

# TODO(Level 4): Integrate SerpAPI, Google Custom Search JSON API, or similar
# for live biodegradable plastics / PLA market and news queries.


@tool("web_search")
def web_search(query: str) -> str:
    """Search the web for real-time information about biodegradable plastics market, PLA prices, and industry news."""
    _ = query
    return (
        "Web search is not yet connected to a live API in this build (Level 3). "
        "This tool will be wired to SerpAPI or Google Search API in Level 4 for "
        "real-time PLA pricing and industry news."
    )
