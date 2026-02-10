import { Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
import { IAuthenticatedRequest } from '../types';
import { UserRole } from '../types/enums';

/**
 * Role Check Middleware Factory
 * Creates a middleware that restricts access to specific roles
 *
 * @param allowedRoles - Array of roles that can access the route
 * @returns Express middleware function
 *
 * @example
 * // Only executives can access
 * router.get('/admin', authMiddleware, roleCheck([UserRole.EXECUTIVE]), handler);
 *
 * // Both workers and executives can access
 * router.get('/shared', authMiddleware, roleCheck([UserRole.WORKER, UserRole.EXECUTIVE]), handler);
 */
export const roleCheck = (allowedRoles: UserRole[]) => {
  return (
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        throw ApiError.unauthorized('User not authenticated');
      }

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        throw ApiError.forbidden(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Convenience middleware for executive-only routes
 */
export const executiveOnly = roleCheck([UserRole.EXECUTIVE, UserRole.SUPER_ADMIN]);

/**
 * Convenience middleware for super admin only routes
 */
export const superAdminOnly = roleCheck([UserRole.SUPER_ADMIN]);

/**
 * Convenience middleware for worker-only routes
 */
export const workerOnly = roleCheck([UserRole.WORKER]);

/**
 * Convenience middleware for any authenticated user
 */
export const anyRole = roleCheck([UserRole.WORKER, UserRole.EXECUTIVE, UserRole.SUPER_ADMIN]);

/**
 * Self or Executive/Super Admin Middleware
 * Allows users to access their own resources OR executives/super admins to access any resource
 *
 * @param userIdParam - The request parameter name containing the target user ID
 */
export const selfOrExecutive = (userIdParam: string = 'userId') => {
  return (
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('User not authenticated');
      }

      const targetUserId = req.params[userIdParam];
      const isOwnResource = req.user.userId === targetUserId;
      const isExecutiveOrAdmin = req.user.role === UserRole.EXECUTIVE || req.user.role === UserRole.SUPER_ADMIN;

      if (!isOwnResource && !isExecutiveOrAdmin) {
        throw ApiError.forbidden(
          'Access denied. You can only access your own resources.'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
