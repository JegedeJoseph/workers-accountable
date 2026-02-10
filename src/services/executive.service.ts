import { Types } from 'mongoose';
import { User } from '../models';
import { WeeklyDiscipline, IWeeklyDiscipline, IDisciplineProgress } from '../models/discipline.model';
import { UserRole, DaysOfWeek, DailyDisciplines, WeeklyDisciplines, SpiritualDiscipline } from '../types/enums';
import { ApiError } from '../utils/errors';
import { IUser } from '../types';

/**
 * Worker discipline summary for executive view
 */
export interface IWorkerDisciplineSummary {
  worker: {
    _id: string;
    fullName: string;
    email: string;
    hostel: string;
    workforceDepartment: string;
  };
  weekStartDate: Date;
  weekEndDate: Date;
  tasksCompleted: number;
  totalTasks: number;
  completionRate: number;
  reflection: string | null;
  reflectionSubmittedAt: Date | null;
  disciplines: IDisciplineProgress[];
}

/**
 * Executive dashboard summary
 */
export interface IExecutiveDashboardSummary {
  totalWorkers: number;
  workersWithProgress: number;
  workersWithReflection: number;
  averageCompletionRate: number;
  weekStartDate: Date;
  weekEndDate: Date;
}

/**
 * Executive Service
 * Handles business logic for executive dashboard and worker tracking
 */
class ExecutiveService {
  /**
   * Get all workers assigned to an executive
   */
  async getAssignedWorkers(executiveId: string): Promise<IUser[]> {
    const workers = await User.find({
      assignedExecutive: new Types.ObjectId(executiveId),
      role: UserRole.WORKER,
      isActive: true,
    }).select('-password -refreshToken');

    return workers;
  }

  /**
   * Get worker count for an executive
   */
  async getAssignedWorkerCount(executiveId: string): Promise<number> {
    return User.countDocuments({
      assignedExecutive: new Types.ObjectId(executiveId),
      role: UserRole.WORKER,
      isActive: true,
    });
  }

  /**
   * Calculate completion rate for a discipline record
   */
  private calculateCompletionRate(disciplines: IDisciplineProgress[]): number {
    let requiredCompleted = 0;
    const totalRequired = 16; // 7 + 7 + 1 + 1

    for (const disc of disciplines) {
      const isDaily = DailyDisciplines.includes(disc.discipline as SpiritualDiscipline);
      const isWeekly = WeeklyDisciplines.includes(disc.discipline as SpiritualDiscipline);

      if (isDaily) {
        for (const day of DaysOfWeek) {
          if (disc[day as keyof IDisciplineProgress] === true) {
            requiredCompleted++;
          }
        }
      } else if (isWeekly) {
        let completed = false;
        for (const day of DaysOfWeek) {
          if (disc[day as keyof IDisciplineProgress] === true) {
            completed = true;
            break;
          }
        }
        if (completed) {
          requiredCompleted++;
        }
      }
    }

    return totalRequired > 0 ? Math.round((requiredCompleted / totalRequired) * 100) : 0;
  }

  /**
   * Count total completed tasks
   */
  private countCompletedTasks(disciplines: IDisciplineProgress[]): number {
    let total = 0;
    for (const disc of disciplines) {
      for (const day of DaysOfWeek) {
        if (disc[day as keyof IDisciplineProgress] === true) {
          total++;
        }
      }
    }
    return total;
  }

