from typing import Optional, Union, Any
from sqlmodel import Session, col, select

from app.models.address import Address


def get_addresses_by_user_id(
    session: Session,
    user_id: int,
) -> list[Address]:
    statement = (
        select(Address)
        .where(col(Address.user_id) == user_id)
        .order_by(
            col(Address.is_default).desc(),
            col(Address.created_at).desc(),
        )
    )
    return list(session.exec(statement).all())


def get_address_by_id_and_user_id(
    session: Session,
    *,
    address_id: int,
    user_id: int,
) -> Optional[Address]:
    statement = select(Address).where(
        col(Address.id) == address_id,
        col(Address.user_id) == user_id,
    )
    return session.exec(statement).first()


def save_address(
    session: Session,
    address: Address,
) -> Address:
    session.add(address)
    session.commit()
    session.refresh(address)
    return address


def save_addresses(
    session: Session,
    addresses: list[Address],
) -> None:
    for address in addresses:
        session.add(address)

    session.commit()


def delete_address(
    session: Session,
    address: Address,
) -> None:
    session.delete(address)
    session.commit()