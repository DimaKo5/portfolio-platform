import uuid

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import STATUS_PUBLISHED, Project
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import (
    ProjectCreate,
    ProjectListResponse,
    ProjectResponse,
    ProjectUpdate,
)
from app.utils.errors import AppError
from app.utils.slug import slugify, unique_slug


class ProjectService:
    def __init__(self, db: Session = Depends(get_db)):
        self.repo = ProjectRepository(db)

    def list_projects(self, user_id: uuid.UUID) -> ProjectListResponse:
        projects = self.repo.list_by_user(user_id)
        return ProjectListResponse(
            items=[ProjectResponse.model_validate(p) for p in projects],
            total=len(projects),
        )

    def get_project(self, user_id: uuid.UUID, project_id: uuid.UUID) -> ProjectResponse:
        return ProjectResponse.model_validate(self._get_owned(user_id, project_id))

    def create_project(self, user_id: uuid.UUID, data: ProjectCreate) -> ProjectResponse:
        fields = data.model_dump(mode="json", exclude_unset=True)
        fields["slug"] = self._generate_slug(user_id, fields["title"])
        fields["sort_order"] = self.repo.max_sort_order(user_id) + 1
        project = self.repo.create(user_id, **fields)
        return ProjectResponse.model_validate(project)

    def update_project(
        self, user_id: uuid.UUID, project_id: uuid.UUID, data: ProjectUpdate
    ) -> ProjectResponse:
        project = self._get_owned(user_id, project_id)
        fields = data.model_dump(mode="json", exclude_unset=True)
        cover = fields.pop("cover_image_url", "__unset__")
        new_title = fields.pop("title", None)
        if new_title:
            fields["slug"] = self._generate_slug(user_id, new_title, exclude_id=project.id)
            fields["title"] = new_title
        if cover != "__unset__":
            project.cover_image_url = cover
        for field, value in fields.items():
            setattr(project, field, value)
        self.repo.save(project)
        return ProjectResponse.model_validate(project)

    def delete_project(self, user_id: uuid.UUID, project_id: uuid.UUID) -> None:
        self.repo.delete(self._get_owned(user_id, project_id))

    def publish_project(self, user_id: uuid.UUID, project_id: uuid.UUID) -> ProjectResponse:
        from app.core.database import utcnow

        project = self._get_owned(user_id, project_id)
        if project.status != STATUS_PUBLISHED:
            project.status = STATUS_PUBLISHED
            project.published_at = utcnow()
            self.repo.save(project)
        return ProjectResponse.model_validate(project)

    def unpublish_project(self, user_id: uuid.UUID, project_id: uuid.UUID) -> ProjectResponse:
        project = self._get_owned(user_id, project_id)
        project.status = "DRAFT"
        self.repo.save(project)
        return ProjectResponse.model_validate(project)

    def reorder_projects(self, user_id: uuid.UUID, ordered_ids: list[uuid.UUID]) -> None:
        owned = {p.id for p in self.repo.list_by_user(user_id)}
        if not set(ordered_ids).issubset(owned):
            raise AppError("PROJECT_ACCESS_DENIED", "Order contains projects you do not own.", 400)
        self.repo.reorder(user_id, ordered_ids)

    def _get_owned(self, user_id: uuid.UUID, project_id: uuid.UUID) -> Project:
        project = self.repo.get_by_id_and_user(project_id, user_id)
        if not project:
            raise AppError("PROJECT_NOT_FOUND", "Project not found.", 404)
        return project

    def _generate_slug(self, user_id: uuid.UUID, title: str, exclude_id: uuid.UUID | None = None) -> str:
        existing = self.repo.existing_slugs(user_id, exclude_id)
        return unique_slug(slugify(title), existing)
