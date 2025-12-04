# API Documentation

This document lists backend API endpoints, request/response shapes, and common errors.

Base URL: `http://localhost:5000` (or `PORT`)

## Auth

- `POST /api/auth/register`
  - Body: `{ name, email, password, isVendor? }`
  - Response: `{ success: true, data: { user, token }}`
  - Errors: 409 Email already registered

- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Response: `{ success: true, data: { user, token }}`
  - Notes: server sets HTTP-only cookie `token` and also returns token in JSON.

- `POST /api/auth/logout`
  - Clears cookie

- `GET /api/auth/user` (protected)
  - Requires Authorization header `Bearer <token>` or cookie `token`.

## Products

- `GET /api/products` — list products
- `GET /api/products/:id` — get product
- `POST /api/products` — create product (vendor or admin)
- `PUT /api/products/:id` — update product (owner vendor or admin)
- `DELETE /api/products/:id` — delete product (owner vendor or admin)

## Vendors

- Standard CRUD under `/api/vendors`

## Jobs & Tasks

- Endpoints under `/api/jobs` and `/api/tasks` for CRUD operations. Vendor-only endpoints require vendor role.

## Errors

All errors follow shape: `{ success: false, error: "message" }` or `{ success: false, message, details }`.
