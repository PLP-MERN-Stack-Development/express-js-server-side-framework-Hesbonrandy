// Import required modules
const express = require('express');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Custom Error Classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // We trust this error → safe to send to client
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation error') {
    super(message, 400);
  }
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next(); // Pass control to the next middleware/route
});

// Authentication middleware
const API_KEY = 'randy123'; 
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === API_KEY) {
    next(); // Authorized → proceed
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid or missing X-API-Key header' });
  }
};

// Product validation middleware
const validateProduct = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  const errors = [];

  if (typeof name !== 'string' || name.trim() === '') {
    errors.push('Name is required and must be a non-empty string');
  }
  if (typeof description !== 'string' || description.trim() === '') {
    errors.push('Description is required and must be a non-empty string');
  }
  if (typeof price !== 'number' || price < 0) {
    errors.push('Price must be a non-negative number');
  }
  if (typeof category !== 'string' || category.trim() === '') {
    errors.push('Category is required and must be a non-empty string');
  }
  if (typeof inStock !== 'boolean') {
    errors.push('inStock must be a boolean (true or false)');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next(); // Valid → proceed
};

// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// Root route
app.get('/', (req, res,) => {
  res.send('Hello World!');
});

// TODO: Implement the following routes:
// GET /api/products - Get all products
// GET /api/products/:id - Get a specific product
// POST /api/products - Create a new product
// PUT /api/products/:id - Update a product
// DELETE /api/products/:id - Delete a product

// Example route implementation for GET /api/products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// GET /api/products/:id - Get a specific product by ID
app.get('/api/products/:id', (req, res, next) => {
  const { id } = req.params;
  const product = products.find(p => p.id === id);
  if (!product) {
     return next(new NotFoundError('Product not found'));
  }
  res.json(product);
});

// POST /api/products - Create a new product
app.post('/api/products', authenticate, (req, res) => {
  console.log('Received body:', req.body);
  console.log('Headers:', req.headers['x-api-key']);
  res.status(201).json({ message: 'Received successfully!', data: req.body });
});

// PUT /api/products/:id - Update an existing product
app.put('/api/products/:id', authenticate, validateProduct, (req, res, next) => {
  const { id } = req.params;
  const productIndex = products.findIndex(p => p.id === id);

  if (productIndex === -1) {
    return next(new NotFoundError('Product not found'));
  }

  const { name, description, price, category, inStock } = req.body;

  products[productIndex] = {
    id,
    name,
    description,
    price: Number(price),
    category,
    inStock: Boolean(inStock)
  };

  res.json(products[productIndex]);
});

// DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id',authenticate, (req, res, next) => {
  const { id } = req.params;
  const productIndex = products.findIndex(p => p.id === id);

  if (productIndex === -1) {
    return next(new NotFoundError('Product not found'));
  }

  const deletedProduct = products.splice(productIndex, 1)[0];
  res.json(deletedProduct);
});

// TODO: Implement custom middleware for:
// - Request logging
// - Authentication
// - Error handling

// Global error-handling middleware (MUST have 4 parameters: err, req, res, next)
app.use((err, req, res, next) => {
  console.error('ERROR 💥:', err.stack);

  // If it's an operational error (we created it), send to client
  if (err.isOperational) {
    res.status(err.statusCode).json({ error: err.message });
  } else {
    // Programming error → don't leak details
    res.status(500).json({
      error: 'Something went wrong!'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = app; 