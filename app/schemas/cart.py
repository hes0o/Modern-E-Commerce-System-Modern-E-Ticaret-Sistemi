from typing import Optional, Union, Any
from datetime import datetime

from pydantic import BaseModel, Field


class CartItemAdd(BaseModel):
    product_id: int = Field(gt=0)
    variant_id: Optional[int] = Field(default=None, gt=0)
    quantity: int = Field(default=1, ge=1, le=100)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1, le=100)


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    variant_id: Optional[int]
    product_name: str
    product_slug: str
    sku: str
    quantity: int
    stock: int
    original_unit_price: float
    unit_price: float
    discount_amount: float
    line_total: float


class CartResponse(BaseModel):
    id: int
    session_token: Optional[str]
    items: list[CartItemResponse]
    total_quantity: int
    subtotal: float
    discount_total: float
    vat_total: float
    grand_total: float
    updated_at: datetime