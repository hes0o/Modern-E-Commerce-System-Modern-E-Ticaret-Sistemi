from datetime import date
from io import BytesIO

from openpyxl import load_workbook

from app.schemas.report import (
    DailySalesReport,
    SalesReportResponse,
)
from app.services.report_export_service import (
    generate_sales_report_pdf,
    generate_sales_report_xlsx,
)


def create_sample_report() -> SalesReportResponse:
    return SalesReportResponse(
        date_from=date(2026, 8, 1),
        date_to=date(2026, 8, 10),
        total_orders=3,
        total_sales=1500,
        total_discount=100,
        total_vat=250,
        daily_sales=[
            DailySalesReport(
                date=date(2026, 8, 6),
                order_count=3,
                sales_total=1500,
                discount_total=100,
                vat_total=250,
            )
        ],
    )


def test_generate_sales_report_xlsx():
    content = generate_sales_report_xlsx(
        create_sample_report()
    )

    workbook = load_workbook(BytesIO(content))
    worksheet = workbook["Satış Raporu"]

    assert content.startswith(b"PK")
    assert worksheet["A1"].value == "Satış Raporu"
    assert worksheet["A5"].value == "2026-08-06"
    assert worksheet["B5"].value == 3
    assert worksheet["C5"].value == 1500


def test_generate_sales_report_pdf():
    content = generate_sales_report_pdf(
        create_sample_report()
    )

    assert content.startswith(b"%PDF-")
    assert len(content) > 1000