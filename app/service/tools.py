from sqlalchemy.orm import Session
from sqlalchemy import func
from app.schemas import models


def get_total_clicks(url_id: int, db: Session):
    total_clicks = (
        db.query(func.count(models.Clicks.id))
        .filter(models.Clicks.url_id == url_id)
        .scalar()
    ) or 0

    return {"total_clicks": total_clicks}


def get_unique_visitors(url_id: int, db: Session):
    unique_visitors = (
        db.query(
            func.count(
                func.distinct(models.Clicks.visitor_id)
            )
        )
        .filter(models.Clicks.url_id == url_id)
        .scalar()
    ) or 0

    return {"unique_visitors": unique_visitors}


def get_top_referrers(url_id: int, db: Session):
    referrers = (
        db.query(
            models.Clicks.referrer,
            func.count(models.Clicks.id).label("click_count")
        )
        .filter(models.Clicks.url_id == url_id)
        .group_by(models.Clicks.referrer)
        .order_by(func.count(models.Clicks.id).desc())
        .limit(5)
        .all()
    )

    return [
        {
            "referrer": referrer or "Direct",
            "click_count": click_count
        }
        for referrer, click_count in referrers
    ]


def get_geo_distribution(url_id: int, db: Session):
    result = (
        db.query(
            models.Clicks.country,
            func.count(models.Clicks.id).label("click_count")
        )
        .filter(models.Clicks.url_id == url_id)
        .group_by(models.Clicks.country)
        .order_by(func.count(models.Clicks.id).desc())
        .limit(5)
        .all()
    )

    return [
        {
            "country": country or "Unknown",
            "click_count": click_count
        }
        for country, click_count in result
    ]


def get_peak_hours(url_id: int, db: Session):
    hour_expr = func.extract("hour", models.Clicks.timestamp)

    result = (
        db.query(
            hour_expr.label("hour"),
            func.count(models.Clicks.id).label("click_count")
        )
        .filter(models.Clicks.url_id == url_id)
        .group_by(hour_expr)
        .order_by(func.count(models.Clicks.id).desc())
        .limit(5)
        .all()
    )

    # Hours are in the database timezone (usually UTC)
    return [
        {
            "hour_utc": int(hour),
            "click_count": click_count
        }
        for hour, click_count in result
    ]


def get_device_stats(url_id: int, db: Session):
    result = (
        db.query(
            models.Clicks.device_os,
            func.count(models.Clicks.id).label("click_count")
        )
        .filter(models.Clicks.url_id == url_id)
        .group_by(models.Clicks.device_os)
        .order_by(func.count(models.Clicks.id).desc())
        .all()
    )

    return [
        {
            "device_os": device_os or "Unknown",
            "click_count": click_count
        }
        for device_os, click_count in result
    ]