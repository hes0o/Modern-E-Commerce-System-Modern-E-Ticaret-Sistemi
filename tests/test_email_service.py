import pytest

from app.core.config import settings
from app.services import email_service


def test_send_email_does_nothing_when_disabled(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        settings,
        "email_enabled",
        False,
    )

    def unexpected_smtp_call(*args, **kwargs):
        raise AssertionError("SMTP çağrılmamalıydı.")

    monkeypatch.setattr(
        email_service.smtplib,
        "SMTP",
        unexpected_smtp_call,
    )

    result = email_service.send_email(
        recipient="customer@example.com",
        subject="Test",
        body="Test mesajı",
    )

    assert result is False


def test_send_email_uses_smtp_when_enabled(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    sent_messages = []

    class FakeSMTP:
        def __init__(
            self,
            host: str,
            port: int,
            timeout: int,
        ) -> None:
            assert host == "smtp.example.com"
            assert port == 587
            assert timeout == 10

        def __enter__(self):
            return self

        def __exit__(
            self,
            exc_type,
            exc_value,
            traceback,
        ) -> None:
            return None

        def ehlo(self) -> None:
            return None

        def starttls(self) -> None:
            return None

        def login(
            self,
            username: str,
            password: str,
        ) -> None:
            assert username == "smtp-user"
            assert password == "smtp-password"

        def send_message(self, message) -> None:
            sent_messages.append(message)

    monkeypatch.setattr(settings, "email_enabled", True)
    monkeypatch.setattr(
        settings,
        "smtp_host",
        "smtp.example.com",
    )
    monkeypatch.setattr(settings, "smtp_port", 587)
    monkeypatch.setattr(
        settings,
        "smtp_username",
        "smtp-user",
    )
    monkeypatch.setattr(
        settings,
        "smtp_password",
        "smtp-password",
    )
    monkeypatch.setattr(settings, "smtp_use_tls", True)
    monkeypatch.setattr(
        email_service.smtplib,
        "SMTP",
        FakeSMTP,
    )

    result = email_service.send_email(
        recipient="customer@example.com",
        subject="Sipariş Güncellendi",
        body="Siparişiniz kargoya verildi.",
    )

    assert result is True
    assert len(sent_messages) == 1
    assert (
        sent_messages[0]["To"]
        == "customer@example.com"
    )
    assert (
        sent_messages[0]["Subject"]
        == "Sipariş Güncellendi"
    )