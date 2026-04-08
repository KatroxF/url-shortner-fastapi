from fastapi import FastAPI,Depends,HTTPException
from schemas import schemas
from sqlalchemy.orm import Session
from fastapi.responses import RedirectResponse

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
    if data.custom_code:
        custom=data.custom_code.lower().replace(" ","-")
        final_code=f"{custom}--{short_code}"
    else:
        final_code=short_code
    new_url.short_code = final_code
    db.commit()
    db.refresh(new_url)
    return {
        "short_url": f"http://localhost:8000/{final_code}"
    }
@app.get("/{short_code}")
def redirect_url(short_code: str, db: Session = Depends(get_db)):

    url = db.query(models.URL).filter(
        models.URL.short_code == short_code
    ).first()

    if not url:
        raise HTTPException(status_code=404, detail="Invalid url")

    return RedirectResponse(url=url.original_url)
    

