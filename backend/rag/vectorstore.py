"""ChromaDB vector store helpers."""

from config import get_settings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document

from rag.embeddings import get_embeddings

CHROMA_COLLECTION_NAME = "swaroop_docs"

_vectorstore: Chroma | None = None


def get_vectorstore() -> Chroma:
    """Return a Chroma instance backed by the configured persist directory."""
    global _vectorstore
    if _vectorstore is None:
        settings = get_settings()
        _vectorstore = Chroma(
            collection_name=CHROMA_COLLECTION_NAME,
            persist_directory=settings.chroma_persist_dir,
            embedding_function=get_embeddings(),
        )
    return _vectorstore


def similarity_search(query: str, k: int = 4) -> list[Document]:
    """Run similarity search against the persisted vector store."""
    store = get_vectorstore()
    return store.similarity_search(query, k=k)
