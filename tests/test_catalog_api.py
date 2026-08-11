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
            supplier="Test Tedarikçi",
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
    assert body["data"]["items"][0]["supplier"] == (
        "Test Tedarikçi"
    )

def test_filter_and_sort_products(client, engine):
    with Session(engine) as session:
        category = Category(
            name="Filtre Kategorisi",
            slug="filtre-kategorisi",
            is_active=True,
        )
        session.add(category)
        session.flush()

        products = [
            Product(
                category_id=category.id,
                sku="FILTER-001",
                name="Ucuz Kampanyalı Ürün",
                slug="ucuz-kampanyali-urun",
                short_description="Filtre testi",
                long_description="Filtre testi ürün açıklaması",
                price=100,
                discount_price=80,
                vat_rate=20,
                status=ProductStatus.PUBLISHED,
                has_variants=False,
                stock=10,
                min_stock_level=2,
                is_featured=True,
                is_campaign=True,
            ),
            Product(
                category_id=category.id,
                sku="FILTER-002",
                name="Pahalı Ürün",
                slug="pahali-urun",
                short_description="Filtre testi",
                long_description="Filtre testi ürün açıklaması",
                price=250,
                vat_rate=20,
                status=ProductStatus.PUBLISHED,
                has_variants=False,
                stock=10,
                min_stock_level=2,
                is_featured=False,
                is_campaign=False,
            ),
        ]
        session.add_all(products)
        session.commit()

    response = client.get(
        "/api/products"
        "?min_price=70"
        "&max_price=100"
        "&is_featured=true"
        "&is_campaign=true"
        "&sort=price_asc"
    )

    assert response.status_code == 200
    body = response.json()
    assert body["data"]["total"] == 1
    assert body["data"]["items"][0]["sku"] == "FILTER-001"


def test_get_product_by_slug(client, engine):
    with Session(engine) as session:
        category = Category(
            name="Slug Kategorisi",
            slug="slug-kategorisi",
            is_active=True,
        )
        session.add(category)
        session.flush()

        product = Product(
            category_id=category.id,
            sku="SLUG-001",
            name="Slug Test Ürünü",
            slug="slug-test-urunu",
            short_description="Slug testi",
            long_description="Slug endpoint testi",
            price=500,
            vat_rate=20,
            status=ProductStatus.PUBLISHED,
            has_variants=False,
            stock=5,
            min_stock_level=1,
        )
        session.add(product)
        session.commit()

    response = client.get(
        "/api/products/slug/slug-test-urunu"
    )

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["sku"] == "SLUG-001"
    assert body["data"]["slug"] == "slug-test-urunu"


def test_invalid_price_range_returns_error(client):
    response = client.get(
        "/api/products?min_price=500&max_price=100"
    )

    assert response.status_code == 422
    assert response.json()["success"] is False
