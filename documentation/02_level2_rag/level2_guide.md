---
title: "Level 2 -- RAG-Enabled Chatbot (Elementary)"
date: 2026-03-25
level: 2
author: Swaroop Formulation Industries
---

# Level 2 -- RAG-Enabled Chatbot (Elementary)

## Goal

Extend the chatbot so it **retrieves answers from ingested documents** using **vector search**, not only parametric model knowledge.

## New Technology

| Component | Role |
|-----------|------|
| **ChromaDB** | Local, free vector database |
| **HuggingFace** | `sentence-transformers/all-MiniLM-L6-v2` embeddings |
| **LangChain** | PDF loading, chunking, RAG chain composition |
| **FastAPI** | HTTP API for chat and ingestion triggers |

## Features

- **Ingest** the project report PDF and **ISO certificates** into the vector store.
- Pipeline: **Query → Embed → Retrieve top-k → Augment prompt → Generate**.
- **`/api/chat`** endpoint with **streaming** responses.
- **Source citations** in the UI (chunk metadata / filenames).
- **About** page describing data sources and limitations.

## Data Ingestion Script (Python)

Example pattern using LangChain loaders, splitter, Chroma, and HuggingFace embeddings:

```python
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

loader = PyPDFLoader("path/to/document.pdf")
docs = loader.load()

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
)
chunks = splitter.split_documents(docs)

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db",
)
vectorstore.persist()
```

Adjust paths, collection names, and chunk sizes for your corpus.

## Implementation Steps

1. **Set up** a FastAPI backend project structure and dependencies.
2. **Create** an ingestion script (or CLI) for PDFs and certificate files.
3. **Build** the RAG chain with LangChain (retriever + LLM binding).
4. **Add** a streaming **`/api/chat`** endpoint (SSE or chunked responses).
5. **Update** the frontend to call the backend instead of only Groq from the client.
6. **Add** an **About** page documenting ingestion, models, and privacy.
7. **Deploy** the backend to **Render** (or comparable) with persistent disk or rebuild-on-deploy strategy for Chroma.

## Deployment Options

| Platform | Notes |
|----------|--------|
| **Render.com** | Free tier suitable for hobby demos; verify sleep/cold start behavior. |
| **HuggingFace Spaces** | Good for demos with Gradio/Streamlit-style wrappers. |
| **Railway.app** | Paid from about **$5/month** for more consistent uptime. |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `CHROMA_PERSIST_DIR` | Directory for persisted Chroma data |
| `EMBEDDING_MODEL` | HuggingFace model id (e.g. `sentence-transformers/all-MiniLM-L6-v2`) |
| `GROQ_API_KEY` | LLM inference (or substitute provider) |

## Version Control

- Use a feature branch such as **`feature/rag-v1`** for RAG work.
- Tag milestone: **`v0.2.0-l2-rag-enabled`**.

## Python Requirements

Install (versions pinned in your own `requirements.txt`):

- `langchain`
- `chromadb`
- `sentence-transformers`
- `fastapi`
- `uvicorn`
- `pypdf`

Also include LangChain community / text-splitter packages as needed for your import paths (`langchain-community`, `langchain-text-splitters`, etc.).
