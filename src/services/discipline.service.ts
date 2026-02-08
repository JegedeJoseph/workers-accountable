import { Types } from 'mongoose';
import { WeeklyDiscipline, IWeeklyDiscipline, IDisciplineProgress } from '../models/discipline.model';
import {
  SpiritualDiscipline,
  DayOfWeek,
  DaysOfWeek,
  DailyDisciplines,
  WeeklyDisciplines,
} from '../types/enums';
import { ApiError } from '../utils/errors';
import { SaveProgressInput } from '../validations/discipline.validation';

/**
 * Dashboard statistics interface
 */
export interface IDashboardStats {
  tasksCompleted: number;
  totalTasks: number;
  requiredTasksCompleted: number;
  totalRequiredTasks: number;
  completionRate: number;
  currentStreak: number;
  weeklyProgress: {
    discipline: SpiritualDiscipline;
    label: string;
    description: string;
    isWeekly: boolean;
    days: Record<DayOfWeek, boolean>;
    completedDays: number;
    requiredDays: number;
  }[];
}

/**
 * Discipline Service
 * Handles business logic for weekly discipline tracking
 */
class DisciplineService {
  /**
   * Discipline metadata for display
   */
  private disciplineMetadata = {
    [SpiritualDiscipline.PRAYER]: {
      label: 'Prayer',
      description: 'Daily devotion',
    },
    [SpiritualDiscipline.BIBLE_STUDY]: {
      label: 'Bible Study',
      description: 'Personal deep study',
    },
    [SpiritualDiscipline.FASTING]: {
      label: 'Fasting',
      description: 'Weekly requirement',
    },
    [SpiritualDiscipline.EVANGELISM]: {
      label: 'Evangelism',
      description: 'Soul winning',
    },
  };

  /**
   * Get or create the current week's discipline record
   */
  async getOrCreateCurrentWeek(userId: string): Promise<IWeeklyDiscipline> {
    const weekStartDate = WeeklyDiscipline.getWeekStartDate();
    const weekEndDate = WeeklyDiscipline.getWeekEndDate();

    let weeklyDiscipline = await WeeklyDiscipline.findOne({
      userId: new Types.ObjectId(userId),
      weekStartDate,
    });

    if (!weeklyDiscipline) {
      weeklyDiscipline = await WeeklyDiscipline.create({
        userId: new Types.ObjectId(userId),
        weekStartDate,
        weekEndDate,
        disciplines: [
          { discipline: SpiritualDiscipline.PRAYER },
          { discipline: SpiritualDiscipline.BIBLE_STUDY },
          { discipline: SpiritualDiscipline.FASTING },
          { discipline: SpiritualDiscipline.EVANGELISM },
        ],
      });
    }

    return weeklyDiscipline;
  }

  /**
   * Get a specific week's discipline record
   */
  async getWeek(userId: string, weekStartDate: Date): Promise<IWeeklyDiscipline | null> {
    return WeeklyDiscipline.findOne({
      userId: new Types.ObjectId(userId),
      weekStartDate,
    });
  }

  /**
   * Save discipline progress for the current week
   */
  async saveProgress(
    userId: string,
    data: SaveProgressInput
  ): Promise<{ weeklyDiscipline: IWeeklyDiscipline; message: string }> {
    const weekStartDate = data.weekStartDate
      ? WeeklyDiscipline.getWeekStartDate(new Date(data.weekStartDate))
      : WeeklyDiscipline.getWeekStartDate();
    const weekEndDate = WeeklyDiscipline.getWeekEndDate(weekStartDate);

    // Find or create the week record
    let weeklyDiscipline = await WeeklyDiscipline.findOne({
      userId: new Types.ObjectId(userId),
      weekStartDate,
    });

    if (!weeklyDiscipline) {
      weeklyDiscipline = new WeeklyDiscipline({
        userId: new Types.ObjectId(userId),
        weekStartDate,
        weekEndDate,
      });
    }

    // Update discipline progress
    for (const progress of data.disciplines) {
      const existingIndex = weeklyDiscipline.disciplines.findIndex(
        (d) => d.discipline === progress.discipline
      );

      if (existingIndex >= 0) {
        // Update existing discipline
        weeklyDiscipline.disciplines[existingIndex] = {
          ...weeklyDiscipline.disciplines[existingIndex],
          ...progress,
        };
      } else {
        // Add new discipline
        weeklyDiscipline.disciplines.push(progress as IDisciplineProgress);
      }
    }

    await weeklyDiscipline.save();

    return {
      weeklyDiscipline,
      message: 'Progress saved successfully',
    };
  }

  /**
   * Get previous weeks' records
   */
  async getPreviousWeeks(userId: string, limit: number = 4): Promise<IWeeklyDiscipline[]> {
    return WeeklyDiscipline.find({
      userId: new Types.ObjectId(userId),
    })
      .sort({ weekStartDate: -1 })
      .limit(limit);
  }

