from fastapi import FastAPI,Depends
from schemas import schemas
from sqlalchemy.orm import Session

from app.db.database import engine, SessionLocal, Base 
from app.utils.util import encode
from app.schemas import models
from app.schemas import schemas
app=FastAPI()

Base.metadata.create_all(bind=engine)

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post('/url',response_model=schemas.MessageResponse)
def url(data:schemas.URLCreate,db:Session=Depends(get_db)):
    new_url=models.URL(
        original_url=data.original_url,
        
    )
    db.add(new_url)
    db.commit()
    db.refresh(new_url)
    short_code = encode(new_url.id)
    new_url.short_code = short_code
    db.commit()
    return {"message": "successfully created"}
    
    

