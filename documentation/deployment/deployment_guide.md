---
title: "Deployment Guide -- From Free Tier to Enterprise"
date: 2026-03-25
author: Swaroop Formulation Industries
---

# Deployment Guide -- From Free Tier to Enterprise

## Level 1 Deployment

**Vercel free:** 100GB bandwidth, serverless functions.

**Alternative:** GitHub Pages (static only).

**Steps:** Connect the GitHub repository, configure environment variables in the Vercel dashboard, and enable auto-deploy on push.

## Level 2 Deployment

**Vercel** (frontend) + **Render.com free** (backend, 750h/month, spins down when idle).

**Alternatives:** HuggingFace Spaces, Railway at approximately $5/month. ChromaDB on disk.

## Level 3 Deployment

**Vercel** (frontend) + **Render** (backend) + **SQLite** file.

**Alternative:** Fly.io (3 free VMs).

## Level 4 Deployment

Add **Supabase free** (500MB PostgreSQL) or **Neon.tech** (512MB). Airflow on a $5/month DigitalOcean droplet or Astronomer free dev tier.

## Level 5 Deployment

**Docker Compose** for all services. **DigitalOcean App Platform** ($5/month) or **AWS Lightsail** ($3.50/month). **GitHub Actions** CI/CD (2000 free minutes). **Sentry free** (5K errors). **UptimeRobot free** (50 monitors).

## Level 6 Deployment Budget Tiers

- **$0--10/month:** Oracle Cloud Free Tier (4 ARM A1, 24GB RAM) + K3s
- **$10--50/month:** Hetzner CX21 (approximately $5) or DigitalOcean K8s ($12)
- **$50--200/month:** AWS EKS Spot or GCP GKE Autopilot

## Always-Free Building Blocks

Cloudflare CDN+DNS+SSL (free), Let's Encrypt, Cloudflare R2 / Backblaze B2 (10GB), approximately $10/year for a `.in` domain.

## Docker Compose Example (Local Development)

Services: `frontend`, `backend`, `chromadb`, `postgres`, `redis`, `airflow-webserver`, `airflow-scheduler`.

```yaml
# docker-compose.yml (illustrative local dev skeleton)
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis
      - chromadb
  chromadb:
    image: chromadb/chroma
    ports:
      - "8001:8000"
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: swaroop
      POSTGRES_PASSWORD: changeme
      POSTGRES_DB: swaroop
    ports:
      - "5432:5432"
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  airflow-webserver:
    image: apache/airflow:2.8.0
    command: webserver
    ports:
      - "8080:8080"
    depends_on:
      - airflow-scheduler
  airflow-scheduler:
    image: apache/airflow:2.8.0
    command: scheduler
```

## Production Checklist

- SSL/TLS termination and certificate renewal
- Environment-specific configurations (dev/staging/prod)
- Health checks and readiness probes
- Backup strategy for databases and object storage
- Monitoring alerts (latency, errors, saturation)
- Log aggregation and retention
