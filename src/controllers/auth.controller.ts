import { Request, Response, NextFunction } from 'express';
import { authService } from '../services';
import { ApiResponse } from '../utils/response';
import { ApiError, ValidationError } from '../utils/errors';
import { IAuthenticatedRequest } from '../types';
import {
  workerRegistrationSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  assignExecutiveSchema,
} from '../validations';
import { ZodError } from 'zod';

/**
 * Format Zod errors for Flutter app consumption
 */
const formatZodError = (error: ZodError): Record<string, string[]> => {
  const formatted: Record<string, string[]> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(err.message);
  });
  return formatted;
};

/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */
class AuthController {
  /**
   * POST /api/auth/register
   * Register a new worker (only workers can self-register)
   */
  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validate request body for worker registration
      const validationResult = workerRegistrationSchema.safeParse(req.body);

      if (!validationResult.success) {
        const formattedErrors = formatZodError(validationResult.error);
        throw new ValidationError('Validation failed', formattedErrors);
      }

      const result = await authService.register(validationResult.data);

      ApiResponse.created(res, result.data, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Login user with email and password
   */
  async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validate request body
      const validationResult = loginSchema.safeParse(req.body);

      if (!validationResult.success) {
        const formattedErrors = formatZodError(validationResult.error);
        throw new ValidationError('Validation failed', formattedErrors);
      }

      const result = await authService.login(validationResult.data);

      ApiResponse.success(res, result.data, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   * Refresh access token using refresh token
   */
  async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validate request body
      const validationResult = refreshTokenSchema.safeParse(req.body);

      if (!validationResult.success) {
        const formattedErrors = formatZodError(validationResult.error);
        throw new ValidationError('Validation failed', formattedErrors);
      }

      const tokens = await authService.refreshAccessToken(
        validationResult.data.refreshToken
      );

      ApiResponse.success(res, { tokens }, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Logout user and invalidate refresh token
   */
  async logout(
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      await authService.logout(req.user.userId);

      ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Get current user profile
   */
  async getProfile(
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      const profile = await authService.getProfile(req.user.userId);

      ApiResponse.success(res, { user: profile }, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/auth/change-password
   * Change user password
   */
  async changePassword(
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      // Validate request body
      const validationResult = changePasswordSchema.safeParse(req.body);

      if (!validationResult.success) {
        const formattedErrors = formatZodError(validationResult.error);
        throw new ValidationError('Validation failed', formattedErrors);
      }

      await authService.changePassword(req.user.userId, validationResult.data);

      ApiResponse.success(
        res,
        null,
        'Password changed successfully. Please login again.'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/deactivate
   * Deactivate own account
   */
  async deactivateAccount(
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      await authService.deactivateUser(req.user.userId);

      ApiResponse.success(res, null, 'Account deactivated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/users/:userId/reactivate
   * Reactivate a user account (Executive only)
   */
  async reactivateAccount(
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        throw ApiError.badRequest('User ID is required');
      }

      await authService.reactivateUser(userId);

      ApiResponse.success(res, null, 'Account reactivated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users/assign-executive
   * Assign an executive to a worker (Executive only)
   */
  async assignExecutive(
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validate request body
      const validationResult = assignExecutiveSchema.safeParse(req.body);

      if (!validationResult.success) {
        const formattedErrors = formatZodError(validationResult.error);
        throw new ValidationError('Validation failed', formattedErrors);
      }

      const { workerId, executiveId } = validationResult.data;

      const updatedWorker = await authService.assignExecutiveToWorker(
        workerId,
        executiveId
      );

      ApiResponse.success(
        res,
        { user: updatedWorker },
        'Executive assigned successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const authController = new AuthController();