  /**
   * Calculate completion rate based on required tasks
   * - Daily disciplines (Prayer, Bible Study): 7 days each = 14 required
   * - Weekly disciplines (Fasting, Evangelism): 1 day each = 2 required
   * - Total required: 16 tasks per week
   */
  private calculateCompletionRate(disciplines: IDisciplineProgress[]): {
    requiredCompleted: number;
    totalRequired: number;
    rate: number;
  } {
    let requiredCompleted = 0;
    const totalRequired = 16; // 7 + 7 + 1 + 1

    for (const disc of disciplines) {
      const isDaily = DailyDisciplines.includes(disc.discipline as SpiritualDiscipline);
      const isWeekly = WeeklyDisciplines.includes(disc.discipline as SpiritualDiscipline);

      if (isDaily) {
        // Count all completed days for daily disciplines
        for (const day of DaysOfWeek) {
          if (disc[day as keyof IDisciplineProgress] === true) {
            requiredCompleted++;
          }
        }
      } else if (isWeekly) {
        // For weekly disciplines, only count 1 if at least one day is completed
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

    const rate = totalRequired > 0 ? Math.round((requiredCompleted / totalRequired) * 100) : 0;

    return { requiredCompleted, totalRequired, rate };
  }

  /**
   * Calculate the current streak (consecutive days with at least one task completed)
   */
  async calculateStreak(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Get all weekly records sorted by date
    const allWeeks = await WeeklyDiscipline.find({
      userId: new Types.ObjectId(userId),
    }).sort({ weekStartDate: -1 });

    if (allWeeks.length === 0) return 0;

    let streak = 0;
    const dayNames: DayOfWeek[] = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ];

    // Build a map of dates to completion status
    const dateCompletionMap: Map<string, boolean> = new Map();

    for (const week of allWeeks) {
      const monday = new Date(week.weekStartDate);

      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(monday);
        currentDate.setDate(monday.getDate() + i);
        const dayOfWeek = dayNames[currentDate.getDay()];
        const dateKey = currentDate.toISOString().split('T')[0];

        // Skip future dates
        if (currentDate > today) continue;

        // Check if any discipline is completed for this day
        let dayCompleted = false;
        for (const disc of week.disciplines) {
          if (disc[dayOfWeek as keyof IDisciplineProgress] === true) {
            dayCompleted = true;
            break;
          }
        }

        dateCompletionMap.set(dateKey, dayCompleted);
      }
    }

    // Calculate streak starting from today and going backwards
    const checkDate = new Date(today);
    checkDate.setHours(0, 0, 0, 0);

    while (true) {
      const dateKey = checkDate.toISOString().split('T')[0];
      const completed = dateCompletionMap.get(dateKey);

      if (completed === undefined || completed === false) {
        // If today has no data yet, don't break the streak
        if (dateKey === today.toISOString().split('T')[0] && completed === undefined) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }

      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
  }

  /**
   * Get dashboard statistics for the current week
   */
  async getDashboardStats(userId: string): Promise<IDashboardStats> {
    const currentWeek = await this.getOrCreateCurrentWeek(userId);
    const streak = await this.calculateStreak(userId);

    // Calculate total tasks completed (all checkboxes)
    let tasksCompleted = 0;
    const totalTasks = 28; // 4 disciplines × 7 days

    for (const disc of currentWeek.disciplines) {
      for (const day of DaysOfWeek) {
        if (disc[day as keyof IDisciplineProgress] === true) {
          tasksCompleted++;
        }
      }
    }

    // Calculate completion rate based on required tasks
    const { requiredCompleted, totalRequired, rate } = this.calculateCompletionRate(
      currentWeek.disciplines
    );

    // Build weekly progress for each discipline
    const weeklyProgress = currentWeek.disciplines.map((disc) => {
      const isWeekly = WeeklyDisciplines.includes(disc.discipline as SpiritualDiscipline);
      const days: Record<string, boolean> = {};
      let completedDays = 0;

      for (const day of DaysOfWeek) {
        const value = disc[day as keyof IDisciplineProgress] as boolean;
        days[day] = value;
        if (value) completedDays++;
      }

      return {
        discipline: disc.discipline as SpiritualDiscipline,
        label: this.disciplineMetadata[disc.discipline as SpiritualDiscipline]?.label || disc.discipline,
        description: this.disciplineMetadata[disc.discipline as SpiritualDiscipline]?.description || '',
        isWeekly,
        days: days as Record<DayOfWeek, boolean>,
        completedDays,
        requiredDays: isWeekly ? 1 : 7,
      };
    });

    return {
      tasksCompleted,
      totalTasks,
      requiredTasksCompleted: requiredCompleted,
      totalRequiredTasks: totalRequired,
      completionRate: rate,
      currentStreak: streak,
      weeklyProgress,
    };
  }
}

// Export singleton instance
export const disciplineService = new DisciplineService();
