"""ONNX-based embeddings via FastEmbed — replaces HuggingFaceEmbeddings + PyTorch."""

from functools import lru_cache

from config import get_settings
from langchain_community.embeddings import FastEmbedEmbeddings


@lru_cache
def get_embeddings() -> FastEmbedEmbeddings:
    """Return a cached FastEmbedEmbeddings instance.

    FastEmbed downloads a compact ONNX model (~50 MB) on first call.
    Model name maps to the all-MiniLM-L6-v2 quantised ONNX checkpoint,
    producing 384-dim vectors identical in semantics to the sentence-transformers
    variant but without requiring PyTorch.
    """
    settings = get_settings()
    return FastEmbedEmbeddings(model_name=settings.embedding_model)
