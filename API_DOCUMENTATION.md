# ERP Pro - API Documentation

## Overview
ERP Pro is a modern, React-based Enterprise Resource Planning system. This document provides specifications for API integration with the application.

## Current Architecture
- **Frontend**: React 19.2.0 with Vite + Tailwind CSS
- **State Management**: React Context API with LocalStorage persistence
- **Base URL**: `http://localhost:3000/api` (when backend is configured)

---

## Data Models

### Product (Inventory)
```json
{
  "id": 1234567890,
  "name": "Industrial Widget",
  "SKU": "WID-01",
  "stock": 5,
  "createdAt": "2024-01-14T10:30:00Z",
  "updatedAt": "2024-01-14T10:30:00Z"
}
```

### Customer
```json
{
  "id": 1234567890,
  "name": "Acme Corp",
  "email": "billing@acme.com",
  "status": "Active",
  "createdAt": "2024-01-14T10:30:00Z",
  "updatedAt": "2024-01-14T10:30:00Z"
}
```

---

## API Endpoints

### Products (Inventory)

#### GET /api/products
Retrieve all products with pagination support

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or SKU

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Industrial Widget",
      "SKU": "WID-01",
      "stock": 5
    }
  ],
  "pagination": {
    "current": 1,
    "total": 5,
    "limit": 10
  }
}
```

#### POST /api/products
Create a new product

**Request Body:**
```json
{
  "name": "New Widget",
  "stock": 10
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "id": 1234567890,
    "name": "New Widget",
    "SKU": "SKU-XXXX",
    "stock": 10
  }
}
```

#### PUT /api/products/:id
Update a product

**Request Body:**
```json
{
  "name": "Updated Widget",
  "stock": 15
}
```

**Response:** 200 OK

#### DELETE /api/products/:id
Delete a product

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### Customers

#### GET /api/customers
Retrieve all customers with pagination

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by name or email
- `status` (optional): Filter by status (Active/Inactive)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Acme Corp",
      "email": "billing@acme.com",
      "status": "Active"
    }
  ],
  "pagination": {
    "current": 1,
    "total": 15,
    "limit": 10
  }
}
```

#### POST /api/customers
Create a new customer

**Request Body:**
```json
{
  "name": "New Company",
  "email": "contact@newco.com",
  "status": "Active"
}
```

**Response:** 201 Created

#### PUT /api/customers/:id
Update a customer

**Request Body:**
```json
{
  "name": "Updated Company",
  "email": "newemail@company.com",
  "status": "Inactive"
}
```

**Response:** 200 OK

#### DELETE /api/customers/:id
Delete a customer

**Response:** 200 OK

---

### Dashboard/Analytics

#### GET /api/dashboard/overview
Get system overview metrics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalStock": 150,
    "lowStockCount": 5,
    "totalCustomers": 42,
    "estimatedValue": 45230.50
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-14T10:30:00Z"
}
```

### Common Error Codes
- `VALIDATION_ERROR` - Invalid input data
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Permission denied
- `CONFLICT` - Resource already exists
- `INTERNAL_ERROR` - Server error

---

## Postman Collection

### Import Instructions
1. Open Postman
2. Click "Import" → "Link"
3. Use this collection (to be hosted at `/public/erp-api-collection.json`)
4. All requests use `{{base_url}}` variable set to `http://localhost:3000/api`

### Environment Variables
```
base_url = http://localhost:3000/api
product_id = 1
customer_id = 1
```

---

## Authentication (Future)
Once authentication is implemented:
- Use Bearer token in Authorization header
- Token format: `Authorization: Bearer {token}`

---

## Rate Limiting
- 100 requests per minute (per IP)
- 10 requests per second (burst limit)

---

## CORS Configuration
The API will support CORS from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000`
- Production domain (TBD)

---

## Best Practices for Integration

1. **Error Handling**: Always check `success` field in response
2. **Pagination**: Implement pagination to avoid loading all data
3. **Caching**: Cache frequently accessed data in `localStorage`
4. **Search**: Use server-side search when possible
5. **Timestamps**: All dates use ISO 8601 format

---

## Development Roadmap

- [ ] Authentication & Authorization
- [ ] Role-based access control
- [ ] Audit logging
- [ ] Advanced filtering & sorting
- [ ] Bulk operations
- [ ] File exports (CSV, PDF)
- [ ] Webhook support
- [ ] GraphQL endpoint
