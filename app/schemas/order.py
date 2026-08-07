from typing import Optional, Union, Any
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

from app.models.enums import OrderStatus, PaymentMethod


class CheckoutAddress(BaseModel):
    title: Optional[str] = Field(default=None, max_length=100)
    recipient_name: str = Field(min_length=2, max_length=150)
    phone: str = Field(min_length=10, max_length=20)
    city: str = Field(min_length=2, max_length=100)
    district: str = Field(min_length=2, max_length=100)
    full_address: str = Field(min_length=5)
    postal_code: Optional[str] = Field(default=None, max_length=10)


class OrderCreate(BaseModel):
    shipping_address_id: Optional[int] = Field(default=None, gt=0)
    billing_address_id: Optional[int] = Field(default=None, gt=0)

    guest_name: Optional[str] = Field(default=None, min_length=2, max_length=150)
    guest_email: Optional[EmailStr] = None
    guest_phone: Optional[str] = Field(default=None, min_length=10, max_length=20)
    shipping_address: Optional[CheckoutAddress] = None
    billing_address: Optional[CheckoutAddress] = None

    payment_method: PaymentMethod
    customer_note: Optional[str] = Field(default=None, max_length=1000)
    contract_version_accepted: str = Field(min_length=1, max_length=20)

    @model_validator(mode="after")
    def validate_address_selection(self) -> "OrderCreate":
        if self.shipping_address_id is None and self.shipping_address is None:
            raise ValueError(
                "Teslimat adresi veya teslimat adresi kimliği gereklidir."
            )

        return self


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    variant_id: Optional[int]
    product_name_snapshot: str
    unit_price: float
    quantity: int
    line_total: float

    model_config = ConfigDict(from_attributes=True)


class OrderStatusHistoryResponse(BaseModel):
    id: int
    old_status: Optional[str]
    new_status: str
    changed_by_user_id: Optional[int]
    note: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: Optional[int]
    guest_name: Optional[str]
    guest_email: Optional[str]
    guest_phone: Optional[str]
    shipping_address_snapshot: dict
    billing_address_snapshot: Optional[dict]
    payment_method: PaymentMethod
    status: OrderStatus
    subtotal: float
    discount_total: Optional[float]
    vat_total: float
    grand_total: float
    customer_note: Optional[str]
    admin_note: Optional[str]
    shipping_tracking_number: Optional[str]
    contract_version_accepted: str
    items: list[OrderItemResponse] = []
    status_history: list[OrderStatusHistoryResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    note: Optional[str] = Field(default=None, max_length=1000)


class OrderCancel(BaseModel):
    note: Optional[str] = Field(default=None, max_length=1000)

class OrderAdminUpdate(BaseModel):
    admin_note: Optional[str] = Field(
        default=None,
        max_length=2000,
    )
    shipping_tracking_number: Optional[str] = Field(
        default=None,
        max_length=60,
    )