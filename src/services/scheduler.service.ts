import * as cron from 'node-cron';
import { notificationService } from './notification.service';
import { NotificationSchedule } from '../models/notification.model';

// Type for scheduled task
type ScheduledTask = ReturnType<typeof cron.schedule>;

/**
 * Scheduler Service
 * Manages scheduled jobs for notifications and other recurring tasks
 */
class SchedulerService {
  private jobs: Map<string, ScheduledTask> = new Map();
  private isInitialized: boolean = false;

  /**
   * Initialize all scheduled jobs
   * Call this after database connection is established
   */
  initialize(): void {
    if (this.isInitialized) {
      console.log('[Scheduler] Already initialized, skipping...');
      return;
    }

    console.log('[Scheduler] Initializing notification schedules...');

    // Schedule morning reminder at 7:00 AM
    this.scheduleJob(
      'morning-reminder',
      '0 7 * * *', // Every day at 7:00 AM
      async () => {
        console.log(`[Scheduler] Running morning reminder job at ${new Date().toISOString()}`);
        try {
          const count = await notificationService.createTaskReminders(NotificationSchedule.MORNING);
          console.log(`[Scheduler] Morning reminder: Created ${count} notifications`);
        } catch (error) {
          console.error('[Scheduler] Morning reminder job failed:', error);
        }
      }
    );

    // Schedule afternoon reminder at 1:00 PM
    this.scheduleJob(
      'afternoon-reminder',
      '0 13 * * *', // Every day at 1:00 PM (13:00)
      async () => {
        console.log(`[Scheduler] Running afternoon reminder job at ${new Date().toISOString()}`);
        try {
          const count = await notificationService.createTaskReminders(NotificationSchedule.AFTERNOON);
          console.log(`[Scheduler] Afternoon reminder: Created ${count} notifications`);
        } catch (error) {
          console.error('[Scheduler] Afternoon reminder job failed:', error);
        }
      }
    );

    // Schedule evening reminder at 9:00 PM
    this.scheduleJob(
      'evening-reminder',
      '0 21 * * *', // Every day at 9:00 PM (21:00)
      async () => {
        console.log(`[Scheduler] Running evening reminder job at ${new Date().toISOString()}`);
        try {
          const count = await notificationService.createTaskReminders(NotificationSchedule.EVENING);
          console.log(`[Scheduler] Evening reminder: Created ${count} notifications`);
        } catch (error) {
          console.error('[Scheduler] Evening reminder job failed:', error);
        }
      }
    );

    // Schedule daily cleanup of old notifications at 2:00 AM
    this.scheduleJob(
      'cleanup-notifications',
      '0 2 * * *', // Every day at 2:00 AM
      async () => {
        console.log(`[Scheduler] Running notification cleanup job at ${new Date().toISOString()}`);
        try {
          const count = await notificationService.cleanupOldNotifications(30);
          console.log(`[Scheduler] Cleanup: Removed ${count} old notifications`);
        } catch (error) {
          console.error('[Scheduler] Cleanup job failed:', error);
        }
      }
    );

    this.isInitialized = true;
    console.log('[Scheduler] All notification schedules initialized successfully');
    console.log('[Scheduler] Schedule summary:');
    console.log('  - Morning reminder: 7:00 AM daily');
    console.log('  - Afternoon reminder: 1:00 PM daily');
    console.log('  - Evening reminder: 9:00 PM daily');
    console.log('  - Cleanup old notifications: 2:00 AM daily');
  }

  /**
   * Schedule a cron job
   */
  private scheduleJob(name: string, cronExpression: string, handler: () => Promise<void>): void {
    if (!cron.validate(cronExpression)) {
      console.error(`[Scheduler] Invalid cron expression for ${name}: ${cronExpression}`);
      return;
    }

    const job = cron.schedule(cronExpression, handler, {
      timezone: 'Africa/Lagos', // WAT timezone for Nigeria
    });

    this.jobs.set(name, job);
    console.log(`[Scheduler] Job '${name}' scheduled with cron: ${cronExpression}`);
  }

  /**
   * Stop a specific job
   */
  stopJob(name: string): void {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      console.log(`[Scheduler] Job '${name}' stopped`);
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll(): void {
    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`[Scheduler] Job '${name}' stopped`);
    }
    this.jobs.clear();
    this.isInitialized = false;
    console.log('[Scheduler] All jobs stopped');
  }

  /**
   * Get status of all scheduled jobs
   */
  getStatus(): { name: string; running: boolean }[] {
    const status: { name: string; running: boolean }[] = [];
    for (const [name, job] of this.jobs) {
      // node-cron doesn't expose a running state directly, 
      // but we can check if it exists in our map
      status.push({ name, running: true });
    }
    return status;
  }

  /**
   * Manually trigger a specific job (for testing)
   */
  async triggerJob(name: string): Promise<void> {
    switch (name) {
      case 'morning-reminder':
        await notificationService.createTaskReminders(NotificationSchedule.MORNING);
        break;
      case 'afternoon-reminder':
        await notificationService.createTaskReminders(NotificationSchedule.AFTERNOON);
        break;
      case 'evening-reminder':
        await notificationService.createTaskReminders(NotificationSchedule.EVENING);
        break;
      case 'cleanup-notifications':
        await notificationService.cleanupOldNotifications(30);
        break;
      default:
        throw new Error(`Unknown job: ${name}`);
    }
  }
}

export const schedulerService = new SchedulerService();
