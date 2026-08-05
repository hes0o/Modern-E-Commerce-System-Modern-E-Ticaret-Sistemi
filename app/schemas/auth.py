from datetime import datetime

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    model_validator,
)


class UserRegister(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=150,
    )
    email: EmailStr
    phone: str | None = Field(
        default=None,
        min_length=7,
        max_length=20,
        pattern=r"^[0-9+\s()-]+$",
    )
    password: str = Field(
        min_length=8,
        max_length=128,
    )
    password_confirm: str = Field(
        min_length=8,
        max_length=128,
    )
    kvkk_accepted: bool
    newsletter_allowed: bool = False

    @model_validator(mode="after")
    def validate_registration(self) -> "UserRegister":
        if self.password != self.password_confirm:
            raise ValueError(
                "Şifreler birbiriyle eşleşmiyor."
            )

        if not self.kvkk_accepted:
            raise ValueError(
                "KVKK metni kabul edilmelidir."
            )

        return self


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(
        min_length=8,
        max_length=128,
    )


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str | None
    role: str
    is_active: bool
    newsletter_allowed: bool
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int