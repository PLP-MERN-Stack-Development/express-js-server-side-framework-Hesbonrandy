# Express Products API

A small RESTful Products API built with Express.js. Provides CRUD operations, filtering, search and pagination for products. This README was generated from the project's source files (`server.js` and `Routes/products.js`).

## Table of contents

- [Features](#features)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Environment](#environment)
- [API Endpoints](#api-endpoints)
- [Request validation](#request-validation)
- [Authentication](#authentication)
- [Examples](#examples)
- [Notes & next steps](#notes--next-steps)

## Features

- List products with optional filtering, searching and pagination
- Get product by ID
- Create, update and delete products (in-memory)
- Basic request logging and centralized error handling

## Getting started

Prerequisites:

- Node.js (v14+ recommended)
- npm (or yarn)

Install dependencies:

```powershell
npm install
```

Start the server:

```powershell
# Production
npm start

# Development (requires nodemon)
npm run dev
```

The server listens on the port defined by the `PORT` environment variable or `3000` by default.

## Available scripts

- `npm start` — run `node server.js`
- `npm run dev` — run `nodemon server.js` (dev dependency)

## Environment

This project uses `dotenv`. Create a `.env` file at the project root to customize the port (for example):

```
PORT=4000
```

## API Endpoints

Base URL: http://localhost:3000 (replace port if you set `PORT`)

- GET / — Root route, returns a simple greeting.

- GET /api/products
  - Returns a list of products. Supports query parameters:
    - `category` — filter by category (exact match)
    - `search` — case-insensitive search against the product name
    - `page` — page number for pagination (default: 1)
    - `limit` — items per page (default: 10)
  - Response shape:
    ```json
    {
      "products": [ /* array of product objects */ ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalProducts": 3,
        "hasNext": false,
        "hasPrev": false
      }
    }
    ```

- GET /api/products/:id
  - Returns a single product by ID. Responds with 404 if not found.

- POST /api/products
  - Create a new product. Requires `X-API-Key` header (see Authentication below).
  - Body (JSON):
    - `name` (string, required)
    - `description` (string, required)
    - `price` (number, required, non-negative)
    - `category` (string, required)
    - `inStock` (boolean, required)
  - On success returns the created product (201).

- PUT /api/products/:id
  - Update an existing product. Requires `X-API-Key` header and same body validation as POST.
  - Returns updated product or 404 if not found.

- DELETE /api/products/:id
  - Delete product by ID. Requires `X-API-Key` header. Returns deleted product or 404.

## Request validation

The server validates incoming product data for required fields and types. If validation fails the server responds with status `400` and a JSON payload containing error details.

Validation rules (from `validateProduct` middleware):

- `name`: non-empty string
- `description`: non-empty string
- `price`: number >= 0
- `category`: non-empty string
- `inStock`: boolean

## Authentication

Protected routes (`POST`, `PUT`, `DELETE`) require an `X-API-Key` header. The default key contained in the code is:

```
randy123
```

Set this header in your requests, for example:

```
X-API-Key: randy123
```

Note: Storing secret keys in source files is insecure. Move secrets to environment variables or a secrets manager for production.

## Examples

Create a product (example curl):

```powershell
curl -X POST http://localhost:3000/api/products -H "Content-Type: application/json" -H "X-API-Key: randy123" -d '{"name":"Mug","description":"Ceramic mug","price":8.5,"category":"kitchen","inStock":true}'
```

Get products with search and pagination:

```powershell
curl "http://localhost:3000/api/products?search=lap&page=1&limit=5"
```

Update a product:

```powershell
curl -X PUT http://localhost:3000/api/products/<id> -H "Content-Type: application/json" -H "X-API-Key: randy123" -d '{"name":"Updated","description":"Updated","price":10,"category":"misc","inStock":false}'
```

Delete a product:

```powershell
curl -X DELETE http://localhost:3000/api/products/<id> -H "X-API-Key: randy123"
```

## Notes & next steps

- Data is stored in-memory in `server.js` (array `products`). It resets on server restart. Consider adding a persistent datastore (MongoDB, PostgreSQL) for production.
- Move sensitive values like API keys into environment variables.
- Add more robust authentication and authorization (JWT, OAuth).
- Consider modularizing routes (the repo already has `Routes/products.js` content) and using `express.Router()` for cleaner structure.

---

If you'd like I can also:

- Add a brief `CONTRIBUTING.md` or license
- Wire up a `.env.example` file
- Extract the route handlers into `Routes/` and properly require them from `server.js`
