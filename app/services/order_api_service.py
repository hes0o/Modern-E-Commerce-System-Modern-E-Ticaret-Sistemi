from datetime import UTC, datetime

from sqlmodel import Session

from app.core.exceptions import (
    AuthenticationError,
    BusinessRuleError,
    ConflictError,
    NotFoundError,
)
from app.models.address import Address
from app.models.enums import OrderStatus
from app.models.user import User
from app.repositories.address_repository import (
    get_address_by_id_and_user_id,
)
from app.repositories.cart_repository import (
    get_cart_by_session_token,
    get_cart_by_user_id,
)
from app.repositories.order_repository import (
    get_all_orders,
    get_order_by_id,
    get_user_orders,
)
from app.schemas.order import (
    CheckoutAddress,
    OrderAdminUpdate,
    OrderCreate,
    OrderListResponse,
    OrderResponse,
)
from app.services.order_service import (
    EmptyCartError,
    StockConflictError,
    cancel_order,
    create_order,
    update_order_status,
)
from app.services.order_state_machine import InvalidStateTransition

CURRENT_CONTRACT_VERSION = "v1"

def address_to_snapshot(address: Address) -> dict:
    return {
        "title": address.title,
        "recipient_name": address.recipient_name,
        "phone": address.phone,
        "city": address.city,
        "district": address.district,
        "full_address": address.full_address,
        "postal_code": address.postal_code,
    }


def checkout_address_to_snapshot(address: CheckoutAddress) -> dict:
    return address.model_dump()


def create_checkout_order(
    session: Session,
    *,
    payload: OrderCreate,
    current_user: User | None,
    session_token: str | None,
) -> OrderResponse:
    if current_user is not None:
        cart = get_cart_by_user_id(session, current_user.id)

        if cart is None:
            raise BusinessRuleError("Sepet bulunamadı.")

        if payload.shipping_address_id is None:
            raise BusinessRuleError(
                "Kayıtlı kullanıcı için teslimat adresi seçilmelidir."
            )

        shipping_address = get_address_by_id_and_user_id(
            session,
            address_id=payload.shipping_address_id,
            user_id=current_user.id,
        )
        if shipping_address is None:
            raise NotFoundError("Teslimat adresi bulunamadı.")

        shipping_snapshot = address_to_snapshot(shipping_address)
        billing_snapshot = None

        if payload.billing_address_id is not None:
            billing_address = get_address_by_id_and_user_id(
                session,
                address_id=payload.billing_address_id,
                user_id=current_user.id,
            )
            if billing_address is None:
                raise NotFoundError("Fatura adresi bulunamadı.")

            billing_snapshot = address_to_snapshot(billing_address)

        user_id = current_user.id
        guest_name = None
        guest_email = None
        guest_phone = None

    else:
        if not session_token:
            raise AuthenticationError(
                "Misafir sepeti için X-Cart-Token gereklidir."
            )

        cart = get_cart_by_session_token(session, session_token)
        if cart is None:
            raise NotFoundError("Misafir sepeti bulunamadı.")

        if (
            payload.guest_name is None
            or payload.guest_email is None
            or payload.guest_phone is None
            or payload.shipping_address is None
        ):
            raise BusinessRuleError(
                "Misafir siparişi için müşteri ve adres bilgileri zorunludur."
            )

        shipping_snapshot = checkout_address_to_snapshot(
            payload.shipping_address
        )
        billing_snapshot = (
            checkout_address_to_snapshot(payload.billing_address)
            if payload.billing_address is not None
            else None
        )

        user_id = None
        guest_name = payload.guest_name
        guest_email = str(payload.guest_email)
        guest_phone = payload.guest_phone

    if cart.id is None:
        raise BusinessRuleError("Sepet kimliği bulunamadı.")

    try:
        order = create_order(
            session,
            cart_id=cart.id,
            user_id=user_id,
            guest_name=guest_name,
            guest_email=guest_email,
            guest_phone=guest_phone,
            shipping_address_snapshot=shipping_snapshot,
            billing_address_snapshot=billing_snapshot,
            payment_method=payload.payment_method,
            customer_note=payload.customer_note,
            contract_version_accepted=CURRENT_CONTRACT_VERSION,
        )

        # Yeni sipariş bildirimi ekle
        from app.models.notification import Notification
        cust_info = guest_name or (current_user.name if current_user else "Müşteri")
        order_notif = Notification(
            type="order",
            title="Yeni Sipariş Alındı",
            message=f"{cust_info} tarafından #{order.order_number} numaralı sipariş oluşturuldu (Tutar: ₺{order.grand_total:.2f}).",
            related_entity_type="order",
            related_entity_id=order.id,
            is_read=False,
        )
        session.add(order_notif)

        session.commit()

    except EmptyCartError as error:
        session.rollback()
        raise BusinessRuleError("Boş sepetten sipariş oluşturulamaz.") from error

    except StockConflictError as error:
        session.rollback()
        raise ConflictError(
            "Sepetteki bazı ürünler için yeterli stok bulunmuyor.",
            errors=error.conflicts,
        ) from error

    except Exception:
        session.rollback()
        raise

    saved_order = get_order_by_id(session, order.id)
    if saved_order is None:
        raise NotFoundError("Oluşturulan sipariş bulunamadı.")

    return OrderResponse.model_validate(saved_order)


