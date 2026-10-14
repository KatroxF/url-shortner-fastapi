from app.db.database import SessionLocal
from app.schemas import models

db = SessionLocal()

BATCH = 100
TOTAL = 500

try:
    for start in range(0, TOTAL, BATCH):
        rows = [
            {
                "original_url": f"https://example.com/page/{i}",
                "short_code": f"load{i}",
            }
            for i in range(start, min(start + BATCH, TOTAL))
        ]

        db.bulk_insert_mappings(models.URL, rows)
        db.commit()
        print(f"Inserted {min(start + BATCH, TOTAL)} / {TOTAL}")

finally:
    db.close()
