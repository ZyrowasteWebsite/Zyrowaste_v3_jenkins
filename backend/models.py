"""Pydantic API schemas."""

from pydantic import BaseModel, Field


class SourceDoc(BaseModel):
    content: str
    metadata: dict = Field(default_factory=dict)


class ChatRequest(BaseModel):
    messages: list[dict[str, str]]


class ChatResponse(BaseModel):
    reply: str
    sources: list[SourceDoc]


class HealthResponse(BaseModel):
    status: str
    version: str