  /**
   * Get weekly discipline data for all workers assigned to an executive
   */
  async getWorkersWeeklyProgress(
    executiveId: string,
    weekStartDate?: Date
  ): Promise<IWorkerDisciplineSummary[]> {
    // Get all assigned workers
    const workers = await this.getAssignedWorkers(executiveId);

    if (workers.length === 0) {
      return [];
    }

    // Calculate week dates
    const startDate = weekStartDate
      ? WeeklyDiscipline.getWeekStartDate(weekStartDate)
      : WeeklyDiscipline.getWeekStartDate();
    const endDate = WeeklyDiscipline.getWeekEndDate(startDate);

    // Get discipline records for all workers
    const workerIds = workers.map((w) => w._id);
    const disciplineRecords = await WeeklyDiscipline.find({
      userId: { $in: workerIds },
      weekStartDate: startDate,
    });

    // Create a map for quick lookup
    const disciplineMap = new Map<string, IWeeklyDiscipline>();
    for (const record of disciplineRecords) {
      disciplineMap.set(record.userId.toString(), record);
    }

    // Build summary for each worker
    const summaries: IWorkerDisciplineSummary[] = workers.map((worker) => {
      const record = disciplineMap.get(worker._id.toString());

      if (record) {
        return {
          worker: {
            _id: worker._id.toString(),
            fullName: worker.fullName,
            email: worker.email,
            hostel: worker.hostel || '',
            workforceDepartment: worker.workforceDepartment || '',
          },
          weekStartDate: startDate,
          weekEndDate: endDate,
          tasksCompleted: this.countCompletedTasks(record.disciplines),
          totalTasks: 28,
          completionRate: this.calculateCompletionRate(record.disciplines),
          reflection: record.reflection || null,
          reflectionSubmittedAt: record.reflectionSubmittedAt || null,
          disciplines: record.disciplines,
        };
      } else {
        // No record for this week - return empty progress
        return {
          worker: {
            _id: worker._id.toString(),
            fullName: worker.fullName,
            email: worker.email,
            hostel: worker.hostel || '',
            workforceDepartment: worker.workforceDepartment || '',
          },
          weekStartDate: startDate,
          weekEndDate: endDate,
          tasksCompleted: 0,
          totalTasks: 28,
          completionRate: 0,
          reflection: null,
          reflectionSubmittedAt: null,
          disciplines: [],
        };
      }
    });

    // Sort by completion rate (descending)
    summaries.sort((a, b) => b.completionRate - a.completionRate);

    return summaries;
  }

  /**
   * Get a specific worker's discipline details (for executive view)
   */
  async getWorkerDisciplineDetails(
    executiveId: string,
    workerId: string,
    weekStartDate?: Date
  ): Promise<IWorkerDisciplineSummary> {
    // Verify the worker is assigned to this executive
    const worker = await User.findOne({
      _id: new Types.ObjectId(workerId),
      assignedExecutive: new Types.ObjectId(executiveId),
      role: UserRole.WORKER,
    }).select('-password -refreshToken');

    if (!worker) {
      throw ApiError.notFound('Worker not found or not assigned to you');
    }

    // Calculate week dates
    const startDate = weekStartDate
      ? WeeklyDiscipline.getWeekStartDate(weekStartDate)
      : WeeklyDiscipline.getWeekStartDate();
    const endDate = WeeklyDiscipline.getWeekEndDate(startDate);

    // Get discipline record
    const record = await WeeklyDiscipline.findOne({
      userId: new Types.ObjectId(workerId),
      weekStartDate: startDate,
    });

    if (record) {
      return {
        worker: {
          _id: worker._id.toString(),
          fullName: worker.fullName,
          email: worker.email,
          hostel: worker.hostel || '',
          workforceDepartment: worker.workforceDepartment || '',
        },
        weekStartDate: startDate,
        weekEndDate: endDate,
        tasksCompleted: this.countCompletedTasks(record.disciplines),
        totalTasks: 28,
        completionRate: this.calculateCompletionRate(record.disciplines),
        reflection: record.reflection || null,
        reflectionSubmittedAt: record.reflectionSubmittedAt || null,
        disciplines: record.disciplines,
      };
    } else {
      return {
        worker: {
          _id: worker._id.toString(),
          fullName: worker.fullName,
          email: worker.email,
          hostel: worker.hostel || '',
          workforceDepartment: worker.workforceDepartment || '',
        },
        weekStartDate: startDate,
        weekEndDate: endDate,
        tasksCompleted: 0,
        totalTasks: 28,
        completionRate: 0,
        reflection: null,
        reflectionSubmittedAt: null,
        disciplines: [],
      };
    }
  }

  /**
   * Get executive dashboard summary
   */
  async getDashboardSummary(executiveId: string, weekStartDate?: Date): Promise<IExecutiveDashboardSummary> {
    // Calculate week dates
    const startDate = weekStartDate
      ? WeeklyDiscipline.getWeekStartDate(weekStartDate)
      : WeeklyDiscipline.getWeekStartDate();
    const endDate = WeeklyDiscipline.getWeekEndDate(startDate);

    // Get all assigned workers
    const workers = await this.getAssignedWorkers(executiveId);
    const totalWorkers = workers.length;

    if (totalWorkers === 0) {
      return {
        totalWorkers: 0,
        workersWithProgress: 0,
        workersWithReflection: 0,
        averageCompletionRate: 0,
        weekStartDate: startDate,
        weekEndDate: endDate,
      };
    }

    // Get discipline records for all workers
    const workerIds = workers.map((w) => w._id);
    const disciplineRecords = await WeeklyDiscipline.find({
      userId: { $in: workerIds },
      weekStartDate: startDate,
    });

    // Calculate stats
    let workersWithProgress = 0;
    let workersWithReflection = 0;
    let totalCompletionRate = 0;

    for (const record of disciplineRecords) {
      const completedTasks = this.countCompletedTasks(record.disciplines);
      if (completedTasks > 0) {
        workersWithProgress++;
      }
      if (record.reflection) {
        workersWithReflection++;
      }
      totalCompletionRate += this.calculateCompletionRate(record.disciplines);
    }

    const averageCompletionRate =
      disciplineRecords.length > 0 ? Math.round(totalCompletionRate / disciplineRecords.length) : 0;

    return {
      totalWorkers,
      workersWithProgress,
      workersWithReflection,
      averageCompletionRate,
      weekStartDate: startDate,
      weekEndDate: endDate,
    };
  }

