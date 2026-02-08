import { Router } from 'express';
import { disciplineController } from '../controllers/discipline.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

/**
 * Discipline Routes
 * All routes require authentication
 */

/**
 * @route   GET /api/disciplines/current-week
 * @desc    Get current week's discipline progress
 * @access  Private
 */
router.get('/current-week', authMiddleware, disciplineController.getCurrentWeek);

/**
 * @route   POST /api/disciplines/save
 * @desc    Save discipline progress
 * @access  Private
 * @body    { disciplines: [{ discipline, monday, tuesday, ... }] }
 */
router.post('/save', authMiddleware, disciplineController.saveProgress);

/**
 * @route   POST /api/disciplines
 * @desc    Save discipline progress (alternative endpoint)
 * @access  Private
 * @body    { disciplines: [{ discipline, monday, tuesday, ... }] }
 */
router.post('/', authMiddleware, disciplineController.saveProgress);

/**
 * @route   GET /api/disciplines
 * @desc    Get current week's discipline progress (alternative endpoint)
 * @access  Private
 */
router.get('/', authMiddleware, disciplineController.getCurrentWeek);

/**
 * @route   GET /api/disciplines/dashboard
 * @desc    Get dashboard statistics (tasks, streak, completion rate)
 * @access  Private
 */
router.get('/dashboard', authMiddleware, disciplineController.getDashboard);

/**
 * @route   GET /api/disciplines/previous-weeks
 * @desc    Get previous weeks' progress
 * @access  Private
 * @query   limit - Number of weeks to retrieve (default: 4, max: 52)
 */
router.get('/previous-weeks', authMiddleware, disciplineController.getPreviousWeeks);

export default router;
