import { Router, Request, Response } from 'express';
import { User } from '../models';
import { authController } from '../controllers';
import { authMiddleware, executiveOnly, selfOrExecutive } from '../middlewares';
import { ApiResponse } from '../utils/response';
import { UserRole, WorkforceDepartment } from '../types/enums';

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Get all users (with optional filters)
 * @access  Private (Executive only)
 */
router.get('/', authMiddleware, executiveOnly, async (req: Request, res: Response) => {
  try {
    const { role, department, page = 1, limit = 20 } = req.query;

    const filter: Record<string, any> = {};

    if (role) {
      filter.role = role;
    }

    if (department) {
      filter.workforceDepartment = department;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('assignedExecutive', 'fullName email excoPosition')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    ApiResponse.paginated(
      res,
      users,
      Number(page),
      Number(limit),
      total,
      'Users retrieved successfully'
    );
  } catch (error) {
    throw error;
  }
});

/**
 * @route   GET /api/users/executives
 * @desc    Get all executives (for worker assignment dropdown)
 * @access  Private
 */
router.get('/executives', authMiddleware, async (req: Request, res: Response) => {
  try {
    const executives = await User.find({
      role: UserRole.EXECUTIVE,
      isActive: true,
    }).select('_id fullName email excoPosition');

    ApiResponse.success(res, { executives }, 'Executives retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * @route   GET /api/users/departments
 * @desc    Get workers grouped by department
 * @access  Private (Executive only)
 */
router.get(
  '/departments',
  authMiddleware,
  executiveOnly,
  async (req: Request, res: Response) => {
    try {
      const { department } = req.query;

      const filter: Record<string, any> = { role: UserRole.WORKER };

      if (department) {
        filter.workforceDepartment = department;
      }

      const workers = await User.find(filter)
        .populate('assignedExecutive', 'fullName email excoPosition')
        .sort({ workforceDepartment: 1, fullName: 1 });

      // Group by department
      const grouped: Record<string, typeof workers> = {};
      workers.forEach((worker) => {
        const dept = worker.workforceDepartment || 'unassigned';
        if (!grouped[dept]) {
          grouped[dept] = [];
        }
        grouped[dept].push(worker);
      });

      ApiResponse.success(
        res,
        { departments: grouped },
        'Workers by department retrieved successfully'
      );
    } catch (error) {
      throw error;
    }
  }
);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID
 * @access  Private (Self or Executive)
 */
router.get(
  '/:userId',
  authMiddleware,
  selfOrExecutive('userId'),
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId).populate(
        'assignedExecutive',
        'fullName email excoPosition'
      );

      if (!user) {
        return ApiResponse.error(res, 'User not found', 404, 'NOT_FOUND');
      }

      ApiResponse.success(res, { user }, 'User retrieved successfully');
    } catch (error) {
      throw error;
    }
  }
);

/**
 * @route   PATCH /api/users/:userId/reactivate
 * @desc    Reactivate a user account
 * @access  Private (Executive only)
 */
router.patch(
  '/:userId/reactivate',
  authMiddleware,
  executiveOnly,
  authController.reactivateAccount.bind(authController)
);

/**
 * @route   POST /api/users/assign-executive
 * @desc    Assign an executive to a worker
 * @access  Private (Executive only)
 */
router.post(
  '/assign-executive',
  authMiddleware,
  executiveOnly,
  authController.assignExecutive.bind(authController)
);

/**
 * @route   GET /api/users/my-workers
 * @desc    Get workers assigned to the current executive
 * @access  Private (Executive only)
 */
router.get(
  '/my-workers',
  authMiddleware,
  executiveOnly,
  async (req: Request & { user?: { userId: string } }, res: Response) => {
    try {
      const executiveId = req.user?.userId;

      const workers = await User.find({
        role: UserRole.WORKER,
        assignedExecutive: executiveId,
      }).sort({ workforceDepartment: 1, fullName: 1 });

      ApiResponse.success(
        res,
        { workers },
        'Assigned workers retrieved successfully'
      );
    } catch (error) {
      throw error;
    }
  }
);

export default router;
