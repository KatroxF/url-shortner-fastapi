# SmartLink Analytics Platform 🚀

A full-stack URL shortener and link analytics platform built with **FastAPI**, **PostgreSQL**, **React**, **Redis**, and **Celery**.

SmartLink allows users to create shortened URLs, manage their links, track visitor activity, view analytics, and generate AI-assisted analytics summaries.

---

## ✨ Features

- 🔗 Create shortened URLs
- ✍️ Support custom short codes
- 🔐 User registration and JWT authentication
- ⚡ Redis-powered URL redirect caching
- 📊 Link analytics dashboard
- 👥 Unique visitor tracking
- 👆 Total click tracking
- 🌍 Visitor country and city tracking
- 💻 Device and operating-system detection
- 📅 Date-based analytics filtering
- ⚙️ Asynchronous analytics processing with Celery
- 🚦 Login rate limiting
- 🤖 AI-assisted analytics summaries
- 📡 REST API integration
- 🗃️ PostgreSQL persistence with SQLAlchemy
- 🔄 Database migrations with Alembic

---

## 🧠 System Design Overview

The application uses a layered full-stack architecture:

1. A user registers or logs in through the React frontend.
2. FastAPI validates the request and authenticates the user using JWT.
3. When a user creates a URL, the backend stores it in PostgreSQL.
4. The backend generates a unique short code.
5. Frequently accessed short URLs are cached in Redis.
6. Redirect requests check Redis before querying PostgreSQL.
7. Each redirect schedules an asynchronous Celery analytics task.
8. The Celery worker collects visitor metadata and stores click analytics.
9. The React dashboard retrieves link and analytics data through REST APIs.
10. Users can request AI-generated summaries for their link analytics.

---

## 🏗️ Architecture

```mermaid
flowchart TD
    Client["React + Vite Frontend"] -->|HTTP / REST API| API["FastAPI Application"]

    API --> Auth["JWT Authentication"]
    API --> Routes["URL and Analytics Routes"]
    API --> DB["SQLAlchemy Database Layer"]
    API --> Cache["Redis Cache"]
    API --> Queue["Celery Task Queue"]
    API --> AI["AI Analytics Service"]

    DB --> PostgreSQL[("PostgreSQL")]

    Cache --> Redis[("Redis")]

    Queue --> Worker["Celery Worker"]
    Worker --> Geo["IP Geolocation API"]
    Worker --> PostgreSQL

    AI --> Groq["Groq API"]
```

### Request and redirect flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API as FastAPI
    participant Redis
    participant PostgreSQL
    participant Worker as Celery Worker

    User->>Frontend: Open shortened URL
    Frontend->>API: Request /{short_code}

    API->>Redis: Search url:{short_code}

    alt URL exists in Redis
        Redis-->>API: Return cached URL
    else URL is not cached
        API->>PostgreSQL: Find URL by short_code
        PostgreSQL-->>API: Return URL
        API->>Redis: Cache URL for 1 hour
    end

    API->>Worker: Schedule click analytics task
    API-->>User: Redirect to original URL

    Worker->>Worker: Detect device and user agent
    Worker->>Worker: Resolve visitor location
    Worker->>PostgreSQL: Store click event and increment click count
```

### Authentication flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API as FastAPI
    participant PostgreSQL

    User->>Frontend: Submit login credentials
    Frontend->>API: POST /login
    API->>PostgreSQL: Find user by email
    PostgreSQL-->>API: Return user
    API->>API: Verify password
    API->>API: Create JWT token
    API-->>Frontend: Return access_token
    Frontend->>API: Send Bearer token
    API->>API: Validate JWT
    API-->>Frontend: Return protected resource
```

---

## 🧱 Backend Architecture

The backend is organized under the `app/` package.

