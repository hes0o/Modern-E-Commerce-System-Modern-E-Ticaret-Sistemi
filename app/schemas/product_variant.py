from typing import Optional, Union, Any
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ProductVariantCreate(BaseModel):
    sku: str = Field(min_length=2, max_length=60)
    color: Optional[str] = Field(default=None, max_length=50)
    size: Optional[str] = Field(default=None, max_length=30)
    price: Optional[float] = Field(default=None, gt=0)
    discount_price: Optional[float] = Field(default=None, gt=0)
    stock: int = Field(default=0, ge=0)
    min_stock_level: Optional[int] = Field(default=0, ge=0)
    image_path: Optional[str] = Field(default=None, max_length=255)

    @model_validator(mode="after")
    def validate_prices(self) -> "ProductVariantCreate":
        if (
            self.discount_price is not None
            and self.price is None
        ):
            raise ValueError(
                "İndirimli varyant fiyatı için normal fiyat gereklidir."
            )

        if (
            self.discount_price is not None
            and self.price is not None
            and self.discount_price >= self.price
        ):
            raise ValueError(
                "İndirimli fiyat normal fiyattan düşük olmalıdır."
            )

        return self


class ProductVariantUpdate(BaseModel):
    sku: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=60,
    )
    color: Optional[str] = Field(default=None, max_length=50)
    size: Optional[str] = Field(default=None, max_length=30)
    price: Optional[float] = Field(default=None, gt=0)
    discount_price: Optional[float] = Field(default=None, gt=0)
    stock: Optional[int] = Field(default=None, ge=0)
    min_stock_level: Optional[int] = Field(default=None, ge=0)
    image_path: Optional[str] = Field(default=None, max_length=255)


class ProductVariantResponse(BaseModel):
    id: int
    product_id: int
    sku: str
    color: Optional[str]
    size: Optional[str]
    price: Optional[float]
    discount_price: Optional[float]
    stock: int
    min_stock_level: Optional[int]
    image_path: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)