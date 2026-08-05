from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    slug: str | None = Field(default=None, max_length=170)
    parent_id: int | None = Field(default=None, gt=0)
    image_path: str | None = Field(default=None, max_length=255)
    sort_order: int = Field(default=0, ge=0)
    seo_title: str | None = Field(default=None, max_length=200)
    seo_description: str | None = Field(
        default=None,
        max_length=300,
    )
    is_active: bool = True


class CategoryUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )
    slug: str | None = Field(default=None, max_length=170)
    parent_id: int | None = Field(default=None, gt=0)
    image_path: str | None = Field(default=None, max_length=255)
    sort_order: int | None = Field(default=None, ge=0)
    seo_title: str | None = Field(default=None, max_length=200)
    seo_description: str | None = Field(
        default=None,
        max_length=300,
    )
    is_active: bool | None = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    parent_id: int | None
    image_path: str | None
    sort_order: int
    seo_title: str | None
    seo_description: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)