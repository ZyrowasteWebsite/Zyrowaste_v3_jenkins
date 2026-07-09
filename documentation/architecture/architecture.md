---
title: "System Architecture -- Swaroop Formulation Industries Platform"
date: 2026-03-25
author: Swaroop Formulation Industries
---

# System Architecture -- Swaroop Formulation Industries Platform

## Overview

The platform evolves from a static chatbot to a full enterprise system across six levels.

## Architecture Layers

### 1. Frontend Layer

Next.js/React with pages for Landing, AI Chatbot, Certifications Vault, Data Dashboards, and Admin Panel. Tailwind CSS styling. TypeScript throughout.

### 2. API Layer

FastAPI (Python) with REST endpoints and WebSocket for streaming chat. API versioning (`/api/v1/`). Rate limiting. CORS configuration.

### 3. AI/ML Layer

**Adaptive RAG Engine:** A query classifier routes requests to vector RAG, SQL RAG, web search, or direct LLM.

**Agentic Orchestrator (LangGraph)** with tools: `VectorSearchTool`, `FinancialCalculatorTool`, `CertificationLookupTool`, `WebSearchTool`. Embeddings via HuggingFace sentence-transformers.

### 4. Data Layer

ChromaDB/Qdrant for vectors, PostgreSQL for structured data, S3/MinIO for object storage, Redis for caching.

### 5. ETL/Pipeline Layer

Apache Airflow for orchestration. DAGs for market data, regulatory updates, competitor monitoring, and certificate tracking. Scrapers using BeautifulSoup, Scrapy, and Playwright.

### 6. Infrastructure Layer

Docker Compose (development), Kubernetes/K3s (production). Traefik ingress. Prometheus and Grafana observability. Terraform for infrastructure as code.

## Data Flow

User query → Frontend → API → Query Classifier → [Vector Store | PostgreSQL | Web] → LLM → Streaming response

## Security

API key proxying, RBAC via Keycloak, audit logging, and no secrets committed in source code.

## Scaling Strategy

Horizontal pod autoscaling, read replicas for PostgreSQL, and a CDN for static assets.
