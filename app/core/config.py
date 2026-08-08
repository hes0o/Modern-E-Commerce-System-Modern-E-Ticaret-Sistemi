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