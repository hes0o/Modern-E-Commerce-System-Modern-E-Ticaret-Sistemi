from typing import Optional, Union, Any
from typing import Generic, TypeVar

from pydantic import BaseModel, Field

DataType = TypeVar("DataType")


class ErrorDetail(BaseModel):
    field: Optional[str] = None
    message: str


class ApiResponse(BaseModel, Generic[DataType]):
    success: bool
    data: Optional[DataType] = None
    message: Optional[str] = None
    errors: list[ErrorDetail] = Field(
        default_factory=list
    )