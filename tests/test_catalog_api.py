from sqlmodel import Session

from app.models.category import Category
from app.models.enums import ProductStatus
from app.models.product import Product


def test_list_categories(client, engine):
    with Session(engine) as session:
        category = Category(
            name="Elektronik",
            slug="elektronik",
            sort_order=1,
            is_active=True,
        )
        session.add(category)
        session.commit()

    response = client.get("/api/categories")

    assert response.status_code == 200
    body = response.json()

    assert body["success"] is True
    assert len(body["data"]) == 1
    assert body["data"][0]["name"] == "Elektronik"
    assert body["data"][0]["slug"] == "elektronik"


def test_list_published_products(client, engine):
    with Session(engine) as session:
        category = Category(
            name="Telefon",
            slug="telefon",
            is_active=True,
        )
        session.add(category)
        session.flush()

        product = Product(
            category_id=category.id,
            sku="TEST-TEL-001",
            name="Test Telefon",
            slug="test-telefon",
            short_description="Test telefon açıklaması",
            long_description="Test telefon detaylı açıklaması",
            price=1000,
            vat_rate=20,
            status=ProductStatus.PUBLISHED,
            has_variants=False,
            stock=10,
            min_stock_level=2,
        )
        session.add(product)
        session.commit()

    response = client.get("/api/products")

    assert response.status_code == 200
    body = response.json()

    assert body["success"] is True
    assert body["data"]["total"] == 1
    assert body["data"]["items"][0]["sku"] == "TEST-TEL-001"
    assert body["data"]["items"][0]["status"] == "published"