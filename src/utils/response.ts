import { Response } from 'express';
import { IApiResponse } from '../types';

/**
 * Standardized API response helper
 * Optimized for Flutter Desktop app JSON serialization
 */
export class ApiResponse {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
    meta?: IApiResponse<T>['meta']
  ): Response {
    const response: IApiResponse<T> = {
      success: true,
      message,
      data,
      ...(meta && { meta }),
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send created response (201)
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): Response {
    return this.success(res, data, message, 201);
  }

  /**
   * Send no content response (204)
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    code: string = 'ERROR',
    details?: unknown
  ): Response {
    const response: IApiResponse = {
      success: false,
      message,
      error: {
        code,
        details: details ?? undefined,
      },
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message: string = 'Success'
  ): Response {
    const totalPages = Math.ceil(total / limit);
    return this.success(res, data, message, 200, {
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }
}
