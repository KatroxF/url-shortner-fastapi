import os
import secrets
import smtplib
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage

TOKEN_EXPIRE_MINUTES = 30
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


def generate_verification_token() -> tuple[str, datetime]:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    return token, expires_at


def is_token_expired(expires_at: datetime | None) -> bool:
    if expires_at is None:
        return True
    if expires_at.tzinfo is None:  
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return datetime.now(timezone.utc) > expires_at


def send_verification_email(to_email: str, username: str, token: str) -> None:
    link = f"{BASE_URL}/verify-email?token={token}"

    
    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"[DEV] Verification link for {to_email}: {link}")
        return

    msg = EmailMessage()
    msg["Subject"] = "Verify your email"
    msg["From"] = SMTP_USER
    msg["To"] = to_email
    msg.set_content(
        f"Hi {username},\n\nClick the link to verify your email "
        f"(valid for {TOKEN_EXPIRE_MINUTES} minutes):\n{link}\n\n"
        "If you didn't sign up, ignore this email."
    )
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)