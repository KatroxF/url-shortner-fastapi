import pytest
from unittest.mock import AsyncMock
from fastapi import HTTPException
from app.route import main
from app.schemas import models

VALID_PASSWORD="Password123"


def register_payload(**overrides):
    data={
        "username":"newuser",
        "email":"new@example.com",
        "password":VALID_PASSWORD
    }
    data.update(overrides)
    return data


def test_register_success(client,db):
    r=client.post("/register",json=register_payload())
    assert r.status_code==200
    assert "message" in r.json()
    saved = db.query(models.User).filter_by(email="new@example.com").one()
    assert saved.username == "newuser"

def test_register_password_is_hashed_not_stored_plain(client, db):
    r=client.post("/register",json=register_payload())
    saved = db.query(models.User).filter_by(email="new@example.com").one()
    assert saved.hashed_password !=VALID_PASSWORD
    assert saved.hashed_password

def test_register_duplicate_username(client, user):
    r=client.post("/register",json=register_payload(username=user.username))
    assert r.status_code == 400
    assert "username" in r.json()["detail"].lower()

def test_register_invalid_email(client):
    r = client.post("/register", json=register_payload(email="not-an-email"))
    assert r.status_code == 422
 
 
def test_register_missing_fields(client):
    r = client.post("/register", json={"email": "a@example.com"})
    assert r.status_code == 422

def test_login_success_returns_token(client, make_user):
    make_user(email="login@example.com", password=VALID_PASSWORD)
    r = client.post("/login", json={"email": "login@example.com",
                                    "password": VALID_PASSWORD})
    assert r.status_code == 200
    assert r.json()["access_token"]
 
 
def test_login_token_works_on_me(client, make_user):
    make_user(email="login@example.com", password=VALID_PASSWORD)
    token = client.post("/login", json={"email": "login@example.com",
                                        "password": VALID_PASSWORD}
                        ).json()["access_token"]
    r = client.get("/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["username"] == "user1"
 
 
def test_login_wrong_password(client, make_user):
    make_user(email="login@example.com", password=VALID_PASSWORD)
    r = client.post("/login", json={"email": "login@example.com",
                                    "password": "WrongPassword1!"})
    assert r.status_code == 401
 
 
def test_login_unknown_email(client):
    r = client.post("/login", json={"email": "ghost@example.com",
                                    "password": VALID_PASSWORD})
    assert r.status_code == 401
 
 
def test_login_same_error_for_wrong_password_and_unknown_email(client, make_user):
    make_user(email="login@example.com", password=VALID_PASSWORD)
    wrong_pw = client.post("/login", json={"email": "login@example.com",
                                           "password": "nope"})
    unknown = client.post("/login", json={"email": "ghost@example.com",
                                          "password": "nope"})
    assert wrong_pw.json() == unknown.json()
 
 
def test_login_google_only_user_gets_401_not_500(client, make_user):
    """Fix 2: a Google-only account has hashed_password=None."""
    make_user(email="g@example.com", google_id="g-123", with_password=False)
    r = client.post("/login", json={"email": "g@example.com",
                                    "password": "anything"})
    assert r.status_code == 401
 
 
def test_login_rate_limit_called_with_expected_key_and_limits(client, rate_limit_mock):
    client.post("/login", json={"email": "a@example.com", "password": "x"})
    rate_limit_mock.assert_awaited_once_with("login:testclient", limit=10, window=60)
 
 
def test_login_blocked_by_rate_limit(client, make_user, rate_limit_mock):
    make_user(email="login@example.com", password=VALID_PASSWORD)
    rate_limit_mock.side_effect = HTTPException(status_code=429, detail="Too many requests")
    r = client.post("/login", json={"email": "login@example.com",
                                    "password": VALID_PASSWORD})
    assert r.status_code == 429
