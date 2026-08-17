from sqlmodel import Session, select
from app.database import engine
from app.seeds.user_seed import seed_users
from app.models.role import Role

with Session(engine) as session:
    roles = session.exec(select(Role)).all()
    role_ids = {role.name: role.id for role in roles}
    seed_users(session, role_ids)
    print("Seeded successfully")