  /**
   * Get all reflections from assigned workers for a specific week
   */
  async getWorkersReflections(
    executiveId: string,
    weekStartDate?: Date
  ): Promise<{ worker: { _id: string; fullName: string }; reflection: string; submittedAt: Date }[]> {
    // Get all assigned workers
    const workers = await this.getAssignedWorkers(executiveId);

    if (workers.length === 0) {
      return [];
    }

    // Calculate week dates
    const startDate = weekStartDate
      ? WeeklyDiscipline.getWeekStartDate(weekStartDate)
      : WeeklyDiscipline.getWeekStartDate();

    // Get discipline records with reflections
    const workerIds = workers.map((w) => w._id);
    const records = await WeeklyDiscipline.find({
      userId: { $in: workerIds },
      weekStartDate: startDate,
      reflection: { $exists: true, $nin: [null, ''] },
      reflectionSubmittedAt: { $exists: true, $ne: null },
    });

    // Create worker map for quick lookup
    const workerMap = new Map<string, IUser>();
    for (const worker of workers) {
      workerMap.set(worker._id.toString(), worker);
    }

    // Build results
    const reflections = records
      .filter((r) => r.reflection && r.reflectionSubmittedAt)
      .map((record) => {
        const worker = workerMap.get(record.userId.toString());
        return {
          worker: {
            _id: record.userId.toString(),
            fullName: worker?.fullName || 'Unknown',
          },
          reflection: record.reflection!,
          submittedAt: record.reflectionSubmittedAt!,
        };
      })
      .sort((a, b) => {
        const timeA = a.submittedAt?.getTime() || 0;
        const timeB = b.submittedAt?.getTime() || 0;
        return timeB - timeA;
      });

    return reflections;
  }

  /**
   * Get worker history (multiple weeks)
   */
  async getWorkerHistory(
    executiveId: string,
    workerId: string,
    weeksLimit: number = 4
  ): Promise<IWorkerDisciplineSummary[]> {
    // Verify the worker is assigned to this executive
    const worker = await User.findOne({
      _id: new Types.ObjectId(workerId),
      assignedExecutive: new Types.ObjectId(executiveId),
      role: UserRole.WORKER,
    }).select('-password -refreshToken');

    if (!worker) {
      throw ApiError.notFound('Worker not found or not assigned to you');
    }

    // Get discipline records
    const records = await WeeklyDiscipline.find({
      userId: new Types.ObjectId(workerId),
    })
      .sort({ weekStartDate: -1 })
      .limit(weeksLimit);

    return records.map((record) => ({
      worker: {
        _id: worker._id.toString(),
        fullName: worker.fullName,
        email: worker.email,
        hostel: worker.hostel || '',
        workforceDepartment: worker.workforceDepartment || '',
      },
      weekStartDate: record.weekStartDate,
      weekEndDate: record.weekEndDate,
      tasksCompleted: this.countCompletedTasks(record.disciplines),
      totalTasks: 28,
      completionRate: this.calculateCompletionRate(record.disciplines),
      reflection: record.reflection || null,
      reflectionSubmittedAt: record.reflectionSubmittedAt || null,
      disciplines: record.disciplines,
    }));
  }

  // ============================================
  // SUPER ADMIN METHODS (GC - View All Workers)
  // ============================================

  /**
   * Get ALL workers in the system (Super Admin only)
   */
  async getAllWorkers(): Promise<IUser[]> {
    const workers = await User.find({
      role: UserRole.WORKER,
      isActive: true,
    })
      .select('-password -refreshToken')
      .populate('assignedExecutive', 'fullName email excoPosition');

    return workers;
  }

