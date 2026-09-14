from __future__ import annotations

from collections.abc import Generator
from contextlib import contextmanager
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import DBAPIError, OperationalError
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

_engine: Optional[Engine] = None
_SessionLocal: Optional[sessionmaker] = None


def get_engine() -> Engine:
    global _engine, _SessionLocal
    if _engine is None:
        settings = get_settings()
        url = settings.sqlalchemy_database_url
        if not url:
            raise RuntimeError(
                "DATABASE_URL is not set. Copy backend/.env.example to backend/.env "
                "and paste your Supabase Postgres connection string."
            )
        # Supabase's pooler (PgBouncer) cannot reuse psycopg3 prepared names
        # across checkouts. The reminder tick hits this as DuplicatePreparedStatement.
        _engine = create_engine(
            url,
            pool_pre_ping=True,
            pool_recycle=120,
            pool_size=5,
            max_overflow=5,
            connect_args={"prepare_threshold": None},
        )
        _SessionLocal = sessionmaker(bind=_engine, autoflush=False, autocommit=False)
    return _engine


def get_session_factory() -> sessionmaker:
    get_engine()
    assert _SessionLocal is not None
    return _SessionLocal


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a DB session."""
    try:
        session = get_session_factory()()
    except OperationalError as exc:
        reset_engine()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="database unreachable",
        ) from exc
    try:
        yield session
    except OperationalError as exc:
        try:
            session.invalidate()
        except DBAPIError:
            pass
        reset_engine()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="database unreachable",
        ) from exc
    finally:
        try:
            session.close()
        except DBAPIError:
            reset_engine()


def reset_engine() -> None:
    """Drop pooled connections after a broken Supabase/pooler socket."""
    global _engine, _SessionLocal
    if _engine is not None:
        _engine.dispose()
    _engine = None
    _SessionLocal = None


@contextmanager
def session_scope() -> Generator[Session, None, None]:
    session = get_session_factory()()
    try:
        yield session
        session.commit()
    except Exception:
        try:
            session.rollback()
        except DBAPIError:
            session.invalidate()
        raise
    finally:
        session.close()


def check_database() -> bool:
    """Return True if a simple SELECT 1 succeeds."""
    with get_engine().connect() as conn:
        conn.execute(text("SELECT 1"))
    return True
