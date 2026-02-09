import { Types } from 'mongoose';
import {
  Notification,
  INotification,
  NotificationStatus,
  NotificationType,
  NotificationSchedule,
} from '../models/notification.model';
import { WeeklyDiscipline, IDisciplineProgress } from '../models/discipline.model';
import User from '../models/user.model';
import {
  SpiritualDiscipline,
  DayOfWeek,
  DaysOfWeek,
  DailyDisciplines,
  WeeklyDisciplines,
  UserRole,
} from '../types/enums';

/**
 * Incomplete Task Info interface
 */
export interface IIncompleteTask {
  discipline: string;
  missingDays: string[];
}

/**
 * User notification summary
 */
export interface IUserNotificationSummary {
  userId: string;
  fullName: string;
  email: string;
  incompleteTasks: IIncompleteTask[];
  completionRate: number;
}

/**
 * Notification Service
 * Handles business logic for notifications and reminders
 */
class NotificationService {
  /**
   * Get the current day of the week (e.g., 'monday', 'tuesday')
   */
  private getCurrentDay(): DayOfWeek {
    const dayNames: DayOfWeek[] = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ];
    return dayNames[new Date().getDay()];
  }

  /**
   * Get days up to and including today for the current week
   */
  private getDaysUpToToday(): DayOfWeek[] {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayOrder: DayOfWeek[] = [
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
      DayOfWeek.SUNDAY,
    ];

    // Convert Sunday (0) to index 6, otherwise day - 1
    const todayIndex = today === 0 ? 6 : today - 1;
    return dayOrder.slice(0, todayIndex + 1);
  }

  /**
   * Check incomplete tasks for a user based on their weekly discipline record
   */
  async checkIncompleteTasks(userId: string): Promise<IIncompleteTask[]> {
    const weekStartDate = WeeklyDiscipline.getWeekStartDate();
    const daysToCheck = this.getDaysUpToToday();
    const incompleteTasks: IIncompleteTask[] = [];

    const weeklyDiscipline = await WeeklyDiscipline.findOne({
      userId: new Types.ObjectId(userId),
      weekStartDate,
    });

    // Initialize default disciplines if no record exists
    const disciplines: IDisciplineProgress[] = weeklyDiscipline?.disciplines || [
      { discipline: SpiritualDiscipline.PRAYER, monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false },
      { discipline: SpiritualDiscipline.BIBLE_STUDY, monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false },
      { discipline: SpiritualDiscipline.FASTING, monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false },
      { discipline: SpiritualDiscipline.EVANGELISM, monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false },
    ];

    for (const disc of disciplines) {
      const isDaily = DailyDisciplines.includes(disc.discipline as SpiritualDiscipline);
      const isWeekly = WeeklyDisciplines.includes(disc.discipline as SpiritualDiscipline);

      if (isDaily) {
        // Check each day up to today for daily disciplines
        const missingDays: string[] = [];
        for (const day of daysToCheck) {
          if (disc[day as keyof IDisciplineProgress] !== true) {
            missingDays.push(day);
          }
        }
        if (missingDays.length > 0) {
          incompleteTasks.push({
            discipline: disc.discipline,
            missingDays,
          });
        }
      } else if (isWeekly) {
        // For weekly disciplines, check if at least one day is completed
        let hasCompleted = false;
        for (const day of DaysOfWeek) {
          if (disc[day as keyof IDisciplineProgress] === true) {
            hasCompleted = true;
            break;
          }
        }
        // Only remind on the last day of the week or if we're checking up to today
        if (!hasCompleted && daysToCheck.includes(DayOfWeek.SUNDAY)) {
          incompleteTasks.push({
            discipline: disc.discipline,
            missingDays: ['week'],
          });
        }
      }
    }

    return incompleteTasks;
  }

  /**
   * Get all workers with incomplete tasks
   */
  async getWorkersWithIncompleteTasks(): Promise<IUserNotificationSummary[]> {
    const workers = await User.find({
      role: UserRole.WORKER,
      isActive: true,
    }).select('_id fullName email');

    const summaries: IUserNotificationSummary[] = [];

    for (const worker of workers) {
      const incompleteTasks = await this.checkIncompleteTasks(worker._id.toString());
      
      if (incompleteTasks.length > 0) {
        // Calculate completion rate
        const weekStartDate = WeeklyDiscipline.getWeekStartDate();
        const weeklyDiscipline = await WeeklyDiscipline.findOne({
          userId: worker._id,
          weekStartDate,
        });

        let completedCount = 0;
        const daysToCheck = this.getDaysUpToToday();
        const totalPossible = daysToCheck.length * DailyDisciplines.length;

        if (weeklyDiscipline) {
          for (const disc of weeklyDiscipline.disciplines) {
            if (DailyDisciplines.includes(disc.discipline as SpiritualDiscipline)) {
              for (const day of daysToCheck) {
                if (disc[day as keyof IDisciplineProgress] === true) {
                  completedCount++;
                }
              }
            }
          }
        }

        const completionRate = totalPossible > 0 
          ? Math.round((completedCount / totalPossible) * 100) 
          : 0;

        summaries.push({
          userId: worker._id.toString(),
          fullName: worker.fullName,
          email: worker.email,
          incompleteTasks,
          completionRate,
        });
      }
    }

    return summaries;
  }

  /**
   * Create a notification for a user
   */
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.GENERAL,
    scheduleTime?: NotificationSchedule,
    incompleteTasks?: IIncompleteTask[]
  ): Promise<INotification> {
    return Notification.create({
      userId: new Types.ObjectId(userId),
      title,
      message,
      type,
      scheduleTime,
      incompleteTasks,
    });
  }

  /**
   * Create task reminder notifications for all workers with incomplete tasks
   */
  async createTaskReminders(scheduleTime: NotificationSchedule): Promise<number> {
    const workersWithIncompleteTasks = await this.getWorkersWithIncompleteTasks();
    let notificationsCreated = 0;

    for (const summary of workersWithIncompleteTasks) {
      const disciplinesList = summary.incompleteTasks
        .map((task) => {
          const disciplineName = this.formatDisciplineName(task.discipline);
          if (task.missingDays[0] === 'week') {
            return `${disciplineName} (not completed this week)`;
          }
          return `${disciplineName} (${task.missingDays.length} day${task.missingDays.length > 1 ? 's' : ''} pending)`;
        })
        .join(', ');

      const title = 'Task Reminder';
      const message = `Hi ${summary.fullName.split(' ')[0]}, you have incomplete tasks: ${disciplinesList}. Your current completion rate is ${summary.completionRate}%.`;

      await this.createNotification(
        summary.userId,
        title,
        message,
        NotificationType.TASK_REMINDER,
        scheduleTime,
        summary.incompleteTasks
      );

      notificationsCreated++;
    }

    console.log(
      `[${new Date().toISOString()}] Created ${notificationsCreated} task reminder notifications for ${scheduleTime}`
    );

    return notificationsCreated;
  }

  /**
   * Format discipline name for display
   */
  private formatDisciplineName(discipline: string): string {
    const names: Record<string, string> = {
      [SpiritualDiscipline.PRAYER]: 'Prayer',
      [SpiritualDiscipline.BIBLE_STUDY]: 'Bible Study',
      [SpiritualDiscipline.FASTING]: 'Fasting',
      [SpiritualDiscipline.EVANGELISM]: 'Evangelism',
    };
    return names[discipline] || discipline;
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(
    userId: string,
    options: {
      status?: NotificationStatus;
      limit?: number;
      skip?: number;
    } = {}
  ): Promise<{ notifications: INotification[]; total: number; unreadCount: number }> {
    const { status, limit = 20, skip = 0 } = options;

    const query: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
    if (status) {
      query.status = status;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(query),
      Notification.countDocuments({
        userId: new Types.ObjectId(userId),
        status: NotificationStatus.UNREAD,
      }),
    ]);

    return { notifications, total, unreadCount };
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    const notification = await Notification.findOne({
      _id: new Types.ObjectId(notificationId),
      userId: new Types.ObjectId(userId),
    });

    if (!notification) {
      return null;
    }

    notification.status = NotificationStatus.READ;
    notification.readAt = new Date();
    await notification.save();

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await Notification.updateMany(
      {
        userId: new Types.ObjectId(userId),
        status: NotificationStatus.UNREAD,
      },
      {
        status: NotificationStatus.READ,
        readAt: new Date(),
      }
    );

    return result.modifiedCount;
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const result = await Notification.deleteOne({
      _id: new Types.ObjectId(notificationId),
      userId: new Types.ObjectId(userId),
    });

    return result.deletedCount > 0;
  }

  /**
   * Delete all read notifications older than specified days
   */
  async cleanupOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      status: NotificationStatus.READ,
      createdAt: { $lt: cutoffDate },
    });

    console.log(
      `[${new Date().toISOString()}] Cleaned up ${result.deletedCount} old notifications`
    );

    return result.deletedCount;
  }

  /**
   * Get notification statistics for a user
   */
  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    read: number;
    todayCount: number;
  }> {
    const userIdObj = new Types.ObjectId(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, unread, read, todayCount] = await Promise.all([
      Notification.countDocuments({ userId: userIdObj }),
      Notification.countDocuments({ userId: userIdObj, status: NotificationStatus.UNREAD }),
      Notification.countDocuments({ userId: userIdObj, status: NotificationStatus.READ }),
      Notification.countDocuments({ userId: userIdObj, createdAt: { $gte: today } }),
    ]);

    return { total, unread, read, todayCount };
  }

  /**
   * Check my incomplete tasks (for frontend polling)
   */
  async getMyIncompleteTasks(userId: string): Promise<{
    hasIncompleteTasks: boolean;
    incompleteTasks: IIncompleteTask[];
    message: string;
  }> {
    const incompleteTasks = await this.checkIncompleteTasks(userId);
    const hasIncompleteTasks = incompleteTasks.length > 0;

    let message = 'All tasks completed! Great job!';
    if (hasIncompleteTasks) {
      const taskCount = incompleteTasks.reduce(
        (sum, task) => sum + (task.missingDays[0] === 'week' ? 1 : task.missingDays.length),
        0
      );
      message = `You have ${taskCount} incomplete task${taskCount > 1 ? 's' : ''}. Keep going!`;
    }

    return { hasIncompleteTasks, incompleteTasks, message };
  }
}

export const notificationService = new NotificationService();
