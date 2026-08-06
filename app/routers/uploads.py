from typing import Annotated

from fastapi import APIRouter, Depends, File, UploadFile, status

from app.core.dependencies import require_admin
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.upload import ImageUploadResponse
from app.services.file_storage_service import (
    UploadFolder,
    save_image,
)

router = APIRouter(
    prefix="/api/uploads",
    tags=["Uploads"],
)


@router.post(
    "/images/{folder}",
    response_model=ApiResponse[ImageUploadResponse],
    status_code=status.HTTP_201_CREATED,
)
async def upload_image(
    folder: UploadFolder,
    file: Annotated[UploadFile, File()],
    _admin: Annotated[User, Depends(require_admin)],
) -> ApiResponse[ImageUploadResponse]:
    image_path = await save_image(
        file,
        folder=folder,
    )

    return ApiResponse(
        success=True,
        data=ImageUploadResponse(
            image_path=image_path,
        ),
        message="Görsel başarıyla yüklendi.",
    )