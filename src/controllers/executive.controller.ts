import { Response, NextFunction } from 'express';
import { executiveService } from '../services/executive.service';
import { ApiResponse } from '../utils/response';
import { ApiError } from '../utils/errors';
import { IAuthenticatedRequest } from '../types';
import { UserRole } from '../types/enums';

/**
 * Verify user is an executive (standalone function)
 */
function verifyExecutive(req: IAuthenticatedRequest): void {
  if (!req.user?.userId) {
    throw ApiError.unauthorized('User not authenticated');
  }
  if (req.user.role !== UserRole.EXECUTIVE) {
    throw ApiError.forbidden('Only executives can access this resource');
  }
}

/**
 * Executive Controller
 * Handles HTTP requests for executive dashboard and worker tracking
 */
class ExecutiveController {
  /**
   * GET /api/executive/dashboard
   * Get executive dashboard summary
   */
  getDashboard = async (
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      verifyExecutive(req);

      const weekStartDate = req.query.weekStartDate
        ? new Date(req.query.weekStartDate as string)
        : undefined;

      const summary = await executiveService.getDashboardSummary(
        req.user!.userId,
        weekStartDate
      );

      ApiResponse.success(res, { summary }, 'Dashboard summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/executive/workers
   * Get all workers assigned to the executive
   */
  getAssignedWorkers = async (
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      verifyExecutive(req);

      const workers = await executiveService.getAssignedWorkers(req.user!.userId);

      ApiResponse.success(
        res,
        { workers, count: workers.length },
        'Assigned workers retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/executive/workers/progress
   * Get weekly discipline progress for all assigned workers
   */
  getWorkersProgress = async (
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      verifyExecutive(req);

      const weekStartDate = req.query.weekStartDate
        ? new Date(req.query.weekStartDate as string)
        : undefined;

      const progress = await executiveService.getWorkersWeeklyProgress(
        req.user!.userId,
        weekStartDate
      );

      ApiResponse.success(
        res,
        { progress, count: progress.length },
        'Workers progress retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/executive/workers/:workerId
   * Get a specific worker's discipline details
   */
  getWorkerDetails = async (
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      verifyExecutive(req);

      const { workerId } = req.params;
      if (!workerId) {
        throw ApiError.badRequest('Worker ID is required');
      }

      const weekStartDate = req.query.weekStartDate
        ? new Date(req.query.weekStartDate as string)
        : undefined;

      const details = await executiveService.getWorkerDisciplineDetails(
        req.user!.userId,
        workerId,
        weekStartDate
      );

      ApiResponse.success(res, { details }, 'Worker details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/executive/workers/:workerId/history
   * Get a specific worker's discipline history (multiple weeks)
   */
  getWorkerHistory = async (
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      verifyExecutive(req);

      const { workerId } = req.params;
      if (!workerId) {
        throw ApiError.badRequest('Worker ID is required');
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 4;

      const history = await executiveService.getWorkerHistory(
        req.user!.userId,
        workerId,
        limit
      );

      ApiResponse.success(
        res,
        { history, count: history.length },
        'Worker history retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/executive/reflections
   * Get all reflections from assigned workers for the current week
   */
  getWorkersReflections = async (
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      verifyExecutive(req);

      const weekStartDate = req.query.weekStartDate
        ? new Date(req.query.weekStartDate as string)
        : undefined;

      const reflections = await executiveService.getWorkersReflections(
        req.user!.userId,
        weekStartDate
      );

      ApiResponse.success(
        res,
        { reflections, count: reflections.length },
        'Workers reflections retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const executiveController = new ExecutiveController();
