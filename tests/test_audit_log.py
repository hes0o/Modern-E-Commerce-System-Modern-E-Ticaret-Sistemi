"""
Tests for audit logging system (SRS §16.4, §17.18).

Verifies:
- Audit entries are created with correct data
- audit_change context manager captures before/after state
- Convenience logging functions work correctly

Note: Database-level protection (preventing UPDATE/DELETE on audit_logs)
can only be tested against PostgreSQL, not SQLite. Those tests should
be run as integration tests with TEST_DATABASE_URL pointing to Postgres.
"""

from sqlmodel import Session, select

from app.models.audit import AuditLog
from app.models.enums import PaymentMethod
from app.models.product import Product
from app.schemas.product import ProductUpdate
from app.schemas.stock import StockUpdateRequest
from app.services.audit_service import (
    audit_change,
    log_action,
    log_order_status_change,
    log_price_change,
    log_role_change,
)
from app.services.order_service import create_order
from app.services.product_service import update_existing_product
from app.services.stock_api_service import update_stock


class TestLogAction:
    """Test the core log_action function."""

    def test_creates_audit_entry(self, seeded_session: Session):
        """log_action should create a new AuditLog record."""
        entry = log_action(
            seeded_session,
            user_id=None,
            action="test.action",
            entity_type="test",
            entity_id=1,
            old_value={"key": "old"},
            new_value={"key": "new"},
            ip_address="127.0.0.1",
        )
        seeded_session.flush()

        assert entry.id is not None
        assert entry.action == "test.action"
        assert entry.entity_type == "test"
        assert entry.entity_id == 1
        assert entry.old_value == {"key": "old"}
        assert entry.new_value == {"key": "new"}
        assert entry.ip_address == "127.0.0.1"

    def test_audit_entry_has_created_at(self, seeded_session: Session):
        """Audit entries should have a timestamp."""
        entry = log_action(
            seeded_session,
            user_id=None,
            action="test.timestamp",
            entity_type="test",
            entity_id=1,
        )
        seeded_session.flush()

        assert entry.created_at is not None

    def test_null_values_allowed(self, seeded_session: Session):
        """old_value, new_value, user_id, ip_address can all be null."""
        entry = log_action(
            seeded_session,
            user_id=None,
            action="test.nullable",
            entity_type="test",
            entity_id=1,
        )
        seeded_session.flush()

        assert entry.user_id is None
        assert entry.old_value is None
        assert entry.new_value is None
        assert entry.ip_address is None


class TestAuditChangeContextManager:
    """Test the audit_change context manager for auto before/after capture."""

    def test_captures_price_change(
        self, seeded_session: Session, sample_product: Product
    ):
        """Context manager should log old and new price values."""
        with audit_change(
            seeded_session,
            instance=sample_product,
            action="product.price_updated",
            user_id=None,
            tracked_fields=["price", "discount_price"],
        ):
            sample_product.price = 150.00
            sample_product.discount_price = 120.00
            seeded_session.add(sample_product)

        seeded_session.flush()

        entries = seeded_session.exec(
            select(AuditLog).where(AuditLog.action == "product.price_updated")
        ).all()

        assert len(entries) == 1
        assert entries[0].old_value["price"] == 100.00
        assert entries[0].new_value["price"] == 150.00

    def test_no_log_if_nothing_changed(
        self, seeded_session: Session, sample_product: Product
    ):
        """No audit entry should be created if values didn't change."""
        with audit_change(
            seeded_session,
            instance=sample_product,
            action="product.price_updated",
            user_id=None,
            tracked_fields=["price"],
        ):
            pass  # No changes made

        seeded_session.flush()

        entries = seeded_session.exec(
            select(AuditLog).where(AuditLog.action == "product.price_updated")
        ).all()

        assert len(entries) == 0