def list_my_orders(
    session: Session,
    *,
    user_id: int,
    page: int,
    page_size: int,
) -> OrderListResponse:
    orders, total = get_user_orders(
        session,
        user_id=user_id,
        page=page,
        page_size=page_size,
    )

    total_pages = (
        (total + page_size - 1) // page_size
        if total > 0
        else 0
    )

    return OrderListResponse(
        items=[
            OrderResponse.model_validate(order)
            for order in orders
        ],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


def list_admin_orders(
    session: Session,
    *,
    page: int,
    page_size: int,
    order_status=None,
) -> OrderListResponse:
    orders, total = get_all_orders(
        session,
        page=page,
        page_size=page_size,
        order_status=order_status,
    )

    total_pages = (
        (total + page_size - 1) // page_size
        if total > 0
        else 0
    )

    return OrderListResponse(
        items=[
            OrderResponse.model_validate(order)
            for order in orders
        ],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )

def get_my_order(
    session: Session,
    *,
    order_id: int,
    user_id: int,
) -> OrderResponse:
    order = get_order_by_id(session, order_id)

    if order is None:
        raise NotFoundError("Sipariş bulunamadı.")

    if order.user_id != user_id:
        raise NotFoundError("Sipariş bulunamadı.")

    return OrderResponse.model_validate(order)


def get_admin_order(
    session: Session,
    *,
    order_id: int,
) -> OrderResponse:
    order = get_order_by_id(session, order_id)

    if order is None:
        raise NotFoundError("Sipariş bulunamadı.")

    return OrderResponse.model_validate(order)


def cancel_my_order(
    session: Session,
    *,
    order_id: int,
    user_id: int,
    note: str | None,
) -> OrderResponse:
    order = get_order_by_id(session, order_id)

    if order is None or order.user_id != user_id:
        raise NotFoundError("Sipariş bulunamadı.")

    try:
        cancel_order(
            session,
            order=order,
            cancelled_by_user_id=user_id,
            note=note,
        )
        session.commit()

    except InvalidStateTransition as error:
        session.rollback()
        raise BusinessRuleError(
            "Bu durumdaki sipariş iptal edilemez."
        ) from error

    except Exception:
        session.rollback()
        raise

    saved_order = get_order_by_id(session, order_id)
    if saved_order is None:
        raise NotFoundError("Güncellenen sipariş bulunamadı.")

    return OrderResponse.model_validate(saved_order)


def change_order_status(
    session: Session,
    *,
    order_id: int,
    new_status: OrderStatus,
    changed_by_user_id: int,
    note: str | None,
) -> OrderResponse:
    order = get_order_by_id(session, order_id)

    if order is None:
        raise NotFoundError("Sipariş bulunamadı.")

    try:
        update_order_status(
            session,
            order=order,
            new_status=new_status,
            changed_by_user_id=changed_by_user_id,
            note=note,
        )
        session.commit()

    except InvalidStateTransition as error:
        session.rollback()
        raise BusinessRuleError(
            
                f"'{error.current.value}' durumundan "
                f"'{error.requested.value}' durumuna geçilemez."
            
        ) from error

    except Exception:
        session.rollback()
        raise

    saved_order = get_order_by_id(session, order_id)
    if saved_order is None:
        raise NotFoundError("Güncellenen sipariş bulunamadı.")

    return OrderResponse.model_validate(saved_order)

def update_order_admin_details(
    session: Session,
    *,
    order_id: int,
    payload: OrderAdminUpdate,
) -> OrderResponse:
    order = get_order_by_id(session, order_id)

    if order is None:
        raise NotFoundError("Sipariş bulunamadı.")

    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(order, field, value)

    order.updated_at = datetime.now(UTC)
    session.add(order)
    session.commit()

    saved_order = get_order_by_id(session, order_id)

    if saved_order is None:
        raise NotFoundError("Güncellenen sipariş bulunamadı.")

    return OrderResponse.model_validate(saved_order)