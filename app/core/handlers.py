from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.exceptions import AppError


async def app_error_handler(
    request: Request,
    exception: AppError,
) -> JSONResponse:
    return JSONResponse(
        status_code=exception.status_code,
        content={
            "success": False,
            "data": None,
            "message": exception.message,
            "errors": exception.errors,
        },
    )


async def validation_error_handler(
    request: Request,
    exception: RequestValidationError,
) -> JSONResponse:
    errors = []

    for error in exception.errors():
        location = error.get("loc", [])
        field = str(location[-1]) if location else None

        errors.append(
            {
                "field": field,
                "message": error.get(
                    "msg",
                    "Geçersiz alan.",
                ),
            }
        )

    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "data": None,
            "message": "Gönderilen bilgiler geçersiz.",
            "errors": errors,
        },
    )


async def unexpected_error_handler(
    request: Request,
    exception: Exception,
) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "data": None,
            "message": "Beklenmeyen bir sunucu hatası oluştu.",
            "errors": [],
        },
    )