from redis.asyncio import Redis

redis_client = Redis(
    host="localhost",
    port=6379,
    db=0,
    decode_responses=True #Redis-Python automatically converts the response to a normal Python string: #By default, Redis-Python may return values as bytes:
)