```text
app/
├── core/
│   └── config.py
│       └── Loads environment variables and application configuration
│
├── db/
│   ├── database.py
│   │   └── SQLAlchemy engine, session factory, and declarative Base
│   └── redis.py
│       └── Async Redis client used for URL caching
│
├── route/
│   └── main.py
│       └── FastAPI application and API endpoints
│
├── schemas/
│   ├── models.py
│   │   └── SQLAlchemy database models
│   └── schemas.py
│       └── Pydantic request and response schemas
│
├── service/
│   ├── service.py
│   │   └── Celery application configuration
│   ├── task.py
│   │   └── Background click analytics task
│   ├── ai_service.py
│   │   └── AI-powered analytics functionality
│   └── tools.py
│       └── Service helper functions
│
└── utils/
    ├── auth.py
    │   └── JWT token creation and validation
    ├── security.py
    │   └── Password hashing and verification
    ├── ratelimit.py
    │   └── Login rate-limiting logic
    └── util.py
        └── Short-code generation utilities
```

### Backend request flow

```text
HTTP Request
    │
    ▼
FastAPI route in app/route/main.py
    │
    ├── Validate request using app/schemas/schemas.py
    ├── Authenticate using app/utils/auth.py
    ├── Apply security and rate limiting
    ├── Read or write data using SQLAlchemy
    ├── Read or write cached data using Redis
    └── Dispatch background tasks using Celery
```

---

## 🗃️ Database Architecture

The application uses PostgreSQL with SQLAlchemy ORM.

### Database entities

```mermaid
erDiagram
    USERS ||--o{ URLS : creates
    URLS ||--o{ CLICKS : receives

    USERS {
        int id PK
        string username UK
        string email UK
        string hashed_password
        datetime created_at
    }

    URLS {
        int id PK
        string original_url
        string short_code UK
        int user_id FK
        datetime created_at
        datetime expired_at
        int click_count
    }

    CLICKS {
        int id PK
        int url_id FK
        datetime timestamp
        string ip_address
        string visitor_id
        string user_agent
        string device_os
        string country
        string country_code
        string city
        string referrer
    }
```

### Database models

- `User` stores registered user accounts.
- `URL` stores original URLs, short codes, ownership, expiration information, and click counts.
- `Clicks` stores individual redirect events and visitor metadata.
- A composite index is used on click URL IDs and timestamps to support analytics queries.
- Alembic migrations are stored in `alembic/versions/`.

---

## ⚡ Caching Architecture

Redis is used to improve redirect performance.

When a short URL is requested:

1. FastAPI checks Redis using the key `url:{short_code}`.
2. If the URL exists in Redis, the cached value is used.
3. If the URL is not cached, PostgreSQL is queried.
4. The result is stored in Redis with a one-hour expiration.
5. The user is redirected to the original URL.

```text
Redis key:
url:{short_code}

Cached value:
{
  "id": 123,
  "original_url": "https://example.com"
}
```

Redis is also used by the rate-limiting functionality.

---

## ⚙️ Background Analytics Processing

Redirect requests should remain fast, so analytics processing is delegated to Celery.

The task in `app/service/task.py`:

- Receives the URL ID and visitor information.
- Resolves the visitor's location using an IP geolocation service.
- Parses the browser user-agent string.
- Detects the visitor device type.
- Stores a new click record in PostgreSQL.
- Increments the URL click counter.

```text
Redirect request
    │
    ├── Return redirect immediately
    └── Queue save_click_analytics task
                    │
                    ├── Detect device
                    ├── Resolve location
                    ├── Store click event
                    └── Increment URL click count
```

---

## 🤖 AI Analytics

The application includes an AI analytics endpoint.

Users can submit a prompt for one of their URLs. The backend validates URL ownership and forwards the request to the AI service.

```text
POST /summary/{short_code}
```

Example request:

```json
{
  "prompt": "Summarize the most important traffic trends for this link."
}
```

The AI service uses the configured Groq API key.

---

## 🛠️ Technology Stack

### Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- PostgreSQL
- Psycopg2
- Pydantic
- Alembic
- Redis
- Celery
- Authlib
- Passlib
- SlowAPI
- Groq

### Frontend

- React
- React DOM
- Vite
- React Router
- Chart.js
- React Chart.js 2
- Tailwind CSS
- ESLint

