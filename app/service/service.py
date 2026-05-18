from celery import Celery
celery_app=Celery(
    "worker",
    broker="redis://localhost:6380/1",
    backend="redis://localhost:6380/1"
)