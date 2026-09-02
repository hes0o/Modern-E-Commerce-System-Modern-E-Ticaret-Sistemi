"""
Product models (SRS §17.7, §17.8, §17.9).

Three related models:
- `Product`        — core product data, SEO, pricing, tags
- `ProductImage`   — cover + gallery images
- `ProductVariant` — color/size variants with own SKU, stock, and price
"""

from typing import Optional

import sqlalchemy as sa
from sqlalchemy import CheckConstraint, Column, Index, Numeric, Text
from sqlmodel import Field, Relationship

from app.models.base import TimestampMixin
from app.models.enums import ProductStatus


class Product(TimestampMixin, table=True):
    """
    Core product record (SRS §17.7).

    For products without variants (`has_variants=False`), stock and price
    live directly on this table. For variant products, stock is tracked
    per variant and price may be overridden at variant level.
    """

    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint(
            "discount_price IS NULL OR discount_price < price",
            name="ck_products_discount_lt_price",
        ),
        CheckConstraint(
            "stock IS NULL OR stock >= 0",
            name="ck_products_stock_non_negative",
        ),
        Index("ix_products_category_status", "category_id", "status"),
    )

    id: int | None = Field(default=None, primary_key=True)
    category_id: int = Field(foreign_key="categories.id", index=True)
    brand_id: int | None = Field(default=None, foreign_key="brands.id", index=True)
    supplier: str | None = Field(
        default=None,
        max_length=150,
        index=True,
    )
    sku: str = Field(max_length=60, unique=True, index=True)
    barcode: str | None = Field(default=None, max_length=60, unique=True)
    name: str = Field(max_length=200)
    slug: str = Field(max_length=220, unique=True, index=True)
    short_description: str = Field(max_length=500)
    long_description: str = Field(sa_column=Column(Text, nullable=False))
    seo_title: str | None = Field(default=None, max_length=200)
    seo_description: str | None = Field(default=None, max_length=300)

    # Pricing
    price: float = Field(sa_column=Column(Numeric(10, 2)))
    discount_price: float | None = Field(
        default=None, sa_column=Column(Numeric(10, 2))
    )
    vat_rate: float = Field(sa_column=Column(Numeric(5, 2)))

    # Status & stock
    status: ProductStatus = Field(
        default=ProductStatus.ACTIVE,
        sa_column=Column(
            sa.Enum(
                ProductStatus,
                values_callable=lambda x: [e.value for e in x],
            ),
            nullable=False,
            default=ProductStatus.ACTIVE.value,
        ),
    )
    has_variants: bool = Field(default=False)
    stock: int | None = Field(default=None)  # Only for non-variant products
    min_stock_level: int | None = Field(default=None)

    # Tags / badges
    is_new: bool = Field(default=False)
    is_bestseller: bool = Field(default=False)
    is_featured: bool = Field(default=False)
    is_campaign: bool = Field(default=False)

    # Relationships
    category: "Category" = Relationship(back_populates="products")  # type: ignore[name-defined]  # noqa: F821
    brand: Optional["Brand"] = Relationship(back_populates="products")  # type: ignore[name-defined]  # noqa: F821
    images: list["ProductImage"] = Relationship(back_populates="product")
    variants: list["ProductVariant"] = Relationship(back_populates="product")


class ProductImage(TimestampMixin, table=True):
    """Product gallery image (SRS §17.8)."""

    __tablename__ = "product_images"

    id: int | None = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="products.id", index=True)
    image_path: str = Field(max_length=255)
    is_cover: bool = Field(default=False)
    sort_order: int = Field(default=0)

    # Relationships
    product: Product = Relationship(back_populates="images")


class ProductVariant(TimestampMixin, table=True):
    """
    Product variant — color/size combination (SRS §17.9).

    Each variant has its own SKU and stock count. Price fields are optional;
    when null, the parent product's price is inherited.
    """

    __tablename__ = "product_variants"
    __table_args__ = (
        CheckConstraint(
            "stock >= 0",
            name="ck_variants_stock_non_negative",
        ),
        Index("ix_variants_product_id", "product_id"),
    )

    id: int | None = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="products.id")
    sku: str = Field(max_length=60, unique=True, index=True)
    color: str | None = Field(default=None, max_length=50)
    size: str | None = Field(default=None, max_length=30)
    price: float | None = Field(default=None, sa_column=Column(Numeric(10, 2)))
    discount_price: float | None = Field(
        default=None, sa_column=Column(Numeric(10, 2))
    )
    stock: int = Field(default=0)
    min_stock_level: int | None = Field(default=None)
    image_path: str | None = Field(default=None, max_length=255)

    # Relationships
    product: Product = Relationship(back_populates="variants")
