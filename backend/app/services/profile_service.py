import uuid

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Profile
from app.repositories.profile_repository import ProfileRepository
from app.schemas.profile import AvatarResponse, ProfileResponse, ProfileUpdate


class ProfileService:
    def __init__(self, db: Session = Depends(get_db)):
        self.repo = ProfileRepository(db)

    def get_profile(self, user_id: uuid.UUID) -> ProfileResponse:
        profile = self.repo.get_by_user_id(user_id)
        return ProfileResponse.model_validate(profile)

    def update_profile(self, user_id: uuid.UUID, data: ProfileUpdate) -> ProfileResponse:
        profile = self.repo.get_by_user_id(user_id)
        updates = data.model_dump(mode="json", exclude_unset=True)
        for field, value in updates.items():
            setattr(profile, field, value)
        self.repo.save(profile)
        return ProfileResponse.model_validate(profile)

    def set_avatar(self, user_id: uuid.UUID, avatar_url: str) -> AvatarResponse:
        profile = self.repo.get_by_user_id(user_id)
        profile.avatar_url = avatar_url
        self.repo.save(profile)
        return AvatarResponse(avatar_url=avatar_url)
