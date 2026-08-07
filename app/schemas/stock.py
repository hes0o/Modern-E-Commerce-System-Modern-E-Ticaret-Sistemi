from typing import Optional, Union, Any
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

StockOperation = Literal[
    "in",
    "out",
    "adjustment",
]


class StockUpdateRequest(BaseModel):
    operation: StockOperation
    variant_id: Optional[int] = Field(default=None, gt=0)
    quantity: Optional[int] = Field(default=None, gt=0)
    new_stock_count: Optional[int] = Field(default=None, ge=0)
    note: Optional[str] = Field(default=None, max_length=1000)


class StockMovementResponse(BaseModel):
    id: int
    product_id: int
    variant_id: Optional[int]
    movement_type: str
    quantity: int
    stock_before: int
    stock_after: int
    related_order_id: Optional[int]
    created_by_user_id: Optional[int]
    note: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StockMovementListResponse(BaseModel):
    items: list[StockMovementResponse]
    total: int
    page: int
    page_size: int
    total_pages: int