class TestConvenienceFunctions:
    """Test specialized audit logging helper functions."""

    def test_log_order_status_change(self, seeded_session: Session):
        """Should create entry with correct order status values."""
        entry = log_order_status_change(
            seeded_session,
            order_id=42,
            old_status="pending",
            new_status="confirmed",
            user_id=1,
        )
        seeded_session.flush()

        assert entry.action == "order.status_updated"
        assert entry.entity_type == "orders"
        assert entry.entity_id == 42
        assert entry.old_value == {"status": "pending"}
        assert entry.new_value == {"status": "confirmed"}

    def test_log_price_change(self, seeded_session: Session):
        """Should create entry with old and new pricing."""
        entry = log_price_change(
            seeded_session,
            product_id=10,
            old_price=100.0,
            new_price=80.0,
            old_discount=None,
            new_discount=65.0,
            user_id=1,
        )
        seeded_session.flush()

        assert entry.action == "product.price_updated"
        assert entry.old_value == {"price": 100.0, "discount_price": None}
        assert entry.new_value == {"price": 80.0, "discount_price": 65.0}

    def test_log_role_change(self, seeded_session: Session):
        """Should create entry with old and new role IDs."""
        entry = log_role_change(
            seeded_session,
            target_user_id=5,
            old_role_id=3,
            new_role_id=2,
            changed_by_user_id=1,
        )
        seeded_session.flush()

        assert entry.action == "user.role_changed"
        assert entry.entity_type == "users"
        assert entry.entity_id == 5
        assert entry.old_value == {"role_id": 3}
        assert entry.new_value == {"role_id": 2}
        assert entry.user_id == 1  # The admin who made the change


class TestAuditLogImmutability:
    """
    Test append-only semantics at the application level.

    Note: Database-level protection (PostgreSQL rules) can only be
    tested in integration tests against a real PostgreSQL instance.
    """

    def test_audit_model_has_no_updated_at(self):
        """AuditLog should not have an updated_at column."""
        columns = {c.name for c in AuditLog.__table__.columns}
        assert "created_at" in columns
        assert "updated_at" not in columns

class TestAuditServiceIntegrations:
    """Critical services should automatically create audit entries."""

    def test_order_creation_is_audited(
        self,
        seeded_session: Session,
        sample_cart,
        sample_user,
    ):
        order = create_order(
            seeded_session,
            cart_id=sample_cart.id,
            user_id=sample_user.id,
            shipping_address_snapshot={"city": "Elazığ"},
            payment_method=PaymentMethod.COD,
            contract_version_accepted="v1.0",
        )
        seeded_session.flush()

        entry = seeded_session.exec(
            select(AuditLog).where(
                AuditLog.action == "order.created",
                AuditLog.entity_id == order.id,
            )
        ).one()

        assert entry.user_id == sample_user.id
        assert entry.new_value["status"] == "pending"
        assert entry.new_value["order_number"] == order.order_number

    def test_product_price_update_is_audited(
        self,
        seeded_session: Session,
        sample_product: Product,
        sample_user,
    ):
        update_existing_product(
            seeded_session,
            sample_product.id,
            ProductUpdate(price=125.0, discount_price=110.0),
            changed_by_user_id=sample_user.id,
        )

        entry = seeded_session.exec(
            select(AuditLog).where(
                AuditLog.action == "product.price_updated",
                AuditLog.entity_id == sample_product.id,
            )
        ).one()

        assert entry.user_id == sample_user.id
        assert entry.old_value["price"] == 100.0
        assert entry.new_value["price"] == 125.0
        assert entry.new_value["discount_price"] == 110.0

    def test_manual_stock_update_is_audited(
        self,
        seeded_session: Session,
        sample_product: Product,
        sample_user,
    ):
        update_stock(
            seeded_session,
            product_id=sample_product.id,
            user_id=sample_user.id,
            payload=StockUpdateRequest(
                operation="in",
                quantity=3,
                note="Audit integration test",
            ),
        )

        entry = seeded_session.exec(
            select(AuditLog).where(
                AuditLog.action == "stock.in",
                AuditLog.entity_id.is_not(None),
            )
        ).one()

        assert entry.user_id == sample_user.id
        assert entry.old_value["stock"] == 50
        assert entry.new_value["stock"] == 53
        assert entry.new_value["product_id"] == sample_product.id