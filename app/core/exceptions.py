class AppError(Exception):
    def __init__(
        self,
        message: str,
        status_code: int,
        errors: list[dict] | None = None,
    ) -> None:
        self.message = message
        self.status_code = status_code
        self.errors = errors or []

        super().__init__(message)


class AuthenticationError(AppError):
    def __init__(
        self,
        message: str = "Kimlik doğrulama başarısız.",
    ) -> None:
        super().__init__(
            message=message,
            status_code=401,
        )


class ForbiddenError(AppError):
    def __init__(
        self,
        message: str = "Bu işlem için yetkiniz bulunmuyor.",
    ) -> None:
        super().__init__(
            message=message,
            status_code=403,
        )


class NotFoundError(AppError):
    def __init__(
        self,
        message: str = "Kayıt bulunamadı.",
    ) -> None:
        super().__init__(
            message=message,
            status_code=404,
        )


class ConflictError(AppError):
    def __init__(
        self,
        message: str,
        errors: list[dict] | None = None,
    ) -> None:
        super().__init__(
            message=message,
            status_code=409,
            errors=errors,
        )


class BusinessRuleError(AppError):
    def __init__(
        self,
        message: str,
        errors: list[dict] | None = None,
    ) -> None:
        super().__init__(
            message=message,
            status_code=422,
            errors=errors,
        )