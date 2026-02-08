import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import enumRoutes from './enum.routes';

const router = Router();

/**
 * API Routes Index
 *
 * Base path: /api
 */

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AU Chapel Workers API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/enums', enumRoutes);

export default router;
