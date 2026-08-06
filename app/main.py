from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import AppError
from app.core.handlers import (
    app_error_handler,
    unexpected_error_handler,
    validation_error_handler,
)
from app.routers.addresses import router as addresses_router
from app.routers.auth import router as auth_router
from app.routers.cart import router as cart_router
from app.routers.categories import router as categories_router
from app.routers.products import router as products_router

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Modern E-Ticaret Sistemi REST API",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
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

@app.get("/api/health", tags=["System"])
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "message": "Backend çalışıyor",
    }