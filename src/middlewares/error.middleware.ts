import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError, ValidationError } from '../utils/errors';
import { ApiResponse } from '../utils/response';
import config from '../config';

/**
 * Global Error Handler Middleware
 * Handles all errors and returns consistent JSON responses for Flutter
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error in development
  if (config.nodeEnv === 'development') {
    console.error('Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors: Record<string, string[]> = {};
    err.errors.forEach((error) => {
      const path = error.path.join('.');
      if (!formattedErrors[path]) {
        formattedErrors[path] = [];
      }
      formattedErrors[path].push(error.message);
    });

    ApiResponse.error(
      res,
      'Validation failed',
      422,
      'VALIDATION_ERROR',
      formattedErrors
    );
    return;
  }

  // Handle custom API errors
  if (err instanceof ApiError) {
    ApiResponse.error(
      res,
      err.message,
      err.statusCode,
      err.code,
      err.details
    );
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const mongooseError = err as any;
    const formattedErrors: Record<string, string[]> = {};

    Object.keys(mongooseError.errors || {}).forEach((key) => {
      formattedErrors[key] = [mongooseError.errors[key].message];
    });

    ApiResponse.error(
      res,
      'Validation failed',
      422,
      'VALIDATION_ERROR',
      formattedErrors
    );
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    ApiResponse.error(
      res,
      'Invalid ID format',
      400,
      'INVALID_ID'
    );
    return;
  }

  // Handle Mongoose duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0] || 'field';
    ApiResponse.error(
      res,
      `Duplicate value for ${field}`,
      409,
      'DUPLICATE_ERROR',
      { field }
    );
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    ApiResponse.error(
      res,
      'Invalid token',
      401,
      'TOKEN_ERROR'
    );
    return;
  }

  if (err.name === 'TokenExpiredError') {
    ApiResponse.error(
      res,
      'Token has expired',
      401,
      'TOKEN_EXPIRED'
    );
    return;
  }

  // Default to internal server error
  const message =
    config.nodeEnv === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  ApiResponse.error(res, message, 500, 'INTERNAL_ERROR');
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  ApiResponse.error(
    res,
    `Route ${req.method} ${req.originalUrl} not found`,
    404,
    'NOT_FOUND'
  );
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
