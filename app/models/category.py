"""
Category model (SRS §17.5).

Self-referencing tree structure via `parent_id`. Supports unlimited
nesting depth, though the SRS recommends 2–3 levels max for UX.
"""

from typing import Optional, List

from sqlmodel import Field, Relationship, SQLModel

from app.models.base import TimestampMixin


class Category(TimestampMixin, table=True):
    """Product category with hierarchical tree structure."""

    __tablename__ = "categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    parent_id: Optional[int] = Field(default=None, foreign_key="categories.id", index=True)
    name: str = Field(max_length=150)
    slug: str = Field(max_length=170, unique=True, index=True)
    image_path: Optional[str] = Field(default=None, max_length=255)
    sort_order: int = Field(default=0)
    seo_title: Optional[str] = Field(default=None, max_length=200)
    seo_description: Optional[str] = Field(default=None, max_length=300)
    is_active: bool = Field(default=True)

    # Relationships — self-referencing tree
    parent: Optional["Category"] = Relationship(
        back_populates="children",
        sa_relationship_kwargs={"remote_side": "Category.id"},
    )
    children: List["Category"] = Relationship(back_populates="parent")
    products: List["Product"] = Relationship(back_populates="category")  # type: ignore[name-defined]  # noqa: F821
