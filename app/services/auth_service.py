import hmac
from datetime import UTC, datetime, timedelta

import jwt
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from app.core.config import settings
from app.core.exceptions import (
    AuthenticationError,
    BusinessRuleError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
)
from app.core.security import (
    create_access_token,
    create_password_reset_token,
    decode_password_reset_token,
    get_password_hash_fingerprint,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.repositories.role_repository import get_role_by_name
from app.repositories.user_repository import (
    create_user,
    get_user_by_email,
)
from app.schemas.auth import (
    PasswordChange,
    PasswordResetConfirm,
    PasswordResetRequest,
    UserLogin,
    UserProfileUpdate,
    UserRegister,
)
from app.services.audit_service import log_action
from app.services.email_service import send_email
from app.services.notification_service import queue_notification


def register_user(
    session: Session,
    registration: UserRegister,
) -> User:
    normalized_email = str(registration.email).lower()

    existing_user = get_user_by_email(
        session,
        normalized_email,
    )

    if existing_user is not None:
        raise ConflictError(
            message="Bu e-posta adresi zaten kullanılıyor.",
            errors=[
                {
                    "field": "email",
                    "message": "E-posta adresi benzersiz olmalıdır.",
                }
            ],
        )

    customer_role = get_role_by_name(
        session,
        "customer",
    )

    if customer_role is None or customer_role.id is None:
        raise NotFoundError(
            "Customer rolü veritabanında bulunamadı."
        )

    user = User(
        name=registration.name.strip(),
        email=normalized_email,
        phone=registration.phone,
        password_hash=hash_password(
            registration.password
        ),
        role_id=customer_role.id,
        is_active=True,
        newsletter_allowed=registration.newsletter_allowed,
        kvkk_accepted_at=datetime.now(UTC),
    )

    try:
        created_user = create_user(
            session,
            user,
        )
        queue_notification(
            session,
            notification_type="new_member",
            title="Yeni Kullanıcı",
            message=(
                f"{created_user.name} sisteme kayıt oldu."
            ),
            related_entity_type="user",
            related_entity_id=created_user.id,
        )
        session.commit()
        session.refresh(created_user)

        return created_user

    except IntegrityError as error:
        session.rollback()

        raise ConflictError(
            message="Kullanıcı kaydı oluşturulamadı.",
        ) from error


def login_user(
    session: Session,
    login: UserLogin,
    *,
    ip_address: str | None = None,
) -> tuple[User, str]:
    normalized_email = str(login.email).lower()
    user = get_user_by_email(
        session,
        normalized_email,
    )

    if user is None:
        log_action(
            session,
            user_id=None,
            action="auth.login_failed",
            entity_type="authentication",
            entity_id=0,
            new_value={
                "reason": "unknown_user",
            },
            ip_address=ip_address,
        )
        session.commit()

        raise AuthenticationError(
            "E-posta veya şifre hatalı."
        )

    now = datetime.now(UTC)
    locked_until = user.locked_until

    if (
        locked_until is not None
        and locked_until.tzinfo is None
    ):
        locked_until = locked_until.replace(tzinfo=UTC)

    if locked_until is not None and locked_until > now:
        log_action(
            session,
            user_id=user.id,
            action="auth.login_blocked",
            entity_type="users",
            entity_id=user.id,
            new_value={
                "reason": "account_locked",
                "locked_until": locked_until.isoformat(),
            },
            ip_address=ip_address,
        )
        session.commit()

        raise ForbiddenError(
            "Çok fazla başarısız giriş yapıldı. "
            "Hesap geçici olarak kilitlendi."
        )

    if locked_until is not None:
        user.locked_until = None
        user.failed_login_attempts = 0

    if not verify_password(
        login.password,
        user.password_hash,
    ):
        user.failed_login_attempts += 1

        if (
            user.failed_login_attempts
            >= settings.login_max_failed_attempts
        ):
            user.locked_until = now + timedelta(
                minutes=settings.login_lock_minutes
            )

        log_action(
            session,
            user_id=user.id,
            action=(
                "auth.account_locked"
                if user.locked_until is not None
                else "auth.login_failed"
            ),
            entity_type="users",
            entity_id=user.id,
            new_value={
                "failed_login_attempts": (
                    user.failed_login_attempts
                ),
                "locked_until": (
                    user.locked_until.isoformat()
                    if user.locked_until is not None
                    else None
                ),
            },
            ip_address=ip_address,
        )

        session.add(user)
        session.commit()

        if user.locked_until is not None:
            raise ForbiddenError(
                "Çok fazla başarısız giriş yapıldı. "
                "Hesap geçici olarak kilitlendi."
            )

        raise AuthenticationError(
            "E-posta veya şifre hatalı."
        )

    if not user.is_active:
        log_action(
            session,
            user_id=user.id,
            action="auth.login_blocked",
            entity_type="users",
            entity_id=user.id,
            new_value={
                "reason": "inactive_account",
            },
            ip_address=ip_address,
        )
        session.commit()

        raise ForbiddenError(
            "Kullanıcı hesabı pasif durumdadır."
        )

    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = now
    session.add(user)
    session.commit()
    session.refresh(user)

    token = create_access_token(
        subject=user.id,
        additional_claims={
            "role": user.role.name,
        },
    )

    return user, token

def update_user_profile(
    session: Session,
    *,
    user: User,
    payload: UserProfileUpdate,
) -> User:
    update_data = payload.model_dump(exclude_unset=True)

    if "email" in update_data:
        normalized_email = str(
            update_data["email"]
        ).strip().lower()
        existing_user = get_user_by_email(
            session,
            normalized_email,
        )

        if (
            existing_user is not None
            and existing_user.id != user.id
        ):
            raise ConflictError(
                "Bu e-posta adresi zaten kullanılıyor."
            )

        update_data["email"] = normalized_email

    if "name" in update_data:
        update_data["name"] = update_data["name"].strip()

    for field, value in update_data.items():
        setattr(user, field, value)

    user.updated_at = datetime.now(UTC)

    try:
        session.add(user)
        session.commit()
        session.refresh(user)

    except IntegrityError as error:
        session.rollback()
        raise ConflictError(
            "Profil bilgileri güncellenemedi."
        ) from error

    return user


def change_user_password(
    session: Session,
    *,
    user: User,
    payload: PasswordChange,
) -> None:
    if not verify_password(
        payload.current_password,
        user.password_hash,
    ):
        raise AuthenticationError(
            "Mevcut şifre hatalı."
        )

    user.password_hash = hash_password(
        payload.new_password
    )
    user.updated_at = datetime.now(UTC)

    session.add(user)
    session.commit()

def request_password_reset(
    session: Session,
    payload: PasswordResetRequest,
    *,
    ip_address: str | None = None,
) -> None:
    normalized_email = str(payload.email).strip().lower()
    user = get_user_by_email(
        session,
        normalized_email,
    )

    if (
        user is None
        or not user.is_active
        or user.id is None
    ):
        return

    token = create_password_reset_token(
        user.id,
        current_password_hash=user.password_hash,
    )
    reset_url = (
        f"{settings.password_reset_url}?token={token}"
    )

    send_email(
        recipient=user.email,
        subject="Şifre Sıfırlama Talebi",
        body=(
            f"Merhaba {user.name},\n\n"
            "Şifrenizi sıfırlamak için aşağıdaki "
            "bağlantıyı kullanın:\n\n"
            f"{reset_url}\n\n"
            "Bu bağlantı "
            f"{settings.password_reset_expire_minutes} "
            "dakika geçerlidir.\n"
            "Bu talebi siz oluşturmadıysanız "
            "bu e-postayı yok sayabilirsiniz."
        ),
    )

    log_action(
        session,
        user_id=user.id,
        action="auth.password_reset_requested",
        entity_type="users",
        entity_id=user.id,
        new_value={
            "delivery_requested": True,
        },
        ip_address=ip_address,
    )
    session.commit()


def reset_user_password(
    session: Session,
    payload: PasswordResetConfirm,
    *,
    ip_address: str | None = None,
) -> None:
    try:
        token_payload = decode_password_reset_token(
            payload.token
        )
        user_id = int(token_payload["sub"])
    except (
        jwt.InvalidTokenError,
        KeyError,
        TypeError,
        ValueError,
    ) as error:
        raise AuthenticationError(
            "Şifre sıfırlama bağlantısı geçersiz "
            "veya süresi dolmuş."
        ) from error

    user = session.get(User, user_id)

    if (
        user is None
        or not user.is_active
        or user.id is None
    ):
        raise AuthenticationError(
            "Şifre sıfırlama bağlantısı geçersiz "
            "veya süresi dolmuş."
        )

    token_password_version = str(
        token_payload.get(
            "password_version",
            "",
        )
    )
    current_password_version = (
        get_password_hash_fingerprint(
            user.password_hash
        )
    )

    if not hmac.compare_digest(
        token_password_version,
        current_password_version,
    ):
        raise AuthenticationError(
            "Şifre sıfırlama bağlantısı geçersiz "
            "veya daha önce kullanılmış."
        )

    if verify_password(
        payload.new_password,
        user.password_hash,
    ):
        raise BusinessRuleError(
            "Yeni şifre mevcut şifreden farklı olmalıdır."
        )

    user.password_hash = hash_password(
        payload.new_password
    )
    user.failed_login_attempts = 0
    user.locked_until = None
    session.add(user)

    log_action(
        session,
        user_id=user.id,
        action="auth.password_reset_completed",
        entity_type="users",
        entity_id=user.id,
        new_value={
            "password_changed": True,
        },
        ip_address=ip_address,
    )

    session.commit()
    session.refresh(user)