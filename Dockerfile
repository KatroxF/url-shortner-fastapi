FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /code

# libpq for psycopg2 (drop if you use psycopg2-binary / SQLite)
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# app/, alembic/, alembic.ini ... (see .dockerignore for what is excluded)
COPY . .

RUN useradd -m appuser && chown -R appuser /code
USER appuser

EXPOSE 8000
CMD ["uvicorn", "app.route.main:app", "--host", "0.0.0.0", "--port", "8000", \
     "--proxy-headers", "--forwarded-allow-ips", "*"]