from sqlmodel import Session

from app.models.category import Category
from app.models.enums import ProductStatus
from app.models.order import Order
from app.models.product import Product


def create_order_customer(client) -> tuple[str, int]:
    client.post(
        "/api/auth/register",
        json={
            "name": "Sipariş Test Kullanıcısı",
            "email": "order.test@example.com",
            "phone": "05551234567",
            "password": "Test1234!",
            "password_confirm": "Test1234!",
            "kvkk_accepted": True,
            "newsletter_allowed": False,
        },
    )

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "order.test@example.com",
            "password": "Test1234!",
        },
    )
    token = login_response.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    address_response = client.post(
        "/api/addresses",
        headers=headers,
        json={
            "title": "Ev",
            "recipient_name": "Sipariş Test Kullanıcısı",
            "phone": "05551234567",
            "city": "Elazığ",
            "district": "Merkez",
            "full_address": "Sipariş testi için açık adres No: 1",
            "postal_code": "23000",
            "is_default": True,
        },
    )
    address_id = address_response.json()["data"]["id"]

    return token, address_id


def test_order_creation_and_cancellation_restores_stock(
    client,
    engine,
):
    with Session(engine) as session:
        category = Category(
            name="Sipariş Kategorisi",
            slug="siparis-kategorisi",
            is_active=True,
        )
        session.add(category)
        session.flush()

        product = Product(
            category_id=category.id,
            sku="ORDER-001",
            name="Sipariş Test Ürünü",
            slug="siparis-test-urunu",
            short_description="Sipariş testi",
            long_description="Sipariş API testi için ürün",
            price=1000,
            discount_price=900,
            vat_rate=20,
            status=ProductStatus.PUBLISHED,
            has_variants=False,
            stock=10,
            min_stock_level=2,
        )
        session.add(product)
        session.commit()
        product_id = product.id

    token, address_id = create_order_customer(client)
    headers = {"Authorization": f"Bearer {token}"}

    cart_response = client.post(
        "/api/cart/items",
        headers=headers,
        json={
            "product_id": product_id,
            "variant_id": None,
            "quantity": 2,
        },
    )
    assert cart_response.status_code == 200

    order_response = client.post(
        "/api/orders",
        headers=headers,
        json={
            "shipping_address_id": address_id,
            "billing_address_id": address_id,
            "payment_method": "cod",
            "customer_note": "Otomatik sipariş testi",
            "contract_version_accepted": "v1",
        },
    )

    assert order_response.status_code == 201
    body = order_response.json()
    assert body["success"] is True
    assert body["data"]["status"] == "pending"
    assert body["data"]["grand_total"] == 1800
    assert body["data"]["items"][0]["quantity"] == 2

    order_id = body["data"]["id"]

    with Session(engine) as session:
        saved_order = session.get(Order, order_id)
        assert saved_order is not None
        saved_order.admin_note = "Yalnızca yöneticinin görebileceği not"
        session.add(saved_order)
        session.commit()

    customer_detail_response = client.get(
        f"/api/orders/me/{order_id}",
        headers=headers,
    )

    assert customer_detail_response.status_code == 200
    assert (
        "admin_note"
        not in customer_detail_response.json()["data"]
    )

    customer_list_response = client.get(
        "/api/orders/me",
        headers=headers,
    )

    assert customer_list_response.status_code == 200
    assert (
        "admin_note"
        not in customer_list_response.json()["data"]["items"][0]
    )

    with Session(engine) as session:
        product_after_order = session.get(Product, product_id)
        assert product_after_order.stock == 8

    cancel_response = client.post(
        f"/api/orders/me/{order_id}/cancel",
        headers=headers,
        json={
            "note": "Otomatik iptal testi",
        },
    )

    assert cancel_response.status_code == 200
    assert cancel_response.json()["data"]["status"] == "cancelled"

    with Session(engine) as session:
        product_after_cancel = session.get(Product, product_id)
        assert product_after_cancel.stock == 10

def test_guest_checkout_uses_session_token(client, engine):
    with Session(engine) as session:
        category = Category(
            name="Misafir Sipariş Kategorisi",
            slug="misafir-siparis-kategorisi",
            is_active=True,
        )
        session.add(category)
        session.flush()

        product = Product(
            category_id=category.id,
            sku="GUEST-ORDER-001",
            name="Misafir Sipariş Ürünü",
            slug="misafir-siparis-urunu",
            short_description="Misafir sipariş testi",
            long_description="Misafir checkout testi için ürün",
            price=500,
            vat_rate=20,
            status=ProductStatus.PUBLISHED,
            has_variants=False,
            stock=5,
            min_stock_level=1,
        )
        session.add(product)
        session.commit()
        product_id = product.id

    cart_response = client.post(
        "/api/cart/items",
        json={
            "product_id": product_id,
            "variant_id": None,
            "quantity": 1,
        },
    )

    assert cart_response.status_code == 200

    session_token = cart_response.json()["data"]["session_token"]

    assert session_token is not None

    headers = {
        "X-Session-Token": session_token,
    }

    order_response = client.post(
        "/api/orders",
        headers=headers,
        json={
            "guest_name": "Misafir Kullanıcı",
            "guest_email": "guest@example.com",
            "guest_phone": "05551234567",
            "shipping_address": {
                "title": "Ev",
                "recipient_name": "Misafir Kullanıcı",
                "phone": "05551234567",
                "city": "Elazığ",
                "district": "Merkez",
                "full_address": (
                    "Misafir sipariş test adresi No: 1"
                ),
                "postal_code": "23000",
            },
            "payment_method": "cod",
            "customer_note": "Misafir checkout testi",
            "contract_version_accepted": "v1",
        },
    )

    assert order_response.status_code == 201
    assert order_response.json()["success"] is True
    assert order_response.json()["data"]["user_id"] is None
    assert (
        order_response.json()["data"]["guest_email"]
        == "guest@example.com"
    )
    assert order_response.json()["data"]["status"] == "pending"