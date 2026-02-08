import { z } from 'zod';
import {
  Gender,
  MaleHostel,
  FemaleHostel,
  WorkforceDepartment,
  Genders,
  MaleHostels,
  FemaleHostels,
  AllHostels,
  WorkforceDepartments,
} from '../types/enums';

/**
 * Common validation patterns
 */
const phoneRegex = /^[\d\s+\-()]+$/;
const passwordMinLength = 8;

/**
 * Worker Registration Schema
 * Only workers can self-register. Executives are pre-seeded.
 */
export const workerRegistrationSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters')
      .trim(),
    email: z
      .string()
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim(),
    phoneNumber: z
      .string()
      .regex(phoneRegex, 'Please provide a valid phone number')
      .trim(),
    gender: z.enum(Genders as [Gender, ...Gender[]], {
      errorMap: () => ({ message: 'Gender must be either male or female' }),
    }),
    password: z
      .string()
      .min(passwordMinLength, `Password must be at least ${passwordMinLength} characters`)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    confirmPassword: z.string(),
    hostel: z.string().refine(
      (val) => AllHostels.includes(val as MaleHostel | FemaleHostel),
      { message: 'Please select a valid hostel' }
    ),
    workforceDepartment: z.enum(
      WorkforceDepartments as [WorkforceDepartment, ...WorkforceDepartment[]],
      {
        errorMap: () => ({ message: 'Please select a valid workforce department' }),
      }
    ),
    assignedExecutive: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Please select an executive'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      // Validate hostel matches gender
      if (data.gender === Gender.MALE) {
        return MaleHostels.includes(data.hostel as MaleHostel);
      } else {
        return FemaleHostels.includes(data.hostel as FemaleHostel);
      }
    },
    {
      message: 'Selected hostel does not match your gender',
      path: ['hostel'],
    }
  );

/**
 * Registration schema - alias for worker registration (only workers can register)
 */
export const registrationSchema = workerRegistrationSchema;

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Refresh token schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * Update worker profile schema (partial updates allowed)
 */
export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .trim()
    .optional(),
  phoneNumber: z
    .string()
    .regex(phoneRegex, 'Please provide a valid phone number')
    .trim()
    .optional(),
  hostel: z
    .string()
    .refine(
      (val) => AllHostels.includes(val as MaleHostel | FemaleHostel),
      { message: 'Please select a valid hostel' }
    )
    .optional(),
  workforceDepartment: z
    .enum(WorkforceDepartments as [WorkforceDepartment, ...WorkforceDepartment[]], {
      errorMap: () => ({ message: 'Please select a valid workforce department' }),
    })
    .optional(),
});

/**
 * Change password schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(passwordMinLength, `Password must be at least ${passwordMinLength} characters`)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

/**
 * Assign executive schema
 */
export const assignExecutiveSchema = z.object({
  workerId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid worker ID format'),
  executiveId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid executive ID format'),
});

/**
 * Type exports for use in controllers
 */
export type WorkerRegistrationInput = z.infer<typeof workerRegistrationSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AssignExecutiveInput = z.infer<typeof assignExecutiveSchema>;
