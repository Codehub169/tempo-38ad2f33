import express from 'express';
import { registerUser, loginUser, getLoggedInUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getLoggedInUserProfile); // Example protected route

export default router;
