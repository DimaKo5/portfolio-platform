import uuid

from fastapi import APIRouter, Depends

from app.api.auth import get_current_user
from app.models import User
from app.schemas.project import ProjectResponse, ProjectTechnologiesRequest
from app.services.technology_service import TechnologyService

router = APIRouter(tags=["technologies"])


@router.put("/projects/{project_id}/technologies", response_model=ProjectResponse)
def set_project_technologies(
    project_id: uuid.UUID,
    data: ProjectTechnologiesRequest,
    current_user: User = Depends(get_current_user),
    service: TechnologyService = Depends(),
) -> ProjectResponse:
    return service.set_project_technologies(current_user.id, project_id, data)
