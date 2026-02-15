# CodeLens AI

An AI-powered code review platform that analyzes code for bugs, style issues, and improvements using Claude AI.

## Architecture

```
┌─────────────┐     HTTP      ┌─────────────┐     HTTP      ┌─────────────┐
│   Client    │ ────────────► │   Backend   │ ────────────► │ ML Service  │
│  (Browser)  │               │  (Node.js)  │               │  (Python)   │
└─────────────┘               └──────┬──────┘               └──────┬──────┘
                                     │                             │
                                     │                             │
                              ┌──────▼──────┐               ┌──────▼──────┐
                              │ PostgreSQL  │               │  Claude AI  │
                              │  Database   │               │     API     │
                              └─────────────┘               └─────────────┘
                                     │
                              ┌──────▼──────┐
                              │    Redis    │
                              │ Job Queue   │
                              └─────────────┘
```

## Tech Stack

**Backend**
- Node.js + Express + TypeScript
- PostgreSQL with Prisma ORM
- Redis + BullMQ for job queues
- JWT authentication

**ML Service**
- Python + FastAPI
- Claude AI (Anthropic API)

## Features

- **User Authentication** - Register, login with JWT tokens
- **Code Submission** - Submit code snippets for review
- **Async Processing** - Background job queue for AI analysis
- **Status Tracking** - Real-time status updates (pending → processing → done)
- **Review History** - View past code reviews
- **Rate Limiting** - API protection against abuse

## How It Works

1. User submits code via API
2. Backend saves to PostgreSQL, adds job to Redis queue
3. Worker picks up job, updates status to "processing"
4. Worker calls Python ML service
5. ML service sends code to Claude AI for analysis
6. Worker saves result, updates status to "done"
7. User retrieves result

## API Endpoints

### Authentication
```
POST /register    - Create account
POST /login       - Get JWT token
```

### Reviews
```
POST   /review      - Submit code for review (auth required)
GET    /reviews     - Get all reviews (auth required)
GET    /review/:id  - Get single review (auth required)
PUT    /review/:id  - Update review (auth required)
DELETE /review/:id  - Delete review (auth required)
```

### ML Service
```
POST /analyze     - Analyze code (internal)
```

## Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL
- Redis

### Backend

```bash
cd backend
npm install
```

Create `.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/codereview"
JWT_SECRET="your-secret-key"
```

Setup database:
```bash
npx prisma db push
npx prisma generate
```

Run:
```bash
npx ts-node src/index.ts
```

### ML Service

```bash
cd ml-service
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn anthropic
```

Create `.env`:
```
ANTHROPIC_API_KEY="your-api-key"
```

Run:
```bash
uvicorn main:app --reload --port 8000
```

### Redis

```bash
sudo service redis-server start
```

## Project Structure

```
codelens-ai/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, rate limiting
│   │   ├── workers/        # Background job processors
│   │   ├── types/          # TypeScript interfaces
│   │   └── index.ts        # Entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
│
├── ml-service/
│   └── main.py             # FastAPI + Claude integration
│
└── README.md
```

## Database Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  reviews   Review[]
}

model Review {
  id        Int      @id @default(autoincrement())
  code      String
  result    String?
  status    String   @default("pending")
  createdAt DateTime @default(now())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
}
```

## Usage Example

```bash
# Register
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@test.com", "password": "password123"}'

# Login
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@test.com", "password": "password123"}'

# Submit code (use token from login)
curl -X POST http://localhost:3000/review \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"code": "var x = 5;"}'

# Get result
curl http://localhost:3000/review/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Design Decisions

**Why job queues?**
AI analysis takes several seconds. Instead of blocking the HTTP request, we return immediately and process asynchronously. This improves user experience and prevents timeouts.

**Why microservices?**
Separating the ML service from the backend allows independent scaling. The Python service can be replaced with a different model without touching the Node.js code.

**Why JWT?**
Stateless authentication that scales horizontally. No session storage needed on the server.

## License

MIT
