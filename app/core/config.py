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


settings = Settings()