from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from starlette.types import ASGIApp

from app.core.config import settings

EXEMPT_PATHS = {
    "/",
    "/health",
    "/api/health",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/api/auth/login",
    "/api/auth/me",
}

EXEMPT_PREFIXES = {
    "/api/admin/",
    "/uploads/",
}


class MaintenanceModeMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app: ASGIApp,
    ) -> None:
        super().__init__(app)

    async def dispatch(
        self,
        request: Request,
        call_next,
    ):
        path = request.url.path

        is_exempt = (
            request.method == "OPTIONS"
            or path in EXEMPT_PATHS
            or any(
                path.startswith(prefix)
                for prefix in EXEMPT_PREFIXES
            )
        )

        if settings.maintenance_mode and not is_exempt:
            return JSONResponse(
                status_code=503,
                content={
                    "success": False,
                    "data": None,
                    "message": (
                        "Sistem geçici olarak bakım modundadır. "
                        "Lütfen daha sonra tekrar deneyin."
                    ),
                    "errors": [],
                },
                headers={
                    "Retry-After": "300",
                },
            )

        return await call_next(request)