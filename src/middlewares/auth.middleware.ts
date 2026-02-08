import { Response, NextFunction } from 'express';
import { authService } from '../services';
import { ApiError, TokenError } from '../utils/errors';
import { IAuthenticatedRequest } from '../types';

/**
 * Authentication Middleware
 * Protects routes by validating JWT access tokens
 */
export const authMiddleware = async (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw ApiError.unauthorized('No authorization header provided');
    }

    // Check Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Invalid authorization header format');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw ApiError.unauthorized('No token provided');
    }

    // Verify token
    const payload = authService.verifyAccessToken(token);

    // Attach user payload to request
    req.user = payload;

    next();
  } catch (error) {
    if (error instanceof TokenError || error instanceof ApiError) {
      next(error);
    } else {
      next(ApiError.unauthorized('Authentication failed'));
    }
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user to request if token is valid, but doesn't require it
 */
export const optionalAuthMiddleware = async (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const payload = authService.verifyAccessToken(token);
          req.user = payload;
        } catch {
          // Token invalid - continue without user
        }
      }
    }

    next();
  } catch {
    // Continue without authentication
    next();
  }
};
