# Backend Quick Start Guide

Follow these steps to get your backend running and verified.

## Quick Setup (5 Steps)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

```bash
# Copy the example file
cp env.example .env

# Edit .env and update these values:
# - DATABASE_URL (your PostgreSQL connection string)
# - JWT_SECRET (change to a secure random string)
# - PORT (default: 5000)
# - CLIENT_ORIGIN (your frontend URL)
```

### 3. Setup Database

```bash
# Create the database (if it doesn't exist)
# Using psql:
psql -U postgres
CREATE DATABASE vendorhub_connect;
\q

# Run migrations to create tables
npm run prisma:generate
npm run prisma:migrate

# Seed with sample data (optional)
npm run seed
```

### 4. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# OR Production mode
npm start
```

You should see: `API server listening on port 5000`

### 5. Verify It's Working

**Test Health Endpoint:**

- Browser: http://localhost:5000/health
- Or: `curl http://localhost:5000/health`

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

## Quick Tests

### Test Authentication

```bash
# Login with seeded demo user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vendor@example.com","password":"Password123!"}'
```

### Test Products

```bash
curl http://localhost:5000/api/products
```

### Test Search

```bash
curl "http://localhost:5000/api/search?q=headphones"
```

## Troubleshooting

**"Port already in use"**

- Change PORT in .env or kill the process on port 5000

**"Database connection failed"**

- Make sure PostgreSQL is running
- Verify DATABASE_URL in .env is correct
- Ensure database `vendorhub_connect` exists

**"Prisma Client not configured"**

- Run: `npm run prisma:generate`

**"Migration failed"**

- Run: `npx prisma migrate reset` (WARNING: deletes data)
- Then: `npm run prisma:migrate`

## What to Check

- ✅ Server starts on port 5000
- ✅ `/health` endpoint returns success
- ✅ Can login with seeded user
- ✅ Can fetch products/vendors/jobs
- ✅ Search endpoint works

See `SETUP.md` for detailed documentation.
