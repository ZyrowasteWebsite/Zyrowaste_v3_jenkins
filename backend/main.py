"""FastAPI entrypoint: health, chat, and auth."""

from contextlib import asynccontextmanager

from auth_router import router as auth_router
from config import get_settings
from db.session import init_db
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import ChatRequest, ChatResponse, HealthResponse, SourceDoc
from rag.chain import get_rag_response

APP_VERSION = "0.3.0-l3-light"


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
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
    """Run the lightweight chat chain over the user's message history."""
    result = await get_rag_response(body.messages)
    sources = [SourceDoc(**s) for s in result["sources"]]
    return ChatResponse(reply=result["reply"], sources=sources)
