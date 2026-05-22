# URL Shortener 🚀

A scalable full-stack URL shortener built with FastAPI, PostgreSQL, React, Redis, and Celery featuring authentication, analytics tracking, caching, and asynchronous background processing.

---

## ✨ Features

- 🔗 Shorten long URLs
- ✍️ Custom short codes
- ⚡ High-speed redirect system with Redis caching
- 🔐 JWT-based authentication
- 📊 Real-time analytics dashboard
- 👥 Unique visitor tracking
- 👆 Total click tracking
- 🌍 Visitor location tracking
- 💻 Device & OS detection
- 📅 Date-wise analytics filtering
- ⚙️ Background analytics processing using Celery
- 📡 REST API integration

---

## 📊 Analytics Features

Each shortened URL provides analytics including:

- Total clicks
- Unique visitors
- Peak traffic day
- Daily click insights
- Device & platform distribution
- Visitor country/state tracking
- Traffic activity trends

> ⚠️ Demo/sample analytics data may be used in dashboard previews for showcase purposes.

---

## ⚡ Performance & Scalability

- Implemented Redis caching for faster URL retrieval and reduced database load
- Integrated Celery + Redis background workers for asynchronous analytics processing
- Optimized redirect performance for handling concurrent traffic efficiently
- Separated analytics processing from request-response cycle to improve response time

---

## 🛠️ Tech Stack

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- Redis
- Celery

### Frontend
- React

### Other Technologies
- JWT Authentication
- REST APIs
- Background Task Queue
- Analytics Tracking System
- Docker (Optional)

---

## 🚧 Project Status

- ✅ URL shortening system completed
- ✅ Authentication system completed
- ✅ Analytics system implemented
- ✅ Analytics dashboard completed
- ✅ Redis caching integrated
- ✅ Celery background workers integrated

---

## 📌 Upcoming Features

- ⏳ Link expiration support
- 🚦 API rate limiting
- 📈 Advanced traffic visualization
- ☁️ Cloud deployment

---

## 📷 Preview

### Home Dashboard

![Home Dashboard](./screenshots/Home.png)

### Analytics Dashboard

![Analytics Dashboard](./screenshots/Analytics.png)

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/your-username/url-shortener.git
cd url-shortener
```

---

## Backend Setup

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
uvicorn app.route.main:app --reload
```

Backend will run on:

```bash
http://127.0.0.1:8000
```

---

## Frontend Setup

```bash
cd urlfrontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on:

```bash
http://localhost:5173
```

---

## 📡 API Features

- User authentication APIs
- URL shortening APIs
- Redirect handling APIs
- Analytics APIs
- Visitor tracking APIs

---

## 📂 Project Structure

```bash
url-shortener/
│
├── backend/
│   ├── app/
│   ├── requirements.txt
│   ├── .env
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
│
└── README.md
```

---

## 🚀 Future Improvements

- AI-powered analytics summaries
- QR code generation for shortened URLs

---





## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.
