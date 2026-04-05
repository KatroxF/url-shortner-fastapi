from fastapi import FastAPI
from schemas import schemas

from app.db.database import engine, SessionLocal, Base 

app=FastAPI()

Base.metadata.create_all(bind=engine)

@app.post('/url',response_model=schemas.URLResponse)
def url(original_url:schemas.URLCreate):
    pass
    

