from datetime import date

from pydantic import BaseModel


class DailySalesReport(BaseModel):
    date: date
    order_count: int
    sales_total: float
    discount_total: float
    vat_total: float


class SalesReportResponse(BaseModel):
    date_from: date
    date_to: date
    total_orders: int
    total_sales: float
    total_discount: float
    total_vat: float
    daily_sales: list[DailySalesReport]