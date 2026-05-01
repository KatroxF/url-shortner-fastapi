from fastapi import FastAPI,Depends,HTTPException,Request,Response
from sqlalchemy.orm import Session
from fastapi.responses import RedirectResponse
from typing import Optional
from datetime import timedelta

from app.db.database import engine, SessionLocal, Base 
from app.utils.util import encode
from app.schemas import models
from app.schemas import schemas
from typing import List
from app.utils import security
from app.utils import auth
from app.utils.auth import get_current_user
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
import uuid
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
def login(user:schemas.UserLogin,db:Session=Depends(get_db)):
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
    
@app.get('/me',response_model=schemas.UserResponse)
def read_me(current_user_id:int=Depends(get_current_user),db:Session=Depends(get_db)):
    user=db.query(models.User).filter(models.User.id==current_user_id).first()
    if not user:
        raise HTTPException(status_code=404,detail="User not found")
    return user
@app.post('/url',response_model=schemas.MessageResponse)
def url(data:schemas.URLCreate,user_id:Optional [int] = Depends(get_current_user),db:Session=Depends(get_db)):
    new_url=models.URL(
        original_url=str(data.original_url),
        user_id=user_id
        
    )
    db.add(new_url)
    db.flush()  #sent req to db without commiting
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
@app.get('/urls',response_model=List[schemas.URLResponse])
def get_url(current_user=Depends(auth.get_current_user),db:Session=Depends(get_db),page:int=1,limit:int=10):
    urls=db.query(models.URL).filter(
        models.URL.user_id==current_user
    ).all()
    return[{
        "original_url": url.original_url,
        "short_url": f"http://localhost:8000/{url.short_code}",
        "short_code": url.short_code,
        "click_count": url.click_count,
        "created_at": url.created_at,
        "expired_at": url.expired_at,
    }
    for url in urls

    ]
@app.get('/urls/recent',response_model=List[schemas.URLStatsResponse])
def get_recent_urls(current_user=Depends(auth.get_current_user),db:Session=Depends(get_db)):
    urls=db.query(models.URL).filter(
        models.URL.user_id==current_user
    ).order_by(models.URL.created_at.desc()).limit(5).all()
    return[{
        "id": url.id,
        "short": url.short_code,
        "long": url.original_url,
        "clicks": url.click_count or 0,
        "created": url.created_at.strftime("%Y-%m-%d")
    }
    for url in urls]

@app.get("/analytics/{short_code}",response_model=schemas.URLStatsResponse)
def get_url_analytics(short_code: str, db:Session=Depends(get_db)):
    url=db.query(models.URL).filter(models.URL.short_code==short_code).first()
    if not url:
        raise HTTPException(status_code=404,detail="URL not found")
    total_clicks=db.query(func.count(models.Clicks.id)).filter(models.Clicks.url_id==url.id).scalar() or 0
    unique_visitors=db.query(func.count(func.distinct(models.Clicks.visitor_id))
                             ).filter(models.Clicks.url_id==url.id).scalar() or 0
    peak_day_result=db.query(
        func.date(models.Clicks.timestamp).label("day"),
        func.count(models.Clicks.id).label("clicks")
    ).filter(models.Clicks.url_id==url.id).group_by(func.date(models.Clicks.timestamp)).order_by(func.count(models.Clicks.id).desc()).first()
    peak_day=peak_day_result.day if peak_day_result else None
    clicks_data=db.query(
        func.date(models.Clicks.timestamp).label("day"),
        func.count(models.Clicks.id).label("clicks")
    ).filter(
        models.Clicks.url_id==url.id,
        models.Clicks.timestamp>=start_date,
        models.Clicks.timestamp<=end_date
    ).group_by(func.date(models.Clicks.timestamp)).order_by(func.date(models.Clicks.timestamp)).all()
    data_dict={row.day:row.clicks for row in clicks_data}
    current=start_date.date()
    end=end_date.date()
    labels=[]
    clicks=[]
    while current <= end:
        labels.append(current.strftime("%b %d"))
        clicks.append(data_dict.get(current, 0))  #
        current += timedelta(days=1)

    return {
        "totalClicks": total_clicks,
        "uniqueVisitors": unique_visitors,
        "peakDay": peak_day,
        "shortCode": url.short_code,
        "originalUrl": url.original_url
    }
   

@app.get("/{short_code}")
def redirect_url(short_code: str,request: Request,response: Response,db: Session = Depends(get_db)):

    url = db.query(models.URL).filter(
        models.URL.short_code == short_code
    ).first()

    if not url:
        raise HTTPException(status_code=404, detail="Invalid url")

    
    visitor_id = request.cookies.get("visitor_id")
    new_visitor = False

    if not visitor_id:
        visitor_id = str(uuid.uuid4())
        new_visitor = True

    
    ip = request.client.host

    click = models.Clicks(
        url_id=url.id,
        ip_address=ip,
        visitor_id=visitor_id,
    )
    db.add(click)

    
    url.click_count += 1

    db.commit()

   
    redirect_response = RedirectResponse(url=url.original_url)


    if new_visitor:
        redirect_response.set_cookie(
            key="visitor_id",
            value=visitor_id,
            httponly=True,
            max_age=365*24*60*60
        )

    return redirect_response

    


        

    

    

    
    

