import { Request, Response, NextFunction } from 'express';
import { disciplineService } from '../services/discipline.service';
import { ApiResponse } from '../utils/response';
import { ApiError, ValidationError } from '../utils/errors';
import { IAuthenticatedRequest } from '../types';
import {
  saveProgressSchema,
  getPreviousWeeksSchema,
  saveReflectionSchema,
} from '../validations/discipline.validation';
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
 * Discipline Controller
 * Handles HTTP requests for weekly discipline tracking
 */
class DisciplineController {
  /**
   * GET /api/disciplines/current-week
   * Get the current week's discipline progress
   */
  async getCurrentWeek(
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      const weeklyDiscipline = await disciplineService.getOrCreateCurrentWeek(req.user.userId);

      ApiResponse.success(
        res,
        { weeklyDiscipline },
        'Current week progress retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/disciplines/save
   * Save discipline progress for the current week
   */
  async saveProgress(
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      // Validate request body
      const validationResult = saveProgressSchema.safeParse(req.body);

      if (!validationResult.success) {
        const formattedErrors = formatZodError(validationResult.error);
        throw new ValidationError('Validation failed', formattedErrors);
      }

      const result = await disciplineService.saveProgress(
        req.user.userId,
        validationResult.data
      );

      ApiResponse.success(res, result, 'Progress saved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/disciplines/dashboard
   * Get dashboard statistics (tasks completed, streak, completion rate)
   */
  async getDashboard(
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      const stats = await disciplineService.getDashboardStats(req.user.userId);

      ApiResponse.success(res, { dashboard: stats }, 'Dashboard stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/disciplines/previous-weeks
   * Get previous weeks' discipline progress
   */
  async getPreviousWeeks(
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      // Validate query params
      const validationResult = getPreviousWeeksSchema.safeParse(req.query);

      if (!validationResult.success) {
        const formattedErrors = formatZodError(validationResult.error);
        throw new ValidationError('Validation failed', formattedErrors);
      }

      const weeks = await disciplineService.getPreviousWeeks(
        req.user.userId,
        validationResult.data.limit
      );

      ApiResponse.success(
        res,
        { weeks, count: weeks.length },
        'Previous weeks retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/disciplines/reflection
   * Save weekly reflection / remarks
   */
  async saveReflection(
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      // Validate request body
      const validationResult = saveReflectionSchema.safeParse(req.body);

      if (!validationResult.success) {
        const formattedErrors = formatZodError(validationResult.error);
        throw new ValidationError('Validation failed', formattedErrors);
      }

      const result = await disciplineService.saveReflection(
        req.user.userId,
        validationResult.data
      );

      ApiResponse.success(res, result, 'Reflection saved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/disciplines/reflection
   * Get weekly reflection for current week
   */
  async getReflection(
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      const result = await disciplineService.getReflection(req.user.userId);

      ApiResponse.success(res, result, 'Reflection retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const disciplineController = new DisciplineController();
