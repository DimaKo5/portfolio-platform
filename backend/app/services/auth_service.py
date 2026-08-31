import uuid

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.utils.errors import AppError

ALREADY_EXISTS_STATUS = 409


class AuthService:
    def __init__(self, db: Session = Depends(get_db)):
        self.repo = UserRepository(db)

    def register(self, data: RegisterRequest) -> TokenResponse:
        from app.utils.slug import is_valid_username

        if not is_valid_username(data.username):
            raise AppError("USERNAME_RESERVED", "Этот username зарезервирован системой. Выберите другой.", 422)
        if self.repo.get_by_email(data.email):
            raise AppError("EMAIL_ALREADY_EXISTS", "Этот email уже зарегистрирован.", ALREADY_EXISTS_STATUS)
        if self.repo.get_by_username(data.username):
            raise AppError("USERNAME_ALREADY_EXISTS", "Этот username уже занят.", ALREADY_EXISTS_STATUS)
        user = self.repo.create(data.email, data.username, hash_password(data.password))
        return self._token_response(user)

    def login(self, data: LoginRequest) -> TokenResponse:
        user = self.repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.password_hash):
            raise AppError("INVALID_CREDENTIALS", "Неверный email или пароль.", 401)
        return self._token_response(user)

    def change_password(self, user: User, current_password: str, new_password: str) -> None:
        if not verify_password(current_password, user.password_hash):
            raise AppError("INVALID_CREDENTIALS", "Текущий пароль указан неверно.", 400)
        user.password_hash = hash_password(new_password)
        self.repo.save(user)

    def change_email(self, user: User, email: str, password: str) -> UserResponse:
        if not verify_password(password, user.password_hash):
            raise AppError("INVALID_CREDENTIALS", "Текущий пароль указан неверно.", 400)
        email = email.lower()
        if email != user.email and self.repo.get_by_email(email):
            raise AppError("EMAIL_ALREADY_EXISTS", "Этот email уже зарегистрирован.", ALREADY_EXISTS_STATUS)
        user.email = email
        self.repo.save(user)
        return UserResponse.model_validate(user)

    def delete_account(self, user: User, password: str) -> None:
        if not verify_password(password, user.password_hash):
            raise AppError("INVALID_CREDENTIALS", "Текущий пароль указан неверно.", 400)
        self.repo.delete(user)

    def _token_response(self, user: User) -> TokenResponse:
        return TokenResponse(
            access_token=create_access_token(user.id),
            user=UserResponse.model_validate(user),
        )
