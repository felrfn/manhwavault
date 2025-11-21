# API Documentation — ManhwaVault

Documentation for the **ManhwaVault** REST API. Current focus: authentication endpoints.

---

## Summary

- **Base URL:** `https://localhost:[PORT]`
- **Format:** JSON
- **Auth Method:** Bearer Token (JWT) — `Authorization: Bearer <token>`
- **Version:** v1

---

## Error Format

All error responses follow one of these formats:

```json
{
  "success": false,
  "error": "Error message here"
}
```

For Zod validation errors:

```json
{
  "success": false,
  "error": {
    "formErrors": [],
    "fieldErrors": {}
  }
}
```

---

## Status Codes

- **200 OK** — Request successful
- **201 Created** — Resource created
- **400 Bad Request** — Invalid input
- **401 Unauthorized** — Token missing or invalid
- **404 Not Found** — Resource not found
- **409 Conflict** — Duplicate / already exists
- **500 Internal Server Error** — Something broke on the server

---

# Endpoints

## Health Check

Path: `/api/v1/health`

#### Success Response

```json
{ "success": true, "data": { "status": "ok", "time": "NOW" } }
```

---

## Authentication

Base path: `/api/v1/auth`

---

### POST /api/v1/auth/register

Create a new user account.

#### Validation Schema

```ts
const registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  displayName: z.string().optional(),
});
```

#### Request Body

```json
{
  "username": "newuser",
  "password": "secret123",
  "displayName": "Optional Name"
}
```

#### Success Response (201)

```json
{
  "success": true,
  "data": {
    "id": "u_123",
    "username": "newuser",
    "displayName": "Optional Name"
  }
}
```

#### Possible Errors

**Username already used**

```json
{
  "success": false,
  "error": "Username already used"
}
```

**Zod validation error**

```json
{
  "success": false,
  "error": {}
}
```

**Server failure**

```json
{
  "success": false,
  "error": "Server error"
}
```

---

### POST /api/v1/auth/login

Authenticate and get a JWT token.

#### Validation Schema

```ts
const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});
```

#### Request Body

```json
{
  "username": "newuser",
  "password": "secret123"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "token": "<jwt-token>"
  }
}
```

#### Possible Errors

**Invalid credentials**

```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Validation error**

```json
{
  "success": false,
  "error": {}
}
```

**Server error**

```json
{
  "success": false,
  "error": "Server error"
}
```

---

### GET /api/v1/auth/me

Return the authenticated user. Requires a valid JWT.

#### Success Response

```json
{
  "success": true,
  "data": {
    "id": "u_123",
    "username": "newuser",
    "displayName": "Optional Name"
  }
}
```

#### Errors

```json
{
  "success": false,
  "error": "User not found"
}
```

```json
{
  "success": false,
  "error": "Server error"
}
```

---

### Example cURL

```bash
curl -X POST https://baseurl.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","password":"secret123"}'
```

---

## Changelog

- **2025-11-21** — Initial Auth documentation
