from fastapi import FastAPI,Depends,HTTPException,Request
from sqlalchemy.orm import Session
from fastapi.responses import RedirectResponse
from typing import Optional

from app.db.database import engine, SessionLocal, Base 
from app.utils.util import encode
from app.schemas import models
from app.schemas import schemas
from typing import List
from app.utils import security
from app.utils import auth
from app.utils.auth import get_current_user
from fastapi.middleware.cors import CORSMiddleware
app=FastAPI()

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post('/register',response_model=schemas.Message)
def register(user:schemas.UserCreate,db:Session=Depends(get_db)):
    existing_email=db.query(models.User).filter(
        models.User.email==user.email
    ).first()
    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    existing_username=db.query(models.User).filter(
        models.User.username == user.username
    ).first()
    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already taken"
        )
    hashed=security.hashed_password(user.password)
    new_user=models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed

    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return{
        "message":"User registered successfull"
    }

@app.post("/login")
def login(user:schemas.UserResponse,db:Session=Depends(get_db)):
    db_user=db.query(models.User).filter(
        models.User.email==user.email
    ).first()
    if not db_user:
          raise HTTPException(status_code=401,detail="Invalid email or password")
    if not security.verify_password(user.password,db_user.hashed_password):
          raise HTTPException(status_code=401,detail="Invalid email or password")
    token=auth.create_access_token({
        "user_id":db_user.id
    })
    return{
        "access_token":token

    }
    

@app.post('/url',response_model=schemas.MessageResponse)
def url(data:schemas.URLCreate,user_id:Optional [int] = Depends(get_current_user),db:Session=Depends(get_db)):
    new_url=models.URL(
        original_url=str(data.original_url),
        user_id=user_id
        
    )
    db.add(new_url)
    db.flush()
    short_code = encode(new_url.id)
    if data.custom_code:
        custom=data.custom_code.lower().replace(" ","-")
        existing=db.query(models.URL).filter(
            models.URL.short_code==custom
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Custom code already taken")
        final_code = custom
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
    url.click_count+=1
    db.commit()

    return RedirectResponse(url=url.original_url)

@app.get("/urls",response_model=List[schemas.URLResponse])
def get_url(current_user=Depends(auth.get_current_user),db:Session=Depends(get_db),page:int=1,limit=10):
    urls=db.query(models.URL).filter(
        models.URL.user_id==current_user.id
    ).all()
    return[{
        "original_url": url.original_url,
        "short_url": url.short_url,
        "short_code": url.short_code,
        "click_count": url.click_count,
        "created_at": url.created_at,
        "expired_at": url.expired_at,
    }
    for url in urls

    ]
        

    

    

    
    

