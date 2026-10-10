from unittest.mock import MagicMock, patch

import geoip2.errors
import pytest

from app.schemas import models
from app.service import geoip
from app.service.task import get_device_type, save_click_analytics

MODULE = "app.service.task"  

CHROME_WINDOWS = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
CHROME_ANDROID = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
SAFARI_IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
SAFARI_IPAD = "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"


@pytest.fixture()
def task_db(session_factory):
    """Make the task use the test database instead of the real one."""
    with patch(f"{MODULE}.SessionLocal", session_factory):
        yield


@pytest.fixture()
def geo_ok():
    with patch(f"{MODULE}.get_location", return_value=("India", "Delhi")) as m:
        yield m


# ---------- save_click_analytics ----------

def test_saves_click_with_location(db, make_url, task_db, geo_ok):
    url = make_url(short_code="abc")

    save_click_analytics(url.id, "8.8.8.8", "visitor-1", CHROME_WINDOWS, "https://google.com")

    clicks = db.query(models.Clicks).filter_by(url_id=url.id).all()
    assert len(clicks) == 1
    click = clicks[0]
    assert click.ip_address == "8.8.8.8"
    assert click.visitor_id == "visitor-1"
    assert click.device_os == "PC"
    assert click.country == "India"
    assert click.city == "Delhi"
    assert click.referrer == "https://google.com"


def test_increments_click_count(db, make_url, task_db, geo_ok):
    url = make_url(short_code="abc")
    before = url.click_count or 0

    save_click_analytics(url.id, "8.8.8.8", "v", CHROME_WINDOWS, None)
    save_click_analytics(url.id, "8.8.8.8", "v", CHROME_WINDOWS, None)

    db.expire_all()  # the task used a different session, so reload
    assert db.query(models.URL).get(url.id).click_count == before + 2


def test_geoip_failure_still_saves_click(db, make_url, task_db):
    url = make_url(short_code="abc")

    with patch(f"{MODULE}.get_location", side_effect=Exception("boom")):
        save_click_analytics(url.id, "8.8.8.8", "v", CHROME_WINDOWS, None)

    click = db.query(models.Clicks).filter_by(url_id=url.id).one()
    assert click.country is None
    assert click.city is None


def test_unknown_url_does_not_crash(db, task_db, geo_ok):
    save_click_analytics(99999, "8.8.8.8", "v", CHROME_WINDOWS, None)
    # no URL to count against, but nothing should blow up


# ---------- get_device_type ----------

@pytest.mark.parametrize(
    "ua_string, expected",
    [
        (CHROME_WINDOWS, "PC"),
        (CHROME_ANDROID, "Android"),
        (SAFARI_IPHONE, "iPhone"),
        (SAFARI_IPAD, "Tablet"),
        ("some-random-bot/1.0", "Unknown"),
    ],
)
def test_device_detection(ua_string, expected):
    assert get_device_type(ua_string) == expected


# ---------- get_location (app/service/geoip.py) ----------

def test_get_location_returns_country_and_city(monkeypatch):
    reader = MagicMock()
    reader.city.return_value.country.name = "India"
    reader.city.return_value.city.name = "Delhi"
    monkeypatch.setattr(geoip, "_reader", reader)

    assert geoip.get_location("8.8.8.8") == ("India", "Delhi")


def test_get_location_without_database_file(monkeypatch):
    monkeypatch.setattr(geoip, "_reader", None)
    assert geoip.get_location("8.8.8.8") == (None, None)


def test_get_location_ip_not_found(monkeypatch):
    reader = MagicMock()
    reader.city.side_effect = geoip2.errors.AddressNotFoundError("not found")
    monkeypatch.setattr(geoip, "_reader", reader)

    assert geoip.get_location("192.168.1.1") == (None, None)


def test_get_location_invalid_ip(monkeypatch):
    reader = MagicMock()
    reader.city.side_effect = ValueError("bad ip")
    monkeypatch.setattr(geoip, "_reader", reader)

    assert geoip.get_location("not-an-ip") == (None, None)


@pytest.mark.skipif(geoip._reader is None, reason="GeoLite2-City.mmdb not found")
def test_real_database_lookup():
    country, _city = geoip.get_location("8.8.8.8")
    assert country == "United States"