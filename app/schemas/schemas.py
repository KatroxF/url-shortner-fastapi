from pydantic import BaseModel,HttpUrl,Field


class UserCrete(BaseModel):
    username:str
    email:str
    password:str=Field(..., min_length=8, max_length=128)

class URLCreate(BaseModel):
    original_url:HttpUrl
class URLResponse(BaseModel):
    id:int
    original_url:str
    short_code:str
    short_url:str