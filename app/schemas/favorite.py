from typing import Optional, Union, Any
from datetime import datetime

from pydantic import BaseModel, Field


class FavoriteCreate(BaseModel):
    product_id: int = Field(gt=0)


class FavoriteResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_slug: str
    sku: str
    price: float
    discount_price: Optional[float]
    stock: Optional[int]
    created_at: datetime