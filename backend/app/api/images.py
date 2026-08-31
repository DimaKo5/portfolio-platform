import uuid

from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.database import get_db
from app.models import User
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectImageSchema
from app.utils.errors import AppError
from app.utils.images import delete_image_file, save_image

router = APIRouter(prefix="/projects", tags=["images"])


@router.post("/{project_id}/images", response_model=ProjectImageSchema, status_code=201)
async def upload_project_image(
    project_id: uuid.UUID,
    file: UploadFile,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProjectImageSchema:
    repo = ProjectRepository(db)
    project = repo.get_by_id_and_user(project_id, current_user.id)
    if not project:
        raise AppError("PROJECT_NOT_FOUND", "Project not found.", 404)
    url = await save_image(file)
    try:
        image = repo.add_image(project, url, None)
        return ProjectImageSchema.model_validate(image)
    except AppError:
        delete_image_file(url)
        raise


@router.delete("/{project_id}/images/{image_id}", status_code=204)
def delete_project_image(
    project_id: uuid.UUID,
    image_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    repo = ProjectRepository(db)
    project = repo.get_by_id_and_user(project_id, current_user.id)
    if not project:
        raise AppError("PROJECT_NOT_FOUND", "Project not found.", 404)
    image = repo.get_image(project_id, image_id)
    if not image:
        raise AppError("IMAGE_NOT_FOUND", "Image not found.", 404)
    url = image.url
    repo.delete_image(image)
    delete_image_file(url)
    if project.cover_image_url == url:
        project.cover_image_url = None
        db.commit()
