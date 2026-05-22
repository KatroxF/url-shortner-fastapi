## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/your-username/url-shortener.git
cd url-shortener
```

---

# Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment

# Windows
venv\Scripts\activate

# Linux / Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## Environment Variables Setup

Create a `.env` file inside the `backend` folder:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/url_shortener

SECRET_KEY=your_secret_key


REDIS_URL=redis://localhost:6379/0

FRONTEND_URL=http://localhost:5173
```

> ⚠️ Replace database username, password, and secret key with your own values.

---

## Start PostgreSQL

Make sure PostgreSQL is running and create a database:

```sql
CREATE DATABASE url_shortener;
```

---

## Start Redis Server

```bash
docker run -d -p 6379:6379 redis
```

---

## Start Celery Worker

```bash
celery -A app.services.tasks worker -l info
```

---

## Run Backend Server

```bash
uvicorn app.main:app --reload
```

---

# Frontend Setup

```bash
cd urlfrontend

# Install dependencies
npm install

# Start development server
npm run dev
```
