import os

os.environ["SQLALCHEMY_DATABASE_URL"] = "sqlite:///./test_import.db"
os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production")
os.environ.setdefault("GROQ_API_KEY", "test-groq-key")
os.environ.setdefault("FRONTEND_URL", "http://localhost:5173")
os.environ.setdefault("GOOGLE_CLIENT_ID", "test-google-client-id")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "test-google-client-secret")

import itertools
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base
from app.route import main
from app.schemas import models
from app.utils import auth as auth_utils
from app.utils import security


class FakeRedis:
    def __init__(self):
        self.store = {}
        self.ttls = {}

    async def get(self, key):
        return self.store.get(key)

    async def set(self, key, value, ex=None, **kwargs):
        self.store[key] = value
        self.ttls[key] = ex
        return True

    async def delete(self, *keys):
        for key in keys:
            self.store.pop(key, None)
            self.ttls.pop(key, None)
        return len(keys)

    async def incr(self, key):
        self.store[key] = int(self.store.get(key, 0)) + 1
        return self.store[key]

    async def expire(self, key, seconds):
        self.ttls[key] = seconds
        return True


@pytest.fixture()
def engine():
    eng = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(eng)
    yield eng
    Base.metadata.drop_all(eng)
    eng.dispose()


@pytest.fixture()
def session_factory(engine):
    return sessionmaker(bind=engine, autoflush=False, autocommit=False)


@pytest.fixture()
def db(session_factory):
    session = session_factory()
    yield session
    session.close()


@pytest.fixture()
def fake_redis(monkeypatch):
    fake = FakeRedis()
    monkeypatch.setattr(main, "redis_client", fake)
    monkeypatch.setattr(
        "app.utils.ratelimit.redis_client",
        fake,
        raising=False,
    )
    return fake


@pytest.fixture(autouse=True)
def rate_limit_mock(monkeypatch):
    mock = AsyncMock(return_value=None)
    monkeypatch.setattr(main, "rate_limit", mock)
    return mock


@pytest.fixture()
def click_task(monkeypatch):
    mock = MagicMock()
    monkeypatch.setattr(main, "save_click_analytics", mock)
    return mock


@pytest.fixture()
def ai_mock(monkeypatch):
    mock = MagicMock(return_value="Mocked AI summary")
    monkeypatch.setattr(main, "ask_ai", mock)
    return mock


@pytest.fixture()
def client(session_factory, fake_redis, click_task, ai_mock):
    def override_get_db():
        session = session_factory()
        try:
            yield session
        finally:
            session.close()

    main.app.dependency_overrides[main.get_db] = override_get_db

    with TestClient(
        main.app,
        raise_server_exceptions=False
    ) as test_client:
        yield test_client

    main.app.dependency_overrides.clear()


@pytest.fixture()
def make_user(db):
    counter = itertools.count(1)

    def _make(
        username=None,
        email=None,
        password="Password123!",
        google_id=None,
        with_password=True
    ):
        n = next(counter)

        user = models.User(
            username=username or f"user{n}",
            email=email or f"user{n}@example.com",
            hashed_password=(
                security.hashed_password(password)
                if with_password
                else None
            ),
            google_id=google_id,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    return _make


@pytest.fixture()
def user(make_user):
    return make_user(
        username="alice",
        email="alice@example.com"
    )


@pytest.fixture()
def other_user(make_user):
    return make_user(
        username="bob",
        email="bob@example.com"
    )


@pytest.fixture()
def headers_for():
    def _headers(u):
        token = auth_utils.create_access_token(
            {"user_id": u.id}
        )
        return {
            "Authorization": f"Bearer {token}"
        }

    return _headers


@pytest.fixture()
def auth_headers(user, headers_for):
    return headers_for(user)


@pytest.fixture()
def make_url(db):
    counter = itertools.count(1)

    def _make(
        owner=None,
        short_code=None,
        original_url="https://example.com",
        **extra
    ):
        n = next(counter)

        url = models.URL(
            original_url=original_url,
            short_code=short_code or f"code{n}",
            user_id=owner.id if owner else None,
            **extra,
        )

        db.add(url)
        db.commit()
        db.refresh(url)

        return url

    return _make


@pytest.fixture()
def make_click(db):
    def _make(
        url,
        visitor_id="visitor-1",
        timestamp=None,
        device_os="Windows",
        country="India",
        city="Delhi",
        ip_address="1.2.3.4",
        referrer=None
    ):
        click = models.Clicks(
            url_id=url.id,
            timestamp=timestamp or datetime.now(timezone.utc),
            visitor_id=visitor_id,
            device_os=device_os,
            country=country,
            city=city,
            ip_address=ip_address,
            referrer=referrer,
        )

        db.add(click)
        db.commit()

        return click

    return _make