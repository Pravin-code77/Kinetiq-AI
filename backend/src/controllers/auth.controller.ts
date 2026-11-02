import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  User,
  UserProfile,
  DietaryPreference,
  UserTarget,
  Streak,
  NotificationPreference,
} from '../models';
import { TargetService } from '../services/target.service';
import { WorkoutRecommendationService } from '../services/workoutRecommendation.service';
import { MealPlannerService } from '../services/mealPlanner.service';
import { EmailService } from '../services/email.service';
import { ENV } from '../config/env';
import { AppError } from '../middleware/errorHandler';

const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ userId, role }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
  const refreshToken = jwt.sign({ userId, role }, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
  return { accessToken, refreshToken };
};

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        throw new AppError('Name, email, and password are required', 400);
      }

      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        throw new AppError('An account with this email already exists', 409);
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
      });
      await user.save();

      // 1. Initialize UserProfile in database
      const profile = await UserProfile.create({
        userId: user._id,
        age: 26,
        gender: 'male',
        heightCm: 175,
        weightKg: 75,
        fitnessLevel: 'Intermediate',
        fitnessGoal: 'Muscle Gain',
        activityLevel: 'Moderately Active',
        equipmentAccess: 'Full Gym',
        sessionMinutes: 45,
        daysPerWeek: 4,
      });

      // 2. Initialize DietaryPreference in database
      const dietary = await DietaryPreference.create({
        userId: user._id,
        dietType: 'High Protein',
        allergies: [],
        medicalFlags: [],
        disclaimerAcknowledgedAt: new Date(),
      });

      // 3. Compute and store initial UserTarget in database
      const targetCalc = TargetService.computeTargets({
        age: profile.age,
        gender: profile.gender,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        activityLevel: profile.activityLevel,
        fitnessGoal: profile.fitnessGoal,
        dietType: dietary.dietType,
      });

      await UserTarget.create({
        userId: user._id,
        bmr: targetCalc.bmr,
        tdee: targetCalc.tdee,
        calorieTarget: targetCalc.calorieTarget,
        proteinGrams: targetCalc.proteinGrams,
        carbsGrams: targetCalc.carbsGrams,
        fatGrams: targetCalc.fatGrams,
      });

      // 4. Initialize default streak & notification preferences in database
      await Promise.all([
        Streak.create({ userId: user._id, currentStreak: 0, longestStreak: 0, lastActiveDate: '' }),
        NotificationPreference.create({ userId: user._id }),
      ]);

      // 5. Initialize starter workout plan and daily meal plan
      try {
        await WorkoutRecommendationService.generatePlan({ userId: user._id });
      } catch (err) {
        console.warn('Initial workout plan generation non-blocking:', err);
      }
      try {
        await MealPlannerService.generateDailyPlan({ userId: user._id });
      } catch (err) {
        console.warn('Initial meal plan generation non-blocking:', err);
      }

      res.status(201).json({
        success: true,
        message: 'Account created successfully! Please log in with your credentials.',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
        return;
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        res.status(404).json({
          success: false,
          code: 'USER_NOT_FOUND',
          message: 'No account found with this email. Please create an account first, then log in.',
        });
        return;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          code: 'INVALID_CREDENTIALS',
          message: 'Incorrect password. Please try again or reset your password.',
        });
        return;
      }

      const tokens = generateTokens(user._id.toString(), user.role);

      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: {
          user,
          ...tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new AppError('Refresh token required', 400);
      }

      const decoded = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET) as any;
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', 401);
      }

      const tokens = generateTokens(user._id.toString(), user.role);

      res.status(200).json({
        success: true,
        data: tokens,
      });
    } catch (error: any) {
      next(new AppError('Invalid or expired refresh token', 401));
    }
  }

  public static async logout(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  public static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email || !email.trim()) {
        res.status(400).json({
          success: false,
          message: 'Please provide a registered Gmail address.',
        });
        return;
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        res.status(404).json({
          success: false,
          code: 'USER_NOT_FOUND',
          message: 'No account found with this email. Please create an account first, then log in.',
        });
        return;
      }

      // Generate a temporary login password and secure 32-byte hex reset token
      const tempPassword = `Kinetiq#${Math.floor(100000 + Math.random() * 900000)}`;
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(tempPassword, salt);

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetExpires;
      await user.save();

      // Send email using Nodemailer
      await EmailService.sendPasswordResetEmail({
        toEmail: user.email,
        userName: user.name,
        resetToken,
        tempPassword,
      });

      res.status(200).json({
        success: true,
        message: 'Password reset link sent! Please check your Gmail inbox to reset your password.',
        data: {
          tempPassword,
          resetToken,
          deepLink: `${ENV.APP_SCHEME}://reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, email, newPassword, confirmPassword } = req.body;

      if (!token) {
        res.status(400).json({
          success: false,
          code: 'INVALID_OR_EXPIRED_TOKEN',
          message: 'This password reset link has expired or is invalid. Please request a new one.',
        });
        return;
      }

      if (!newPassword) {
        res.status(400).json({
          success: false,
          message: 'Please enter a new password.',
        });
        return;
      }

      if (confirmPassword !== undefined && newPassword !== confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'Passwords do not match. Please try again.',
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.',
        });
        return;
      }

      const query: any = {
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      };
      if (email && typeof email === 'string') {
        query.email = email.toLowerCase().trim();
      }

      const user = await User.findOne(query);
      if (!user) {
        res.status(400).json({
          success: false,
          code: 'INVALID_OR_EXPIRED_TOKEN',
          message: 'This password reset link has expired or is invalid. Please request a new one.',
        });
        return;
      }

      // Update password securely in MongoDB using bcrypt
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Your password has been reset successfully! Please log in with your new password.',
      });
    } catch (error) {
      next(error);
    }
  }
}
