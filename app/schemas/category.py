from typing import Optional, Union, Any
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    slug: Optional[str] = Field(default=None, max_length=170)
    parent_id: Optional[int] = Field(default=None, gt=0)
    image_path: Optional[str] = Field(default=None, max_length=255)
    sort_order: int = Field(default=0, ge=0)
    seo_title: Optional[str] = Field(default=None, max_length=200)
    seo_description: Optional[str] = Field(
        default=None,
        max_length=300,
    )
    is_active: bool = True


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=150,
    )
    slug: Optional[str] = Field(default=None, max_length=170)
    parent_id: Optional[int] = Field(default=None, gt=0)
    image_path: Optional[str] = Field(default=None, max_length=255)
    sort_order: Optional[int] = Field(default=None, ge=0)
    seo_title: Optional[str] = Field(default=None, max_length=200)
    seo_description: Optional[str] = Field(
        default=None,
        max_length=300,
    )
    is_active: Optional[bool] = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    parent_id: Optional[int]
    image_path: Optional[str]
    sort_order: int
    seo_title: Optional[str]
    seo_description: Optional[str]
    is_active: bool
    product_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)