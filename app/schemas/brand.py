from typing import Optional, Union, Any
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BrandCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    logo_path: Optional[str] = Field(default=None, max_length=255)
    is_active: bool = True
    category_id: int = Field(gt=0)


class BrandUpdate(BaseModel):
    name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=150,
    )
    logo_path: Optional[str] = Field(default=None, max_length=255)
    is_active: Optional[bool] = None
    category_id: Optional[int] = Field(default=None, gt=0)


class BrandResponse(BaseModel):
    id: int
    name: str
    slug: Optional[str] = None
    website: Optional[str] = None
    logo_path: Optional[str]
    is_active: bool
    category_id: Optional[int] = None
    product_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)