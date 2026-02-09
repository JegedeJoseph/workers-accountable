import mongoose, { Schema, Document, Types, Model } from 'mongoose';

/**
 * Notification Status enum
 */
export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  DISMISSED = 'dismissed',
}

/**
 * Notification Type enum
 */
export enum NotificationType {
  TASK_REMINDER = 'task_reminder',
  GENERAL = 'general',
}

/**
 * Notification Schedule Time enum
 */
export enum NotificationSchedule {
  MORNING = '7am',
  AFTERNOON = '1pm',
  EVENING = '9pm',
}

/**
 * Interface for Notification document
 */
export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  scheduleTime?: NotificationSchedule;
  incompleteTasks?: {
    discipline: string;
    missingDays: string[];
  }[];
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Static methods interface
 */
export interface INotificationModel extends Model<INotification> {
  markAsRead(notificationId: string): Promise<INotification | null>;
  markAllAsRead(userId: string): Promise<number>;
}

/**
 * Notification Schema
 */
const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      default: NotificationType.GENERAL,
    },
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.UNREAD,
    },
    scheduleTime: {
      type: String,
      enum: Object.values(NotificationSchedule),
    },
    incompleteTasks: [
      {
        discipline: { type: String },
        missingDays: [{ type: String }],
      },
    ],
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
NotificationSchema.index({ userId: 1, status: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

/**
 * Mark a notification as read
 */
NotificationSchema.statics.markAsRead = async function (
  notificationId: string
): Promise<INotification | null> {
  return this.findByIdAndUpdate(
    notificationId,
    {
      status: NotificationStatus.READ,
      readAt: new Date(),
    },
    { new: true }
  );
};

/**
 * Mark all notifications as read for a user
 */
NotificationSchema.statics.markAllAsRead = async function (userId: string): Promise<number> {
  const result = await this.updateMany(
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
};

export const Notification = mongoose.model<INotification, INotificationModel>(
  'Notification',
  NotificationSchema
);
