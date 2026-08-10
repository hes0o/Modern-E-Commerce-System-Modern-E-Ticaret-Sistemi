from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response
from sqlmodel import Session

from app.core.dependencies import require_permission
from app.database import get_session
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.report import SalesReportResponse
from app.services.report_export_service import (
    generate_sales_report_pdf,
    generate_sales_report_xlsx,
)
from app.services.report_service import (
    generate_sales_report,
    generate_sales_report_csv,
)

router = APIRouter(
    prefix="/api/admin/reports",
    tags=["Reports"],
)


@router.get(
    "/sales",
    response_model=ApiResponse[SalesReportResponse],
)
def sales_report(
    date_from: Annotated[date, Query()],
    date_to: Annotated[date, Query()],
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[User, Depends(require_permission("report.read"))],
) -> ApiResponse[SalesReportResponse]:
    report = generate_sales_report(
        session,
        date_from=date_from,
        date_to=date_to,
    )

    return ApiResponse(
        success=True,
        data=report,
        message="Satış raporu getirildi.",
    )


@router.get(
    "/sales/export.csv",
)
def export_sales_report(
    date_from: Annotated[date, Query()],
    date_to: Annotated[date, Query()],
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[User, Depends(require_permission("report.export"))],
) -> Response:
    report = generate_sales_report(
        session,
        date_from=date_from,
        date_to=date_to,
    )
    csv_content = generate_sales_report_csv(report)

    filename = (
        f"sales-report-{date_from.isoformat()}-"
        f"{date_to.isoformat()}.csv"
    )

    return Response(
        content=csv_content,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )

@router.get(
    "/sales/export.xlsx",
)
def download_sales_report_xlsx(
    date_from: Annotated[date, Query()],
    date_to: Annotated[date, Query()],
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[
        User,
        Depends(require_permission("report.export")),
    ],
) -> Response:
    report = generate_sales_report(
        session,
        date_from=date_from,
        date_to=date_to,
    )
    content = generate_sales_report_xlsx(report)
    filename = (
        f"sales-report-{date_from.isoformat()}-"
        f"{date_to.isoformat()}.xlsx"
    )

    return Response(
        content=content,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )


@router.get(
    "/sales/export.pdf",
)
def download_sales_report_pdf(
    date_from: Annotated[date, Query()],
    date_to: Annotated[date, Query()],
    session: Annotated[Session, Depends(get_session)],
    _admin: Annotated[
        User,
        Depends(require_permission("report.export")),
    ],
) -> Response:
    report = generate_sales_report(
        session,
        date_from=date_from,
        date_to=date_to,
    )
    content = generate_sales_report_pdf(report)
    filename = (
        f"sales-report-{date_from.isoformat()}-"
        f"{date_to.isoformat()}.pdf"
    )

    return Response(
        content=content,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )