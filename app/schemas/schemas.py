from pydantic import BaseModel,HttpUrl,Field,EmailStr
from typing import List, Optional
from datetime import datetime


class UserCreate(BaseModel):
    username:str
    email:EmailStr
    password:str=Field(..., min_length=8, max_length=128)
class UserLogin(BaseModel):
    email: EmailStr
    password:str
    

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
class UserResponse(BaseModel):
    id: int
    username: str

class URLStatsResponse(BaseModel):
    id: int
    short: str
    long: str
    clicks: int
    created: str

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

class LinkInfo(BaseModel):
    original_url: str
    short_url: str
class DeviceStat(BaseModel):
    name: str
    value: int


class LocationItem(BaseModel):
    location:str
    total_clicks_location: int
class URLAnalyticsResponse(BaseModel):
    linkInfo: LinkInfo
    locationStats: List[LocationItem]
    totalClicks: int
    uniqueVisitors: int
    peakDay: Optional[datetime]
    labels: List[str]
    clicks: List[int]
    deviceStats: List[DeviceStat]
    
    