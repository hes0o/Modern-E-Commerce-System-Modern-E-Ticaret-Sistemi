"""
Seeds package — database seed runner.

Run all seeds: python -m app.seeds
"""

from sqlmodel import Session

from app.database import engine
from app.seeds.rbac_seed import seed_rbac
from app.seeds.user_seed import seed_users


def run_all_seeds() -> None:
    """Execute all seed functions in dependency order."""
    with Session(engine) as session:
        print("🌱 Seeding RBAC (roles, permissions, mappings)...")
        role_ids = seed_rbac(session)
        print(f"   ✅ Roles created/verified: {list(role_ids.keys())}")

        print("🌱 Seeding default admin/personnel users...")
        seed_users(session, role_ids)
        print("   ✅ Default users created/verified:")
        print("      admin@example.com / Admin123! (admin)")
        print("      employee@example.com / Emp123! (personnel)")

        print("\n🎉 All seeds completed successfully!")


if __name__ == "__main__":
    run_all_seeds()