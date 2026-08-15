from typing import Optional, Union, Any
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.enums import ProductStatus

class ProductVariantCreate(BaseModel):
    sku: str = Field(min_length=1, max_length=60)
    color: Optional[str] = Field(default=None, max_length=50)
    size: Optional[str] = Field(default=None, max_length=30)
    price: Optional[float] = Field(default=None, gt=0)
    discount_price: Optional[float] = Field(default=None, gt=0)
    stock: int = Field(default=0, ge=0)
    min_stock_level: Optional[int] = Field(default=0, ge=0)
    image_path: Optional[str] = Field(default=None, max_length=255)

class ProductVariantUpdate(BaseModel):
    id: Optional[int] = None
    sku: Optional[str] = Field(default=None, min_length=1, max_length=60)
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

    model_config = ConfigDict(from_attributes=True)


class ProductCreate(BaseModel):
    category_id: int = Field(gt=0)
    brand_id: Optional[int] = Field(default=None, gt=0)
    sku: str = Field(min_length=2, max_length=60)
    barcode: Optional[str] = Field(default=None, max_length=60)
    name: str = Field(min_length=2, max_length=200)
    slug: Optional[str] = Field(default=None, max_length=220)
    short_description: str = Field(
        min_length=2,
        max_length=500,
    )
    long_description: str = Field(min_length=2)
    seo_title: Optional[str] = Field(default=None, max_length=200)
    seo_description: Optional[str] = Field(
        default=None,
        max_length=300,
    )
    price: float = Field(gt=0)
    discount_price: Optional[float] = Field(default=None, gt=0)
    vat_rate: float = Field(default=20, ge=0, le=100)
    status: ProductStatus = ProductStatus.DRAFT
    has_variants: bool = False
    stock: Optional[int] = Field(default=None, ge=0)
    min_stock_level: Optional[int] = Field(default=0, ge=0)
    is_new: bool = False
    is_bestseller: bool = False
    is_featured: bool = False
    is_campaign: bool = False
    variants: list[ProductVariantCreate] = []

    @model_validator(mode="after")
    def validate_product_rules(self) -> "ProductCreate":
        if (
            self.discount_price is not None
            and self.discount_price >= self.price
        ):
            raise ValueError(
                "İndirimli fiyat normal fiyattan düşük olmalıdır."
            )

        # Auto-fix: varyantlı üründe stock otomatik None yap
        if self.has_variants:
            self.stock = None

        # Varyantsız üründe stok zorunlu
        if not self.has_variants and self.stock is None:
            self.stock = 0

        return self



class ProductUpdate(BaseModel):
    category_id: Optional[int] = Field(default=None, gt=0)
    brand_id: Optional[int] = Field(default=None, gt=0)
    sku: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=60,
    )
    barcode: Optional[str] = Field(default=None, max_length=60)
    name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=200,
    )
    slug: Optional[str] = Field(default=None, max_length=220)
    short_description: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=500,
    )
    long_description: Optional[str] = Field(
        default=None,
        min_length=2,
    )
    seo_title: Optional[str] = Field(default=None, max_length=200)
    seo_description: Optional[str] = Field(
        default=None,
        max_length=300,
    )
    price: Optional[float] = Field(default=None, gt=0)
    discount_price: Optional[float] = Field(default=None, gt=0)
    vat_rate: Optional[float] = Field(default=None, ge=0, le=100)
    status: Optional[ProductStatus] = None
    has_variants: Optional[bool] = None
    stock: Optional[int] = Field(default=None, ge=0)
    min_stock_level: Optional[int] = Field(default=None, ge=0)
    is_new: Optional[bool] = None
    is_bestseller: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_campaign: Optional[bool] = None
    variants: Optional[list[ProductVariantUpdate]] = None


class ProductResponse(BaseModel):
    id: int
    category_id: int
    brand_id: Optional[int]
    sku: str
    barcode: Optional[str]
    name: str
    slug: str
    short_description: str
    long_description: str
    seo_title: Optional[str]
    seo_description: Optional[str]
    price: float
    discount_price: Optional[float]
    vat_rate: float
    status: ProductStatus
    has_variants: bool
    stock: Optional[int]
    min_stock_level: Optional[int]
    is_new: bool
    is_bestseller: bool
    is_featured: bool
    is_campaign: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ProductDetailResponse(ProductResponse):
    variants: list[ProductVariantResponse] = []

class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int