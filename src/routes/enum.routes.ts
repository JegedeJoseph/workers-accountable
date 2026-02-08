import { Router, Request, Response } from 'express';
import { ApiResponse } from '../utils/response';
import { User } from '../models';
import {
  Gender,
  Genders,
  MaleHostels,
  FemaleHostels,
  WorkforceDepartments,
  ExcoPositions,
  UserRole,
} from '../types/enums';
import { EXECUTIVES_SEED_DATA } from '../config/executives.seed';

const router = Router();

/**
 * @route   GET /api/enums
 * @desc    Get all enum values for Flutter dropdowns
 * @access  Public
 *
 * This endpoint provides all enum values for the Flutter Desktop app
 * to populate dropdowns and validate user input without hardcoding
 */
router.get('/', (req: Request, res: Response) => {
  const enums = {
    genders: Genders,
    maleHostels: MaleHostels,
    femaleHostels: FemaleHostels,
    workforceDepartments: WorkforceDepartments,
    excoPositions: ExcoPositions,
  };

  ApiResponse.success(res, enums, 'Enums retrieved successfully');
});

/**
 * @route   GET /api/enums/hostels
 * @desc    Get hostel options by gender
 * @access  Public
 * @query   gender - 'male' or 'female'
 */
router.get('/hostels', (req: Request, res: Response) => {
  const { gender } = req.query;

  if (gender === Gender.MALE) {
    ApiResponse.success(res, { hostels: MaleHostels }, 'Male hostels retrieved');
  } else if (gender === Gender.FEMALE) {
    ApiResponse.success(res, { hostels: FemaleHostels }, 'Female hostels retrieved');
  } else {
    // Return both if no gender specified
    ApiResponse.success(
      res,
      { maleHostels: MaleHostels, femaleHostels: FemaleHostels },
      'All hostels retrieved'
    );
  }
});

/**
 * @route   GET /api/enums/departments
 * @desc    Get workforce department options
 * @access  Public
 */
router.get('/departments', (req: Request, res: Response) => {
  ApiResponse.success(
    res,
    { departments: WorkforceDepartments },
    'Departments retrieved successfully'
  );
});

/**
 * @route   GET /api/enums/executives
 * @desc    Get list of executives for worker registration dropdown
 * @access  Public
 * 
 * Returns executives from database if seeded, otherwise from seed data
 */
router.get('/executives', async (req: Request, res: Response) => {
  try {
    // Try to get executives from database first
    const dbExecutives = await User.find({
      role: UserRole.EXECUTIVE,
      isActive: true,
    }).select('_id fullName email excoPosition');

    if (dbExecutives.length > 0) {
      const executives = dbExecutives.map((exec) => ({
        id: exec._id.toString(),
        fullName: exec.fullName,
        email: exec.email,
        position: exec.excoPosition,
      }));
      ApiResponse.success(res, { executives }, 'Executives retrieved from database');
    } else {
      // Fallback to seed data if database is empty
      const executives = EXECUTIVES_SEED_DATA.map((exec, index) => ({
        id: `seed_${index}`, // Placeholder ID - will be replaced after seeding
        fullName: exec.fullName,
        email: exec.email,
        position: exec.excoPosition,
      }));
      ApiResponse.success(
        res,
        { executives, note: 'Database not seeded yet. Run seed script.' },
        'Executives retrieved from seed data'
      );
    }
  } catch (error) {
    // Fallback to seed data on error
    const executives = EXECUTIVES_SEED_DATA.map((exec, index) => ({
      id: `seed_${index}`,
      fullName: exec.fullName,
      email: exec.email,
      position: exec.excoPosition,
    }));
    ApiResponse.success(res, { executives }, 'Executives retrieved from seed data');
  }
});

/**
 * @route   GET /api/enums/positions
 * @desc    Get executive position options
 * @access  Public
 */
router.get('/positions', (req: Request, res: Response) => {
  ApiResponse.success(
    res,
    { positions: ExcoPositions },
    'Positions retrieved successfully'
  );
});

export default router;
