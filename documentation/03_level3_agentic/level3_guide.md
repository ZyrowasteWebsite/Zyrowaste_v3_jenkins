---
title: "Level 3 -- Agentic RAG + Certifications Page (Intermediate)"
date: 2026-03-25
level: 3
author: Swaroop Formulation Industries
---

# Level 3 -- Agentic RAG + Certifications Page (Intermediate)

## Goal

Introduce a **multi-tool agent** that **reasons** over user queries and add a **dedicated certifications showcase**. Include **basic scraping** for market intelligence.

## New Technology

| Area | Choice |
|---|---|
| Agent framework | **LangGraph** or **CrewAI** |
| Frontend | **Next.js App Router** |

## Agentic RAG

The **agent** receives a query and **decides which tools** to call. Typical tools:

| Tool | Purpose |
|---|---|
| **VectorSearchTool** | Semantic retrieval from Chroma / Qdrant |
| **FinancialCalculatorTool** | ROI, margins, or unit economics helpers |
| **CertificationLookupTool** | Structured lookup of ISO records |
| **WebSearchTool** | Optional live web augmentation (rate-limited, cited) |

**Multi-step reasoning example:** User asks for *"Compare our ISO scope to last year's revenue assumption in the project report."* The planner might (1) run **CertificationLookupTool** for scope text, (2) run **VectorSearchTool** on the report for financial assumptions, (3) synthesize a comparison with citations.

## Certifications Page

- Display **ISO 9001:2015** and **ISO 13485:2016** with **structured fields**: certificate number, issue/expiry dates, scope of certification.
- **PDF viewer** or **download** links per certificate.
- **Admin form** (protected route) to add or update certificates, backed by **SQLite** for simplicity.

## Basic Scraping

- Scripts under `backend/scrapers/` scrape **biodegradable plastics market data** from **public** sources.
- Store normalized output as **JSON** under `_0_Resources/_scraped/` (gitignore large or sensitive pulls if needed).

## Project Structure (Illustrative)

```
backend/
  agents/
    swaroop_agent.py
    tools/
      vector_search.py
      financial_calculator.py
      certification_lookup.py
      web_search.py
  scrapers/
    market_data_scraper.py
frontend/
  app/
    certifications/
      page.tsx
```

## Implementation Steps

1. **Build** the agent graph with **LangGraph** (or CrewAI crews) and shared tool interfaces.
2. **Create** tool functions with clear schemas and unit tests where practical.
3. **Migrate** the frontend to **Next.js** (App Router), preserving chat and branding.
4. **Build** the **certifications** page with structured data components and PDF actions.
5. **Create** scraping scripts with scheduling hooks (manual cron or later Airflow).
6. **Add** `docker-compose.yml` for local backend + DB + optional vector store.

## Deployment

| Tier | Pattern |
|---|---|
| Default | **Vercel** (frontend) + **Render** (backend API + agent) |
| Alternative | **Fly.io** for API/worker-style processes |
| Data | **SQLite** for certificates admin data (file volume or persistent disk on host) |

## Version Control

Adopt **GitFlow** for this level: `main`, `develop`, `feature/*`, `release/*`, `hotfix/*` as appropriate.

Tag milestone: **`v0.3.0-l3-agentic-rag`**.
