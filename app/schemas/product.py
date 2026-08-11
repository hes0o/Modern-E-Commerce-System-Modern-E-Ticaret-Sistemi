from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.enums import ProductStatus


class ProductCreate(BaseModel):
    category_id: int = Field(gt=0)
    brand_id: int | None = Field(default=None, gt=0)
    supplier: str | None = Field(
        default=None,
        max_length=150,
    )
    sku: str = Field(min_length=2, max_length=60)
    barcode: str | None = Field(default=None, max_length=60)
    name: str = Field(min_length=2, max_length=200)
    slug: str | None = Field(default=None, max_length=220)
    short_description: str = Field(
        min_length=2,
        max_length=500,
    )
    long_description: str = Field(min_length=2)
    seo_title: str | None = Field(default=None, max_length=200)
    seo_description: str | None = Field(
        default=None,
        max_length=300,
    )
    price: float = Field(gt=0)
    discount_price: float | None = Field(default=None, gt=0)
    vat_rate: float = Field(default=20, ge=0, le=100)
    status: ProductStatus = ProductStatus.DRAFT
    has_variants: bool = False
    stock: int | None = Field(default=0, ge=0)
    min_stock_level: int | None = Field(default=0, ge=0)
    is_new: bool = False
    is_bestseller: bool = False
    is_featured: bool = False
    is_campaign: bool = False

    @model_validator(mode="after")
    def validate_product_rules(self) -> "ProductCreate":
        if (
            self.discount_price is not None
            and self.discount_price >= self.price
        ):
            raise ValueError(
                "İndirimli fiyat normal fiyattan düşük olmalıdır."
            )

        if self.has_variants and self.stock is not None:
            raise ValueError(
                "Varyantlı ürünlerde ana ürün stoku boş olmalıdır."
            )

        if not self.has_variants and self.stock is None:
            raise ValueError(
                "Varyantsız ürünlerde stok bilgisi zorunludur."
            )

        return self


class ProductUpdate(BaseModel):
    category_id: int | None = Field(default=None, gt=0)
    brand_id: int | None = Field(default=None, gt=0)
    supplier: str | None = Field(
        default=None,
        max_length=150,
    )
    sku: str | None = Field(
        default=None,
        min_length=2,
        max_length=60,
    )
    barcode: str | None = Field(default=None, max_length=60)
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=200,
    )
    slug: str | None = Field(default=None, max_length=220)
    short_description: str | None = Field(
        default=None,
        min_length=2,
        max_length=500,
    )
    long_description: str | None = Field(
        default=None,
        min_length=2,
    )
    seo_title: str | None = Field(default=None, max_length=200)
    seo_description: str | None = Field(
        default=None,
        max_length=300,
    )
    price: float | None = Field(default=None, gt=0)
    discount_price: float | None = Field(default=None, gt=0)
    vat_rate: float | None = Field(default=None, ge=0, le=100)
    status: ProductStatus | None = None
    has_variants: bool | None = None
    stock: int | None = Field(default=None, ge=0)
    min_stock_level: int | None = Field(default=None, ge=0)
    is_new: bool | None = None
    is_bestseller: bool | None = None
    is_featured: bool | None = None
    is_campaign: bool | None = None


class ProductResponse(BaseModel):
    id: int
    category_id: int
    brand_id: int | None
    supplier: str | None
    sku: str
    barcode: str | None
    name: str
    slug: str
    short_description: str
    long_description: str
    seo_title: str | None
    seo_description: str | None
    price: float
    discount_price: float | None
    vat_rate: float
    status: ProductStatus
    has_variants: bool
    stock: int | None
    min_stock_level: int | None
    is_new: bool
    is_bestseller: bool
    is_featured: bool
    is_campaign: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int