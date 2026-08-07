import csv
from datetime import timezone, date, datetime, time, timedelta
from io import StringIO

from sqlmodel import Session

from app.core.exceptions import BusinessRuleError
from app.repositories.report_repository import (
    get_sales_report_data,
)
from app.schemas.report import (
    DailySalesReport,
    SalesReportResponse,
)


def validate_report_dates(
    date_from: date,
    date_to: date,
) -> None:
    if date_from > date_to:
        raise BusinessRuleError(
            "Başlangıç tarihi bitiş tarihinden sonra olamaz."
        )

    if (date_to - date_from).days > 366:
        raise BusinessRuleError(
            "Rapor aralığı en fazla 366 gün olabilir."
        )


def generate_sales_report(
    session: Session,
    *,
    date_from: date,
    date_to: date,
) -> SalesReportResponse:
    validate_report_dates(date_from, date_to)

    start_at = datetime.combine(
        date_from,
        time.min,
        tzinfo=timezone.utc,
    )
    end_at = datetime.combine(
        date_to + timedelta(days=1),
        time.min,
        tzinfo=timezone.utc,
    )

    totals, daily_rows = get_sales_report_data(
        session,
        start_at=start_at,
        end_at=end_at,
    )

    return SalesReportResponse(
        date_from=date_from,
        date_to=date_to,
        total_orders=int(totals[0]),
        total_sales=float(totals[1]),
        total_discount=float(totals[2]),
        total_vat=float(totals[3]),
        daily_sales=[
            DailySalesReport(
                date=row[0],
                order_count=int(row[1]),
                sales_total=float(row[2]),
                discount_total=float(row[3]),
                vat_total=float(row[4]),
            )
            for row in daily_rows
        ],
    )


def generate_sales_report_csv(
    report: SalesReportResponse,
) -> str:
    output = StringIO()
    writer = csv.writer(output)

    writer.writerow(
        [
            "Tarih",
            "Sipariş Sayısı",
            "Satış Toplamı",
            "İndirim Toplamı",
            "KDV Toplamı",
        ]
    )

    for row in report.daily_sales:
        writer.writerow(
            [
                row.date.isoformat(),
                row.order_count,
                f"{row.sales_total:.2f}",
                f"{row.discount_total:.2f}",
                f"{row.vat_total:.2f}",
            ]
        )

    writer.writerow([])
    writer.writerow(
        [
            "GENEL TOPLAM",
            report.total_orders,
            f"{report.total_sales:.2f}",
            f"{report.total_discount:.2f}",
            f"{report.total_vat:.2f}",
        ]
    )

    return "\ufeff" + output.getvalue()