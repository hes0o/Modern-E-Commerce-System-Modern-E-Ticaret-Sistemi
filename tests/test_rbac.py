"""
Tests for RBAC seed data and permission logic (SRS §3).

Verifies that roles, permissions, and mappings are correctly
created and follow the role-yetki matrix from the SRS.
"""

import pytest
from sqlmodel import Session, select

from app.models.rbac import Permission, Role, RolePermission
from app.seeds.rbac_seed import (
    ADMIN_PERMISSIONS,
    CUSTOMER_PERMISSIONS,
    PERMISSIONS,
    PERSONNEL_PERMISSIONS,
    ROLES,
    seed_rbac,
)


class TestRBACSeeding:
    """Test that seed data is correctly created."""

    def test_all_roles_created(self, seeded_session: Session):
        """All 3 roles should exist after seeding."""
        roles = seeded_session.exec(select(Role)).all()
        role_names = {r.name for r in roles}
        assert role_names == {"admin", "personnel", "customer"}

    def test_all_permissions_created(self, seeded_session: Session):
        """All defined permissions should exist after seeding."""
        permissions = seeded_session.exec(select(Permission)).all()
        perm_names = {p.name for p in permissions}
        expected = {p["name"] for p in PERMISSIONS}
        assert perm_names == expected

    def test_admin_has_all_permissions(self, seeded_session: Session):
        """Admin role should have every permission."""
        admin = seeded_session.exec(
            select(Role).where(Role.name == "admin")
        ).one()

        mappings = seeded_session.exec(
            select(RolePermission).where(RolePermission.role_id == admin.id)
        ).all()

        all_perms = seeded_session.exec(select(Permission)).all()
        assert len(mappings) == len(all_perms)

    def test_personnel_has_subset(self, seeded_session: Session):
        """Personnel should have only the defined subset of permissions."""
        personnel = seeded_session.exec(
            select(Role).where(Role.name == "personnel")
        ).one()

        mappings = seeded_session.exec(
            select(RolePermission).where(RolePermission.role_id == personnel.id)
        ).all()
        perm_ids = {m.permission_id for m in mappings}

        # Resolve expected permission IDs
        expected_perms = seeded_session.exec(
            select(Permission).where(
                Permission.name.in_(PERSONNEL_PERMISSIONS)  # type: ignore
            )
        ).all()
        expected_ids = {p.id for p in expected_perms}

        assert perm_ids == expected_ids

    def test_customer_has_no_admin_permissions(self, seeded_session: Session):
        """Customer role should have zero admin permissions."""
        customer = seeded_session.exec(
            select(Role).where(Role.name == "customer")
        ).one()

        mappings = seeded_session.exec(
            select(RolePermission).where(RolePermission.role_id == customer.id)
        ).all()

        assert len(mappings) == 0

    def test_seeding_is_idempotent(self, seeded_session: Session):
        """Running seed twice should not create duplicate records."""
        # First seed already happened in fixture; run again
        seed_rbac(seeded_session)

        roles = seeded_session.exec(select(Role)).all()
        assert len(roles) == len(ROLES)

        permissions = seeded_session.exec(select(Permission)).all()
        assert len(permissions) == len(PERMISSIONS)


class TestPermissionCoverage:
    """Verify that permission names follow conventions and cover all modules."""

    def test_permission_naming_convention(self):
        """All permissions should follow 'module.action' format."""
        for perm in PERMISSIONS:
            parts = perm["name"].split(".")
            assert len(parts) == 2, f"Permission '{perm['name']}' doesn't follow module.action format"

    def test_crud_modules_have_full_coverage(self):
        """Modules with CRUD operations should have create/read/update/delete."""
        crud_modules = ["product", "category", "brand"]
        perm_names = {p["name"] for p in PERMISSIONS}

        for module in crud_modules:
            for action in ["create", "read", "update", "delete"]:
                expected = f"{module}.{action}"
                assert expected in perm_names, f"Missing permission: {expected}"

    def test_personnel_cannot_manage_settings(self):
        """Personnel should NOT have settings permissions (SRS §3.2)."""
        assert "settings.read" not in PERSONNEL_PERMISSIONS
        assert "settings.update" not in PERSONNEL_PERMISSIONS

    def test_personnel_cannot_assign_roles(self):
        """Personnel should NOT be able to assign roles (SRS §3.2)."""
        assert "user.assign_role" not in PERSONNEL_PERMISSIONS
        assert "user.create" not in PERSONNEL_PERMISSIONS
