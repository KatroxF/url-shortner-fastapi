"""Tests for helpers in app/utils (+ make_utc and RESERVED_CODES from main.py)."""
from datetime import datetime, timedelta, timezone

import pytest

from app.route import main
from app.utils import auth as auth_utils
from app.utils import security
from app.utils.util import encode



def test_encode_returns_non_empty_string():
    code = encode(1)
    assert isinstance(code, str)
    assert code


def test_encode_is_deterministic():
    assert encode(12345) == encode(12345)


def test_encode_unique_for_many_ids():
    codes = {encode(i) for i in range(1, 5001)}
    assert len(codes) == 5000


def test_encode_only_url_safe_characters():
    for i in (1, 61, 62, 999_999, 10**9):
        assert encode(i).isalnum()



def test_security_hash_is_not_plaintext():
    assert security.hashed_password("Password123!") != "Password123!"


def test_security_verify_correct_password():
    hashed = security.hashed_password("Password123!")
    assert security.verify_password("Password123!", hashed) is True


def test_security_verify_wrong_password():
    hashed = security.hashed_password("Password123!")
    assert security.verify_password("wrong", hashed) is False


def test_security_same_password_hashes_differently_each_time():
    assert security.hashed_password("Password123!") != security.hashed_password("Password123!")



def test_jwt_create_access_token_returns_string():
    token = auth_utils.create_access_token({"user_id": 1})
    assert isinstance(token, str)
    assert token.count(".") == 2  # header.payload.signature


def test_jwt_valid_token_accepted(client, user, headers_for):
    assert client.get("/me", headers=headers_for(user)).status_code == 200


def test_jwt_tampered_signature_rejected(client, user):
    token = auth_utils.create_access_token({"user_id": user.id})
    tampered = token[:-4] + ("AAAA" if not token.endswith("AAAA") else "BBBB")
    r = client.get("/me", headers={"Authorization": f"Bearer {tampered}"})
    assert r.status_code in (401, 403)


def test_jwt_garbage_token_rejected(client):
    r = client.get("/me", headers={"Authorization": "Bearer not.a.jwt"})
    assert r.status_code in (401, 403)


def test_jwt_missing_header_rejected(client):
    assert client.get("/me").status_code in (401, 403)


def test_jwt_token_for_nonexistent_user_rejected(client):
    token = auth_utils.create_access_token({"user_id": 999_999})
    r = client.get("/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code in (401, 404)



def test_make_utc_naive_datetime_is_assumed_utc():
    result = main.make_utc(datetime(2026, 1, 1, 12, 0))
    assert result.tzinfo == timezone.utc
    assert result.hour == 12


def test_make_utc_aware_datetime_is_converted_to_utc():
    ist = timezone(timedelta(hours=5, minutes=30))
    result = main.make_utc(datetime(2026, 1, 1, 12, 0, tzinfo=ist))
    assert result.tzinfo == timezone.utc
    assert (result.hour, result.minute) == (6, 30)


def test_make_utc_utc_datetime_unchanged():
    dt = datetime(2026, 1, 1, 12, 0, tzinfo=timezone.utc)
    assert main.make_utc(dt) == dt



@pytest.mark.parametrize("route", ["login", "register", "me", "url", "urls", "links",
                                   "analytics", "summary", "docs", "redoc"])
def test_reserved_codes_cover_existing_routes(route):
    assert route in main.RESERVED_CODES