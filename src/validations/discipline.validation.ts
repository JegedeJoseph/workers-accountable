import { z } from 'zod';
import { SpiritualDiscipline, SpiritualDisciplines } from '../types/enums';

/**
 * Schema for a single discipline's daily progress
 */
const disciplineProgressSchema = z.object({
  discipline: z.enum(SpiritualDisciplines as [SpiritualDiscipline, ...SpiritualDiscipline[]]),
  monday: z.boolean().default(false),
  tuesday: z.boolean().default(false),
  wednesday: z.boolean().default(false),
  thursday: z.boolean().default(false),
  friday: z.boolean().default(false),
  saturday: z.boolean().default(false),
  sunday: z.boolean().default(false),
});

/**
 * Schema for saving weekly discipline progress
 */
export const saveProgressSchema = z.object({
  disciplines: z
    .array(disciplineProgressSchema)
    .min(1, 'At least one discipline progress is required')
    .max(4, 'Maximum 4 disciplines allowed'),
  weekStartDate: z
    .string()
    .datetime()
    .optional()
    .describe('ISO date string for the week start (Monday). Defaults to current week.'),
});

/**
 * Schema for getting previous weeks
 */
export const getPreviousWeeksSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 4))
    .refine((val) => val > 0 && val <= 52, 'Limit must be between 1 and 52'),
});

/**
 * Schema for getting a specific week
 */
export const getWeekSchema = z.object({
  weekStartDate: z.string().datetime('Invalid date format. Use ISO 8601 format.'),
});

// Type exports
export type SaveProgressInput = z.infer<typeof saveProgressSchema>;
export type GetPreviousWeeksInput = z.infer<typeof getPreviousWeeksSchema>;
export type GetWeekInput = z.infer<typeof getWeekSchema>;
