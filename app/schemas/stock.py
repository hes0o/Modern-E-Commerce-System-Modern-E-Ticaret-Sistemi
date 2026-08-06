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
    variant_id: int | None = Field(default=None, gt=0)
    quantity: int | None = Field(default=None, gt=0)
    new_stock_count: int | None = Field(default=None, ge=0)
    note: str | None = Field(default=None, max_length=1000)


class StockMovementResponse(BaseModel):
    id: int
    product_id: int
    variant_id: int | None
    movement_type: str
    quantity: int
    stock_before: int
    stock_after: int
    related_order_id: int | None
    created_by_user_id: int | None
    note: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StockMovementListResponse(BaseModel):
    items: list[StockMovementResponse]
    total: int
    page: int
    page_size: int
    total_pages: int