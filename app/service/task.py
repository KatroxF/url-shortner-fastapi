from app.service.service import celery_app
from app.db.database import SessionLocal, engine, Base
from user_agents import parse
import requests
from app.schemas import models


@celery_app.task
def save_click_analytics(url_id, ip, visitor_id, ua_string,referrer):
    db = SessionLocal()
    try:
        country = None
        city = None

        try:
            res = requests.get(f"https://ipapi.co/{ip}/json/", timeout=3)
            data = res.json()
            country = data.get("country_name")
            city = data.get("city")
        except Exception:
            pass

        ua = parse(ua_string) #convert string to user agent object
        
        if ua.is_pc:
            device_type = "PC"
        elif ua.is_mobile:
            if ua.os.family == "Android":
                device_type = "Android"
            elif ua.os.family in ["iOS", "iPhone"]:
                device_type = "iPhone"
            else:
                device_type = "Unknown"
        elif ua.is_tablet:
            device_type = "Tablet"
        else:
            device_type = "Unknown"
        clicks=models.Clicks(
            url_id=url_id,
            ip_address=ip,
            visitor_id=visitor_id,
            user_agent=ua_string,
            device_os=device_type,
            country=country,
            city=city,
            referrer=referrer
        )
        db.add(clicks)
        url=db.query(models.URL).filter(models.URL.id == url_id).first()
        if url:
            url.click_count += 1
        db.commit()
    finally:
        db.close()

