from datetime import datetime

from sqlalchemy import func
from sqlmodel import Session, col, select

from app.models.enums import OrderStatus
from app.models.order import Order


def get_sales_report_data(
    session: Session,
    *,
    start_at: datetime,
    end_at: datetime,
) -> tuple:
    conditions = (
        col(Order.status) != OrderStatus.CANCELLED,
        col(Order.created_at) >= start_at,
        col(Order.created_at) < end_at,
    )

    totals = session.exec(
        select(
            func.count(Order.id),
            func.coalesce(
                func.sum(Order.grand_total),
                0,
            ),
            func.coalesce(
                func.sum(Order.discount_total),
                0,
            ),
            func.coalesce(
                func.sum(Order.vat_total),
                0,
            ),
        ).where(*conditions)
    ).one()

    daily_rows = session.exec(
        select(
            func.date(Order.created_at).label(
                "order_date"
            ),
            func.count(Order.id).label(
                "order_count"
            ),
            func.coalesce(
                func.sum(Order.grand_total),
                0,
            ).label("sales_total"),
            func.coalesce(
                func.sum(Order.discount_total),
                0,
            ).label("discount_total"),
            func.coalesce(
                func.sum(Order.vat_total),
                0,
            ).label("vat_total"),
        )
        .where(*conditions)
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
    ).all()

    return totals, daily_rows


def get_period_sales_data(
    session: Session,
    *,
    start_at: datetime,
    end_at: datetime,
) -> list:
    """
    Belirtilen aralıktaki siparişleri günlük gruplar hâlinde döndürür.
    Her satır: (date, order_count, sales_total)
    """
    conditions = (
        col(Order.status) != OrderStatus.CANCELLED,
        col(Order.created_at) >= start_at,
        col(Order.created_at) < end_at,
    )

    rows = session.exec(
        select(
            func.date(Order.created_at).label("day"),
            func.count(Order.id).label("order_count"),
            func.coalesce(func.sum(Order.grand_total), 0).label("sales_total"),
        )
        .where(*conditions)
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
    ).all()

    return rows