"""
Models package — re-exports all SQLModel table classes.

Importing this module ensures all models are registered with
SQLModel.metadata, which is required for Alembic autogenerate
to detect them.
"""

# RBAC
from app.models.rbac import Permission, Role, RolePermission  # noqa: F401

# User & Address
from app.models.user import User  # noqa: F401
from app.models.address import Address  # noqa: F401

# Catalog
from app.models.category import Category  # noqa: F401
from app.models.brand import Brand  # noqa: F401
from app.models.product import Product, ProductImage, ProductVariant  # noqa: F401

# Shopping
from app.models.cart import Cart, CartItem  # noqa: F401
from app.models.favorite import Favorite  # noqa: F401

# Orders
from app.models.order import Order, OrderItem, OrderStatusHistory  # noqa: F401

# Stock
from app.models.stock import StockMovement  # noqa: F401

# System
from app.models.notification import Notification  # noqa: F401
from app.models.setting import Setting  # noqa: F401
from app.models.audit import AuditLog  # noqa: F401

# Enums (re-export for convenience)
from app.models.enums import (  # noqa: F401
    OrderStatus,
    PaymentMethod,
    ProductStatus,
    StockMovementType,
)
