from typing import Optional, Union, Any
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, model_validator

AdminRoleName = Literal[
    "admin",
    "personnel",
    "customer",
]


class AdminUserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=20)
    password: str = Field(min_length=8, max_length=128)
    password_confirm: str = Field(min_length=8, max_length=128)
    role: AdminRoleName
    is_active: bool = True

    @model_validator(mode="after")
    def validate_passwords(self) -> "AdminUserCreate":
        if self.password != self.password_confirm:
            raise ValueError("Parolalar eşleşmiyor.")

        return self


class AdminUserUpdate(BaseModel):
    name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=150,
    )
    phone: Optional[str] = Field(default=None, max_length=20)
    role: Optional[AdminRoleName] = None
    is_active: Optional[bool] = None


class AdminUserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str]
    role: str
    is_active: bool
    last_login_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class AdminUserListResponse(BaseModel):
    items: list[AdminUserResponse]
    total: int
    page: int
    page_size: int
    total_pages: int