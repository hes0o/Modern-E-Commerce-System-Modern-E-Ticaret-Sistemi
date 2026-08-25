from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

from app.models.enums import OrderStatus, PaymentMethod


class CheckoutAddress(BaseModel):
    title: str | None = Field(default=None, max_length=100)
    recipient_name: str = Field(min_length=2, max_length=150)
    phone: str = Field(min_length=10, max_length=20)
    city: str = Field(min_length=2, max_length=100)
    district: str = Field(min_length=2, max_length=100)
    full_address: str = Field(min_length=5)
    postal_code: str | None = Field(default=None, max_length=10)


class OrderCreate(BaseModel):
    shipping_address_id: int | None = Field(default=None, gt=0)
    billing_address_id: int | None = Field(default=None, gt=0)

    guest_name: str | None = Field(default=None, min_length=2, max_length=150)
    guest_email: EmailStr | None = None
    guest_phone: str | None = Field(default=None, min_length=10, max_length=20)
    shipping_address: CheckoutAddress | None = None
    billing_address: CheckoutAddress | None = None

    payment_method: PaymentMethod
    customer_note: str | None = Field(default=None, max_length=1000)
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
    variant_id: int | None
    product_name_snapshot: str
    unit_price: float
    quantity: int
    line_total: float

    model_config = ConfigDict(from_attributes=True)


class OrderStatusHistoryResponse(BaseModel):
    id: int
    old_status: str | None
    new_status: str
    changed_by_user_id: int | None
    note: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: int | None
    guest_name: str | None
    guest_email: str | None
    guest_phone: str | None
    shipping_address_snapshot: dict
    billing_address_snapshot: dict | None
    payment_method: PaymentMethod
    status: OrderStatus
    subtotal: float
    discount_total: float | None
    vat_total: float
    grand_total: float
    customer_note: str | None
    shipping_tracking_number: str | None
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

class AdminOrderResponse(OrderResponse):
    admin_note: str | None


class AdminOrderListResponse(BaseModel):
    items: list[AdminOrderResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    note: str | None = Field(default=None, max_length=1000)


class OrderCancel(BaseModel):
    note: str | None = Field(default=None, max_length=1000)

class OrderAdminUpdate(BaseModel):
    admin_note: str | None = Field(
        default=None,
        max_length=2000,
    )
    shipping_tracking_number: str | None = Field(
        default=None,
        max_length=60,
    )