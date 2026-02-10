import { Router } from 'express';
import { executiveController } from '../controllers/executive.controller';
import { authMiddleware, superAdminOnly } from '../middlewares';

const router = Router();

/**
 * Super Admin Routes (GC - General Coordinator)
 * All routes require authentication and super_admin role
 * These routes provide system-wide visibility into all workers
 */

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get system-wide dashboard summary (total workers, executives, avg completion, etc.)
 * @access  Super Admin only (GC)
 * @query   weekStartDate - Optional ISO date for specific week
 */
router.get('/dashboard', authMiddleware, superAdminOnly, executiveController.getSystemDashboard);

/**
 * @route   GET /api/admin/workers
 * @desc    Get ALL workers in the system
 * @access  Super Admin only (GC)
 */
router.get('/workers', authMiddleware, superAdminOnly, executiveController.getAllWorkers);

/**
 * @route   GET /api/admin/workers/progress
 * @desc    Get weekly discipline progress for ALL workers
 * @access  Super Admin only (GC)
 * @query   weekStartDate - Optional ISO date for specific week
 */
router.get('/workers/progress', authMiddleware, superAdminOnly, executiveController.getAllWorkersProgress);

/**
 * @route   GET /api/admin/workers/:workerId
 * @desc    Get any worker's discipline details
 * @access  Super Admin only (GC)
 * @query   weekStartDate - Optional ISO date for specific week
 */
router.get('/workers/:workerId', authMiddleware, superAdminOnly, executiveController.getAnyWorkerDetails);

/**
 * @route   GET /api/admin/workers/:workerId/history
 * @desc    Get any worker's discipline history (multiple weeks)
 * @access  Super Admin only (GC)
 * @query   limit - Number of weeks to retrieve (default: 4)
 */
router.get('/workers/:workerId/history', authMiddleware, superAdminOnly, executiveController.getAnyWorkerHistory);

/**
 * @route   GET /api/admin/reflections
 * @desc    Get all reflections from ALL workers for the week
 * @access  Super Admin only (GC)
 * @query   weekStartDate - Optional ISO date for specific week
 */
router.get('/reflections', authMiddleware, superAdminOnly, executiveController.getAllReflections);

export default router;
