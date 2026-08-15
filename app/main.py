from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.exceptions import AppError
from app.core.handlers import (
    app_error_handler,
    unexpected_error_handler,
    validation_error_handler,
)
from app.core.rate_limit import RateLimitMiddleware
from app.core.security_headers import SecurityHeadersMiddleware
from app.routers.addresses import router as addresses_router
from app.routers.admin_users import router as admin_users_router
from app.routers.auth import router as auth_router
from app.routers.brands import router as brands_router
from app.routers.cart import router as cart_router
from app.routers.categories import router as categories_router
from app.routers.dashboard import router as dashboard_router
from app.routers.favorites import router as favorites_router
from app.routers.notifications import router as notifications_router
from app.routers.orders import router as orders_router
from app.routers.product_images import router as product_images_router
from app.routers.product_variants import router as product_variants_router
from app.routers.products import router as products_router
from app.routers.rbac import router as rbac_router
from app.routers.reports import router as reports_router
from app.routers.settings import router as settings_router
from app.routers.stock import router as stock_router
from app.routers.uploads import router as uploads_router

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Modern E-Ticaret Sistemi REST API",
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    RateLimitMiddleware,
    request_limit=120,
    window_seconds=60,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(
    AppError,
    app_error_handler,
)
app.add_exception_handler(
    RequestValidationError,
    validation_error_handler,
)
app.add_exception_handler(
    Exception,
    unexpected_error_handler,
)

app.include_router(auth_router)
app.include_router(categories_router)
app.include_router(products_router)
app.include_router(cart_router)
app.include_router(addresses_router)
app.include_router(favorites_router)
app.include_router(orders_router)
app.include_router(uploads_router)
app.include_router(brands_router)
app.include_router(product_variants_router)
app.include_router(product_images_router)
app.include_router(admin_users_router)
app.include_router(stock_router)
app.include_router(notifications_router)
app.include_router(dashboard_router)
app.include_router(settings_router)
app.include_router(rbac_router)
app.include_router(reports_router)


app.mount(
    "/uploads",
    StaticFiles(directory="uploads", check_dir=False),
    name="uploads",
)

@app.get("/api/health", tags=["System"])
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "message": "Backend çalışıyor",
    }