from typing import Optional, Union, Any
from io import BytesIO
from pathlib import Path
from typing import Literal
from uuid import uuid4

from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError

from app.core.exceptions import BusinessRuleError

MAX_FILE_SIZE = 5 * 1024 * 1024
MAX_IMAGE_PIXELS = 25_000_000

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": "JPEG",
    "image/png": "PNG",
    "image/webp": "WEBP",
}

FORMAT_EXTENSIONS = {
    "JPEG": ".jpg",
    "PNG": ".png",
    "WEBP": ".webp",
}

UploadFolder = Literal[
    "products",
    "categories",
    "brands",
]


async def save_image(
    file: UploadFile,
    *,
    folder: UploadFolder,
) -> str:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise BusinessRuleError(
            "Yalnızca JPEG, PNG ve WEBP görselleri yüklenebilir."
        )

    file_data = await file.read(MAX_FILE_SIZE + 1)
    await file.close()

    if not file_data:
        raise BusinessRuleError("Yüklenen görsel boş olamaz.")

    if len(file_data) > MAX_FILE_SIZE:
        raise BusinessRuleError(
            "Görsel boyutu en fazla 5 MB olabilir."
        )

    expected_format = ALLOWED_CONTENT_TYPES[file.content_type]

    try:
        with Image.open(BytesIO(file_data)) as image:
            image.verify()

        with Image.open(BytesIO(file_data)) as image:
            actual_format = image.format

            if actual_format != expected_format:
                raise BusinessRuleError(
                    "Dosya içeriği ile dosya türü uyuşmuyor."
                )

            width, height = image.size
            if width * height > MAX_IMAGE_PIXELS:
                raise BusinessRuleError(
                    "Görsel çözünürlüğü çok yüksek."
                )

            if actual_format == "JPEG" and image.mode != "RGB":
                image = image.convert("RGB")

            upload_root = Path("uploads").resolve()
            target_directory = (upload_root / folder).resolve()
            target_directory.mkdir(
                parents=True,
                exist_ok=True,
            )

            extension = FORMAT_EXTENSIONS[actual_format]
            safe_filename = f"{uuid4().hex}{extension}"
            destination = (target_directory / safe_filename).resolve()

            if upload_root not in destination.parents:
                raise BusinessRuleError(
                    "Geçersiz dosya yolu."
                )

            image.save(
                destination,
                format=actual_format,
            )

    except (
        UnidentifiedImageError,
        OSError,
        ValueError,
    ) as error:
        raise BusinessRuleError(
            "Geçerli bir görsel dosyası yüklenmelidir."
        ) from error

    return f"/uploads/{folder}/{safe_filename}"


def delete_stored_image(image_path: Optional[str]) -> None:
    if not image_path or not image_path.startswith("/uploads/"):
        return

    upload_root = Path("uploads").resolve()
    relative_path = image_path.removeprefix("/uploads/")
    destination = (upload_root / relative_path).resolve()

    if upload_root not in destination.parents:
        return

    if destination.is_file():
        destination.unlink()