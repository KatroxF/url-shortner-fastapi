from datetime import datetime, timedelta, timezone
 
import pytest
 
from app.schemas import models
 
 
def code_from(short_url: str) -> str:
    return short_url.rstrip("/").split("/")[-1]
 
 

def test_create_url_success(client, db, user, auth_headers):
    r = client.post("/url", json={"original_url": "https://example.com/page"},
                    headers=auth_headers)
    assert r.status_code == 200
    short_url = r.json()["short_url"]
    assert short_url.startswith("http://localhost:8000/")
 
    saved = db.query(models.URL).filter_by(short_code=code_from(short_url)).one()
    assert saved.original_url.startswith("https://example.com/page")
    assert saved.user_id == user.id

def test_create_url_each_gets_a_unique_code(client, auth_headers):
    codes = {
        code_from(client.post("/url", json={"original_url": "https://example.com"},
                              headers=auth_headers).json()["short_url"])
        for _ in range(5)
    }
    assert len(codes) == 5

def test_create_url_custom_code_is_prefixed(client, auth_headers):
    r = client.post("/url", json={"original_url": "https://example.com",
                                  "custom_code": "promo"}, headers=auth_headers)
    assert r.status_code == 200
    assert code_from(r.json()["short_url"]).startswith("promo-")