from fastapi import APIRouter, Depends, UploadFile

from app.api.auth import get_current_user
from app.models import User
from app.schemas.profile import AvatarResponse, ProfileResponse, ProfileUpdate
from app.services.profile_service import ProfileService
from app.utils.errors import AppError
from app.utils.images import save_image

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=ProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(),
) -> ProfileResponse:
    return service.get_profile(current_user.id)


@router.put("", response_model=ProfileResponse)
def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(),
) -> ProfileResponse:
    return service.update_profile(current_user.id, data)


@router.post("/avatar", response_model=AvatarResponse)
async def upload_avatar(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
    service: ProfileService = Depends(),
) -> AvatarResponse:
    avatar_url = await save_image(file)
    try:
        return service.set_avatar(current_user.id, avatar_url)
    except AppError:
        from app.utils.images import delete_image_file

        delete_image_file(avatar_url)
        raise
