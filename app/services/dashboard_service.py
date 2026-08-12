from sqlmodel import Session

from app.repositories.dashboard_repository import (
    get_dashboard_metrics,
)
from app.schemas.dashboard import (
    DashboardSummary,
    MonthlyRevenue,
    TopSellingProduct,
)


def get_dashboard_summary(
    session: Session,
) -> DashboardSummary:
    metrics = get_dashboard_metrics(session)

    monthly_values = {
        int(row[0]): float(row[1])
        for row in metrics["monthly_rows"]
    }

    monthly_revenue = [
        MonthlyRevenue(
            month=month,
            revenue=monthly_values.get(month, 0.0),
        )
        for month in range(1, 13)
    ]

    top_selling_products = [
        TopSellingProduct(
            product_id=row[0],
            product_name=row[1],
            quantity_sold=int(row[2]),
            revenue=float(row[3]),
            stock=row[4],
        )
        for row in metrics["top_product_rows"]
    ]

    return DashboardSummary(
        daily_order_count=metrics[
            "daily_order_count"
        ],
        monthly_sales=float(metrics["monthly_sales"]),
        total_sales=float(metrics["total_sales"]),
        total_customer_count=metrics[
            "total_customer_count"
        ],
        low_stock_count=metrics["low_stock_count"],
        out_of_stock_count=metrics["out_of_stock_count"],
        monthly_revenue=monthly_revenue,
        top_selling_products=top_selling_products,
    )