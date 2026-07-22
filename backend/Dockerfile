# syntax=docker/dockerfile:1.7
#
# ── Stage 1: dependency builder ─────────────────────────────────────────────
# Heavy pip install runs here; only the installed packages are copied forward.
FROM python:3.11-slim AS builder

WORKDIR /build

COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip \
 && pip install --prefix=/install -r requirements.txt


# ── Stage 2: lean runtime image ─────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application source (excluding files in .dockerignore)
COPY . .

EXPOSE 8000

# Single worker — 1 GB droplet cannot afford 2 copies of the embedding model in RAM
HEALTHCHECK --interval=20s --timeout=10s --start-period=90s --retries=5 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=8)"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
