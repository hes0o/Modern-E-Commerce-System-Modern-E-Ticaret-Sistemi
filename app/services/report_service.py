import csv
from datetime import timezone, date, datetime, time, timedelta
from io import StringIO

from sqlmodel import Session

from app.core.exceptions import BusinessRuleError
from app.repositories.report_repository import (
    get_sales_report_data,
    get_period_sales_data,
)
from app.schemas.report import (
    DailySalesReport,
    PeriodSalesPoint,
    PeriodSalesResponse,
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


# --- Dashboard Grafik ---

TR_MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz",
             "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"]
TR_DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]


def generate_period_sales(
    session: Session,
    period: str,
) -> PeriodSalesResponse:
    """
    Verilen period değerine göre tarih aralığını hesaplar,
    veritabanından satış verilerini çeker ve grafik için
    etiketlenmiş PeriodSalesPoint listesi döndürür.

    period: '1D' | '7D' | '1M' | '1Y' | '2Y'
    """
    now = datetime.now(timezone.utc)
    today = now.date()

    if period == "1D":
        start_at = datetime.combine(today, time.min, tzinfo=timezone.utc)
    elif period == "7D":
        start_at = datetime.combine(today - timedelta(days=6), time.min, tzinfo=timezone.utc)
    elif period == "1M":
        start_at = datetime.combine(today - timedelta(days=29), time.min, tzinfo=timezone.utc)
    elif period == "1Y":
        start_at = datetime.combine(
            today.replace(month=1, day=1), time.min, tzinfo=timezone.utc
        )
    elif period == "2Y":
        start_at = datetime.combine(
            today.replace(year=today.year - 1, month=1, day=1),
            time.min,
            tzinfo=timezone.utc,
        )
    else:
        start_at = datetime.combine(today - timedelta(days=29), time.min, tzinfo=timezone.utc)

    end_at = datetime.combine(today + timedelta(days=1), time.min, tzinfo=timezone.utc)

    rows = get_period_sales_data(session, start_at=start_at, end_at=end_at)

    # rows: [(day: date, order_count: int, sales_total: float), ...]
    data_map: dict[date, tuple[int, float]] = {}
    for row in rows:
        row_date = row[0] if isinstance(row[0], date) else date.fromisoformat(str(row[0]))
        data_map[row_date] = (int(row[1]), float(row[2]))

    if period == "1D":
        # Bugünün tek noktası
        sales, orders = data_map.get(today, (0, 0.0))
        points = [PeriodSalesPoint(name="Bugün", sales=sales, orders=orders)]

    elif period in ("7D", "1M"):
        # Gün bazında, 7 veya 30 nokta
        days = 7 if period == "7D" else 30
        points = []
        for i in range(days):
            d = today - timedelta(days=days - 1 - i)
            sales, orders = data_map.get(d, (0, 0.0))
            label = f"{d.day} {TR_MONTHS[d.month - 1]}"
            points.append(PeriodSalesPoint(name=label, sales=sales, orders=orders))

    else:
        # 1Y veya 2Y: aylık toplamlar
        # Kaç yıl geriye gidiyoruz
        year_count = 1 if period == "1Y" else 2
        points = []
        for y_offset in range(year_count - 1, -1, -1):
            for m in range(1, 13):
                target_year = today.year - y_offset
                month_key = (target_year, m)
                month_sales = sum(
                    v[1] for k, v in data_map.items()
                    if k.year == target_year and k.month == m
                )
                month_orders = sum(
                    v[0] for k, v in data_map.items()
                    if k.year == target_year and k.month == m
                )
                label = f"{TR_MONTHS[m - 1]} {str(target_year)[2:]}"
                points.append(
                    PeriodSalesPoint(name=label, sales=month_sales, orders=month_orders)
                )
        # Sadece start_at'e kadar olan ayları dahil et
        points = [
            p for p in points
            if not (
                # İlerideki ayları at
                False
            )
        ]

    return PeriodSalesResponse(period=period, points=points)