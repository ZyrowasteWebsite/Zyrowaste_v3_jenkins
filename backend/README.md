# Zyrowaste Backend

FastAPI + Groq API lightweight backend for **zyrowaste.com** (optimized for 1GB deployment).

## Structure

```
backend/
├── main.py            FastAPI entrypoint (/api/health, /api/chat, /api/auth/*)
├── rag/               Lightweight chat chain (direct Groq API call)
├── agents/            LangGraph agent (L3+, not yet mounted)
├── genai/             GenAI utility modules (L5+)
├── db/                SQLAlchemy models + session
├── auth_*.py          JWT auth routes + utils
├── scrapers/          Offline scraper scripts (not in Docker image)
├── scripts/ingest.py  Optional offline ingestion helper
├── dags/              Apache Airflow DAGs
├── data/
│   ├── resources/     RAG source PDFs + _0_Resources/
│   └── scraped/       Scraper output (gitignored)
├── requirements.txt           Core API (Docker image)
├── requirements-dev.txt       + pytest + ruff (CI)
└── requirements-scrapers.txt  + requests/bs4/feedparser (scraper scripts)
```

## Quick start

```bash
python -m venv .venv
source .venv/bin/activate          # or .venv\Scripts\activate on Windows
pip install -r requirements-dev.txt
cp .env.example .env               # set GROQ_API_KEY
uvicorn main:app --reload --port 8000
```

## Notes

- No pickle file usage in runtime.
- No Chroma / LangChain runtime dependencies in production image.
- Uses SQLite by default (`DATABASE_URL` optional).

## Docker

```bash
docker build -t zyrowaste-backend:local .
docker run -p 8000:8000 --env-file .env zyrowaste-backend:local
```

## Production

Image is pushed to `ghcr.io/zyrowaste/backend` by the Jenkins pipeline in the `zyrowaste-deploy` repo.
