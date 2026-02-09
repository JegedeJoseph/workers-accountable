import { Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';
import { ApiResponse } from '../utils/response';
import { ApiError } from '../utils/errors';
import { IAuthenticatedRequest } from '../types';
import { NotificationStatus, NotificationSchedule } from '../models/notification.model';

/**
 * Notification Controller
 * Handles HTTP requests for notification management
 */
class NotificationController {
  /**
   * GET /api/notifications
   * Get all notifications for the authenticated user
   */
  async getNotifications(
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      const { status, limit, skip } = req.query;

      const result = await notificationService.getUserNotifications(req.user.userId, {
        status: status as NotificationStatus | undefined,
        limit: limit ? parseInt(limit as string, 10) : 20,
        skip: skip ? parseInt(skip as string, 10) : 0,
      });

      ApiResponse.success(res, result, 'Notifications retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/stats
   * Get notification statistics for the authenticated user
   */
  async getStats(
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      const stats = await notificationService.getNotificationStats(req.user.userId);

      ApiResponse.success(res, stats, 'Notification statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/incomplete-tasks
   * Check for incomplete tasks (for frontend polling)
   */
  async checkIncompleteTasks(
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      const result = await notificationService.getMyIncompleteTasks(req.user.userId);

      ApiResponse.success(res, result, 'Incomplete tasks check completed');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Mark a notification as read
   */
  async markAsRead(
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      const { id } = req.params;

      const notification = await notificationService.markAsRead(id, req.user.userId);

      if (!notification) {
        throw ApiError.notFound('Notification not found');
      }

      ApiResponse.success(res, { notification }, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/notifications/mark-all-read
   * Mark all notifications as read for the authenticated user
   */
  async markAllAsRead(
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      const count = await notificationService.markAllAsRead(req.user.userId);

      ApiResponse.success(res, { markedAsRead: count }, `${count} notifications marked as read`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/notifications/:id
   * Delete a notification
   */
  async deleteNotification(
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      const { id } = req.params;

      const deleted = await notificationService.deleteNotification(id, req.user.userId);

      if (!deleted) {
        throw ApiError.notFound('Notification not found');
      }

      ApiResponse.success(res, null, 'Notification deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/notifications/trigger-reminders
   * Manually trigger task reminders (for testing/admin purposes)
   * This endpoint should be protected for executives only in production
   */
  async triggerReminders(
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      const { scheduleTime } = req.body;
      const validScheduleTimes = Object.values(NotificationSchedule);

      if (!scheduleTime || !validScheduleTimes.includes(scheduleTime)) {
        throw ApiError.badRequest(
          `Invalid scheduleTime. Must be one of: ${validScheduleTimes.join(', ')}`
        );
      }

      const count = await notificationService.createTaskReminders(
        scheduleTime as NotificationSchedule
      );

      ApiResponse.success(
        res,
        { notificationsCreated: count, scheduleTime },
        `Created ${count} task reminder notifications`
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/workers-incomplete
   * Get all workers with incomplete tasks (for executives to view)
   */
  async getWorkersWithIncompleteTasks(
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      const workers = await notificationService.getWorkersWithIncompleteTasks();

      ApiResponse.success(
        res,
        {
          workers,
          totalWorkers: workers.length,
          timestamp: new Date().toISOString(),
        },
        'Workers with incomplete tasks retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/notifications/cleanup
   * Cleanup old read notifications (admin function)
   */
  async cleanupOldNotifications(
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw ApiError.unauthorized('User not authenticated');
      }

      const { daysOld } = req.query;
      const days = daysOld ? parseInt(daysOld as string, 10) : 30;

      const deletedCount = await notificationService.cleanupOldNotifications(days);

      ApiResponse.success(
        res,
        { deletedCount, daysOld: days },
        `Cleaned up ${deletedCount} old notifications`
      );
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
