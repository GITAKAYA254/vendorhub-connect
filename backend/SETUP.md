# Backend Setup and Verification Guide

This guide will help you set up and verify that your backend is working correctly.

## Prerequisites

1. **Node.js** (v18 or higher recommended)
2. **PostgreSQL** database installed and running
3. **npm** or **yarn** package manager

## Step 1: Install Dependencies

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

## Step 2: Database Setup

### 2.1. Ensure PostgreSQL is Running

Make sure PostgreSQL is installed and running on your system. The default connection string expects:

- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Password: `postgres`
- Database: `vendorhub_connect`

### 2.2. Create Environment File

Create a `.env` file in the `backend` directory (copy from `env.example`):

```bash
cp env.example .env
```

Edit `.env` with your actual database credentials:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vendorhub_connect"
PORT=5000
JWT_SECRET="super-secret-key"
CLIENT_ORIGIN="http://localhost:5173"
```

**Important:**

- Update `DATABASE_URL` if your PostgreSQL credentials are different
- Change `JWT_SECRET` to a strong, random string in production
- Update `CLIENT_ORIGIN` if your frontend runs on a different port

### 2.3. Create Database

Create the database if it doesn't exist:

```bash
# Using psql (PostgreSQL command line)
psql -U postgres
CREATE DATABASE vendorhub_connect;
\q
```

Or if you have a different setup, adjust accordingly.

### 2.4. Run Database Migrations

Generate Prisma Client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

This will:

- Generate the Prisma Client
- Create all database tables based on the schema

### 2.5. Seed the Database (Optional)

Populate the database with sample data:

```bash
npm run seed
```

This creates:

- A demo vendor user: `vendor@example.com` / `Password123!`
- A demo customer user: `customer@example.com` / `Password123!`
- Sample products, jobs, and tasks

## Step 3: Start the Backend Server

### Development Mode (with auto-reload):

```bash
npm run dev
```

### Production Mode:

```bash
npm start
```

You should see:

```
API server listening on port 5000
```

## Step 4: Verify Backend is Working

### 4.1. Health Check

Test the health endpoint:

```bash
curl http://localhost:5000/health
```

Or open in browser: http://localhost:5000/health

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

### 4.2. Test Authentication Endpoints

#### Register a New User:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123!",
    "role": "customer"
  }'
```

#### Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@example.com",
    "password": "Password123!"
  }'
```

**Expected Response:** JSON with user data and JWT token

#### Get Current User (requires authentication):

```bash
curl http://localhost:5000/api/auth/user \
  -H "Cookie: token=YOUR_JWT_TOKEN_HERE"
```

### 4.3. Test Other Endpoints

#### Get All Products:

```bash
curl http://localhost:5000/api/products
```

#### Get All Vendors:

```bash
curl http://localhost:5000/api/vendors
```

#### Search:

```bash
curl "http://localhost:5000/api/search?q=headphones"
```

## Step 5: Common Issues and Troubleshooting

### Issue: Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**

- Change the `PORT` in your `.env` file
- Or stop the process using port 5000

### Issue: Database Connection Error

**Error:** `Can't reach database server`

**Solutions:**

1. Verify PostgreSQL is running:

   ```bash
   # Windows
   services.msc (look for PostgreSQL service)

   # Linux/Mac
   sudo systemctl status postgresql
   ```

2. Check your `DATABASE_URL` in `.env` matches your PostgreSQL setup
3. Verify database exists: `psql -U postgres -l` (should list `vendorhub_connect`)

### Issue: Prisma Client Not Generated

**Error:** `PrismaClient is not configured`

**Solution:**

```bash
npm run prisma:generate
```

### Issue: Migration Errors

**Error:** Migration failed

**Solution:**

```bash
# Reset database (WARNING: This deletes all data)
npx prisma migrate reset

# Or create a fresh migration
npm run prisma:migrate
```

## Step 6: Verify All Features

### Available API Endpoints:

- **Authentication:**

  - `POST /api/auth/register` - Register new user
  - `POST /api/auth/login` - Login
  - `POST /api/auth/logout` - Logout
  - `GET /api/auth/user` - Get current user (protected)

- **Vendors:**

  - `GET /api/vendors` - List all vendors
  - `GET /api/vendors/:id` - Get vendor details
  - `PUT /api/vendors/profile` - Update vendor profile (protected, vendor only)

- **Products:**

  - `GET /api/products` - List all products
  - `GET /api/products/:id` - Get product details
  - `POST /api/products` - Create product (protected, vendor only)
  - `PUT /api/products/:id` - Update product (protected, vendor only)
  - `DELETE /api/products/:id` - Delete product (protected, vendor only)

- **Jobs:**

  - `GET /api/jobs` - List all jobs
  - `GET /api/jobs/:id` - Get job details
  - `POST /api/jobs` - Create job (protected, vendor only)
  - `PUT /api/jobs/:id` - Update job (protected, vendor only)

- **Tasks:**

  - `GET /api/tasks` - List all tasks
  - `GET /api/tasks/:id` - Get task details
  - `POST /api/tasks` - Create task (protected, vendor only)
  - `PUT /api/tasks/:id` - Update task (protected, vendor only)

- **Search:**
  - `GET /api/search?q=query` - Search across products, jobs, tasks

## Quick Verification Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with correct values
- [ ] PostgreSQL database created
- [ ] Database migrations run successfully
- [ ] Database seeded (optional but recommended)
- [ ] Server starts without errors
- [ ] Health endpoint returns `{"success": true, "data": {"status": "ok"}}`
- [ ] Can register a new user
- [ ] Can login and receive JWT token
- [ ] Can access protected endpoints with authentication
- [ ] Can fetch products, vendors, jobs, and tasks

## Testing with Frontend

Once the backend is verified:

1. Ensure `CLIENT_ORIGIN` in `.env` matches your frontend URL
2. Start your frontend application
3. Test the full integration:
   - User registration/login
   - Browse products
   - View vendor profiles
   - Search functionality

## Production Considerations

Before deploying to production:

1. **Change JWT_SECRET** to a strong, random string
2. **Update DATABASE_URL** to your production database
3. **Set proper CORS origins** in `CLIENT_ORIGIN`
4. **Use environment-specific configurations**
5. **Enable HTTPS**
6. **Set up proper error logging and monitoring**
7. **Configure rate limiting**
8. **Set up database backups**

## Need Help?

If you encounter issues:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL is running and accessible
4. Check that all migrations have been applied
5. Review the API endpoint responses for specific error details
