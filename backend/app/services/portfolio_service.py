from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.project_repository import ProjectRepository
from app.repositories.user_repository import UserRepository
from app.schemas.portfolio import PublicPortfolioResponse, PublicProjectResponse
from app.schemas.profile import ProfileResponse
from app.schemas.project import ProjectResponse
from app.utils.errors import AppError


class PortfolioService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
        self.repo = ProjectRepository(db)
        self.users = UserRepository(db)

    def get_portfolio(self, username: str) -> PublicPortfolioResponse:
        user = self.users.get_by_username(username.lower())
        if not user:
            raise AppError("PORTFOLIO_NOT_FOUND", "Портфолио не найдено.", 404)
        profile = user.profile
        if not profile:
            raise AppError("PORTFOLIO_NOT_FOUND", "Портфолио не найдено.", 404)
        profile.view_count += 1
        self.db.commit()
        projects = self.repo.list_published_by_user(user.id)
        skills = sorted({t.name for p in projects for t in p.technologies})
        return PublicPortfolioResponse(
            username=user.username,
            profile=ProfileResponse.model_validate(profile),
            projects=[ProjectResponse.model_validate(p) for p in projects],
            skills=skills,
        )

    def get_public_project(self, username: str, slug: str) -> PublicProjectResponse:
        user = self.users.get_by_username(username.lower())
        if not user:
            raise AppError("PROJECT_NOT_FOUND", "Проект не найден.", 404)
        project = next(
            (p for p in self.repo.list_published_by_user(user.id) if p.slug == slug), None
        )
        if not project:
            raise AppError("PROJECT_NOT_FOUND", "Проект не найден.", 404)
        project.view_count += 1
        self.db.commit()
        return PublicProjectResponse(
            username=user.username,
            project=ProjectResponse.model_validate(project),
        )

