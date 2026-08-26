from sqlmodel import Session, select

from app.models.category import Category
from app.models.enums import ProductStatus
from app.models.product import Product
from app.models.rbac import Role
from app.models.user import User


def create_catalog_admin_token(
    client,
    engine,
) -> str:
    email = "catalog.admin@example.com"

    client.post(
        "/api/auth/register",
        json={
            "name": "Katalog Yöneticisi",
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

def test_public_catalog_hides_unpublished_products(
    client,
    engine,
):
    with Session(engine) as session:
        category = Category(
            name="Görünürlük Kategorisi",
            slug="gorunurluk-kategorisi",
            is_active=True,
        )
        session.add(category)
        session.flush()

        published_product = Product(
            category_id=category.id,
            sku="PUBLIC-PUBLISHED-001",
            name="Yayımlanmış Ürün",
            slug="yayimlanmis-urun",
            short_description="Genel mağazada görünür.",
            long_description="Yayımlanmış ürün açıklaması.",
            price=100,
            vat_rate=20,
            status=ProductStatus.PUBLISHED,
            has_variants=False,
            stock=10,
        )
        draft_product = Product(
            category_id=category.id,
            sku="PUBLIC-DRAFT-001",
            name="Taslak Ürün",
            slug="taslak-urun",
            short_description="Genel mağazada görünmemeli.",
            long_description="Taslak ürün açıklaması.",
            price=200,
            vat_rate=20,
            status=ProductStatus.DRAFT,
            has_variants=False,
            stock=10,
        )
        session.add_all([published_product, draft_product])
        session.commit()
        draft_product_id = draft_product.id

    response = client.get("/api/products?status=draft")

    assert response.status_code == 200
    body = response.json()
    assert body["data"]["total"] == 1
    assert body["data"]["items"][0]["sku"] == (
        "PUBLIC-PUBLISHED-001"
    )

    detail_response = client.get(
        f"/api/products/{draft_product_id}"
    )

    assert detail_response.status_code == 404

def test_admin_product_list_requires_authentication(client):
    response = client.get("/api/products/admin")

    assert response.status_code == 401
    assert response.json()["success"] is False


def test_product_delete_archives_product(
    client,
    engine,
):
    with Session(engine) as session:
        category = Category(
            name="Arşiv Kategorisi",
            slug="arsiv-kategorisi",
            is_active=True,
        )
        session.add(category)
        session.flush()

        product = Product(
            category_id=category.id,
            sku="ARCHIVE-TEST-001",
            name="Arşivlenecek Ürün",
            slug="arsivlenecek-urun",
            short_description="Arşivleme testi.",
            long_description="Kalıcı olarak silinmemelidir.",
            price=300,
            vat_rate=20,
            status=ProductStatus.PUBLISHED,
            has_variants=False,
            stock=5,
        )
        session.add(product)
        session.commit()
        product_id = product.id

    token = create_catalog_admin_token(client, engine)
    headers = {
        "Authorization": f"Bearer {token}",
    }

    delete_response = client.delete(
        f"/api/products/{product_id}",
        headers=headers,
    )

    assert delete_response.status_code == 200
    assert delete_response.json()["data"]["status"] == "archived"

    with Session(engine) as session:
        archived_product = session.get(Product, product_id)

        assert archived_product is not None
        assert archived_product.status == ProductStatus.ARCHIVED

    public_detail = client.get(
        f"/api/products/{product_id}"
    )
    assert public_detail.status_code == 404

    admin_detail = client.get(
        f"/api/products/admin/{product_id}",
        headers=headers,
    )
    assert admin_detail.status_code == 200
    assert admin_detail.json()["data"]["status"] == "archived"

    admin_list = client.get(
        "/api/products/admin?status=archived",
        headers=headers,
    )
    assert admin_list.status_code == 200
    assert admin_list.json()["data"]["total"] == 1