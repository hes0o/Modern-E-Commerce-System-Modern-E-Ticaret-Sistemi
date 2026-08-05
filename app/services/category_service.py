import re
import unicodedata

from sqlmodel import Session

from app.core.exceptions import (
    BusinessRuleError,
    ConflictError,
    NotFoundError,
)
from app.models.category import Category
from app.repositories.category_repository import (
    create_category as save_new_category,
)
from app.repositories.category_repository import (
    get_categories,
    get_category_by_id,
    get_category_by_slug,
)
from app.repositories.category_repository import (
    update_category as save_category,
)
from app.schemas.category import CategoryCreate, CategoryUpdate

TURKISH_CHARACTER_MAP = str.maketrans(
    {
        "ç": "c",
        "Ç": "c",
        "ğ": "g",
        "Ğ": "g",
        "ı": "i",
        "İ": "i",
        "ö": "o",
        "Ö": "o",
        "ş": "s",
        "Ş": "s",
        "ü": "u",
        "Ü": "u",
    }
)


def create_slug(value: str) -> str:
    value = value.translate(TURKISH_CHARACTER_MAP)
    value = unicodedata.normalize("NFKD", value)
    value = value.encode("ascii", "ignore").decode("ascii")
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def list_categories(
    session: Session,
    *,
    active_only: bool = True,
) -> list[Category]:
    return get_categories(
        session,
        active_only=active_only,
    )


def get_category(
    session: Session,
    category_id: int,
) -> Category:
    category = get_category_by_id(session, category_id)

    if category is None:
        raise NotFoundError("Kategori bulunamadı.")

    return category


def validate_parent(
    session: Session,
    parent_id: int | None,
    *,
    current_category_id: int | None = None,
) -> None:
    if parent_id is None:
        return

    if parent_id == current_category_id:
        raise BusinessRuleError(
            "Bir kategori kendisinin üst kategorisi olamaz."
        )

    parent = get_category_by_id(session, parent_id)

    if parent is None:
        raise NotFoundError("Üst kategori bulunamadı.")

    visited_ids: set[int] = set()

    while parent is not None:
        if parent.id == current_category_id:
            raise BusinessRuleError(
                "Alt kategori üst kategori olarak seçilemez."
            )

        if parent.id is None or parent.id in visited_ids:
            break

        visited_ids.add(parent.id)

        if parent.parent_id is None:
            break

        parent = get_category_by_id(
            session,
            parent.parent_id,
        )


def ensure_slug_is_available(
    session: Session,
    slug: str,
    *,
    current_category_id: int | None = None,
) -> None:
    existing_category = get_category_by_slug(session, slug)

    if (
        existing_category is not None
        and existing_category.id != current_category_id
    ):
        raise ConflictError(
            "Bu kategori bağlantı adı zaten kullanılıyor."
        )


def create_new_category(
    session: Session,
    category_data: CategoryCreate,
) -> Category:
    validate_parent(
        session,
        category_data.parent_id,
    )

    slug = create_slug(
        category_data.slug or category_data.name,
    )

    if not slug:
        raise BusinessRuleError(
            "Geçerli bir kategori bağlantı adı oluşturulamadı."
        )

    ensure_slug_is_available(session, slug)

    category = Category(
        name=category_data.name.strip(),
        slug=slug,
        parent_id=category_data.parent_id,
        image_path=category_data.image_path,
        sort_order=category_data.sort_order,
        seo_title=category_data.seo_title,
        seo_description=category_data.seo_description,
        is_active=category_data.is_active,
    )

    return save_new_category(session, category)


def update_existing_category(
    session: Session,
    category_id: int,
    category_data: CategoryUpdate,
) -> Category:
    category = get_category(session, category_id)
    update_data = category_data.model_dump(
        exclude_unset=True,
    )

    if "parent_id" in update_data:
        validate_parent(
            session,
            update_data["parent_id"],
            current_category_id=category_id,
        )

    if "slug" in update_data:
        requested_slug = update_data["slug"]

        if requested_slug is None:
            update_data.pop("slug")
        else:
            slug = create_slug(requested_slug)

            if not slug:
                raise BusinessRuleError(
                    "Geçerli bir kategori bağlantı adı oluşturulamadı."
                )

            ensure_slug_is_available(
                session,
                slug,
                current_category_id=category_id,
            )
            update_data["slug"] = slug

    if "name" in update_data:
        update_data["name"] = update_data["name"].strip()

    for field_name, value in update_data.items():
        setattr(category, field_name, value)

    return save_category(session, category)


def deactivate_category(
    session: Session,
    category_id: int,
) -> Category:
    category = get_category(session, category_id)
    category.is_active = False
    return save_category(session, category)