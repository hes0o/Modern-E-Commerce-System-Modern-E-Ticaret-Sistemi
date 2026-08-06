import asyncio
from collections import defaultdict, deque
from time import monotonic

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app: ASGIApp,
        *,
        request_limit: int = 120,
        window_seconds: int = 60,
    ) -> None:
        super().__init__(app)
        self.request_limit = request_limit
        self.window_seconds = window_seconds
        self.requests: dict[str, deque[float]] = defaultdict(deque)
        self.lock = asyncio.Lock()

    async def dispatch(
        self,
        request: Request,
        call_next,
    ):
        client_ip = (
            request.client.host
            if request.client is not None
            else "unknown"
        )
        current_time = monotonic()
        window_start = current_time - self.window_seconds

        async with self.lock:
            request_times = self.requests[client_ip]

            while (
                request_times
                and request_times[0] <= window_start
            ):
                request_times.popleft()

            if len(request_times) >= self.request_limit:
                retry_after = max(
                    1,
                    int(
                        self.window_seconds
                        - (current_time - request_times[0])
                    ),
                )

                return JSONResponse(
                    status_code=429,
                    content={
                        "success": False,
                        "data": None,
                        "message": (
                            "Çok fazla istek gönderdiniz. "
                            "Lütfen daha sonra tekrar deneyin."
                        ),
                        "errors": [],
                    },
                    headers={
                        "Retry-After": str(retry_after),
                    },
                )

            request_times.append(current_time)
            remaining = self.request_limit - len(request_times)

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(
            self.request_limit
        )
        response.headers["X-RateLimit-Remaining"] = str(
            remaining
        )
        return response