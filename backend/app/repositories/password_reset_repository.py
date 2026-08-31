import uuid
from datetime import datetime

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models import PasswordReset


class PasswordResetRepository:
    def __init__(self, db: Session):
        self.db = db

    def invalidate_all(self, user_id: uuid.UUID) -> None:
        self.db.execute(delete(PasswordReset).where(PasswordReset.user_id == user_id))
        self.db.commit()

    def create(self, user_id: uuid.UUID, code_hash: str, expires_at) -> PasswordReset:
        reset = PasswordReset(user_id=user_id, code_hash=code_hash, expires_at=expires_at)
        self.db.add(reset)
        self.db.commit()
        self.db.refresh(reset)
        return reset

    def get_latest_active(self, user_id: uuid.UUID, now: datetime) -> PasswordReset | None:
        return self.db.scalar(
            select(PasswordReset)
            .where(
                PasswordReset.user_id == user_id,
                PasswordReset.used.is_(False),
                PasswordReset.expires_at > now,
            )
            .order_by(PasswordReset.created_at.desc())
            .limit(1)
        )

    def save(self, reset: PasswordReset) -> None:
        self.db.commit()
