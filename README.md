# Auth Master

A beginner-friendly authentication project built with modern full-stack tools.

This repo is designed to help you learn real-world auth, not just login/signup UI.
You will learn how registration, OTP email verification, JWT access/refresh tokens,
cookie-based sessions, route protection, role-based access, and logout-all-devices work together.

## What You Will Learn

- How to register users securely with hashed passwords (bcrypt)
- How OTP email verification works before allowing login
- How access tokens and refresh tokens work together
- How to store refresh tokens and sessions in PostgreSQL with Prisma
- How to protect routes in Next.js 16+ using `proxy.ts`
- How to implement role-based access (`USER`, `ADMIN`, `GUEST`)
- How to build logout and logout-all-devices flows safely

## Tech Stack Used In This Repo

- Next.js 16+ (App Router)
- React 19
- Tailwind CSS v4
- shadcn/ui
- Prisma 7
- PostgreSQL 16
- JSON Web Tokens (`jsonwebtoken`)
- bcrypt (`bcryptjs`)
- Nodemailer (OTP email sending)

## Project Overview

This app implements a complete auth flow:

1. User registers with email + password.
2. Password is hashed and user is created as unverified.
3. OTP code is generated, saved in DB, and sent by email.
4. User verifies OTP.
5. User logs in and receives:
   - access token (short-lived, 15 min)
   - refresh token (long-lived, 7 days)
6. Tokens are stored in `HttpOnly` cookies.
7. Protected pages are guarded by Next.js `proxy.ts`.
8. User can logout current device or all devices.

## Auth Architecture (Simple Mental Model)

- **Access token:** quick identity check for protected routes.
- **Refresh token:** used to issue a new access token when old one expires.
- **DB refresh token table:** lets you revoke sessions server-side.
- **Token version on user:** incrementing it invalidates all old tokens instantly.
- **Session table:** tracks active devices.

## Main Routes

### UI Pages

- `/register` -> create account
- `/verify` -> enter OTP
- `/login` -> sign in
- `/dashboard` -> protected user area
- `/admin` -> protected admin-only page

### API Endpoints

- `POST /api/auth/register` -> create user, generate OTP, send email
- `POST /api/auth/verify-otp` -> verify OTP, mark user verified
- `POST /api/auth/login` -> validate credentials, set token cookies
- `POST /api/auth/refresh` -> issue new access token using refresh token
- `POST /api/auth/logout` -> clear current login session
- `POST /api/auth/logout-all` -> invalidate all sessions/devices
- `GET /api/auth/me` -> return current user payload from access token
- `GET /api/auth/sessions` -> list active sessions/devices

## Sample API Requests And Responses

Use these examples to test the auth flow with Postman, Insomnia, or curl.

### 1) Register

Request:

```bash
curl -X POST http://localhost:3000/api/auth/register \
   -H "Content-Type: application/json" \
   -d '{"email":"john@example.com","password":"secret123"}'
```

Example success response:

```json
{
  "message": "User registered. Please verify OTP sent to email.",
  "user": {
    "id": "cm...",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

### 2) Verify OTP

Request:

```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
   -H "Content-Type: application/json" \
   -d '{"email":"john@example.com","code":"123456"}'
```

Example success response:

```json
{
  "message": "Email verified successfully. You can now log in."
}
```

### 3) Login (sets HttpOnly cookies)

Request:

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
   -H "Content-Type: application/json" \
   -d '{"email":"john@example.com","password":"secret123"}'
```

Example success response body:

```json
{
  "message": "Logged in Successfully",
  "user": {
    "id": "cm...",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

Header note:

- Response contains `Set-Cookie` for `access_token` and `refresh_token`.

### 4) Get Current User

Request:

```bash
curl -X GET http://localhost:3000/api/auth/me \
   -H "Cookie: access_token=YOUR_ACCESS_TOKEN"
