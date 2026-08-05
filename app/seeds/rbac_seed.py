"""
RBAC seed data (SRS §3).

Populates roles, permissions, and role-permission mappings.
Designed to be idempotent — safe to run multiple times.
"""

from typing import List, Dict

from sqlmodel import Session, select

from app.models.rbac import Permission, Role, RolePermission


# ──────────────────────────────────────────────────────────────
# Role definitions
# ──────────────────────────────────────────────────────────────

ROLES = [
    {"name": "admin", "description": "Full system access — all modules and settings"},
    {"name": "personnel", "description": "Limited module access — assigned per user by admin"},
    {"name": "customer", "description": "Registered customer — frontend operations only"},
]

# ──────────────────────────────────────────────────────────────
# Permission definitions (module.action format)
# ──────────────────────────────────────────────────────────────

PERMISSIONS = [
    # Product management
    {"name": "product.create", "description": "Create new products"},
    {"name": "product.read", "description": "View product listings and details (admin)"},
    {"name": "product.update", "description": "Edit product information and pricing"},
    {"name": "product.delete", "description": "Archive/soft-delete products"},
    # Category management
    {"name": "category.create", "description": "Create new categories"},
    {"name": "category.read", "description": "View category tree (admin)"},
    {"name": "category.update", "description": "Edit category details and ordering"},
    {"name": "category.delete", "description": "Delete/deactivate categories"},
    # Order management
    {"name": "order.read", "description": "View order listings and details"},
    {"name": "order.update_status", "description": "Change order status"},
    {"name": "order.cancel", "description": "Cancel orders"},
    {"name": "order.add_note", "description": "Add admin notes to orders"},
    {"name": "order.update_tracking", "description": "Update shipping tracking number"},
    # Stock management
    {"name": "stock.read", "description": "View stock levels and movements"},
    {"name": "stock.update", "description": "Perform manual stock in/out/adjustment"},
    # Customer management
    {"name": "customer.read", "description": "View customer list and details"},
    {"name": "customer.update_status", "description": "Activate/deactivate customer accounts"},
    # Dashboard & reports
    {"name": "dashboard.read", "description": "View dashboard metrics"},
    {"name": "report.read", "description": "View reports"},
    {"name": "report.export", "description": "Export reports to Excel/PDF"},
    # Settings
    {"name": "settings.read", "description": "View system settings"},
    {"name": "settings.update", "description": "Modify system settings"},
    # User/personnel management
    {"name": "user.create", "description": "Create admin/personnel accounts"},
    {"name": "user.read", "description": "View admin/personnel list"},
    {"name": "user.update", "description": "Edit admin/personnel accounts"},
    {"name": "user.assign_role", "description": "Assign roles to users"},
    # Notifications
    {"name": "notification.read", "description": "View panel notifications"},
    {"name": "notification.update", "description": "Mark notifications as read"},
    # Brand management
    {"name": "brand.create", "description": "Create new brands"},
    {"name": "brand.read", "description": "View brand list (admin)"},
    {"name": "brand.update", "description": "Edit brand details"},
    {"name": "brand.delete", "description": "Delete/deactivate brands"},
    # Audit logs
    {"name": "audit.read", "description": "View audit log entries"},
]

# ──────────────────────────────────────────────────────────────
# Default role → permission mappings
# ──────────────────────────────────────────────────────────────

# Admin gets ALL permissions
ADMIN_PERMISSIONS = [p["name"] for p in PERMISSIONS]

# Personnel gets a configurable subset (default: orders, stock, notifications)
PERSONNEL_PERMISSIONS = [
    "product.read",
    "category.read",
    "order.read",
    "order.update_status",
    "order.add_note",
    "order.update_tracking",
    "stock.read",
    "stock.update",
    "customer.read",
    "dashboard.read",
    "notification.read",
    "notification.update",
    "brand.read",
]

# Customer has NO admin permissions (frontend auth only)
CUSTOMER_PERMISSIONS: List[str] = []


def seed_rbac(session: Session) -> Dict[str, int]:
    """
    Seed roles, permissions, and role-permission mappings.

    Idempotent: skips records that already exist.

    Returns:
        Dict mapping role names to their IDs.
    """
    role_ids: Dict[str, int] = {}
    permission_ids: Dict[str, int] = {}

    # ── Seed Roles ──
    for role_data in ROLES:
        existing = session.exec(
            select(Role).where(Role.name == role_data["name"])
        ).first()
        if existing:
            role_ids[existing.name] = existing.id
        else:
            role = Role(**role_data)
            session.add(role)
            session.flush()
            role_ids[role.name] = role.id

    # ── Seed Permissions ──
    for perm_data in PERMISSIONS:
        existing = session.exec(
            select(Permission).where(Permission.name == perm_data["name"])
        ).first()
        if existing:
            permission_ids[existing.name] = existing.id
        else:
            perm = Permission(**perm_data)
            session.add(perm)
            session.flush()
            permission_ids[perm.name] = perm.id

    # ── Seed Role-Permission Mappings ──
    role_perm_map = {
        "admin": ADMIN_PERMISSIONS,
        "personnel": PERSONNEL_PERMISSIONS,
        "customer": CUSTOMER_PERMISSIONS,
    }

    for role_name, perm_names in role_perm_map.items():
        role_id = role_ids[role_name]
        for perm_name in perm_names:
            perm_id = permission_ids[perm_name]
            # Check if mapping already exists
            existing = session.exec(
                select(RolePermission).where(
                    RolePermission.role_id == role_id,
                    RolePermission.permission_id == perm_id,
                )
            ).first()
            if not existing:
                mapping = RolePermission(role_id=role_id, permission_id=perm_id)
                session.add(mapping)

    session.commit()
    return role_ids
