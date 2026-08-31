import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    AccountDeleteRequest,
    EmailChangeRequest,
    LoginRequest,
    PasswordChangeRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService
from app.utils.rate_limit import rate_limit

router = APIRouter(prefix="/auth", tags=["auth"])

register_limit = rate_limit(max_requests=5, window_seconds=60)
login_limit = rate_limit(max_requests=10, window_seconds=60)

bearer_scheme = HTTPBearer(auto_error=False)

CREDENTIALS_ERROR = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED, detail="Не авторизован"
)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise CREDENTIALS_ERROR
    user_id = decode_access_token(credentials.credentials)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Недействительный или истёкший токен"
        )
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise CREDENTIALS_ERROR
    user = UserRepository(db).get_by_id(user_uuid)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Пользователь не найден"
        )
    return user


@router.post("/register", response_model=TokenResponse, status_code=201,
             dependencies=[Depends(register_limit)])
def register(data: RegisterRequest, service: AuthService = Depends()) -> TokenResponse:
    return service.register(data)


@router.post("/login", response_model=TokenResponse,
             dependencies=[Depends(login_limit)])
def login(data: LoginRequest, service: AuthService = Depends()) -> TokenResponse:
    return service.login(data)


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.put("/password", status_code=204)
def change_password(
    data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    service: AuthService = Depends(),
) -> None:
    service.change_password(current_user, data.current_password, data.new_password)


@router.put("/email", response_model=UserResponse)
def change_email(
    data: EmailChangeRequest,
    current_user: User = Depends(get_current_user),
    service: AuthService = Depends(),
) -> UserResponse:
    return service.change_email(current_user, data.email, data.password)


@router.delete("/account", status_code=204)
def delete_account(
    data: AccountDeleteRequest,
    current_user: User = Depends(get_current_user),
    service: AuthService = Depends(),
) -> None:
    service.delete_account(current_user, data.password)
