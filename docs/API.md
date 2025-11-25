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

````markdown
# Manhwa Endpoints

Base path: `/api/v1/manhwa`

---

## GET /manhwa

Get all manhwa with pagination.

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "mhw_001",
      "slug": "legendary-shadow-hunter",
      "title": "Legendary Shadow Hunter",
      "coverUrl": "https://example.com/cover/shadow-hunter.jpg",
      "genres": ["Action", "Fantasy", "Adventure"],
      "createdAt": "2025-10-10T12:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```
````

---

## GET /manhwa/:slug

Get detail of a specific manhwa.

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "mhw_003",
    "slug": "eternal-winds",
    "title": "Eternal Winds",
    "description": "A fantasy story about a young swordsman who commands the wind to protect his homeland from ancient beasts.",
    "coverUrl": "https://example.com/cover/eternal-winds.jpg",
    "genres": ["Fantasy", "Action", "Drama"],
    "createdAt": "2025-10-12T08:45:00.000Z"
  }
}
```

---

## GET /manhwa/:slug/comments

Get comments for a specific manhwa.

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": "cmt_001",
      "userId": "usr_001",
      "manhwaId": "mhw_003",
      "body": "Cerita lumayan seru, pacing-nya oke banget!",
      "createdAt": "2025-10-15T14:22:10.000Z",
      "user": {
        "id": "usr_001",
        "username": "reader01",
        "displayName": "Riko"
      }
    }
  ]
}
```

---

## POST /manhwa/:slug/favorite

Toggle favorite status.
**Auth required**

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "isFavorite": true
  }
}
```

---

## PATCH /manhwa/:slug/status

Update reading status.
**Auth required**

### Status Enum

```
PLANNING | READING | COMPLETED | PAUSED | DROPPED
```

### Request Body

```json
{
  "status": "PLANNING"
}
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "status_001",
    "userId": "usr_001",
    "manhwaId": "mhw_003",
    "status": "PLANNING",
    "progress": 0,
    "updatedAt": "2025-10-20T11:30:00.000Z"
  }
}
```

---

## POST /manhwa/:slug/comments

Create a comment.
**Auth required**

### Request Body

```json
{
  "body": "Baru baca chapter 1, menarik banget!"
}
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": "cmt_002",
    "userId": "usr_001",
    "manhwaId": "mhw_003",
    "body": "Baru baca chapter 1, menarik banget!",
    "createdAt": "2025-10-20T12:05:00.000Z"
  }
}
```

---

## Changelog

- **2025-11-25** — Added full Manhwa endpoints documentation (list, detail, comments, favorite toggle, status update, create comment).
- **2025-11-21** — Initial Authentication documentation created.
