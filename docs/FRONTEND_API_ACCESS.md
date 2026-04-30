# Frontend Auth API Guide (React + Vite)

This document covers authentication only: what routes exist and what the frontend must send.

## Base URL

- Local backend URL: `http://localhost:8000`
- Auth prefix: `/auth/`
- Trailing slash is required on endpoints.

Example full URL:

- `http://localhost:8000/auth/login/`

## Common Request Rules

- Send JSON body for `POST` auth endpoints.
- Include header: `Content-Type: application/json`
- For protected auth endpoints, include:
  - `Authorization: Token <token>`
- Do not send `Bearer <token>`; this backend expects the `Token` prefix.

## Authentication Flow

1. Register or login.
2. Save returned `token` in frontend state/storage.
3. Send `Authorization: Token <token>` for protected routes.
4. Call logout to invalidate the current token.
5. Clear token in frontend when logout succeeds or when protected endpoints return `401`.

## Endpoints

### 1) Register

- **Method:** `POST`
- **URL:** `/auth/register/`
- **Body required by backend serializer:**

```json
{
  "username": "alice",
  "password": "your_password"
}
```

- **Success response (`201`):**

```json
{
  "message": "User created",
  "token": "<token>"
}
```

- **Common failure (`400`)** from serializer validation:

```json
{
  "username": ["A user with that username already exists."]
}
```

### 2) Login

- **Method:** `POST`
- **URL:** `/auth/login/`
- **Body:**

```json
{
  "username": "alice",
  "password": "your_password"
}
```

- **Success response (`200`):**

```json
{
  "token": "<token>"
}
```

- **Failure response (`400`):**

```json
{
  "error": "Invalid credentials"
}
```

### 3) Profile (Protected)

- **Method:** `GET`
- **URL:** `/auth/profile/`
- **Headers:**

```text
Authorization: Token <token>
```

- **Success response (`200`):**

```json
{
  "id": 1,
  "username": "alice"
}
```

- **Failure (`401`)** if token is missing/invalid.

### 4) Logout (Protected)

- **Method:** `POST`
- **URL:** `/auth/logout/`
- **Headers:**

```text
Authorization: Token <token>
```

- **Success response (`200`):**

```json
{
  "message": "Logged out"
}
```

Notes:
- Logout deletes the current token server-side.
- After logout, frontend should remove stored token immediately.
- After logout, using that same token will return `401`.

## Vite Frontend Example

Set env in frontend:

- `VITE_API_BASE_URL=http://localhost:8000`

Use:

- `${import.meta.env.VITE_API_BASE_URL}/auth/register/`
- `${import.meta.env.VITE_API_BASE_URL}/auth/login/`
- `${import.meta.env.VITE_API_BASE_URL}/auth/profile/`
- `${import.meta.env.VITE_API_BASE_URL}/auth/logout/`

## Quick Error Checklist

- `401 Unauthorized`: missing/expired/invalid token header.
- `400 Invalid credentials`: username/password mismatch.
- `400` on register with field errors: inspect backend validation response per field.
- `404`: wrong path or missing trailing slash.
- Browser CORS error: frontend origin is not listed in backend CORS settings.