### Infrastructure

- PostgreSQL
- Redis
- Celery worker
- Optional Docker-based Redis setup

---

## 📂 Project Structure

```text
url-shortner-fastapi/
│
├── app/
│   ├── core/
│   │   └── config.py
│   │
│   ├── db/
│   │   ├── database.py
│   │   └── redis.py
│   │
│   ├── route/
│   │   └── main.py
│   │
│   ├── schemas/
│   │   ├── models.py
│   │   └── schemas.py
│   │
│   ├── service/
│   │   ├── ai_service.py
│   │   ├── service.py
│   │   ├── task.py
│   │   └── tools.py
│   │
│   └── utils/
│       ├── auth.py
│       ├── ratelimit.py
│       ├── security.py
│       └── util.py
│
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│       ├── ab0209f91a56_init.py
│       ├── ab84f1dd1bf6_add_referrer_column.py
│       ├── eadb36e05a46_add_composite_index_on_clicks_url_id_.py
│       └── 146f0a4dbd1b_add_analytics_columns_to_clicks.py
│
├── urlfrontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── LandingPage.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── components/
│   │       ├── Analytics/
│   │       ├── Card/
│   │       ├── Dashboard/
│   │       ├── Hero/
│   │       ├── Home/
│   │       ├── Links/
│   │       ├── Login/
│   │       ├── Modal/
│   │       ├── Navbar/
│   │       ├── Sidebar/
│   │       └── Signup/
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/
│   ├── Analytics.png
│   └── Home.png
│
├── alembic.ini
├── package.json
├── package-lock.json
├── requirements.txt
├── test.py
└── README.md
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register a new user |
| `POST` | `/login` | Authenticate and receive a JWT |
| `GET` | `/me` | Return the current authenticated user |

### URL management

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/url` | Create a shortened URL |
| `GET` | `/urls` | List URLs belonging to the current user |
| `GET` | `/urls/recent` | Return the user's five most recent URLs |
| `GET` | `/links` | Return link information for the current user |
| `GET` | `/{short_code}` | Redirect to the original URL |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytics/{short_code}` | Return analytics for a shortened URL |
| `POST` | `/summary/{short_code}` | Generate an AI analytics summary |

### Analytics response data

The analytics endpoint can provide:

- Total clicks
- Unique visitors
- Peak traffic day
- Daily click counts
- Device statistics
- Country and city statistics
- Original URL information
- Short URL information

---

## 🔐 Environment Variables

Create a `.env` file in the repository root.

```env
SQLALCHEMY_DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/url_shortener
SECRET_KEY=replace_with_a_secure_secret_key
GROQ_API_KEY=replace_with_your_groq_api_key
```

### Environment variable reference

| Variable | Description |
|---|---|
| `SQLALCHEMY_DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | Secret used to sign JWT tokens |
| `GROQ_API_KEY` | API key used by the AI analytics service |

> The backend currently reads `SQLALCHEMY_DATABASE_URL` from `app/core/config.py`.

---

## ⚙️ Installation

### Prerequisites

Install the following before starting the application:

- Python 3.10+
- Node.js and npm
- PostgreSQL
- Redis
- Git

---

### 1. Clone the repository

```bash
git clone https://github.com/KatroxF/url-shortner-fastapi.git
cd url-shortner-fastapi
```

---

### 2. Create and activate a Python virtual environment

#### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

#### Linux/macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

---

### 3. Install backend dependencies

```bash
pip install -r requirements.txt
```

---

### 4. Create the PostgreSQL database

Start PostgreSQL and create the application database:

```sql
CREATE DATABASE url_shortener;
```

Then configure the connection string in `.env`:

```env
SQLALCHEMY_DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/url_shortener
```

---

### 5. Start Redis

Using Docker:

```bash
docker run -d --name smartlink-redis -p 6379:6379 redis
```

Or start your local Redis service.

The current application uses:

```text
redis://localhost:6379/0
```

Celery uses Redis database `1` as its broker and result backend.

