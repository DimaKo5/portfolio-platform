from fastapi import APIRouter, Depends

from app.services.portfolio_service import PortfolioService

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/{username}")
def get_portfolio(username: str, service: PortfolioService = Depends()):
    return service.get_portfolio(username)


@router.get("/{username}/projects/{slug}")
def get_public_project(username: str, slug: str, service: PortfolioService = Depends()):
    return service.get_public_project(username, slug)
