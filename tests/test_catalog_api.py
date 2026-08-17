from sqlmodel import Session, select

from app.models.brand import Brand
from app.models.category import Category
from app.models.enums import ProductStatus
from app.models.product import Product, ProductVariant
from app.models.rbac import Role
from app.models.user import User


def create_catalog_admin_token(
    client,
    engine,
    email: str = "catalog.admin@example.com",
) -> str:
    client.post(
        "/api/auth/register",
        json={
            "name": "Katalog Admin Testi",
            "email": email,
            "phone": "05551234567",
            "password": "Test1234!",
            "password_confirm": "Test1234!",
            "kvkk_accepted": True,
            "newsletter_allowed": False,
        },
    )

    with Session(engine) as session:
        user = session.exec(
            select(User).where(User.email == email)
        ).one()
        admin_role = session.exec(
            select(Role).where(Role.name == "admin")
        ).one()

        user.role_id = admin_role.id
        session.add(user)
        session.commit()

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": "Test1234!",
        },
    )

    return login_response.json()["data"]["access_token"]

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

def test_filter_products_by_variant_color_and_size(
    client,
    engine,
):
    with Session(engine) as session:
        category = Category(
            name="Varyant Filtre Kategorisi",
            slug="varyant-filtre-kategorisi",
            is_active=True,
        )
        session.add(category)
        session.flush()

        product = Product(
            category_id=category.id,
            sku="VARIANT-FILTER-001",
            name="Varyant Filtre Ürünü",
            slug="varyant-filtre-urunu",
            short_description="Varyant filtre testi",
            long_description="Renk ve beden filtre testi",
            price=750,
            vat_rate=20,
            status=ProductStatus.PUBLISHED,
            has_variants=True,
            stock=None,
            min_stock_level=1,
        )
        session.add(product)
        session.flush()

        unmatched_product = Product(
            category_id=category.id,
            sku="VARIANT-FILTER-002",
            name="Eşleşmeyen Varyantsız Ürün",
            slug="eslesmeyen-varyantsiz-urun",
            short_description="Filtre dışı ürün",
            long_description="Renk ve beden filtresiyle eşleşmez",
            price=900,
            vat_rate=20,
            status=ProductStatus.PUBLISHED,
            has_variants=False,
            stock=8,
            min_stock_level=1,
        )
        session.add(unmatched_product)

        session.add_all(
            [
                ProductVariant(
                    product_id=product.id,
                    sku="VARIANT-MAVI-M",
                    color="Mavi",
                    size="M",
                    stock=5,
                ),
                ProductVariant(
                    product_id=product.id,
                    sku="VARIANT-SIYAH-L",
                    color="Siyah",
                    size="L",
                    stock=3,
                ),
            ]
        )
        session.commit()

    response = client.get(
        "/api/products?color=mavi&size=m"
    )

    assert response.status_code == 200
    body = response.json()
    assert body["data"]["total"] == 1
    assert body["data"]["items"][0]["sku"] == (
        "VARIANT-FILTER-001"
    )

def test_admin_product_list_requires_authentication(client):
    response = client.get("/api/products/admin")

    assert response.status_code == 401
    assert response.json()["success"] is False

