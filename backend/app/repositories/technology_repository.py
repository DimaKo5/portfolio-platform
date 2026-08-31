from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Technology


class TechnologyRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_all(self) -> list[Technology]:
        return list(
            self.db.scalars(select(Technology).order_by(Technology.category, Technology.name)).all()
        )

    def get_by_ids(self, ids: list) -> list[Technology]:
        if not ids:
            return []
        return list(self.db.scalars(select(Technology).where(Technology.id.in_(ids))).all())
