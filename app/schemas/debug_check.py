from app.db.database import SessionLocal, engine
from app.schemas import models

print("Engine URL:", engine.url)

db = SessionLocal()

user = db.query(models.User).filter(models.User.id == 11).first()
print("Query result for id=11:", user)

all_users = db.query(models.User).all()
print("\nAll users in this DB:")
for u in all_users:
    print(u.id, u.username, u.email, u.google_id)

db.close()