import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    app_name: str = os.getenv(
        "APP_NAME",
        "Modern E-Ticaret API",
    )
    app_version: str = os.getenv(
        "APP_VERSION",
        "1.0.0",
    )
    app_env: str = os.getenv(
        "APP_ENV",
        "development",
    )
    maintenance_mode: bool = os.getenv(
        "MAINTENANCE_MODE",
        "false",
    ).lower() in {"1", "true", "yes"}
    secret_key: str = os.getenv(
        "SECRET_KEY",
        "change-me-in-production",
    )
    jwt_algorithm: str = os.getenv(
        "JWT_ALGORITHM",
        "HS256",
    )
    access_token_expire_minutes: int = int(
        os.getenv(
            "ACCESS_TOKEN_EXPIRE_MINUTES",
            "60",
        )
    )

    password_reset_expire_minutes: int = int(
        os.getenv(
            "PASSWORD_RESET_EXPIRE_MINUTES",
            "30",
        )
    )
    password_reset_url: str = os.getenv(
        "PASSWORD_RESET_URL",
        "http://localhost:5173/reset-password",
    )

    login_max_failed_attempts: int = int(
        os.getenv(
            "LOGIN_MAX_FAILED_ATTEMPTS",
            "5",
        )
    )
    login_lock_minutes: int = int(
        os.getenv(
            "LOGIN_LOCK_MINUTES",
            "15",
        )
    )

    email_enabled: bool = os.getenv(
        "EMAIL_ENABLED",
        "false",
    ).lower() in {"1", "true", "yes"}

    smtp_host: str = os.getenv(
        "SMTP_HOST",
        "localhost",
    )
    smtp_port: int = int(
        os.getenv(
            "SMTP_PORT",
            "587",
        )
    )
    smtp_username: str | None = os.getenv(
        "SMTP_USERNAME",
    )
    smtp_password: str | None = os.getenv(
        "SMTP_PASSWORD",
    )
    smtp_from_email: str = os.getenv(
        "SMTP_FROM_EMAIL",
        "noreply@example.com",
    )
    smtp_from_name: str = os.getenv(
        "SMTP_FROM_NAME",
        "Modern E-Ticaret",
    )
    smtp_use_tls: bool = os.getenv(
        "SMTP_USE_TLS",
        "true",
    ).lower() in {"1", "true", "yes"}

settings = Settings()