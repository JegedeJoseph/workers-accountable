import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../config';
import { IUser } from '../types';
import {
  UserRole,
  Gender,
  MaleHostel,
  FemaleHostel,
  WorkforceDepartment,
  ExcoPosition,
  Genders,
  AllHostels,
  MaleHostels,
  FemaleHostels,
  WorkforceDepartments,
  ExcoPositions,
  UserRoles,
} from '../types/enums';

/**
 * User Schema Definition
 * Implements conditional fields based on role (Worker/Executive)
 */
const userSchema = new Schema<IUser>(
  {
    // Common Fields
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [120, 'Full name cannot exceed 120 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[\d\s+\-()]+$/, 'Please provide a valid phone number'],
    },
    gender: {
      type: String,
      enum: {
        values: Genders,
        message: 'Gender must be either male or female',
      },
      required: [true, 'Gender is required'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: {
        values: UserRoles,
        message: 'Role must be worker, executive, or super_admin',
      },
      required: [true, 'Role is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    mustChangePassword: {
      type: Boolean,
      default: false, // True for executives on first login
    },
    refreshToken: {
      type: String,
      select: false,
    },

    // Worker-specific fields
    hostel: {
      type: String,
      enum: {
        values: AllHostels,
        message: 'Invalid hostel selection',
      },
      required: function (this: IUser) {
        return this.role === UserRole.WORKER;
      },
      validate: {
        validator: function (this: IUser, value: string) {
          if (this.role !== UserRole.WORKER) return true;
          // Validate hostel matches gender
          if (this.gender === Gender.MALE) {
            return MaleHostels.includes(value as MaleHostel);
          } else {
            return FemaleHostels.includes(value as FemaleHostel);
          }
        },
        message: 'Hostel must match your gender',
      },
    },
    workforceDepartment: {
      type: String,
      enum: {
        values: WorkforceDepartments,
        message: 'Invalid workforce department',
      },
      required: function (this: IUser) {
        return this.role === UserRole.WORKER;
      },
    },
    assignedExecutive: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: function (this: IUser) {
        return this.role === UserRole.WORKER; // Required for workers
      },
      validate: {
        validator: async function (value: mongoose.Types.ObjectId) {
          if (!value) return true;
          const executive = await mongoose.model('User').findById(value);
          return executive && executive.role === UserRole.EXECUTIVE;
        },
        message: 'Assigned executive must be a valid executive user',
      },
    },

    // Executive-specific fields
    excoPosition: {
      type: String,
      enum: {
        values: ExcoPositions,
        message: 'Invalid executive position',
      },
      required: function (this: IUser) {
        return this.role === UserRole.EXECUTIVE;
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: Record<string, unknown>) {
        ret.password = undefined;
        ret.refreshToken = undefined;
        ret.__v = undefined;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Indexes for better query performance
userSchema.index({ role: 1 });
userSchema.index({ workforceDepartment: 1 });
userSchema.index({ assignedExecutive: 1 });
userSchema.index({ excoPosition: 1 });

/**
 * Pre-save middleware: Hash password before saving
 */
userSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(config.bcrypt.saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Pre-save middleware: Validate role-specific fields
 */
userSchema.pre('save', function (next) {
  if (this.role === UserRole.WORKER) {
    // Clear executive-specific fields for workers
    this.excoPosition = undefined;
  } else if (this.role === UserRole.EXECUTIVE) {
    // Clear worker-specific fields for executives
    this.hostel = undefined;
    this.workforceDepartment = undefined;
    this.assignedExecutive = undefined;
  }
  next();
});

/**
 * Instance method: Compare password for authentication
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Static method: Find user by email with password
 */
userSchema.statics.findByEmailWithPassword = function (email: string) {
  return this.findOne({ email }).select('+password');
};

/**
 * Static method: Find user by email with refresh token
 */
userSchema.statics.findByEmailWithRefreshToken = function (email: string) {
  return this.findOne({ email }).select('+refreshToken');
};

/**
 * Static method: Find all workers in a department
 */
userSchema.statics.findWorkersByDepartment = function (
  department: WorkforceDepartment
) {
  return this.find({
    role: UserRole.WORKER,
    workforceDepartment: department,
  }).populate('assignedExecutive', 'fullName email excoPosition');
};

/**
 * Static method: Find all workers assigned to an executive
 */
userSchema.statics.findWorkersByExecutive = function (
  executiveId: mongoose.Types.ObjectId
) {
  return this.find({
    role: UserRole.WORKER,
    assignedExecutive: executiveId,
  });
};

// Create and export the model
const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
