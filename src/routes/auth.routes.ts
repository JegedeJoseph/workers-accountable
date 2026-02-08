import { Router } from 'express';
import { authController } from '../controllers';
import { authMiddleware, executiveOnly } from '../middlewares';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Worker or Executive)
 * @access  Public
 */
router.post('/register', authController.register.bind(authController));

/**
 * @route   POST /api/auth/login
 * @desc    Login user with email and password
 * @access  Public
 */
router.post('/login', authController.login.bind(authController));

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public (requires valid refresh token)
 */
router.post('/refresh', authController.refreshToken.bind(authController));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Private
 */
router.post(
  '/logout',
  authMiddleware,
  authController.logout.bind(authController)
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authMiddleware,
  authController.getProfile.bind(authController)
);

/**
 * @route   PATCH /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.patch(
  '/change-password',
  authMiddleware,
  authController.changePassword.bind(authController)
);

/**
 * @route   POST /api/auth/deactivate
 * @desc    Deactivate own account
 * @access  Private
 */
router.post(
  '/deactivate',
  authMiddleware,
  authController.deactivateAccount.bind(authController)
);

export default router;
