/**
 * Custom API Error class for consistent error handling
 */
export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;
  public details?: unknown;

  constructor(
    statusCode: number,
    message: string,
    code: string = 'ERROR',
    isOperational: boolean = true,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Factory methods for common errors
   */
  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, message, 'BAD_REQUEST', true, details);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(403, message, 'FORBIDDEN');
  }

  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(404, message, 'NOT_FOUND');
  }

  static conflict(message: string, details?: unknown): ApiError {
    return new ApiError(409, message, 'CONFLICT', true, details);
  }

  static validationError(message: string, details?: unknown): ApiError {
    return new ApiError(422, message, 'VALIDATION_ERROR', true, details);
  }

  static tooManyRequests(message: string = 'Too many requests'): ApiError {
    return new ApiError(429, message, 'TOO_MANY_REQUESTS');
  }

  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(500, message, 'INTERNAL_ERROR', false);
  }
}

/**
 * Authentication-specific errors
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed') {
    super(401, message, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Token-specific errors
 */
export class TokenError extends ApiError {
  constructor(message: string = 'Invalid or expired token') {
    super(401, message, 'TOKEN_ERROR');
  }
}

/**
 * Validation error for Zod
 */
export class ValidationError extends ApiError {
  constructor(message: string, details: unknown) {
    super(422, message, 'VALIDATION_ERROR', true, details);
  }
}
