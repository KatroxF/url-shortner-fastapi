# URL Shortener 🚀

A full-stack URL shortener built with FastAPI, PostgreSQL, and React featuring authentication and analytics tracking.

---

## ✨ Features

- 🔗 Shorten long URLs
- ✍️ Custom short codes
- ⚡ Fast redirect system
- 🔐 JWT-based authentication
- 📊 Analytics dashboard
- 👥 Unique visitor tracking
- 👆 Total click tracking
- 🌍 Visitor location tracking
- 💻 Device & OS detection
- 📅 Date range filtering
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

> ⚠️ Demo/sample analytics data is used in dashboard previews for showcase purposes.

---

## 🛠️ Tech Stack

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL

### Frontend
- React

### Other Technologies
- JWT Authentication
- REST API
- Analytics Tracking System

---

## 🚧 Project Status

- ✅ URL shortening system completed
- ✅ Authentication system completed
- ✅ Analytics system implemented
- ✅ Analytics dashboard completed

---

## 📌 Upcoming Features

- ⏳ Link expiration support
- 🚦 Rate limiting
- ⚡ Redis caching

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

### Backend Setup

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

# Run backend server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
