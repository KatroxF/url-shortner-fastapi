from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import SQLALCHEMY_DATABASE_URL

engine=create_engine(
    SQLALCHEMY_DATABASE_URL,
     pool_size=30,
    max_overflow=50,
    pool_pre_ping=True,
    pool_recycle=3600   
)
    




SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()