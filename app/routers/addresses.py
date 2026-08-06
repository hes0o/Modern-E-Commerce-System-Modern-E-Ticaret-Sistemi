from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.dependencies import get_current_user
from app.database import get_session
from app.models.user import User
from app.schemas.address import (
    AddressCreate,
    AddressResponse,
    AddressUpdate,
)
from app.schemas.common import ApiResponse
from app.services.address_service import (
    create_new_address,
    delete_existing_address,
    get_user_address,
    list_user_addresses,
    update_existing_address,
)

router = APIRouter(
    prefix="/api/addresses",
    tags=["Addresses"],
)


def create_address_response(
    address: object,
) -> AddressResponse:
    return AddressResponse.model_validate(address)


@router.get(
    "",
    response_model=ApiResponse[list[AddressResponse]],
)
def get_address_list(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
) -> ApiResponse[list[AddressResponse]]:
    addresses = list_user_addresses(
        session,
        current_user,
    )

    return ApiResponse(
        success=True,
        data=[
            create_address_response(address)
            for address in addresses
        ],
        message="Adresler getirildi.",
    )


@router.get(
    "/{address_id}",
    response_model=ApiResponse[AddressResponse],
)
def get_address_detail(
    address_id: int,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
) -> ApiResponse[AddressResponse]:
    address = get_user_address(
        session,
        current_user=current_user,
        address_id=address_id,
    )

    return ApiResponse(
        success=True,
        data=create_address_response(address),
        message="Adres getirildi.",
    )


@router.post(
    "",
    response_model=ApiResponse[AddressResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_address(
    address_data: AddressCreate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
) -> ApiResponse[AddressResponse]:
    address = create_new_address(
        session,
        current_user=current_user,
        address_data=address_data,
    )

    return ApiResponse(
        success=True,
        data=create_address_response(address),
        message="Adres başarıyla oluşturuldu.",
    )


@router.put(
    "/{address_id}",
    response_model=ApiResponse[AddressResponse],
)
def update_address(
    address_id: int,
    address_data: AddressUpdate,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
) -> ApiResponse[AddressResponse]:
    address = update_existing_address(
        session,
        current_user=current_user,
        address_id=address_id,
        address_data=address_data,
    )

    return ApiResponse(
        success=True,
        data=create_address_response(address),
        message="Adres başarıyla güncellendi.",
    )


@router.delete(
    "/{address_id}",
    response_model=ApiResponse[None],
)
def delete_address(
    address_id: int,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
) -> ApiResponse[None]:
    delete_existing_address(
        session,
        current_user=current_user,
        address_id=address_id,
    )

    return ApiResponse(
        success=True,
        data=None,
        message="Adres başarıyla silindi.",
    )