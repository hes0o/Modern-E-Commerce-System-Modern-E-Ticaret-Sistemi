from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class NotificationCreate(BaseModel):
    type: str = Field(min_length=2, max_length=50)
    title: str = Field(min_length=2, max_length=200)
    message: str = Field(min_length=2)
    related_entity_type: str | None = Field(
        default=None,
        max_length=50,
    )
    related_entity_id: int | None = Field(default=None, gt=0)
    recipient_user_id: int | None = Field(default=None, gt=0)


class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    related_entity_type: str | None
    related_entity_id: int | None
    is_read: bool
    recipient_user_id: int | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationListResponse(BaseModel):
    items: list[NotificationResponse]
    total: int
    unread_count: int