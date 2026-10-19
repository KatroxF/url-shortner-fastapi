
from redis.asyncio import Redis
from app.core.config import REDIS_URL




# redis_client = Redis(
#     host="localhost",
#     port=6379,
#     db=0,
#     decode_responses=True #Redis-Python automatically converts the response to a normal Python string: #By default, Redis-Python may return values as bytes:
# )

redis_client = Redis.from_url(
    REDIS_URL,
    decode_responses=True
)