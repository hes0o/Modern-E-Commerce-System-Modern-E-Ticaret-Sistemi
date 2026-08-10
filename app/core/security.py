import hashlib
from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from pwdlib import PasswordHash

from app.core.config import settings

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    return password_hash.verify(
        plain_password,
        hashed_password,
    )


def create_access_token(
    subject: str | int,
    additional_claims: dict[str, Any] | None = None,
) -> str:
    now = datetime.now(UTC)
    expires_at = now + timedelta(
        minutes=settings.access_token_expire_minutes
    )

    payload: dict[str, Any] = {
        "sub": str(subject),
        "iat": now,
        "exp": expires_at,
        "type": "access",
    }

    if additional_claims:
        payload.update(additional_claims)

    return jwt.encode(
        payload,
        settings.secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(
    token: str,
) -> dict[str, Any]:
    payload = jwt.decode(
        token,
        settings.secret_key,
        algorithms=[settings.jwt_algorithm],
    )

    if payload.get("type") != "access":
        raise jwt.InvalidTokenError(
            "Invalid access token type."
        )

    return payload

def get_password_hash_fingerprint(
    hashed_password: str,
) -> str:
    return hashlib.sha256(
        hashed_password.encode("utf-8")
    ).hexdigest()


def create_password_reset_token(
    subject: str | int,
    *,
    current_password_hash: str,
) -> str:
    now = datetime.now(UTC)
    expires_at = now + timedelta(
        minutes=settings.password_reset_expire_minutes
    )

    payload: dict[str, Any] = {
        "sub": str(subject),
        "iat": now,
        "exp": expires_at,
        "type": "password_reset",
        "password_version": (
            get_password_hash_fingerprint(
                current_password_hash
            )
        ),
    }

    return jwt.encode(
        payload,
        settings.secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decode_password_reset_token(
    token: str,
) -> dict[str, Any]:
    payload = jwt.decode(
        token,
        settings.secret_key,
        algorithms=[settings.jwt_algorithm],
    )

    if payload.get("type") != "password_reset":
        raise jwt.InvalidTokenError(
            "Invalid password reset token type."
        )

    return payload