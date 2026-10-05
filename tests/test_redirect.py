import json
from datetime import datetime, timedelta, timezone
 
import pytest

def get(client, code, **kwargs):
    return client.get(f"/{code}", follow_redirects=False, **kwargs)  #means don't automatically follow the redirect returned by the server.

def test_redirect_to_original_url(client, user, make_url):
    make_url(user, short_code="abc", original_url="https://example.com/target")
    r = get(client, "abc")  #get() helper probably sends a GET request to your FastAPI endpoint:
    assert r.status_code in (302, 307)
    assert r.headers["location"] == "https://example.com/target"
 
 
def test_redirect_unknown_code_returns_404(client):
    assert get(client, "nope").status_code == 404
 
 
def test_redirect_unknown_code_is_not_cached(client, fake_redis):
    get(client, "nope")
    assert "url:nope" not in fake_redis.store
 
 
def test_redirect_anonymous_link_without_owner_still_works(client, make_url):
    make_url(None, short_code="anon", original_url="https://example.com/a")
    assert get(client, "anon").status_code in (302, 307)
 
 

def test_redirect_cache_miss_stores_entry_for_one_hour(client, user, make_url, fake_redis):
    url = make_url(user, short_code="abc", original_url="https://example.com/x")
    get(client, "abc")
 
    assert "url:abc" in fake_redis.store
    cached = json.loads(fake_redis.store["url:abc"])
    assert cached["id"] == url.id
    assert cached["original_url"] == "https://example.com/x"
    assert fake_redis.ttls["url:abc"] == 3600
 
 
def test_redirect_cache_hit_does_not_need_the_database(client, fake_redis, click_task):
    fake_redis.store["url:abc"] = json.dumps(
        {"id": 42, "original_url": "https://cached.example.com"}
    )
    r = get(client, "abc")  # no row exists in the DB
    assert r.status_code in (302, 307)
    assert r.headers["location"] == "https://cached.example.com"
    assert click_task.delay.call_args.args[0] == 42

def test_redirect_second_request_is_served_from_cache(client, db, user, make_url):
    url = make_url(user, short_code="abc", original_url="https://example.com/x")
    assert get(client, "abc").status_code in (302, 307)
 
    db.delete(url)  
    db.commit()
    assert get(client, "abc").status_code in (302, 307)
 