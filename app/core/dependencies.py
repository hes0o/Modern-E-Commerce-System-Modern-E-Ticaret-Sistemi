from typing import Annotated

import jwt
from fastapi import Depends
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from sqlmodel import Session

from app.core.exceptions import (
    AuthenticationError,
    ForbiddenError,
)
from app.core.security import decode_access_token
from app.database import get_session
from app.models.user import User
from app.repositories.user_repository import get_user_by_id

bearer_scheme = HTTPBearer(
    auto_error=False,
)


def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
    session: Annotated[
        Session,
        Depends(get_session),
    ],
) -> User:
    if credentials is None:
        raise AuthenticationError(
            "Giriş yapmanız gerekiyor."
        )

    try:
        payload = decode_access_token(
            credentials.credentials
        )

        if payload.get("type") != "access":
            raise AuthenticationError(
                "Geçersiz token türü."
            )

        user_id = int(payload["sub"])

    except (
        jwt.InvalidTokenError,
        KeyError,
        TypeError,
        ValueError,
    ) as error:
        raise AuthenticationError(
            "Token geçersiz veya süresi dolmuş."
        ) from error

    user = get_user_by_id(
        session,
        user_id,
    )

    if user is None:
        raise AuthenticationError(
            "Token kullanıcısı bulunamadı."
        )

    if not user.is_active:
        raise ForbiddenError(
            "Kullanıcı hesabı pasif durumdadır."
        )

    return user


def require_admin(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
) -> User:
    if current_user.role.name != "admin":
        raise ForbiddenError(
            "Bu işlem yalnızca admin tarafından yapılabilir."
        )

    return current_user