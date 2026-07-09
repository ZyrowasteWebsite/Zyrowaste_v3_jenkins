---
title: "Level 4 -- Adaptive RAG + Data Analysis Dashboards (Upper Intermediate)"
date: 2026-03-25
level: 4
author: Swaroop Formulation Industries
---

# Level 4 -- Adaptive RAG + Data Analysis Dashboards (Upper Intermediate)

## Goal

Smart retrieval routing, interactive dashboards, and structured ETL.

## New Technology

- **LangGraph** with routing (query classifier)
- **Plotly Dash** or **React + Recharts** for dashboards
- **PostgreSQL** (Supabase or Neon free tier)
- **Apache Airflow** for orchestration

## Adaptive RAG Pipeline

A **query classifier LLM** routes incoming queries to:

1. **Vector RAG** -- factual and document-based queries
2. **SQL RAG** -- financial and numeric queries
3. **Web Search** -- real-time and market queries
4. **Direct LLM** -- simple queries and greetings

## Data Analysis Page (`/analytics`)

- Financial projections dashboard: Sales, EBITDA, Net Profit, and ROI by year
- Market comparison charts
- Risk matrix visualization
- CAPEX breakdown
- Sensitivity analysis (NPV / IRR)

## ETL Pipelines (Airflow)

| DAG | Purpose |
| --- | --- |
| `market_data_pipeline` | PLA / PBAT prices |
| `competitor_monitor` | Competitor monitoring |
| `regulatory_updates` | CPCB / BIS regulatory feeds |
| `certificate_renewal_tracker` | Certificate renewal tracking |

## Data Scraping Sources

- PLA / PBAT pricing from IndiaMART and Alibaba
- Market reports from Grand View Research
- Regulatory updates from CPCB and BIS
- Competitor intelligence, trade events, and government subsidies

## Implementation Steps

1. Build the query classifier with LangGraph
2. Create the SQL RAG chain
3. Set up PostgreSQL with Alembic migrations
4. Build dashboard components
5. Create Airflow DAGs
6. Connect the frontend analytics page

## Deployment

- **Database:** Supabase or Neon (free PostgreSQL)
- **Orchestration:** Self-hosted Airflow on a ~\$5/month DigitalOcean droplet
- **Frontend:** Vercel
- **Backend:** Railway

## Environment Variables

In addition to variables from earlier levels:

```bash
DATABASE_URL=
AIRFLOW_HOME=
```

## Version Control

- Tag: `v0.4.0-l4-adaptive-dashboards`
- Add `dags/` and `alembic/` directories to the repository
