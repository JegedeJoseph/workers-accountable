import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import config from '../config';
import { User } from '../models';
import { ApiError, AuthenticationError, TokenError } from '../utils/errors';
import {
  IUser,
  IJwtPayload,
  ITokenResponse,
  IAuthResponse,
} from '../types';
import { UserRole } from '../types/enums';
import {
  WorkerRegistrationInput,
  LoginInput,
  ChangePasswordInput,
} from '../validations';

/**
 * Authentication Service
 * Handles all authentication-related business logic
 */
class AuthService {
  /**
   * Generate access token with role-based claims
   */
  generateAccessToken(user: IUser): string {
    const payload: IJwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  /**
   * Generate refresh token for desktop app persistence
   */
  generateRefreshToken(user: IUser): string {
    const payload: IJwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  /**
   * Generate both tokens
   */
  generateTokens(user: IUser): ITokenResponse {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
      expiresIn: config.jwt.expiresIn,
      tokenType: 'Bearer',
    };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): IJwtPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as IJwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenError('Access token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new TokenError('Invalid access token');
      }
      throw new TokenError('Token verification failed');
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): IJwtPayload {
    try {
      return jwt.verify(token, config.jwt.refreshSecret) as IJwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenError('Refresh token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new TokenError('Invalid refresh token');
      }
      throw new TokenError('Refresh token verification failed');
    }
  }

  /**
   * Register a new worker
   * NOTE: Only workers can self-register. Executives are pre-seeded.
   */
  async register(data: WorkerRegistrationInput): Promise<IAuthResponse> {
    // Check if email already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw ApiError.conflict('Email is already registered');
    }

    // Validate the assigned executive exists
    const executive = await User.findOne({
      _id: data.assignedExecutive,
      role: UserRole.EXECUTIVE,
    });
    if (!executive) {
      throw ApiError.badRequest('Please select a valid executive');
    }

    // Remove confirmPassword before creating user
    const { confirmPassword, ...userData } = data;

    // Create worker user
    const user = new User({
      ...userData,
      role: UserRole.WORKER, // Always set role to worker
    });
    await user.save();

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Store refresh token in database
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Fetch user with populated executive
    const populatedUser = await User.findById(user._id)
      .populate('assignedExecutive', 'fullName email excoPosition');

    return {
      success: true,
      message: 'Registration successful',
      data: {
        user: populatedUser?.toJSON() || user.toJSON(),
        tokens,
      },
    };
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginInput): Promise<IAuthResponse & { mustChangePassword?: boolean }> {
    // Find user with password field
    const user = await User.findOne({ email: credentials.email }).select(
      '+password +refreshToken'
    );

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AuthenticationError('Account has been deactivated');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(credentials.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate new tokens
    const tokens = this.generateTokens(user);

    // Update refresh token in database (skip validation to avoid issues with stale references)
    await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

    // Populate assigned executive for workers
    let userResponse: Record<string, unknown>;
    if (user.role === UserRole.WORKER && user.assignedExecutive) {
      const populatedUser = await User.findById(user._id)
        .populate('assignedExecutive', 'fullName email excoPosition')
        .lean();
      userResponse = {
        ...populatedUser,
        password: undefined,
        refreshToken: undefined,
      };
    } else {
      userResponse = user.toJSON();
    }

    // Check if executive needs to change password (first login)
    const mustChangePassword = user.role === UserRole.EXECUTIVE && user.mustChangePassword;

    return {
      success: true,
      message: mustChangePassword 
        ? 'Login successful. Please change your password.' 
        : 'Login successful',
      data: {
        user: userResponse as Partial<IUser>,
        tokens,
      },
      mustChangePassword,
    };
  }

  /**
   * Refresh access token using refresh token
   * Implements refresh token rotation for security
   */
  async refreshAccessToken(refreshToken: string): Promise<ITokenResponse> {
    // Verify the refresh token
    const payload = this.verifyRefreshToken(refreshToken);

    // Find user and verify stored refresh token
    const user = await User.findById(payload.userId).select('+refreshToken');
    if (!user) {
      throw new TokenError('User not found');
    }

    if (user.refreshToken !== refreshToken) {
      // Potential token reuse attack - invalidate all refresh tokens
      user.refreshToken = undefined;
      await user.save();
      throw new TokenError('Invalid refresh token - please login again');
    }

    // Check if user is still active
    if (!user.isActive) {
      throw new AuthenticationError('Account has been deactivated');
    }

    // Generate new tokens (rotation)
    const tokens = this.generateTokens(user);

    // Update refresh token in database
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return tokens;
  }

  /**
   * Logout user - invalidate refresh token
   */
  async logout(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    data: ChangePasswordInput
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(data.currentPassword);
    if (!isPasswordValid) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    // Update password (will be hashed by pre-save hook)
    user.password = data.newPassword;
    // Clear mustChangePassword flag for executives
    user.mustChangePassword = false;
    // Invalidate refresh token to force re-login
    user.refreshToken = undefined;
    await user.save();
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<IUser | null> {
    const user = await User.findById(userId);
    if (user && user.role === UserRole.WORKER) {
      return User.findById(userId)
        .populate('assignedExecutive', 'fullName email excoPosition');
    }
    return user;
  }

  /**
   * Get user profile with populated references
   */
  async getProfile(userId: string): Promise<Partial<IUser>> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user.toJSON();
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    user.isActive = false;
    user.refreshToken = undefined;
    await user.save();
  }

  /**
   * Reactivate user account (Executive only)
   */
  async reactivateUser(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    user.isActive = true;
    await user.save();
  }

  /**
   * Assign executive to worker
   */
  async assignExecutiveToWorker(
    workerId: string,
    executiveId: string
  ): Promise<IUser> {
    const worker = await User.findOne({
      _id: workerId,
      role: UserRole.WORKER,
    });
    if (!worker) {
      throw ApiError.notFound('Worker not found');
    }

    const executive = await User.findOne({
      _id: executiveId,
      role: UserRole.EXECUTIVE,
    });
    if (!executive) {
      throw ApiError.notFound('Executive not found');
    }

    worker.assignedExecutive = new Types.ObjectId(executiveId);
    await worker.save();

    return User.findById(workerId)
      .populate('assignedExecutive', 'fullName email excoPosition') as Promise<IUser>;
  }
}

// Export singleton instance
export const authService = new AuthService();
