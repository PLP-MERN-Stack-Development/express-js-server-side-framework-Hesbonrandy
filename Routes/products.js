// GET /api/products — with filtering, search, and pagination
app.get('/api/products', (req, res, next) => {
  let result = [...products]; // Work on a copy

  // 1. Filter by category (e.g., category=electronics)
  if (req.query.category) {
    result = result.filter(product => 
      product.category === req.query.category
    );
  }

  // 2. Search by name (case-insensitive, e.g., search=laptop)
  if (req.query.search) {
    const searchTerm = req.query.search.toLowerCase();
    result = result.filter(product =>
      product.name.toLowerCase().includes(searchTerm)
    );
  }

  // 3. Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedProducts = result.slice(startIndex, endIndex);

  // Send response with metadata
  res.json({
    products: paginatedProducts,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(result.length / limit),
      totalProducts: result.length,
      hasNext: endIndex < result.length,
      hasPrev: startIndex > 0
    }
  });
});

// POST /api/products - Create a new product
app.post('/api/products',authenticate, validateProduct, (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  const newProduct = {
    id: uuidv4(), // Generate unique ID
    name,
    description,
    price: Number(price), // Ensure it's a number
    category,
    inStock: Boolean(inStock) // Ensure it's a boolean
  };

  products.push(newProduct); // Add to array
  res.status(201).json(newProduct); // Respond with new product
});

// PUT /api/products/:id - Update an existing product
app.put('/api/products/:id',authenticate, validateProduct, (req, res, next) => {
  const { id } = req.params;
  const productIndex = products.findIndex(p => p.id === id);

  if (productIndex === -1) {
  return next(new NotFoundError('Product not found'));
}

  const { name, description, price, category, inStock } = req.body;

  // Update the product (keep same ID)
  products[productIndex] = {
    id, // Keep original ID
    name,
    description,
    price: Number(price),
    category,
    inStock: Boolean(inStock)
  };

  res.json(products[productIndex]); // Send updated product
});

// DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id',authenticate, (req, res, next) => {
  const { id } = req.params;
  const productIndex = products.findIndex(p => p.id === id);

  if (productIndex === -1) {
  return next(new NotFoundError('Product not found'));
}

  const deletedProduct = products.splice(productIndex, 1)[0]; // Remove and get it
  res.json(deletedProduct); // Send deleted product
});

