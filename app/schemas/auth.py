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

class UserProfileUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )
    email: EmailStr | None = None
    phone: str | None = Field(
        default=None,
        min_length=7,
        max_length=20,
        pattern=r"^[0-9+\s()-]+$",
    )
    newsletter_allowed: bool | None = None


class PasswordChange(BaseModel):
    current_password: str = Field(
        min_length=8,
        max_length=128,
    )
    new_password: str = Field(
        min_length=8,
        max_length=128,
    )
    new_password_confirm: str = Field(
        min_length=8,
        max_length=128,
    )

    @model_validator(mode="after")
    def validate_password_change(self) -> "PasswordChange":
        if self.new_password != self.new_password_confirm:
            raise ValueError(
                "Yeni şifreler birbiriyle eşleşmiyor."
            )

        if self.current_password == self.new_password:
            raise ValueError(
                "Yeni şifre mevcut şifreden farklı olmalıdır."
            )

        return self