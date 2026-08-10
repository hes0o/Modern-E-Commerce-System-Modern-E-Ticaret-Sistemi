from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class EmailTestRequest(BaseModel):
    recipient: EmailStr

class SettingCreate(BaseModel):
    key: str = Field(
        min_length=2,
        max_length=100,
        pattern=r"^[a-z0-9_.-]+$",
    )
    value: str | None = Field(default=None, max_length=5000)
    group: str | None = Field(default=None, max_length=50)


class SettingUpdate(BaseModel):
    value: str | None = Field(default=None, max_length=5000)
    group: str | None = Field(default=None, max_length=50)


class SettingResponse(BaseModel):
    id: int
    key: str
    value: str | None
    group: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)