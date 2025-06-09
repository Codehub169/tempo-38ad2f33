import express from 'express';
import {
  createOrder,
  getOrderById,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js'; // Added

const router = express.Router();

// POST /api/orders - Create a new order
router.post('/', protect, createOrder); // Added protect middleware

// GET /api/orders/:id - Get a specific order by ID
router.get('/:id', getOrderById); // Consider protecting this too if order details are sensitive

export default router;
