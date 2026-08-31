from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Profile


class ProfileRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id) -> Profile | None:
        return self.db.scalar(select(Profile).where(Profile.user_id == user_id))

    def save(self, profile: Profile) -> Profile:
        self.db.commit()
        self.db.refresh(profile)
        return profile
