---
title: "Swaroop Formulation Industries -- Progressive Website Development Roadmap"
date: 2026-03-25
level: Overview
author: Swaroop Formulation Industries
---

# Swaroop Formulation Industries -- Progressive Website Development Roadmap

## Business Context

**Swaroop Formulation Industries Pvt. Ltd.** manufactures biodegradable PLA-based plastic bags and bio-medical compostable waste bags in Unnao, Uttar Pradesh, India. The company holds **ISO 9001:2015** and **ISO 13485:2016** certifications. It targets **B2B** logistics, retail, and export markets. Financial projections indicate **20-45% ROI** over five years.

## Six-Level Roadmap Summary

| Level | Name | Scope | Timeline |
|-------|------|-------|----------|
| **1** | Beginner | Static site + chatbot; GitHub Pages / Vercel | 1 week |
| **2** | Elementary | RAG chatbot with document retrieval; ChromaDB; Render free | 2 weeks |
| **3** | Intermediate | Agentic RAG + certifications page + basic scraping; LangGraph | 3-4 weeks |
| **4** | Upper Intermediate | Adaptive RAG + dashboards + Airflow ETL + PostgreSQL | 4-6 weeks |
| **5** | Advanced | Full platform + GenAI automation + CI/CD + Docker | 6-8 weeks |
| **6** | Expert | Enterprise K8s + RBAC + observability + IaC | 8-12 weeks |

### Level Details

- **Level 1 (Beginner):** Static site with an embedded chatbot; deploy on GitHub Pages or Vercel; about one week.
- **Level 2 (Elementary):** Retrieval-augmented chatbot using ChromaDB; free tier on Render; about two weeks.
- **Level 3 (Intermediate):** Agentic RAG, certifications showcase, basic web scraping with LangGraph; three to four weeks.
- **Level 4 (Upper Intermediate):** Adaptive RAG, operational dashboards, Airflow ETL, PostgreSQL; four to six weeks.
- **Level 5 (Advanced):** End-to-end platform with GenAI automation, CI/CD, and Docker; six to eight weeks.
- **Level 6 (Expert):** Kubernetes, role-based access control, observability stack, infrastructure as code; eight to twelve weeks.

## Top-Down Architecture

### Frontend (Next.js / React)

Primary surfaces:

- **Landing** -- marketing and company narrative
- **Chat** -- conversational assistant
- **Certs** -- certifications and compliance
- **Dash** -- analytics and operational views
- **Admin** -- configuration and content management

### Backend (FastAPI / Python)

- **REST + WebSocket API** -- synchronous and streaming interactions
- **Adaptive RAG Engine** -- context-aware retrieval and generation
- **Agentic Orchestrator** -- multi-step tool use and planning
- **Airflow ETL** -- scheduled data pipelines
- **Web Scrapers** -- ingestion from public sources

### Data Layer

| Component | Role |
|-----------|------|
| **ChromaDB / Qdrant** | Vector store for embeddings and semantic search |
| **PostgreSQL** | Relational data, users, metadata |
| **S3 / MinIO** | Object storage for documents and artifacts |
| **Redis** | Caching, sessions, rate limiting |

## Version Control Strategy (Progressive)

Development maturity maps to branching models:

1. **Levels 1-2:** Simple **main** + **dev**; integrate on `dev`, release from `main`.
2. **Levels 3-4:** **GitFlow** -- `main`, `develop`, `feature/*`, `release/*`, `hotfix/*`.
3. **Levels 5-6:** **Trunk-based** development with short-lived branches, feature flags, and protected `main`.

Tags follow `v{MAJOR}.{MINOR}.{PATCH}-{level-descriptor}` (for example `v0.1.0-l1-chatbot-basic`).

## Documentation Convention

Project documentation is maintained in **dual format**:

- **Markdown (`.md`)** -- readable in repositories, wikis, and editors.
- **LaTeX (`.tex`)** -- PDF-ready reports, print, and formal deliverables.

Content for each topic should stay aligned across both formats; only presentation (headings, code blocks, tables) is adapted to the medium.
