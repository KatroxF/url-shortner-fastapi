from sqlalchemy import Column,Integer,String,DateTime,ForeignKey
from app.db.database import Base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__="users"
    id=Column(Integer,primary_key=True,index=True)
    username=Column(String,unique=True, index=True, nullable=False)
    email=Column(String, unique=True, index=True, nullable=False)  
    hashed_password=Column(String, nullable=False)
    created_at=Column(DateTime(timezone=True), server_default=func.now())
    urls=relationship("URL", back_populates="user")

class URL(Base):
    __tablename__ = "urls"

    id = Column(Integer, primary_key=True, index=True)
    original_url = Column(String, nullable=False)
    short_code = Column(String, unique=True, index=True)
    user_id=Column(Integer,ForeignKey("users.id"),nullable=True)
    created_at= Column(DateTime(timezone=True), server_default=func.now())
    expired_at=Column(DateTime, nullable=True)
    click_count=Column(Integer, default=0)
    user=relationship("User", back_populates="urls")
    clicks=relationship("Clicks", back_populates="url",cascade="all, delete-orphan")
class Clicks(Base):
    __tablename__="clicks"
    id=Column(Integer, primary_key=True, index=True)
    url_id=Column(Integer,ForeignKey("urls.id"),nullable=True)
    timestamp=Column(DateTime(timezone=True), server_default=func.now())
    ip_address=Column(String, nullable=True)
    visitor_id = Column(String, index=True)
    user_agent = Column(String)
    device_os=Column(String)
    country = Column(String)
    region = Column(String)
    city = Column(String)
    url=relationship("URL", back_populates="clicks")

    
    
    