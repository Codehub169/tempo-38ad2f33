import express from 'express';
import {
  getAllProducts,
  getProductById,
  getCategories,
  getProductsByCategory,
  createProduct
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/products - Get all products (with optional filters)
router.get('/', getAllProducts);

// POST /api/products - Create a new product (Protected, Seller only)
router.post('/', protect, authorize(['seller']), createProduct);

// GET /api/products/categories - Get all product categories
router.get('/categories', getCategories);

// GET /api/products/category/:categoryName - Get products by category name
router.get('/category/:categoryName', getProductsByCategory); 

// GET /api/products/:id - Get a single product by ID
router.get('/:id', getProductById);

export default router;
