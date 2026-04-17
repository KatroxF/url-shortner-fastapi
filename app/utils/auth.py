from datetime import datetime,timedelta,timezone
from authlib.jose import jwt ,JoseError
from fastapi import HTTPException,Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import SECRET_KEY



ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRY_MINUTES = 30
security = HTTPBearer(auto_error=False)

def create_access_token(data:dict):
    header={"alg":ALGORITHM}
    expire=datetime.now(timezone.utc)+timedelta(
        minutes=ACCESS_TOKEN_EXPIRY_MINUTES
    )
    payload=data.copy()
    payload.update({
        "exp":expire
    })
    token= jwt.encode(header,payload, SECRET_KEY)
    return token
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if credentials is None:
        return None
     
    token = credentials.credentials

    return verify_access_token(token)
def verify_access_token(token:str):
    try:
        claims=jwt.decode(token,SECRET_KEY)
        claims.validate()
        return claims["user_id"]
    except JoseError:
        raise HTTPException(
        status_code=401,
        detail="Invalid or expired token")
