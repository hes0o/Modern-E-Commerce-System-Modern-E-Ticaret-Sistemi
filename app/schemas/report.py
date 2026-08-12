from datetime import date
from typing import Optional

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


class PeriodSalesPoint(BaseModel):
    """Dashboard grafik için tek bir veri noktası."""
    name: str       # Eksen etiketi (ör. "Oca", "Pzt", "08:00")
    sales: float    # Toplam satış tutarı
    orders: int     # Sipariş sayısı


class PeriodSalesResponse(BaseModel):
    period: str
    points: list[PeriodSalesPoint]