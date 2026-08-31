import uuid

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.project_repository import ProjectRepository
from app.repositories.technology_repository import TechnologyRepository
from app.schemas.project import ProjectResponse, ProjectTechnologiesRequest
from app.utils.errors import AppError


class TechnologyService:
    def __init__(self, db: Session = Depends(get_db)):
        self.tech_repo = TechnologyRepository(db)
        self.project_repo = ProjectRepository(db)

    def list_technologies(self):
        return self.tech_repo.list_all()

    def set_project_technologies(
        self, user_id: uuid.UUID, project_id: uuid.UUID, data: ProjectTechnologiesRequest
    ) -> ProjectResponse:
        project = self.project_repo.get_by_id_and_user(project_id, user_id)
        if not project:
            raise AppError("PROJECT_NOT_FOUND", "Проект не найден.", 404)
        found = {t.id for t in self.tech_repo.get_by_ids(data.technology_ids)}
        missing = set(data.technology_ids) - found
        if missing:
            raise AppError("TECHNOLOGY_NOT_FOUND", "Одна или несколько технологий не найдены.", 400)
        project = self.project_repo.set_technologies(project, data.technology_ids)
        return ProjectResponse.model_validate(project)
