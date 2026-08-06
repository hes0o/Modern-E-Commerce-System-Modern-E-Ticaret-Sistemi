from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response
from sqlmodel import Session

from app.core.dependencies import require_admin
from app.database import get_session
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.report import SalesReportResponse
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
    _admin: Annotated[User, Depends(require_admin)],
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
    _admin: Annotated[User, Depends(require_admin)],
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