def test_admin_filters_products_by_status_and_brand(
    client,
    engine,
):
    with Session(engine) as session:
        category = Category(
            name="Admin Filtre Kategorisi",
            slug="admin-filtre-kategorisi",
            is_active=True,
        )
        brand_a = Brand(
            name="Admin Filtre Marka A",
            is_active=True,
        )
        brand_b = Brand(
            name="Admin Filtre Marka B",
            is_active=True,
        )
        session.add_all([category, brand_a, brand_b])
        session.flush()

        session.add_all(
            [
                Product(
                    category_id=category.id,
                    brand_id=brand_a.id,
                    sku="ADMIN-DRAFT-A",
                    name="Taslak Marka A",
                    slug="taslak-marka-a",
                    short_description="Admin filtre testi",
                    long_description="Admin filtre testi detayi",
                    price=100,
                    vat_rate=20,
                    status=ProductStatus.DRAFT,
                    has_variants=False,
                    stock=10,
                    min_stock_level=2,
                ),
                Product(
                    category_id=category.id,
                    brand_id=brand_b.id,
                    sku="ADMIN-DRAFT-B",
                    name="Taslak Marka B",
                    slug="taslak-marka-b",
                    short_description="Admin filtre testi",
                    long_description="Admin filtre testi detayi",
                    price=200,
                    vat_rate=20,
                    status=ProductStatus.DRAFT,
                    has_variants=False,
                    stock=10,
                    min_stock_level=2,
                ),
                Product(
                    category_id=category.id,
                    brand_id=brand_a.id,
                    sku="ADMIN-PUBLISHED-A",
                    name="Yayindaki Marka A",
                    slug="yayindaki-marka-a",
                    short_description="Admin filtre testi",
                    long_description="Admin filtre testi detayi",
                    price=300,
                    vat_rate=20,
                    status=ProductStatus.PUBLISHED,
                    has_variants=False,
                    stock=10,
                    min_stock_level=2,
                ),
            ]
        )
        session.commit()
        brand_a_id = brand_a.id

    token = create_catalog_admin_token(client, engine)

    response = client.get(
        (
            "/api/products/admin"
            f"?status=draft&brand_id={brand_a_id}"
        ),
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["data"]["total"] == 1
    assert body["data"]["items"][0]["sku"] == "ADMIN-DRAFT-A"

def test_admin_filters_low_and_out_of_stock_products(
    client,
    engine,
):
    with Session(engine) as session:
        category = Category(
            name="Admin Stok Kategorisi",
            slug="admin-stok-kategorisi",
            is_active=True,
        )
        session.add(category)
        session.flush()

        low_product = Product(
            category_id=category.id,
            sku="ADMIN-STOCK-LOW",
            name="Azalan Stok Urunu",
            slug="azalan-stok-urunu",
            short_description="Stok filtre testi",
            long_description="Stok filtre testi detayi",
            price=100,
            vat_rate=20,
            status=ProductStatus.PUBLISHED,
            has_variants=False,
            stock=2,
            min_stock_level=5,
        )
        out_product = Product(
            category_id=category.id,
            sku="ADMIN-STOCK-OUT",
            name="Tukenen Stok Urunu",
            slug="tukenen-stok-urunu",
            short_description="Stok filtre testi",
            long_description="Stok filtre testi detayi",
            price=200,
            vat_rate=20,
            status=ProductStatus.PUBLISHED,
            has_variants=False,
            stock=0,
            min_stock_level=5,
        )
        healthy_product = Product(
            category_id=category.id,
            sku="ADMIN-STOCK-HEALTHY",
            name="Yeterli Stok Urunu",
            slug="yeterli-stok-urunu",
            short_description="Stok filtre testi",
            long_description="Stok filtre testi detayi",
            price=300,
            vat_rate=20,
            status=ProductStatus.PUBLISHED,
            has_variants=False,
            stock=20,
            min_stock_level=5,
        )
        low_variant_product = Product(
            category_id=category.id,
            sku="ADMIN-VARIANT-LOW",
            name="Azalan Varyantli Urun",
            slug="azalan-varyantli-urun",
            short_description="Varyant stok filtre testi",
            long_description="Varyant stok filtre testi detayi",
            price=400,
            vat_rate=20,
            status=ProductStatus.PUBLISHED,
            has_variants=True,
            stock=None,
            min_stock_level=None,
        )
        out_variant_product = Product(
            category_id=category.id,
            sku="ADMIN-VARIANT-OUT",
            name="Tukenen Varyantli Urun",
            slug="tukenen-varyantli-urun",
            short_description="Varyant stok filtre testi",
            long_description="Varyant stok filtre testi detayi",
            price=500,
            vat_rate=20,
            status=ProductStatus.PUBLISHED,
            has_variants=True,
            stock=None,
            min_stock_level=None,
        )

        session.add_all(
            [
                low_product,
                out_product,
                healthy_product,
                low_variant_product,
                out_variant_product,
            ]
        )
        session.flush()

        session.add_all(
            [
                ProductVariant(
                    product_id=low_variant_product.id,
                    sku="ADMIN-VARIANT-LOW-M",
                    color="Mavi",
                    size="M",
                    stock=2,
                    min_stock_level=5,
                ),
                ProductVariant(
                    product_id=out_variant_product.id,
                    sku="ADMIN-VARIANT-OUT-L",
                    color="Siyah",
                    size="L",
                    stock=0,
                    min_stock_level=5,
                ),
            ]
        )
        session.commit()

    token = create_catalog_admin_token(client, engine)
    headers = {
        "Authorization": f"Bearer {token}",
    }

    low_response = client.get(
        "/api/products/admin?stock_status=low",
        headers=headers,
    )
    out_response = client.get(
        "/api/products/admin?stock_status=out",
        headers=headers,
    )

    assert low_response.status_code == 200
    low_body = low_response.json()
    assert low_body["data"]["total"] == 2
    assert {
        item["sku"] for item in low_body["data"]["items"]
    } == {
        "ADMIN-STOCK-LOW",
        "ADMIN-VARIANT-LOW",
    }

    assert out_response.status_code == 200
    out_body = out_response.json()
    assert out_body["data"]["total"] == 2
    assert {
        item["sku"] for item in out_body["data"]["items"]
    } == {
        "ADMIN-STOCK-OUT",
        "ADMIN-VARIANT-OUT",
    }