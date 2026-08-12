from typing import Optional

from sqlalchemy.exc import NoResultFound
from sqlmodel import Session

from app.core.exceptions import (
    BusinessRuleError,
    ConflictError,
    NotFoundError,
)

from app.models.enums import StockMovementType

from app.repositories.stock_repository import (
    get_stock_movements,
    get_stock_products,
)

from app.schemas.stock import (
    StockMovementListResponse,
    StockMovementResponse,
    StockUpdateRequest,
)

from app.services.stock_service import (
    InsufficientStockError,
    manual_stock_in,
    manual_stock_out,
    stock_adjustment,
)


def update_stock(
    session: Session,
    *,
    product_id: int,
    user_id: int,
    payload: StockUpdateRequest,
) -> StockMovementResponse:

    try:

        if payload.operation in {"in", "out"}:

            if payload.quantity is None:
                raise BusinessRuleError(
                    "Stok giriş/çıkış işlemi için miktar gereklidir."
                )

            if payload.operation == "in":

                movement = manual_stock_in(
                    session,
                    product_id=product_id,
                    variant_id=payload.variant_id,
                    quantity=payload.quantity,
                    user_id=user_id,
                    note=payload.note,
                )

            else:

                movement = manual_stock_out(
                    session,
                    product_id=product_id,
                    variant_id=payload.variant_id,
                    quantity=payload.quantity,
                    user_id=user_id,
                    note=payload.note,
                )

        else:

            if payload.new_stock_count is None:
                raise BusinessRuleError(
                    "Stok düzeltme işlemi için yeni stok değeri gereklidir."
                )

            movement = stock_adjustment(
                session,
                product_id=product_id,
                variant_id=payload.variant_id,
                new_stock_count=payload.new_stock_count,
                user_id=user_id,
                note=payload.note,
            )

        session.commit()
        session.refresh(movement)

    except InsufficientStockError as error:

        session.rollback()

        raise ConflictError(
            (
                "Yeterli stok yok. "
                f"Kullanılabilir stok: {error.available}."
            ),
            errors=[
                {
                    "product_id": error.product_id,
                    "variant_id": error.variant_id,
                    "requested": error.requested,
                    "available": error.available,
                }
            ],
        ) from error

    except NoResultFound as error:

        session.rollback()

        raise NotFoundError(
            "Ürün veya ürün varyantı bulunamadı."
        ) from error

    except ValueError as error:

        session.rollback()

        raise BusinessRuleError(
            str(error)
        ) from error

    except Exception:

        session.rollback()

        raise

    return StockMovementResponse.model_validate(
        movement
    )


def list_stock_movements(
    session: Session,
    *,
    page: int,
    page_size: int,
    product_id: Optional[int],
    variant_id: Optional[int],
    movement_type: Optional[StockMovementType],
) -> StockMovementListResponse:

    movements, total = get_stock_movements(
        session,
        page=page,
        page_size=page_size,
        product_id=product_id,
        variant_id=variant_id,
        movement_type=movement_type,
    )

    total_pages = (
        (total + page_size - 1) // page_size
        if total > 0
        else 0
    )

    return StockMovementListResponse(
        items=[
            StockMovementResponse.model_validate(
                movement
            )
            for movement in movements
        ],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


def list_stock_products(
    session: Session,
    *,
    page: int,
    page_size: int,
    search: Optional[str],
    filter_type: Optional[str],
) -> dict:

    products, total = get_stock_products(
        session,
        page=page,
        page_size=page_size,
        search=search,
        filter_type=filter_type,
    )

    items = []

    for product in products:
        current_stock = (
            product.stock
            if product.stock is not None
            else 0
        )

        items.append(
            {
                "id": product.id,
                "product_id": product.id,
                "product_name": product.name,
                "productName": product.name,
                "sku": product.sku,
                "category": (
                    product.category.name
                    if product.category
                    else "-"
                ),
                "current_stock": current_stock,
                "currentStock": current_stock,
                "min_stock": (
                    product.min_stock_level
                    if product.min_stock_level is not None
                    else 0
                ),
                "minStock": (
                    product.min_stock_level
                    if product.min_stock_level is not None
                    else 0
                ),
                "supplier": "-",
            }
        )

    total_pages = (
        (total + page_size - 1) // page_size
        if total > 0
        else 0
    )

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }