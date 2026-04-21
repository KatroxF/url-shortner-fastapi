from pydantic import BaseModel,HttpUrl,Field,EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    username:str
    email:EmailStr
    password:str=Field(..., min_length=8, max_length=128)
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    password:str
    created_at: datetime

class URLCreate(BaseModel):
    original_url:HttpUrl
    custom_code: Optional[str] = None

class URLResponse(BaseModel):
    original_url: str
    short_url: str
    short_code: str
    click_count: int
    created_at: datetime
    expired_at: Optional[datetime]

class ClickResponse(BaseModel):
    id: int
    url_id: int
    timestamp: datetime
    ip_address: Optional[str]
    user_agent: Optional[str]
class MessageResponse(BaseModel):
    short_url: str
class Message(BaseModel):
    message:str