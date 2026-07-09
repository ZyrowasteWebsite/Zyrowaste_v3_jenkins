"""FastAPI entrypoint: health, chat (RAG), auth, and vector store warmup."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth_router import router as auth_router
from config import get_settings
from db.session import init_db
from models import ChatRequest, ChatResponse, HealthResponse, SourceDoc
from rag.chain import get_rag_response
from rag.vectorstore import get_vectorstore

APP_VERSION = "0.2.0-l2-rag"


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    get_vectorstore()
    yield


app = FastAPI(title="Zyrowaste / Swaroop RAG API", version=APP_VERSION, lifespan=lifespan)

_settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=_settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])


@app.get("/api/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """Liveness / readiness probe."""
    return HealthResponse(status="healthy", version=APP_VERSION)


@app.post("/api/chat", response_model=ChatResponse)
async def chat(body: ChatRequest) -> ChatResponse:
    """Run the RAG chain over the user's message history."""
    result = await get_rag_response(body.messages)
    sources = [SourceDoc(**s) for s in result["sources"]]
    return ChatResponse(reply=result["reply"], sources=sources)
