import express from 'express';
import {
  getAllProducts,
  getProductById,
  getCategories,
  getProductsByCategory
} from '../controllers/productController.js';

const router = express.Router();

// GET /api/products - Get all products (with optional filters: category, condition, priceMin, priceMax, search, sortBy, sortOrder, page, limit)
router.get('/', getAllProducts);

// GET /api/products/categories - Get all product categories
router.get('/categories', getCategories);

// GET /api/products/category/:categoryName - Get products by category name
router.get('/category/:categoryName', getProductsByCategory); 
// Note: It might be better to use category ID if names can have special characters or change.
// For simplicity with current frontend expectations, using name.

// GET /api/products/:id - Get a single product by ID
router.get('/:id', getProductById);

export default router;
