import logging
import smtplib
from email.message import EmailMessage
from email.utils import formataddr

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email(
    *,
    recipient: str,
    subject: str,
    body: str,
) -> bool:
    """SMTP e-postası gönderir; hata durumunda ana işlemi bozmaz."""
    if not settings.email_enabled:
        logger.info(
            "Email sending is disabled; recipient=%s subject=%s",
            recipient,
            subject,
        )
        return False

    message = EmailMessage()
    message["From"] = formataddr(
        (
            settings.smtp_from_name,
            settings.smtp_from_email,
        )
    )
    message["To"] = recipient
    message["Subject"] = subject
    message.set_content(body)

    try:
        with smtplib.SMTP(
            settings.smtp_host,
            settings.smtp_port,
            timeout=10,
        ) as smtp:
            smtp.ehlo()

            if settings.smtp_use_tls:
                smtp.starttls()
                smtp.ehlo()

            if (
                settings.smtp_username
                and settings.smtp_password
            ):
                smtp.login(
                    settings.smtp_username,
                    settings.smtp_password,
                )

            smtp.send_message(message)

    except (OSError, smtplib.SMTPException):
        logger.exception(
            "Email could not be sent; recipient=%s subject=%s",
            recipient,
            subject,
        )
        return False

    return True