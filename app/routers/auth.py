from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.database import get_session
from app.models.user import User
from app.schemas.auth import (
    PasswordChange,
    TokenResponse,
    UserLogin,
    UserProfileUpdate,
    UserRegister,
    UserResponse,
)
from app.schemas.common import ApiResponse
from app.services.auth_service import (
    change_user_password,
    login_user,
    register_user,
    update_user_profile,
)

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)

def create_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role.name,
        is_active=user.is_active,
        newsletter_allowed=user.newsletter_allowed,
        created_at=user.created_at,
    )


@router.post(
    "/register",
    response_model=ApiResponse[UserResponse],
    status_code=status.HTTP_201_CREATED,
)
def register(
    registration: UserRegister,
    session: Annotated[Session, Depends(get_session)],
) -> ApiResponse[UserResponse]:
    user = register_user(session, registration)

    return ApiResponse(
        success=True,
        data=create_user_response(user),
        message="Kullanıcı başarıyla oluşturuldu.",
    )


@router.post(
    "/login",
    response_model=ApiResponse[TokenResponse],
)
def login(
    login_data: UserLogin,
    session: Annotated[Session, Depends(get_session)],
) -> ApiResponse[TokenResponse]:
    user, access_token = login_user(session, login_data)

    token_response = TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,
    )

    return ApiResponse(
        success=True,
        data=token_response,
        message=f"Hoş geldiniz, {user.name}.",
    )


@router.get(
    "/me",
    response_model=ApiResponse[UserResponse],
)
def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
) -> ApiResponse[UserResponse]:
    return ApiResponse(
        success=True,
        data=create_user_response(current_user),
        message="Oturum sahibi getirildi.",
    )

@router.patch(
    "/me",
    response_model=ApiResponse[UserResponse],
)
def update_me(
    payload: UserProfileUpdate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ApiResponse[UserResponse]:
    user = update_user_profile(
        session,
        user=current_user,
        payload=payload,
    )

    return ApiResponse(
        success=True,
        data=create_user_response(user),
        message="Profil bilgileri güncellendi.",
    )


@router.patch(
    "/me/password",
    response_model=ApiResponse[None],
)
def change_password(
    payload: PasswordChange,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ApiResponse[None]:
    change_user_password(
        session,
        user=current_user,
        payload=payload,
    )

    return ApiResponse(
        success=True,
        data=None,
        message="Şifre başarıyla değiştirildi.",
    )