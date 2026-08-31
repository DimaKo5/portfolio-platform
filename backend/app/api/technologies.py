from fastapi import APIRouter, Depends

from app.schemas.technology import TechnologyResponse
from app.services.technology_service import TechnologyService

router = APIRouter(prefix="/technologies", tags=["technologies"])


@router.get("", response_model=list[TechnologyResponse])
def list_technologies(service: TechnologyService = Depends()) -> list[TechnologyResponse]:
    return [TechnologyResponse.model_validate(t) for t in service.list_technologies()]
