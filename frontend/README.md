# Zyrowaste Frontend

Vite + React + TypeScript SPA for **zyrowaste.com**.

## Quick start (local dev)

```bash
cp .env.example .env           # add VITE_API_BASE_URL if needed
npm install
npm run dev                    # Vite dev server on :5173, proxies /api → :8000
```

### Level 1 (no backend — direct Groq)

```bash
cp .env.example .env           # set GROQ_API_KEY
npm run dev:api                # node scripts/dev-api.mjs (port 8000)
# in another terminal:
npm run dev
```

## Env vars

| Variable | Default | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | *(empty)* | Leave empty in prod (same-origin `/api` via nginx). Set `http://localhost:8000` for local dev against FastAPI. |
| `GROQ_API_KEY` | — | Only for Level 1 dev-api proxy |

## Docker

```bash
docker build -t zyrowaste-frontend:local .
docker run -p 3000:80 zyrowaste-frontend:local
```

## Production

Image is pushed to `ghcr.io/zyrowaste/frontend` by the Jenkins pipeline in the `zyrowaste-deploy` repo.
