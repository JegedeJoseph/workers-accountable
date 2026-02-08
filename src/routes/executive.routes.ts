import { Router } from 'express';
import { executiveController } from '../controllers/executive.controller';
import { authMiddleware, executiveOnly } from '../middlewares';

const router = Router();

/**
 * Executive Routes
 * All routes require authentication and executive role
 */

/**
 * @route   GET /api/executive/dashboard
 * @desc    Get executive dashboard summary (total workers, avg completion, etc.)
 * @access  Executive only
 * @query   weekStartDate - Optional ISO date for specific week
 */
router.get('/dashboard', authMiddleware, executiveOnly, executiveController.getDashboard);

/**
 * @route   GET /api/executive/workers
 * @desc    Get all workers assigned to the executive
 * @access  Executive only
 */
router.get('/workers', authMiddleware, executiveOnly, executiveController.getAssignedWorkers);

/**
 * @route   GET /api/executive/workers/progress
 * @desc    Get weekly discipline progress for all assigned workers
 * @access  Executive only
 * @query   weekStartDate - Optional ISO date for specific week
 */
router.get('/workers/progress', authMiddleware, executiveOnly, executiveController.getWorkersProgress);

/**
 * @route   GET /api/executive/workers/:workerId
 * @desc    Get a specific worker's discipline details for current week
 * @access  Executive only
 * @query   weekStartDate - Optional ISO date for specific week
 */
router.get('/workers/:workerId', authMiddleware, executiveOnly, executiveController.getWorkerDetails);

/**
 * @route   GET /api/executive/workers/:workerId/history
 * @desc    Get a specific worker's discipline history (multiple weeks)
 * @access  Executive only
 * @query   limit - Number of weeks to retrieve (default: 4)
 */
router.get('/workers/:workerId/history', authMiddleware, executiveOnly, executiveController.getWorkerHistory);

/**
 * @route   GET /api/executive/reflections
 * @desc    Get all reflections from assigned workers for the week
 * @access  Executive only
 * @query   weekStartDate - Optional ISO date for specific week
 */
router.get('/reflections', authMiddleware, executiveOnly, executiveController.getWorkersReflections);

export default router;
