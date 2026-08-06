from sqlmodel import Session

from app.models.category import Category
from app.models.enums import ProductStatus
from app.models.product import Product


def create_customer_token(client) -> str:
    client.post(
        "/api/auth/register",
        json={
            "name": "Müşteri Testi",
            "email": "customer.api@example.com",
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
            "email": "customer.api@example.com",
            "password": "Test1234!",
        },
    )

    return login_response.json()["data"]["access_token"]


def test_create_and_list_customer_address(client):
    token = create_customer_token(client)
    headers = {
        "Authorization": f"Bearer {token}",
    }

    create_response = client.post(
        "/api/addresses",
        headers=headers,
        json={
            "title": "Ev",
            "recipient_name": "Müşteri Testi",
            "phone": "05551234567",
            "city": "Elazığ",
            "district": "Merkez",
            "full_address": "Sürsürü Mahallesi test adresi No: 1",
            "postal_code": "23000",
            "is_default": True,
        },
    )

    assert create_response.status_code == 201
    assert create_response.json()["success"] is True
    assert create_response.json()["data"]["title"] == "Ev"
    assert create_response.json()["data"]["is_default"] is True

    list_response = client.get(
        "/api/addresses",
        headers=headers,
    )

    assert list_response.status_code == 200
    assert len(list_response.json()["data"]) == 1
    assert list_response.json()["data"][0]["city"] == "Elazığ"

def test_add_product_to_favorites(client, engine):
    with Session(engine) as session:
        category = Category(
            name="Favori Kategorisi",
            slug="favori-kategorisi",
            is_active=True,
        )
        session.add(category)
        session.flush()

        product = Product(
            category_id=category.id,
            sku="FAV-001",
            name="Favori Test Ürünü",
            slug="favori-test-urunu",
            short_description="Favori testi",
            long_description="Favori API testi için ürün",
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

    token = create_customer_token(client)
    headers = {
        "Authorization": f"Bearer {token}",
    }

    add_response = client.post(
        "/api/favorites",
        headers=headers,
        json={
            "product_id": product_id,
        },
    )

    assert add_response.status_code == 201
    assert add_response.json()["success"] is True
    assert add_response.json()["data"]["product_id"] == product_id

    list_response = client.get(
        "/api/favorites",
        headers=headers,
    )

    assert list_response.status_code == 200
    assert len(list_response.json()["data"]) == 1
    assert list_response.json()["data"][0]["sku"] == "FAV-001"

def test_add_and_update_cart_item(client, engine):
    with Session(engine) as session:
        category = Category(
            name="Sepet Kategorisi",
            slug="sepet-kategorisi",
            is_active=True,
        )
        session.add(category)
        session.flush()

        product = Product(
            category_id=category.id,
            sku="CART-001",
            name="Sepet Test Ürünü",
            slug="sepet-test-urunu",
            short_description="Sepet testi",
            long_description="Sepet API testi için ürün",
            price=750,
            discount_price=700,
            vat_rate=20,
            status=ProductStatus.PUBLISHED,
            has_variants=False,
            stock=10,
            min_stock_level=2,
        )
        session.add(product)
        session.commit()
        product_id = product.id

    token = create_customer_token(client)
    headers = {
        "Authorization": f"Bearer {token}",
    }

    add_response = client.post(
        "/api/cart/items",
        headers=headers,
        json={
            "product_id": product_id,
            "variant_id": None,
            "quantity": 2,
        },
    )

    assert add_response.status_code == 200
    assert add_response.json()["success"] is True
    assert add_response.json()["data"]["total_quantity"] == 2
    assert add_response.json()["data"]["grand_total"] == 1400

    item_id = add_response.json()["data"]["items"][0]["id"]

    update_response = client.put(
        f"/api/cart/items/{item_id}",
        headers=headers,
        json={
            "quantity": 3,
        },
    )

    assert update_response.status_code == 200
    assert update_response.json()["data"]["total_quantity"] == 3
    assert update_response.json()["data"]["grand_total"] == 2100