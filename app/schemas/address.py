from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AddressCreate(BaseModel):
    title: str = Field(min_length=2, max_length=100)
    recipient_name: str = Field(
        min_length=2,
        max_length=150,
    )
    phone: str = Field(min_length=10, max_length=20)
    city: str = Field(min_length=2, max_length=100)
    district: str = Field(min_length=2, max_length=100)
    full_address: str = Field(
        min_length=5,
        max_length=1000,
    )
    postal_code: str | None = Field(
        default=None,
        max_length=10,
    )
    is_default: bool = False


class AddressUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )
    recipient_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )
    phone: str | None = Field(
        default=None,
        min_length=10,
        max_length=20,
    )
    city: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )
    district: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )
    full_address: str | None = Field(
        default=None,
        min_length=5,
        max_length=1000,
    )
    postal_code: str | None = Field(
        default=None,
        max_length=10,
    )
    is_default: bool | None = None


class AddressResponse(BaseModel):
    id: int
    title: str
    recipient_name: str
    phone: str
    city: str
    district: str
    full_address: str
    postal_code: str | None
    is_default: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)