```

Example success response:

```json
{
  "user": {
    "id": "cm...",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

### 5) Refresh Access Token

Request:

```bash
curl -i -X POST http://localhost:3000/api/auth/refresh \
   -H "Cookie: refresh_token=YOUR_REFRESH_TOKEN"
```

Example success response:

```json
{
  "message": "Token refreshed successfully"
}
```

Header note:

- Response sets a fresh `access_token` cookie.

### 6) Get Active Sessions

Request:

```bash
curl -X GET http://localhost:3000/api/auth/sessions \
   -H "Cookie: access_token=YOUR_ACCESS_TOKEN"
```

Example success response:

```json
{
  "sessions": [
    {
      "id": "cm...",
      "deviceInfo": "Mozilla/5.0 ...",
      "lastSeen": "2026-03-30T10:30:00.000Z",
      "createdAt": "2026-03-30T09:45:00.000Z"
    }
  ],
  "count": 1
}
```

### 7) Logout Current Device

Request:

```bash
curl -X POST http://localhost:3000/api/auth/logout \
   -H "Cookie: refresh_token=YOUR_REFRESH_TOKEN"
```

Example success response:

```json
{
  "message": "Logged out successfully"
}
```

### 8) Logout All Devices

Request:

```bash
curl -X POST http://localhost:3000/api/auth/logout-all \
   -H "Cookie: refresh_token=YOUR_REFRESH_TOKEN"
```

Example success response:

```json
{
  "message": "Logged out from all devices successfully"
}
```

## Auth Flow Visual

```mermaid
flowchart TD
      A[User Registers] --> B[POST /api/auth/register]
      B --> C[Hash password with bcrypt]
      C --> D[Create user isVerified=false]
      D --> E[Generate OTP and save in Otp table]
      E --> F[Send OTP email]
      F --> G[User submits OTP]
      G --> H[POST /api/auth/verify-otp]
      H --> I[Mark OTP used and user isVerified=true]
      I --> J[User logs in]
      J --> K[POST /api/auth/login]
      K --> L[Create access token 15m]
      K --> M[Create refresh token 7d]
      M --> N[Save refresh token + session in DB]
      L --> O[Set access_token cookie HttpOnly]
      M --> P[Set refresh_token cookie HttpOnly]
      O --> Q[Open /dashboard or protected route]
      P --> Q
      Q --> R{Access token valid?}
      R -- Yes --> S[proxy.ts allows request]
      R -- No --> T[POST /api/auth/refresh]
      T --> U{Refresh token valid and in DB?}
      U -- Yes --> V[Issue new access token cookie]
      U -- No --> W[Force login again]
      V --> S
      S --> X[User can logout or logout-all]
      X --> Y[Delete tokens/sessions and clear cookies]
```

## Data Model (Prisma + Postgres)

The schema contains:

- `User` -> account data, role, verification status, tokenVersion
- `RefreshToken` -> one row per refresh token
- `Session` -> device/session tracking
- `Otp` -> email verification codes with expiry + used flag

## Folder Guide

- `app/api/auth/*` -> backend auth logic (register/login/refresh/logout/...)
- `app/register`, `app/login`, `app/verify` -> auth UI pages
- `app/dashboard`, `app/admin` -> protected pages
- `lib/jwt.ts` -> sign/verify JWTs
- `lib/prisma.ts` -> Prisma client setup (Prisma 7 style)
- `lib/mailer.ts` -> OTP email delivery
- `proxy.ts` -> route protection + role guard in Next.js 16+
- `prisma/schema.prisma` -> database schema

## Prerequisites

- Node.js 20+
- PostgreSQL 16 running locally or remotely
- npm
- Gmail account + App Password (for OTP emails)

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/auth_master"

JWT_SECRET="your-long-random-access-secret"
JWT_REFRESH_SECRET="your-long-random-refresh-secret"

EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-gmail-app-password"
```

Notes:

- Use different values for `JWT_SECRET` and `JWT_REFRESH_SECRET`.
- For Gmail, use an App Password (not your normal account password).

## Setup And Run

1. Install dependencies:

```bash
npm install
```

2. Run Prisma migration:

```bash
npx prisma migrate dev --name init
```

3. Start development server:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

## Beginner Learning Path (Recommended)

Read files in this order to understand auth end-to-end:

1. `prisma/schema.prisma` (understand data model first)
2. `app/api/auth/register/route.ts` (registration + OTP creation)
3. `app/api/auth/verify-otp/route.ts` (email verification)
4. `app/api/auth/login/route.ts` (credentials -> token cookies)
5. `lib/jwt.ts` (token generation and verification)
6. `app/api/auth/refresh/route.ts` (token refresh logic)
7. `proxy.ts` (route protection and role checks)
8. `app/api/auth/logout/route.ts` and `app/api/auth/logout-all/route.ts` (session invalidation)
9. `app/dashboard/page.tsx` (how frontend consumes auth APIs)

## Security Concepts Demonstrated

- Password hashing with bcrypt
- Email verification before login
- HttpOnly cookies to reduce XSS token theft
- Access + refresh token split
- Server-side refresh token revocation
- Session tracking per device
- Role-based route authorization
- Global session invalidation with token versioning

## Common Testing Flow

1. Register with email/password.
2. Check email and copy OTP.
3. Verify OTP.
4. Login and visit dashboard.
5. Open sessions list in dashboard.
6. Test logout and logout-all.
7. Try opening `/admin` with non-admin user (should redirect).

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npx prisma migrate dev
```

## Final Notes

This project is great for understanding how modern auth systems are built with Next.js 16+, Prisma 7, and PostgreSQL 16.

If you are learning authentication, focus on understanding the "why" behind each layer:

- Why verify emails?
- Why split access and refresh tokens?
- Why store refresh tokens in DB?
- Why protect routes in `proxy.ts`?

Once these ideas are clear, you can adapt the same architecture to production apps.
