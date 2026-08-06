from sqlmodel import Session

from app.core.exceptions import NotFoundError
from app.models.address import Address
from app.models.user import User
from app.repositories.address_repository import (
    delete_address,
    get_address_by_id_and_user_id,
    get_addresses_by_user_id,
    save_address,
    save_addresses,
)
from app.schemas.address import (
    AddressCreate,
    AddressUpdate,
)


def list_user_addresses(
    session: Session,
    current_user: User,
) -> list[Address]:
    return get_addresses_by_user_id(
        session,
        current_user.id,
    )


def get_user_address(
    session: Session,
    *,
    current_user: User,
    address_id: int,
) -> Address:
    address = get_address_by_id_and_user_id(
        session,
        address_id=address_id,
        user_id=current_user.id,
    )

    if address is None:
        raise NotFoundError(
            "Adres bulunamadı."
        )

    return address


def remove_default_from_other_addresses(
    addresses: list[Address],
    *,
    excluded_address_id: int | None = None,
) -> list[Address]:
    changed_addresses: list[Address] = []

    for address in addresses:
        if (
            address.id != excluded_address_id
            and address.is_default
        ):
            address.is_default = False
            changed_addresses.append(address)

    return changed_addresses


def create_new_address(
    session: Session,
    *,
    current_user: User,
    address_data: AddressCreate,
) -> Address:
    existing_addresses = get_addresses_by_user_id(
        session,
        current_user.id,
    )

    should_be_default = (
        address_data.is_default
        or not existing_addresses
    )

    changed_addresses: list[Address] = []

    if should_be_default:
        changed_addresses = (
            remove_default_from_other_addresses(
                existing_addresses
            )
        )

    address = Address(
        user_id=current_user.id,
        title=address_data.title.strip(),
        recipient_name=(
            address_data.recipient_name.strip()
        ),
        phone=address_data.phone.strip(),
        city=address_data.city.strip(),
        district=address_data.district.strip(),
        full_address=address_data.full_address.strip(),
        postal_code=(
            address_data.postal_code.strip()
            if address_data.postal_code
            else None
        ),
        is_default=should_be_default,
    )

    save_addresses(
        session,
        [*changed_addresses, address],
    )
    session.refresh(address)
    return address


def update_existing_address(
    session: Session,
    *,
    current_user: User,
    address_id: int,
    address_data: AddressUpdate,
) -> Address:
    address = get_user_address(
        session,
        current_user=current_user,
        address_id=address_id,
    )
    update_data = address_data.model_dump(
        exclude_unset=True,
    )
    all_addresses = get_addresses_by_user_id(
        session,
        current_user.id,
    )
    changed_addresses: list[Address] = []

    if update_data.get("is_default") is True:
        changed_addresses = (
            remove_default_from_other_addresses(
                all_addresses,
                excluded_address_id=address.id,
            )
        )

    if (
        update_data.get("is_default") is False
        and address.is_default
    ):
        other_address = next(
            (
                item
                for item in all_addresses
                if item.id != address.id
            ),
            None,
        )

        if other_address is not None:
            other_address.is_default = True
            changed_addresses.append(other_address)
        else:
            update_data["is_default"] = True

    text_fields = {
        "title",
        "recipient_name",
        "phone",
        "city",
        "district",
        "full_address",
        "postal_code",
    }

    for field_name, value in update_data.items():
        if (
            field_name in text_fields
            and isinstance(value, str)
        ):
            value = value.strip()

        setattr(address, field_name, value)

    save_addresses(
        session,
        [*changed_addresses, address],
    )
    session.refresh(address)
    return address


def delete_existing_address(
    session: Session,
    *,
    current_user: User,
    address_id: int,
) -> None:
    address = get_user_address(
        session,
        current_user=current_user,
        address_id=address_id,
    )
    was_default = address.is_default

    delete_address(session, address)

    if not was_default:
        return

    remaining_addresses = get_addresses_by_user_id(
        session,
        current_user.id,
    )

    if remaining_addresses:
        remaining_addresses[0].is_default = True
        save_address(
            session,
            remaining_addresses[0],
        )