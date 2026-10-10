import logging

from user_agents import parse

from app.db.database import SessionLocal
from app.schemas import models
from app.service.geoip import get_location
from app.service.service import celery_app

logger = logging.getLogger(__name__)


def get_device_type(ua_string):
    """Convert a user-agent string into a simple device label."""
    ua = parse(ua_string)

    if ua.is_pc:
        return "PC"
    if ua.is_tablet:
        return "Tablet"
    if ua.is_mobile:
        if ua.os.family == "Android":
            return "Android"
        if ua.os.family == "iOS":
            return "iPhone"
    return "Unknown"


@celery_app.task
def save_click_analytics(url_id, ip, visitor_id, ua_string, referrer):
    db = SessionLocal()
    try:
        try:
            country, city = get_location(ip)
        except Exception:
            logger.exception("GeoIP lookup failed for %s", ip)
            country, city = None, None

        click = models.Clicks(
            url_id=url_id,
            ip_address=ip,
            visitor_id=visitor_id,
            user_agent=ua_string,
            device_os=get_device_type(ua_string),
            country=country,
            city=city,
            referrer=referrer,
        )
        db.add(click)

        url = db.query(models.URL).filter(models.URL.id == url_id).first()
        if url:
            url.click_count += 1

        db.commit()
    finally:
        db.close()