"""
Database connection and session management.

Provides the SQLAlchemy engine, session factory, and a dependency-injectable
`get_session` generator for use in FastAPI or standalone scripts.
"""

import os
from typing import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlmodel import Session

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://ecommerce_user:ecommerce_pass@localhost:5432/ecommerce_db",
)

engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("SQL_ECHO", "").lower() == "true",
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)


def get_session() -> Generator[Session, None, None]:
    """Yield a database session, ensuring it is closed after use."""
    with Session(engine) as session:
        yield session
