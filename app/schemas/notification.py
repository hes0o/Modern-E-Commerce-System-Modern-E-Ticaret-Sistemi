from typing import Optional, Union, Any
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class NotificationCreate(BaseModel):
    type: str = Field(min_length=2, max_length=50)
    title: str = Field(min_length=2, max_length=200)
    message: str = Field(min_length=2)
    related_entity_type: Optional[str] = Field(
        default=None,
        max_length=50,
    )
    related_entity_id: Optional[int] = Field(default=None, gt=0)
    recipient_user_id: Optional[int] = Field(default=None, gt=0)


class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    related_entity_type: Optional[str]
    related_entity_id: Optional[int]
    is_read: bool
    recipient_user_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationListResponse(BaseModel):
    items: list[NotificationResponse]
    total: int
    unread_count: int