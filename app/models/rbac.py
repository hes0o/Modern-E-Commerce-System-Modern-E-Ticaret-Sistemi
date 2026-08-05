"""
Role-Based Access Control (RBAC) models (SRS §3, §17.3).

Implements a flexible many-to-many relationship between roles and permissions.
The `RolePermission` junction table allows granular permission assignment,
supporting the future expansion of sub-roles under the Personnel category
(e.g., "Sipariş Sorumlusu", "Stok Sorumlusu").
"""

from typing import Optional, List

from sqlmodel import Field, Relationship, SQLModel

from app.models.base import TimestampMixin


class RolePermission(SQLModel, table=True):
    """Junction table linking roles to permissions (many-to-many)."""

    __tablename__ = "role_permission"

    role_id: int = Field(foreign_key="roles.id", primary_key=True)
    permission_id: int = Field(foreign_key="permissions.id", primary_key=True)


class Role(TimestampMixin, table=True):
    """
    User role definition (e.g., admin, personnel, customer).

    Each user is assigned exactly one role. The role determines which
    permissions the user holds, via the role_permission junction table.
    """

    __tablename__ = "roles"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, unique=True, index=True)
    description: Optional[str] = Field(default=None, max_length=255)

    # Relationships
    permissions: List["Permission"] = Relationship(
        back_populates="roles",
        link_model=RolePermission,
    )
    users: List["User"] = Relationship(back_populates="role")  # type: ignore[name-defined]  # noqa: F821


class Permission(TimestampMixin, table=True):
    """
    Granular permission definition (e.g., "product.create", "order.update_status").

    Permissions are assigned to roles, not directly to users. This keeps the
    authorization model clean and auditable.
    """

    __tablename__ = "permissions"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, unique=True, index=True)
    description: Optional[str] = Field(default=None, max_length=255)

    # Relationships
    roles: List[Role] = Relationship(
        back_populates="permissions",
        link_model=RolePermission,
    )
