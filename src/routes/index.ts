import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import enumRoutes from './enum.routes';
import disciplineRoutes from './discipline.routes';
import executiveRoutes from './executive.routes';
import notificationRoutes from './notification.routes';

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
router.use('/disciplines', disciplineRoutes);
router.use('/executive', executiveRoutes);
router.use('/notifications', notificationRoutes);

export default router;
