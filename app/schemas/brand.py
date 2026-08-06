from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BrandCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    logo_path: str | None = Field(default=None, max_length=255)
    is_active: bool = True


class BrandUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )
    logo_path: str | None = Field(default=None, max_length=255)
    is_active: bool | None = None


class BrandResponse(BaseModel):
    id: int
    name: str
    logo_path: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)