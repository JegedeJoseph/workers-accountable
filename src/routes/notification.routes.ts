import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authMiddleware } from '../middlewares';
import { roleCheck, executiveOnly } from '../middlewares/role.middleware';
import { UserRole } from '../types/enums';

const router = Router();

/**
 * Notification Routes
 * All routes require authentication
 */

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the authenticated user
 * @access  Private
 * @query   status - Filter by status (unread, read, dismissed)
 * @query   limit - Number of notifications to retrieve (default: 20)
 * @query   skip - Number of notifications to skip (for pagination)
 */
router.get('/', authMiddleware, notificationController.getNotifications);

/**
 * @route   GET /api/notifications/stats
 * @desc    Get notification statistics for the authenticated user
 * @access  Private
 */
router.get('/stats', authMiddleware, notificationController.getStats);

/**
 * @route   GET /api/notifications/incomplete-tasks
 * @desc    Check for incomplete tasks (for frontend polling to show reminders)
 * @access  Private
 */
router.get('/incomplete-tasks', authMiddleware, notificationController.checkIncompleteTasks);

/**
 * @route   GET /api/notifications/workers-incomplete
 * @desc    Get all workers with incomplete tasks (executives only)
 * @access  Private (Executives only)
 */
router.get(
  '/workers-incomplete',
  authMiddleware,
  executiveOnly,
  notificationController.getWorkersWithIncompleteTasks
);

/**
 * @route   PATCH /api/notifications/mark-all-read
 * @desc    Mark all notifications as read for the authenticated user
 * @access  Private
 */
router.patch('/mark-all-read', authMiddleware, notificationController.markAllAsRead);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a specific notification as read
 * @access  Private
 */
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);

/**
 * @route   DELETE /api/notifications/cleanup
 * @desc    Cleanup old read notifications (executives only)
 * @access  Private (Executives only)
 * @query   daysOld - Delete notifications older than this many days (default: 30)
 */
router.delete('/cleanup', authMiddleware, executiveOnly, notificationController.cleanupOldNotifications);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a specific notification
 * @access  Private
 */
router.delete('/:id', authMiddleware, notificationController.deleteNotification);

/**
 * @route   POST /api/notifications/trigger-reminders
 * @desc    Manually trigger task reminders (executives only, for testing)
 * @access  Private (Executives only)
 * @body    { scheduleTime: '7am' | '1pm' | '9pm' }
 */
router.post(
  '/trigger-reminders',
  authMiddleware,
  executiveOnly,
  notificationController.triggerReminders
);

export default router;
