from fastapi import HTTPException
from app.db.redis import redis_client
async def rate_limit(key:str,limit:str,window:int):
    count=await redis_client.get(key)
    if count==1:
        await redis_client.expire(key,window)
    if count>limit:
        raise HTTPException(status_code=429,detail="Too many requests")