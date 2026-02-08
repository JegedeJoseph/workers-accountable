import mongoose, { Schema, Document, Types, Model } from 'mongoose';
import { SpiritualDiscipline, DayOfWeek, SpiritualDisciplines, DaysOfWeek } from '../types/enums';

/**
 * Interface for a single discipline's daily progress
 */
export interface IDisciplineProgress {
  discipline: SpiritualDiscipline;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

/**
 * Interface for Weekly Discipline document
 */
export interface IWeeklyDiscipline extends Document {
  userId: Types.ObjectId;
  weekStartDate: Date; // Monday of the week
  weekEndDate: Date; // Sunday of the week
  disciplines: IDisciplineProgress[];
  reflection?: string; // Personal reflections / Prayer requests
  reflectionSubmittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Static methods interface
 */
export interface IWeeklyDisciplineModel extends Model<IWeeklyDiscipline> {
  getWeekStartDate(date?: Date): Date;
  getWeekEndDate(date?: Date): Date;
}

/**
 * Helper function to get the Monday of a given week
 */
function getWeekStartDate(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Helper function to get the Sunday of a given week
 */
function getWeekEndDate(date: Date = new Date()): Date {
  const monday = getWeekStartDate(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

/**
 * Discipline Progress Sub-schema
 */
const DisciplineProgressSchema = new Schema<IDisciplineProgress>(
  {
    discipline: {
      type: String,
      enum: SpiritualDisciplines,
      required: true,
    },
    monday: { type: Boolean, default: false },
    tuesday: { type: Boolean, default: false },
    wednesday: { type: Boolean, default: false },
    thursday: { type: Boolean, default: false },
    friday: { type: Boolean, default: false },
    saturday: { type: Boolean, default: false },
    sunday: { type: Boolean, default: false },
  },
  { _id: false }
);

/**
 * Weekly Discipline Schema
 */
const WeeklyDisciplineSchema = new Schema<IWeeklyDiscipline>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    weekStartDate: {
      type: Date,
      required: true,
    },
    weekEndDate: {
      type: Date,
      required: true,
    },
    disciplines: [DisciplineProgressSchema],
    reflection: {
      type: String,
      maxlength: 2000,
      trim: true,
    },
    reflectionSubmittedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Set default disciplines when creating a new document
WeeklyDisciplineSchema.pre('save', function (next) {
  if (this.isNew && (!this.disciplines || this.disciplines.length === 0)) {
    this.disciplines = [
      { discipline: SpiritualDiscipline.PRAYER, monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false },
      { discipline: SpiritualDiscipline.BIBLE_STUDY, monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false },
      { discipline: SpiritualDiscipline.FASTING, monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false },
      { discipline: SpiritualDiscipline.EVANGELISM, monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false },
    ];
  }
  next();
});

// Compound index for efficient lookups
WeeklyDisciplineSchema.index({ userId: 1, weekStartDate: 1 }, { unique: true });

/**
 * Helper method to get discipline progress by name
 */
WeeklyDisciplineSchema.methods.getDiscipline = function (
  discipline: SpiritualDiscipline
): IDisciplineProgress | undefined {
  return this.disciplines.find((d: IDisciplineProgress) => d.discipline === discipline);
};

/**
 * Helper to calculate total completed tasks for the week
 */
WeeklyDisciplineSchema.methods.getTotalCompleted = function (): number {
  let total = 0;
  for (const disc of this.disciplines) {
    for (const day of DaysOfWeek) {
      if (disc[day as keyof IDisciplineProgress] === true) {
        total++;
      }
    }
  }
  return total;
};

/**
 * Static method to get the Monday of the current week
 */
WeeklyDisciplineSchema.statics.getWeekStartDate = getWeekStartDate;

/**
 * Static method to get the Sunday of the current week
 */
WeeklyDisciplineSchema.statics.getWeekEndDate = getWeekEndDate;

export const WeeklyDiscipline = mongoose.model<IWeeklyDiscipline, IWeeklyDisciplineModel>(
  'WeeklyDiscipline',
  WeeklyDisciplineSchema
);
