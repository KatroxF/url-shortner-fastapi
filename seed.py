from app.db.database import SessionLocal
from app.schemas import models

db = SessionLocal()
BATCH = 10_000
TOTAL = 500_000

for start in range(0, TOTAL, BATCH):
    rows = [
        {"original_url": f"https://example.com/page/{i}", "short_code": f"load{i}"}
        for i in range(start, start + BATCH)
    ]
    db.bulk_insert_mappings(models.URL, rows)
    db.commit()
    print("inserted", start + BATCH)

db.close()