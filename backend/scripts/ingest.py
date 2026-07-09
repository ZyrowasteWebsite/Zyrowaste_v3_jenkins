"""
Ingest PDFs into ChromaDB for the Level 2 RAG backend.

Run from the `backend` directory:
    python -m scripts.ingest
"""
from __future__ import annotations
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter


from config import get_settings
from rag.embeddings import get_embeddings
from rag.vectorstore import CHROMA_COLLECTION_NAME

import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))





PROJECT_ROOT = BACKEND_ROOT.parent
DEFAULT_RESOURCES_DIR = PROJECT_ROOT / "_0_Resources"
PROJECT_REPORT_PDF = PROJECT_ROOT / "Project_Report___Biodegradable_Packaging_Material.pdf"


def _collect_pdf_paths(resources_dir: Path, extra_pdf: Path) -> list[Path]:
    paths: list[Path] = []
    if resources_dir.is_dir():
        paths.extend(sorted(resources_dir.glob("*.pdf")))
    if extra_pdf.is_file():
        paths.append(extra_pdf)
    seen: set[Path] = set()
    unique: list[Path] = []
    for p in paths:
        rp = p.resolve()
        if rp not in seen:
            seen.add(rp)
            unique.append(p)
    return unique


def ingest(resources_dir: Path | None = None, extra_pdf: Path | None = None) -> None:
    resources_dir = resources_dir or DEFAULT_RESOURCES_DIR
    extra_pdf = extra_pdf or PROJECT_REPORT_PDF

    pdf_paths = _collect_pdf_paths(resources_dir, extra_pdf)
    if not pdf_paths:
        print(f"No PDFs found under {resources_dir} and {extra_pdf}. Nothing to ingest.")
        return

    print(f"Loading {len(pdf_paths)} PDF file(s)...")
    all_docs: list = []
    for pdf in pdf_paths:
        print(f"  - {pdf}")
        loader = PyPDFLoader(str(pdf))
        all_docs.extend(loader.load())

    print(f"Loaded {len(all_docs)} document page(s).")

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(all_docs)
    print(f"Split into {len(chunks)} chunk(s).")

    settings = get_settings()
    embeddings = get_embeddings()
    Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=settings.chroma_persist_dir,
        collection_name=CHROMA_COLLECTION_NAME,
    )
    print(
        f"Ingest complete. Chroma collection '{CHROMA_COLLECTION_NAME}' "
        f"updated at {settings.chroma_persist_dir!r}."
    )


if __name__ == "__main__":
    ingest()
