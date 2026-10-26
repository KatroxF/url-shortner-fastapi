import os
from celery import Celery
from app.core.config import CELERY_REDIS_URL


celery_app = Celery(
    "worker",
    broker=CELERY_REDIS_URL,
    backend=CELERY_REDIS_URL,
)