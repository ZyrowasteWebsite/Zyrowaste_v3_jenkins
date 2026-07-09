"""SQLAlchemy engine, session factory, and FastAPI dependency."""

from __future__ import annotations

import os
from collections.abc import AsyncGenerator, Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from db.models import Base

_DEFAULT_SQLITE = "sqlite:///./swaroop.db"
DATABASE_URL = os.getenv("DATABASE_URL", _DEFAULT_SQLITE)

connect_args: dict[str, object] = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    """Create tables (dev convenience; prefer Alembic in production)."""
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a scoped database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_db_async() -> AsyncGenerator[Session, None]:
    """Async-compatible wrapper that yields a sync session (same thread)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
