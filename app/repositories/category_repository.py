from sqlmodel import Session, col, select

from app.models.category import Category


def get_categories(
    session: Session,
    *,
    active_only: bool = True,
) -> list[Category]:
    statement = select(Category)

    if active_only:
        statement = statement.where(
            col(Category.is_active).is_(True),
        )

    statement = statement.order_by(
        col(Category.sort_order),
        col(Category.name),
    )

    return list(session.exec(statement).all())


def get_category_by_id(
    session: Session,
    category_id: int,
) -> Category | None:
    return session.get(Category, category_id)


def get_category_by_slug(
    session: Session,
    slug: str,
) -> Category | None:
    statement = select(Category).where(
        col(Category.slug) == slug,
    )
    return session.exec(statement).first()


def create_category(
    session: Session,
    category: Category,
) -> Category:
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


def update_category(
    session: Session,
    category: Category,
) -> Category:
    session.add(category)
    session.commit()
    session.refresh(category)
    return category
    