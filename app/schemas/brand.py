from typing import Optional, Union, Any
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BrandCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    logo_path: Optional[str] = Field(default=None, max_length=255)
    is_active: bool = True


class BrandUpdate(BaseModel):
    name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=150,
    )
    logo_path: Optional[str] = Field(default=None, max_length=255)
    is_active: Optional[bool] = None


class BrandResponse(BaseModel):
    id: int
    name: str
    logo_path: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)