  /**
   * Get ALL workers count in the system
   */
  async getAllWorkersCount(): Promise<number> {
    return User.countDocuments({
      role: UserRole.WORKER,
      isActive: true,
    });
  }

  /**
   * Get system-wide dashboard summary (Super Admin only)
   */
  async getSystemDashboardSummary(weekStartDate?: Date): Promise<IExecutiveDashboardSummary & { totalExecutives: number }> {
    const totalWorkers = await this.getAllWorkersCount();
    const totalExecutives = await User.countDocuments({
      role: UserRole.EXECUTIVE,
      isActive: true,
    });

    // Calculate week dates
    const startDate = weekStartDate
      ? WeeklyDiscipline.getWeekStartDate(weekStartDate)
      : WeeklyDiscipline.getWeekStartDate();
    const endDate = WeeklyDiscipline.getWeekEndDate(startDate);

    // Get all discipline records for the week
    const disciplineRecords = await WeeklyDiscipline.find({
      weekStartDate: startDate,
    });

    // Calculate stats
    const workersWithProgress = disciplineRecords.length;
    const workersWithReflection = disciplineRecords.filter(
      (r) => r.reflection && r.reflectionSubmittedAt
    ).length;

    // Calculate average completion rate
    let totalCompletionRate = 0;
    for (const record of disciplineRecords) {
      totalCompletionRate += this.calculateCompletionRate(record.disciplines);
    }
    const averageCompletionRate = workersWithProgress > 0
      ? Math.round(totalCompletionRate / workersWithProgress)
      : 0;

    return {
      totalWorkers,
      totalExecutives,
      workersWithProgress,
      workersWithReflection,
      averageCompletionRate,
      weekStartDate: startDate,
      weekEndDate: endDate,
    };
  }

  /**
   * Get weekly discipline progress for ALL workers (Super Admin only)
   */
  async getAllWorkersWeeklyProgress(weekStartDate?: Date): Promise<IWorkerDisciplineSummary[]> {
    // Get all workers
    const workers = await this.getAllWorkers();

    if (workers.length === 0) {
      return [];
    }

    // Calculate week dates
    const startDate = weekStartDate
      ? WeeklyDiscipline.getWeekStartDate(weekStartDate)
      : WeeklyDiscipline.getWeekStartDate();
    const endDate = WeeklyDiscipline.getWeekEndDate(startDate);

    // Get discipline records for all workers
    const workerIds = workers.map((w) => w._id);
    const disciplineRecords = await WeeklyDiscipline.find({
      userId: { $in: workerIds },
      weekStartDate: startDate,
    });

    // Create a map for quick lookup
    const disciplineMap = new Map<string, IWeeklyDiscipline>();
    for (const record of disciplineRecords) {
      disciplineMap.set(record.userId.toString(), record);
    }

    // Build summary for each worker
    const summaries: IWorkerDisciplineSummary[] = workers.map((worker) => {
      const record = disciplineMap.get(worker._id.toString());

      if (record) {
        return {
          worker: {
            _id: worker._id.toString(),
            fullName: worker.fullName,
            email: worker.email,
            hostel: worker.hostel || '',
            workforceDepartment: worker.workforceDepartment || '',
          },
          weekStartDate: startDate,
          weekEndDate: endDate,
          tasksCompleted: this.countCompletedTasks(record.disciplines),
          totalTasks: 28,
          completionRate: this.calculateCompletionRate(record.disciplines),
          reflection: record.reflection || null,
          reflectionSubmittedAt: record.reflectionSubmittedAt || null,
          disciplines: record.disciplines,
        };
      } else {
        return {
          worker: {
            _id: worker._id.toString(),
            fullName: worker.fullName,
            email: worker.email,
            hostel: worker.hostel || '',
            workforceDepartment: worker.workforceDepartment || '',
          },
          weekStartDate: startDate,
          weekEndDate: endDate,
          tasksCompleted: 0,
          totalTasks: 28,
          completionRate: 0,
          reflection: null,
          reflectionSubmittedAt: null,
          disciplines: [],
        };
      }
    });

    // Sort by completion rate (descending)
    summaries.sort((a, b) => b.completionRate - a.completionRate);

    return summaries;
  }

