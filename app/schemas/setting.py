from typing import Optional, Union, Any
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SettingCreate(BaseModel):
    key: str = Field(
        min_length=2,
        max_length=100,
        pattern=r"^[a-z0-9_.-]+$",
    )
    value: Optional[str] = Field(default=None, max_length=5000)
    group: Optional[str] = Field(default=None, max_length=50)


class SettingUpdate(BaseModel):
    value: Optional[str] = Field(default=None, max_length=5000)
    group: Optional[str] = Field(default=None, max_length=50)


class SettingResponse(BaseModel):
    id: int
    key: str
    value: Optional[str]
    group: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)