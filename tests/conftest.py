"""
Shared test fixtures — in-memory SQLite for fast unit tests,
PostgreSQL for integration tests.
"""

import os

import pytest
from sqlmodel import Session, SQLModel, create_engine

from app.models import *  # noqa: F401, F403 — register all models
from app.seeds.rbac_seed import seed_rbac


@pytest.fixture(name="engine")
def fixture_engine():
    """Create an in-memory SQLite engine for unit tests."""
    # SQLite for fast isolated tests; use PostgreSQL URL for integration tests
    test_url = os.getenv(
        "TEST_DATABASE_URL",
        "sqlite:///./test.db",
    )
    engine = create_engine(
        test_url,
        echo=False,
        connect_args={"check_same_thread": False} if "sqlite" in test_url else {},
    )
    SQLModel.metadata.create_all(engine)
    yield engine
    SQLModel.metadata.drop_all(engine)
    engine.dispose()
    # Clean up SQLite file if used
    if "sqlite" in test_url and os.path.exists("./test.db"):
        os.remove("./test.db")


@pytest.fixture(name="session")
def fixture_session(engine):
    """Provide a transactional session that rolls back after each test."""
    with Session(engine) as session:
        yield session
        session.rollback()


@pytest.fixture(name="seeded_session")
def fixture_seeded_session(engine):
    """Session with RBAC seed data already loaded."""
    with Session(engine) as session:
        seed_rbac(session)
        yield session
        session.rollback()


@pytest.fixture(name="sample_category")
def fixture_sample_category(seeded_session):
    """Create a sample category for testing."""
    from app.models.category import Category

    cat = Category(name="Elektronik", slug="elektronik", sort_order=1, is_active=True)
    seeded_session.add(cat)
    seeded_session.flush()
    return cat


@pytest.fixture(name="sample_product")
def fixture_sample_product(seeded_session, sample_category):
    """Create a sample product with stock for testing."""
    from app.models.product import Product
    from app.models.enums import ProductStatus

    product = Product(
        category_id=sample_category.id,
        sku="TEST-001",
        name="Test Ürün",
        slug="test-urun",
        short_description="Test ürün açıklaması",
        long_description="<p>Test ürün detaylı açıklama</p>",
        price=100.00,
        vat_rate=18.00,
        status=ProductStatus.PUBLISHED,
        has_variants=False,
        stock=50,
        min_stock_level=5,
        is_new=True,
    )
    seeded_session.add(product)
    seeded_session.flush()
    return product


@pytest.fixture(name="sample_product_with_variants")
def fixture_sample_product_with_variants(seeded_session, sample_category):
    """Create a sample product with variants for testing."""
    from app.models.product import Product, ProductVariant
    from app.models.enums import ProductStatus

    product = Product(
        category_id=sample_category.id,
        sku="TEST-VAR-001",
        name="Variant Ürün",
        slug="variant-urun",
        short_description="Varyantlı test ürün",
        long_description="<p>Varyantlı test ürün detay</p>",
        price=200.00,
        vat_rate=18.00,
        status=ProductStatus.PUBLISHED,
        has_variants=True,
        stock=None,
    )
    seeded_session.add(product)
    seeded_session.flush()

    variants = [
        ProductVariant(
            product_id=product.id,
            sku="TEST-VAR-001-RED-M",
            color="Kırmızı",
            size="M",
            stock=20,
            min_stock_level=3,
        ),
        ProductVariant(
            product_id=product.id,
            sku="TEST-VAR-001-BLUE-L",
            color="Mavi",
            size="L",
            stock=15,
            min_stock_level=3,
        ),
    ]
    for v in variants:
        seeded_session.add(v)
    seeded_session.flush()

    return product, variants


@pytest.fixture(name="sample_user")
def fixture_sample_user(seeded_session):
    """Create a sample customer user for testing."""
    from app.models.user import User
    from sqlmodel import select
    from app.models.rbac import Role

    customer_role = seeded_session.exec(
        select(Role).where(Role.name == "customer")
    ).one()

    user = User(
        name="Test Müşteri",
        email="test@example.com",
        password_hash="hashed_password_placeholder",
        role_id=customer_role.id,
    )
    seeded_session.add(user)
    seeded_session.flush()
    return user


@pytest.fixture(name="sample_cart")
def fixture_sample_cart(seeded_session, sample_user, sample_product):
    """Create a cart with items for order creation tests."""
    from app.models.cart import Cart, CartItem

    cart = Cart(user_id=sample_user.id)
    seeded_session.add(cart)
    seeded_session.flush()

    item = CartItem(
        cart_id=cart.id,
        product_id=sample_product.id,
        variant_id=None,
        quantity=2,
    )
    seeded_session.add(item)
    seeded_session.flush()

    return cart
