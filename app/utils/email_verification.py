import os
import secrets
import smtplib
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
import hashlib
import logging
from app.core.config import (
    BASE_URL,
    FRONTEND_URL,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    RESET_TOKEN_EXPIRE_MINUTES,
)


logger = logging.getLogger(__name__)

TOKEN_EXPIRE_MINUTES = 30



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
    msg["Subject"] = "Verify your email for Shortly"
    msg["From"] = f"Shortly <{SMTP_USER}>"
    msg["To"] = to_email
    msg.set_content(
        f"Hi {username},\n\n"
        f"Thanks for signing up for Shortly. Click the link to verify your email "
        f"(valid for {TOKEN_EXPIRE_MINUTES} minutes):\n{link}\n\n"
        "If you didn't sign up, ignore this email."
    )

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
    except Exception:
        logger.exception("Failed to send verification email to %s", to_email)
def hash_token(token:str)->str:
    return hashlib.sha256(token.encode()).hexdigest()

def generate_reset_token() -> tuple[str, str, datetime]:
    token = secrets.token_urlsafe(32)   # emailed to the user
    token_hash = hash_token(token)      # stored in the DB
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    return token, token_hash, expires_at


def send_reset_email(to_email: str, username: str, token: str) -> None:
    link = f"{FRONTEND_URL}/reset-password?token={token}"

    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"[DEV] Password reset link for {to_email}: {link}")
        return

    msg = EmailMessage()
    msg["Subject"] = "Reset your Shortly password"
    msg["From"] = f"Shortly <{SMTP_USER}>"
    msg["To"] = to_email
    msg.set_content(
        f"Hi {username},\n\n"
        f"Click the link to reset your password "
        f"(valid for {RESET_TOKEN_EXPIRE_MINUTES} minutes):\n{link}\n\n"
        "If you didn't request this, ignore this email. Your password stays the same."
    )

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
    except Exception:
        logger.exception("Failed to send reset email to %s", to_email)