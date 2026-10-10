import os
import logging
import geoip2.database
import geoip2.errors
logger = logging.getLogger(__name__)

GEOIP_PATH = os.getenv(
    "GEOIP_DB_PATH",
    os.path.join(os.path.dirname(__file__), "..", "geoip", "GeoLite2-City.mmdb"),
)

try:
    _reader = geoip2.database.Reader(GEOIP_PATH)
except FileNotFoundError:
    logger.warning("GeoIP database not found at %s, locations will be empty", GEOIP_PATH)
    _reader = None


def get_location(ip):
    if _reader is None:
        return None, None
    try:
        res = _reader.city(ip)
        return res.country.name, res.city.name
    except (geoip2.errors.AddressNotFoundError, ValueError):
        return None, None