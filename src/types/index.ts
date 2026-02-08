import { Request } from 'express';
import { Types } from 'mongoose';
import { UserRole, Gender, MaleHostel, FemaleHostel, WorkforceDepartment, ExcoPosition } from './enums';

// Combined Hostel type
type Hostel = MaleHostel | FemaleHostel;

/**
 * Base User Interface - Common fields for all users
 */
export interface IUserBase {
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: Gender;
  password: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword?: boolean; // For executives on first login
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Worker-specific fields
 */
export interface IWorkerFields {
  hostel: Hostel;
  workforceDepartment: WorkforceDepartment;
  assignedExecutive?: Types.ObjectId;
}

/**
 * Executive-specific fields
 */
export interface IExecutiveFields {
  excoPosition: ExcoPosition;
}

/**
 * Combined User Interface
 */
export interface IUser extends IUserBase {
  _id: Types.ObjectId;
  // Worker-specific fields (optional based on role)
  hostel?: Hostel;
  workforceDepartment?: WorkforceDepartment;
  assignedExecutive?: Types.ObjectId;
  // Executive-specific fields (optional based on role)
  excoPosition?: ExcoPosition;
  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): Omit<IUser, 'password' | 'refreshToken'>;
}

/**
 * User document with populated executive reference
 */
export interface IUserPopulated extends Omit<IUser, 'assignedExecutive'> {
  assignedExecutive?: {
    _id: Types.ObjectId;
    fullName: string;
    email: string;
    excoPosition: ExcoPosition;
  };
}

/**
 * JWT Payload Interface
 */
export interface IJwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Refresh Token Payload
 */
export interface IRefreshTokenPayload extends IJwtPayload {
  tokenType: 'refresh';
}

/**
 * Token Response Interface - For Flutter Desktop app serialization
 */
export interface ITokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  tokenType: string;
}

/**
 * Auth Response Interface - Structured for Flutter
 */
export interface IAuthResponse {
  success: boolean;
  message: string;
  data: {
    user: Partial<IUser>;
    tokens: ITokenResponse;
  };
}

/**
 * Extended Express Request with authenticated user
 */
export interface IAuthenticatedRequest extends Request {
  user?: IJwtPayload;
}

/**
 * API Response Interface - Standard response format for Flutter
 */
export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Registration DTO - Worker Only
 * (Executives are pre-seeded and cannot self-register)
 */
export interface IWorkerRegistrationDTO {
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: Gender;
  password: string;
  confirmPassword: string;
  hostel: string; // MaleHostel or FemaleHostel based on gender
  workforceDepartment: WorkforceDepartment;
  assignedExecutive: string; // Required - must select an executive
}

/**
 * Login DTO
 */
export interface ILoginDTO {
  email: string;
  password: string;
}
