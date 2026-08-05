from typing import Generic, TypeVar

from pydantic import BaseModel, Field

DataType = TypeVar("DataType")


class ErrorDetail(BaseModel):
    field: str | None = None
    message: str


class ApiResponse(BaseModel, Generic[DataType]):
    success: bool
    data: DataType | None = None
    message: str | None = None
    errors: list[ErrorDetail] = Field(
        default_factory=list
    )