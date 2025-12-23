# E-Commerce REST API

A comprehensive REST API built with Express.js, Prisma, and PostgreSQL for managing an e-commerce platform with authentication, products, and orders.

## Features

- User authentication (signup/login) with JWT
- Role-based access control (CUSTOMER and ADMIN)
- Product management (CRUD operations)
- Order management with order items
- Input validation with Joi
- PostgreSQL database with Prisma ORM
- API testing interface at `/ui` endpoint

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - ORM for database management
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Joi** - Request validation
- **Jest & Supertest** - Testing

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd final_assinment
```

2. Install dependencies:
```bash
npm install
```

3. **IMPORTANT:** Create a `.env` file in the root directory and add the following environment variables:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
JWT_SECRET="your_secret_key_here"
```

Replace:
- `username` - Your PostgreSQL username
- `password` - Your PostgreSQL password
- `database_name` - Your database name
- `your_secret_key_here` - A strong secret key for JWT

Example:
```env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/ecommerce?schema=public"
JWT_SECRET="my-super-secret-key-12345"
```

4. Run Prisma migrations to set up the database:
```bash
npx prisma migrate dev
```

5. Generate Prisma Client:
```bash
npm run prisma:generate
```

## Running the Application

### Development mode (with auto-restart):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Testing Interface

For testing purposes, you can access the API testing UI at:
```
http://localhost:3000/ui
```

This interface allows you to test all API endpoints interactively without needing Postman or curl.

## API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication

All endpoints (except `/auth/signup` and `/auth/login`) require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

### Auth Endpoints

#### POST /auth/signup
Register a new user.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "CUSTOMER"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "CUSTOMER"
}
```

#### POST /auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "CUSTOMER"
  }
}
```

---

### User Endpoints

#### GET /users/:id
Get user details by ID.

**Access:** CUSTOMER, ADMIN

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "CUSTOMER",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### Product Endpoints

#### GET /products
List all products with optional filtering.

**Access:** Authenticated users

**Query Parameters:**
- `category` (optional) - Filter by category
- `minPrice` (optional) - Minimum price
- `maxPrice` (optional) - Maximum price
- `search` (optional) - Search in product name/description

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Product Name",
    "description": "Product description",
    "price": 29.99,
    "stock": 100,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET /products/:id
Get a single product by ID.

**Access:** Authenticated users

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Product Name",
  "description": "Product description",
  "price": 29.99,
  "stock": 100,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### POST /products
Create a new product.

**Access:** ADMIN only

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 49.99,
  "stock": 50
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "name": "New Product",
  "description": "Product description",
  "price": 49.99,
  "stock": 50,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### PATCH /products/:id
Update an existing product.

**Access:** ADMIN only

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "price": 39.99,
  "stock": 75
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Updated Product Name",
  "description": "Product description",
  "price": 39.99,
  "stock": 75,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

#### DELETE /products/:id
Delete a product.

**Access:** ADMIN only

**Response:** `204 No Content`

---

### Order Endpoints

#### POST /orders
Create a new order.

**Access:** CUSTOMER, ADMIN

**Request Body:**
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 3,
      "quantity": 1
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "userId": 1,
  "totalPrice": 109.97,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "orderItems": [
    {
      "id": 1,
      "orderId": 1,
      "productId": 1,
      "quantity": 2,
      "price": 29.99
    },
    {
      "id": 2,
      "orderId": 1,
      "productId": 3,
      "quantity": 1,
      "price": 49.99
    }
  ]
}
```

#### GET /orders/:id
Get order details by ID.

**Access:** CUSTOMER (own orders only), ADMIN (all orders)

**Response:** `200 OK`
```json
{
  "id": 1,
  "userId": 1,
  "totalPrice": 109.97,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "orderItems": [
    {
      "id": 1,
      "productId": 1,
      "quantity": 2,
      "price": 29.99,
      "product": {
        "id": 1,
        "name": "Product Name"
      }
    }
  ]
}
```

---

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Token not provided"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied: insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Database Schema

### User
- `id` - Auto-incrementing primary key
- `username` - Unique username
- `email` - Unique email
- `password` - Hashed password
- `role` - CUSTOMER or ADMIN
- `createdAt` - Timestamp

### Product
- `id` - Auto-incrementing primary key
- `name` - Product name
- `description` - Product description (optional)
- `price` - Product price
- `stock` - Available quantity
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Order
- `id` - Auto-incrementing primary key
- `userId` - Foreign key to User
- `totalPrice` - Total order price
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### OrderItem
- `id` - Auto-incrementing primary key
- `orderId` - Foreign key to Order
- `productId` - Foreign key to Product
- `quantity` - Quantity ordered
- `price` - Price at time of order

---

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm test:coverage
```

Coverage threshold is set to 80% for branches, functions, lines, and statements.

---

## Additional Scripts

### Open Prisma Studio (Database GUI)
```bash
npm run prisma:studio
```

### Apply database migrations
```bash
npm run prisma:migrate
```

---

## Project Structure

```
final_assinment/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── controllers/           # Route controllers
│   ├── middleware/            # Custom middleware
│   ├── routes/                # API routes
│   ├── utils/                 # Utility functions
│   ├── validators/            # Joi schemas
│   ├── lib/                   # Database client
│   ├── app.js                 # Express app configuration
│   └── server.js              # Server entry point
├── public/                    # Static files for /ui
├── __tests___/                # Test files
├── .env                       # Environment variables (create this)
├── package.json
└── README.md
```

---

## License

ISC

---

## Notes

- Make sure your PostgreSQL database is running before starting the application
- The JWT secret should be a strong, random string in production
- Default user role is CUSTOMER; create an ADMIN user manually in the database if needed
- All passwords are hashed using bcrypt before storage
- The API uses JWT tokens that expire based on your configuration