---

### 6. Run database migrations

```bash
alembic upgrade head
```

---

### 7. Start the FastAPI backend

```bash
uvicorn app.route.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

Alternative documentation:

```text
http://127.0.0.1:8000/redoc
```

---

### 8. Start the Celery worker

Open a second terminal, activate the virtual environment, and run:

```bash
celery -A app.service.task worker -l info
```

The Celery application is configured in:

```text
app/service/service.py
```

The background analytics task is defined in:

```text
app/service/task.py
```

---

### 9. Start the React frontend

Open another terminal:

```bash
cd urlfrontend
npm install
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

---

## 🧪 Development Commands

### Backend

```bash
uvicorn app.route.main:app --reload
```

### Database migrations

```bash
alembic upgrade head
```

Create a new migration:

```bash
alembic revision --autogenerate -m "describe your change"
```

### Celery

```bash
celery -A app.service.task worker -l info
```

### Frontend

```bash
cd urlfrontend

npm run dev
npm run build
npm run lint
npm run preview
```

### AI service smoke test

The repository includes a small test script:

```bash
python test.py
```

---

## 🖥️ Frontend Routes

The React frontend currently defines these routes:

| Route | Component | Description |
|---|---|---|
| `/` | `LandingPage` | Public landing page |
| `/login` | `Login` | User login screen |
| `/signup` | `Signup` | User registration screen |
| `/dashboard` | `Dashboard` | Authenticated dashboard |

The frontend entry point is:

```text
urlfrontend/src/main.jsx
```

The route configuration is defined in:

```text
urlfrontend/src/App.jsx
```

---

## 📊 Analytics Data Model

Each click event can contain the following information:

- URL ID
- Timestamp
- IP address
- Anonymous visitor ID
- User-agent string
- Device type
- Country
- Country code
- City
- Referrer

Visitor IDs are stored in a cookie named:

```text
visitor_id
```

This allows the application to estimate unique visitors without requiring visitors to log in.

---

## 🔒 Security Considerations

The application currently includes:

- Password hashing
- JWT access tokens
- Token expiration
- Login rate limiting
- Protected user-specific endpoints
- URL ownership checks
- HTTP-only visitor cookies

Before production deployment, consider:

- Restricting CORS origins
- Using a strong production `SECRET_KEY`
- Moving all service URLs to environment variables
- Adding HTTPS
- Validating proxy headers securely
- Adding refresh-token support
- Rotating secrets
- Adding stronger API rate limits
- Avoiding storage of raw IP addresses when not required
- Adding request and application logging
- Running migrations separately from application startup

---

## 🚧 Project Status

### Completed

- ✅ URL shortening
- ✅ Custom short-code support
- ✅ User registration
- ✅ JWT authentication
- ✅ PostgreSQL persistence
- ✅ Redis URL caching
- ✅ Redirect handling
- ✅ Background click analytics
- ✅ Visitor tracking
- ✅ Device detection
- ✅ Location tracking
- ✅ Analytics dashboard
- ✅ Date-based analytics filtering
- ✅ Celery worker integration
- ✅ AI analytics endpoint
- ✅ Alembic migrations

### Planned Improvements

- ⏳ Link expiration enforcement
- ⏳ QR code generation
- ⏳ Advanced traffic visualizations
- ⏳ Production deployment configuration
- ⏳ Docker Compose setup
- ⏳ Automated tests
- ⏳ API versioning
- ⏳ Improved error handling
- ⏳ Centralized frontend API client
- ⏳ Pagination metadata
- ⏳ Refresh-token authentication
- ⏳ Admin dashboard

---

## 📷 Screenshots

### Home Dashboard

![Home Dashboard](./screenshots/Home.png)

### Analytics Dashboard

![Analytics Dashboard](./screenshots/Analytics.png)

---

## 📄 License

Add your preferred license here, for example:

```text
MIT License
```

---

## 👤 Author

Created by [KatroxF](https://github.com/KatroxF).

If you find this project useful, consider giving it a ⭐ on GitHub.
