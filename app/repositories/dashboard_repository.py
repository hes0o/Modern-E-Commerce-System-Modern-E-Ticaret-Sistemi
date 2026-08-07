from datetime import timezone, datetime

from sqlalchemy import extract, func
from sqlmodel import Session, col, select

from app.models.enums import OrderStatus
from app.models.order import Order, OrderItem
from app.models.product import Product, ProductVariant
from app.models.rbac import Role
from app.models.user import User


def get_dashboard_metrics(
    session: Session,
) -> dict:
    today = datetime.now(timezone.utc).date()

    active_order_condition = (
        col(Order.status) != OrderStatus.CANCELLED
    )

    daily_order_count = session.exec(
        select(func.count())
        .select_from(Order)
        .where(
            func.date(Order.created_at) == today,
        )
    ).one()

    monthly_sales = session.exec(
        select(
            func.coalesce(
                func.sum(Order.grand_total),
                0,
            )
        )
        .select_from(Order)
        .where(
            active_order_condition,
            extract("year", Order.created_at) == today.year,
            extract("month", Order.created_at) == today.month,
        )
    ).one()

    total_sales = session.exec(
        select(
            func.coalesce(
                func.sum(Order.grand_total),
                0,
            )
        )
        .select_from(Order)
        .where(active_order_condition)
    ).one()

    total_customer_count = session.exec(
        select(func.count())
        .select_from(User)
        .join(Role)
        .where(col(Role.name) == "customer")
    ).one()

    low_stock_products = session.exec(
        select(func.count())
        .select_from(Product)
        .where(
            col(Product.has_variants).is_(False),
            col(Product.stock).is_not(None),
            col(Product.min_stock_level).is_not(None),
            col(Product.stock)
            <= col(Product.min_stock_level),
        )
    ).one()

    low_stock_variants = session.exec(
        select(func.count())
        .select_from(ProductVariant)
        .where(
            col(ProductVariant.min_stock_level).is_not(None),
            col(ProductVariant.stock)
            <= col(ProductVariant.min_stock_level),
        )
    ).one()

    monthly_rows = session.exec(
        select(
            extract("month", Order.created_at).label(
                "month"
            ),
            func.sum(Order.grand_total).label(
                "revenue"
            ),
        )
        .where(
            active_order_condition,
            extract("year", Order.created_at) == today.year,
        )
        .group_by(
            extract("month", Order.created_at)
        )
        .order_by(
            extract("month", Order.created_at)
        )
    ).all()

    top_product_rows = session.exec(
        select(
            Product.id,
            Product.name,
            func.sum(OrderItem.quantity).label(
                "quantity_sold"
            ),
            func.sum(OrderItem.line_total).label(
                "revenue"
            ),
            Product.stock,
        )
        .join(
            OrderItem,
            OrderItem.product_id == Product.id,
        )
        .join(
            Order,
            Order.id == OrderItem.order_id,
        )
        .where(active_order_condition)
        .group_by(
            Product.id,
            Product.name,
            Product.stock,
        )
        .order_by(
            func.sum(OrderItem.quantity).desc()
        )
        .limit(5)
    ).all()

    return {
        "daily_order_count": daily_order_count,
        "monthly_sales": monthly_sales,
        "total_sales": total_sales,
        "total_customer_count": total_customer_count,
        "low_stock_count": (
            low_stock_products + low_stock_variants
        ),
        "monthly_rows": monthly_rows,
        "top_product_rows": top_product_rows,
    }