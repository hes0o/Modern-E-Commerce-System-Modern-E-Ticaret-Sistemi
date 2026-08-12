from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.dependencies import require_permission
from app.database import get_session
from app.models.user import User
from app.schemas.category import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
)
from app.schemas.common import ApiResponse
from app.services.category_service import (
    create_new_category,
    delete_category_permanently,
    get_category,
    list_categories,
    update_existing_category,
)

router = APIRouter(
    prefix="/api/categories",
    tags=["Categories"],
)


def create_category_response(
    category: object,
) -> CategoryResponse:
    return CategoryResponse.model_validate(category)


@router.get(
    "",
    response_model=ApiResponse[list[CategoryResponse]],
)
def get_category_list(
    session: Annotated[Session, Depends(get_session)],
) -> ApiResponse[list[CategoryResponse]]:
    categories = list_categories(
        session,
        active_only=True,
    )

    return ApiResponse(
        success=True,
        data=categories,
        message="Kategoriler getirildi.",
    )


@router.get(
    "/{category_id}",
    response_model=ApiResponse[CategoryResponse],
)
def get_category_detail(
    category_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> ApiResponse[CategoryResponse]:
    category = get_category(session, category_id)

    return ApiResponse(
        success=True,
        data=create_category_response(category),
        message="Kategori getirildi.",
    )


@router.post(
    "",
    response_model=ApiResponse[CategoryResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_category(
    category_data: CategoryCreate,
    session: Annotated[Session, Depends(get_session)],
    _admin_user: Annotated[
        User,
        Depends(require_permission("category.create")),
    ],
) -> ApiResponse[CategoryResponse]:
    category = create_new_category(
        session,
        category_data,
    )

    return ApiResponse(
        success=True,
        data=create_category_response(category),
        message="Kategori başarıyla oluşturuldu.",
    )


@router.put(
    "/{category_id}",
    response_model=ApiResponse[CategoryResponse],
)
def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    session: Annotated[Session, Depends(get_session)],
    _admin_user: Annotated[
        User,
        Depends(require_permission("category.update")),
    ],
) -> ApiResponse[CategoryResponse]:
    category = update_existing_category(
        session,
        category_id,
        category_data,
    )

    return ApiResponse(
        success=True,
        data=create_category_response(category),
        message="Kategori başarıyla güncellendi.",
    )


@router.delete(
    "/{category_id}",
    response_model=ApiResponse[CategoryResponse],
)
def delete_category(
    category_id: int,
    session: Annotated[Session, Depends(get_session)],
    _admin_user: Annotated[
        User,
        Depends(require_permission("category.delete")),
    ],
) -> ApiResponse[CategoryResponse]:
    category = delete_category_permanently(
        session,
        category_id,
    )

    return ApiResponse(
        success=True,
        data=create_category_response(category),
        message="Kategori başarıyla silindi.",
    )
