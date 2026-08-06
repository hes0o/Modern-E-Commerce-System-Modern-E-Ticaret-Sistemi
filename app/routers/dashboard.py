from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.dependencies import require_permission
from app.database import get_session
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.dashboard import DashboardSummary
from app.services.dashboard_service import (
    get_dashboard_summary,
)

router = APIRouter(
    prefix="/api/admin/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "",
    response_model=ApiResponse[DashboardSummary],
)
def dashboard_summary(
    session: Annotated[Session, Depends(get_session)],
    _user: Annotated[
    User,
    Depends(require_permission("dashboard.read")),
],
) -> ApiResponse[DashboardSummary]:
    dashboard = get_dashboard_summary(session)

    return ApiResponse(
        success=True,
        data=dashboard,
        message="Kontrol paneli verileri getirildi.",
    )