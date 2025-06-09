import express from 'express';
import {
  createOrder,
  getOrderById,
  // updateOrderStatus, // Potentially for admin later
  // getAllOrders // Potentially for admin later
} from '../controllers/orderController.js';

const router = express.Router();

// POST /api/orders - Create a new order
router.post('/', createOrder);

// GET /api/orders/:id - Get a specific order by ID
router.get('/:id', getOrderById);

// Future routes for admin (example):
// PATCH /api/orders/:id/status - Update order status
// router.patch('/:id/status', updateOrderStatus);

// GET /api/orders - Get all orders (admin)
// router.get('/', getAllOrders);

export default router;
