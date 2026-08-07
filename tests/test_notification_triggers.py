from sqlmodel import Session, select

from app.models.enums import PaymentMethod
from app.models.notification import Notification
from app.schemas.auth import UserRegister
from app.services.auth_service import register_user
from app.services.order_service import create_order


def test_registration_creates_admin_notification(
    seeded_session: Session,
) -> None:
    registration = UserRegister(
        name="Bildirim Test Kullanıcısı",
        email="notification-test@example.com",
        phone="05551234567",
        password="Test1234!",
        password_confirm="Test1234!",
        kvkk_accepted=True,
        newsletter_allowed=False,
    )

    user = register_user(
        seeded_session,
        registration,
    )

    notification = seeded_session.exec(
        select(Notification).where(
            Notification.type == "new_member",
            Notification.related_entity_id == user.id,
        )
    ).first()

    assert notification is not None
    assert notification.title == "Yeni Kullanıcı"
    assert notification.recipient_user_id is None


def test_order_creation_creates_admin_notification(
    seeded_session: Session,
    sample_cart,
) -> None:
    order = create_order(
        seeded_session,
        cart_id=sample_cart.id,
        user_id=sample_cart.user_id,
        shipping_address_snapshot={
            "title": "Ev",
            "recipient_name": "Test Müşteri",
            "phone": "05551234567",
            "city": "Elazığ",
            "district": "Merkez",
            "full_address": "Test adresi No: 1",
            "postal_code": "23000",
        },
        payment_method=PaymentMethod.COD,
        contract_version_accepted="v1",
    )
    seeded_session.flush()

    notification = seeded_session.exec(
        select(Notification).where(
            Notification.type == "new_order",
            Notification.related_entity_id == order.id,
        )
    ).first()

    assert notification is not None
    assert notification.title == "Yeni Sipariş"
    assert notification.recipient_user_id is None