  /**
   * Get a specific worker's discipline details (Super Admin - no assignment check)
   */
  async getAnyWorkerDisciplineDetails(
    workerId: string,
    weekStartDate?: Date
  ): Promise<IWorkerDisciplineSummary> {
    const worker = await User.findOne({
      _id: new Types.ObjectId(workerId),
      role: UserRole.WORKER,
    }).select('-password -refreshToken');

    if (!worker) {
      throw ApiError.notFound('Worker not found');
    }

    // Calculate week dates
    const startDate = weekStartDate
      ? WeeklyDiscipline.getWeekStartDate(weekStartDate)
      : WeeklyDiscipline.getWeekStartDate();
    const endDate = WeeklyDiscipline.getWeekEndDate(startDate);

    // Get discipline record
    const record = await WeeklyDiscipline.findOne({
      userId: new Types.ObjectId(workerId),
      weekStartDate: startDate,
    });

    if (record) {
      return {
        worker: {
          _id: worker._id.toString(),
          fullName: worker.fullName,
          email: worker.email,
          hostel: worker.hostel || '',
          workforceDepartment: worker.workforceDepartment || '',
        },
        weekStartDate: startDate,
        weekEndDate: endDate,
        tasksCompleted: this.countCompletedTasks(record.disciplines),
        totalTasks: 28,
        completionRate: this.calculateCompletionRate(record.disciplines),
        reflection: record.reflection || null,
        reflectionSubmittedAt: record.reflectionSubmittedAt || null,
        disciplines: record.disciplines,
      };
    } else {
      return {
        worker: {
          _id: worker._id.toString(),
          fullName: worker.fullName,
          email: worker.email,
          hostel: worker.hostel || '',
          workforceDepartment: worker.workforceDepartment || '',
        },
        weekStartDate: startDate,
        weekEndDate: endDate,
        tasksCompleted: 0,
        totalTasks: 28,
        completionRate: 0,
        reflection: null,
        reflectionSubmittedAt: null,
        disciplines: [],
      };
    }
  }

  /**
   * Get any worker's history (Super Admin - no assignment check)
   */
  async getAnyWorkerHistory(
    workerId: string,
    weeksLimit: number = 4
  ): Promise<IWorkerDisciplineSummary[]> {
    const worker = await User.findOne({
      _id: new Types.ObjectId(workerId),
      role: UserRole.WORKER,
    }).select('-password -refreshToken');

    if (!worker) {
      throw ApiError.notFound('Worker not found');
    }

    // Get discipline records
    const records = await WeeklyDiscipline.find({
      userId: new Types.ObjectId(workerId),
    })
      .sort({ weekStartDate: -1 })
      .limit(weeksLimit);

    return records.map((record) => ({
      worker: {
        _id: worker._id.toString(),
        fullName: worker.fullName,
        email: worker.email,
        hostel: worker.hostel || '',
        workforceDepartment: worker.workforceDepartment || '',
      },
      weekStartDate: record.weekStartDate,
      weekEndDate: record.weekEndDate,
      tasksCompleted: this.countCompletedTasks(record.disciplines),
      totalTasks: 28,
      completionRate: this.calculateCompletionRate(record.disciplines),
      reflection: record.reflection || null,
      reflectionSubmittedAt: record.reflectionSubmittedAt || null,
      disciplines: record.disciplines,
    }));
  }

  /**
   * Get all reflections from ALL workers (Super Admin only)
   */
  async getAllWorkersReflections(weekStartDate?: Date): Promise<Array<{
    worker: { _id: string; fullName: string };
    reflection: string;
    submittedAt: Date;
  }>> {
    // Calculate week dates
    const startDate = weekStartDate
      ? WeeklyDiscipline.getWeekStartDate(weekStartDate)
      : WeeklyDiscipline.getWeekStartDate();

    // Get all discipline records with reflections
    const records = await WeeklyDiscipline.find({
      weekStartDate: startDate,
      reflection: { $exists: true, $nin: [null, ''] },
      reflectionSubmittedAt: { $exists: true, $ne: null },
    }).populate('userId', 'fullName');

    // Build results
    const reflections = records
      .filter((r) => r.reflection && r.reflectionSubmittedAt)
      .map((record) => {
        const user = record.userId as unknown as { _id: Types.ObjectId; fullName: string };
        return {
          worker: {
            _id: user._id.toString(),
            fullName: user.fullName || 'Unknown',
          },
          reflection: record.reflection!,
          submittedAt: record.reflectionSubmittedAt!,
        };
      })
      .sort((a, b) => {
        const timeA = a.submittedAt?.getTime() || 0;
        const timeB = b.submittedAt?.getTime() || 0;
        return timeB - timeA;
      });

    return reflections;
  }
}

// Export singleton instance
export const executiveService = new ExecutiveService();
