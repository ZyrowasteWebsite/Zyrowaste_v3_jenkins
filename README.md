## How to run this on vscode
### create uv environment using command: uv venv then activate the same in cmd not powershell and then create requirement.txt


# Swaroop Formulation Industries -- Website Platform

A progressive web platform for **Swaroop Formulation Industries Pvt. Ltd.**, a manufacturer of biodegradable PLA-based plastic bags and bio-medical compostable waste bags based in Unnao, Uttar Pradesh, India.

## Roadmap (6 Levels)

| Level | Name | Key Technologies |
|---|---|---|
| 1 | Foundation Chatbot | Vite + React, Groq API, Vercel |
| 2 | RAG-Enabled Chatbot | FastAPI, ChromaDB, LangChain |
| 3 | Agentic RAG + Certifications | LangGraph, Next.js, SQLite |
| 4 | Adaptive RAG + Dashboards | Plotly, PostgreSQL, Airflow |
| 5 | Full Platform + GenAI | Docker, GitHub Actions, DVC |
| 6 | Enterprise Production | Kubernetes, Terraform, Grafana |

## Quick Start (Level 1 -- Beginner, No Admin)

```powershell
# From project root
./scripts/bootstrap-node.ps1
./scripts/run-level1.ps1
```

If this is first run, edit `frontend/.env` and set `GROQ_API_KEY`, then run `./scripts/run-level1.ps1` again.

App URL: `http://localhost:5173`

### VS Code local server (recommended)

- Task 1: `Bootstrap Portable Node (No Admin)` (first run only)
- Task 2: `Run Level 1 (Local Server)`
- Debug launch: `Level 1: Launch in Edge` (F5)

## Project Structure

```
frontend/          # Vite + React application (Level 1+)
backend/           # FastAPI Python backend (Level 2+)
dags/              # Apache Airflow DAGs (Level 4+)
scripts/           # Utilities (bootstrap, run, ingestion)
infrastructure/    # Terraform, K8s manifests, Helm (Level 6)
documentation/     # Dual .md/.tex project docs
_0_Resources/      # Source PDFs, certificates, scraped data
.cursor/rules/     # Cursor AI conventions
.github/           # GitHub Actions workflows (Level 5+)
```

## Documentation

All documentation lives in `documentation/` with dual `.md` and `.tex` formats. See `.cursor/rules/documentation_rules.mdc` for conventions.

## Certifications

- **ISO 9001:2015** -- Quality Management System (QSR/QS/2603392923)
- **ISO 13485:2016** -- Medical Devices QMS (IN01232718)

## License

Proprietary -- Swaroop Formulation Industries Pvt. Ltd.
