import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger("app.email")


def send_password_reset_email(to_email: str, code: str) -> None:
    """Send a password reset code. Falls back to logging when SMTP is not set up."""
    if not settings.smtp_enabled:
        logger.info("Password reset code for %s: %s (SMTP not configured)", to_email, code)
        return

    message = EmailMessage()
    message["Subject"] = "Код подтверждения — Portfolio Platform"
    message["From"] = settings.SMTP_FROM or settings.SMTP_USER
    message["To"] = to_email
    message.set_content(
        f"Ваш код для сброса пароля: {code}\n\n"
        f"Код действителен {settings.PASSWORD_RESET_TTL_MINUTES} минут.\n"
        "Если вы не запрашивали сброс пароля — просто игнорируйте это письмо."
    )

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
        if settings.SMTP_TLS:
            server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(message)
    logger.info("Password reset email sent to %s", to_email)
