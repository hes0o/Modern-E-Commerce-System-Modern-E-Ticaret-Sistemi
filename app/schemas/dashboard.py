from typing import Optional, Union, Any
from pydantic import BaseModel


class MonthlyRevenue(BaseModel):
    month: int
    revenue: float


class TopSellingProduct(BaseModel):
    product_id: int
    product_name: str
    quantity_sold: int
    revenue: float
    stock: Optional[int]


class DashboardSummary(BaseModel):
    daily_order_count: int
    monthly_sales: float
    total_sales: float
    total_customer_count: int
    low_stock_count: int
    monthly_revenue: list[MonthlyRevenue]
    top_selling_products: list[TopSellingProduct]