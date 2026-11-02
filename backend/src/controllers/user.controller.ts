import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticate';
import {
  User,
  UserProfile,
  DietaryPreference,
  UserTarget,
  Streak,
  WorkoutPlan,
  WorkoutSession,
  MealPlan,
  MealLog,
  WeightLog,
  ProgressPhoto,
} from '../models';
import { TargetService } from '../services/target.service';
import { AppError } from '../middleware/errorHandler';

export class UserController {
  public static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const [user, profile, dietary, targets, streak] = await Promise.all([
        User.findById(userId),
        UserProfile.findOne({ userId }),
        DietaryPreference.findOne({ userId }),
        UserTarget.findOne({ userId }).sort({ createdAt: -1 }),
        Streak.findOne({ userId }),
      ]);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      let userProfile = profile;
      let userTargets = targets;
      let userDietary = dietary;

      if (!userProfile) {
        userProfile = await UserProfile.create({
          userId,
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
      }

      if (!userDietary) {
        userDietary = await DietaryPreference.create({
          userId,
          dietType: 'High Protein',
          allergies: [],
          medicalFlags: [],
          disclaimerAcknowledgedAt: new Date(),
        });
      }

      if (!userTargets) {
        const targetCalc = TargetService.computeTargets({
          age: userProfile.age,
          gender: userProfile.gender,
          heightCm: userProfile.heightCm,
          weightKg: userProfile.weightKg,
          activityLevel: userProfile.activityLevel,
          fitnessGoal: userProfile.fitnessGoal,
          dietType: userDietary.dietType,
        });
        userTargets = await UserTarget.create({
          userId,
          bmr: targetCalc.bmr,
          tdee: targetCalc.tdee,
          calorieTarget: targetCalc.calorieTarget,
          proteinGrams: targetCalc.proteinGrams,
          carbsGrams: targetCalc.carbsGrams,
          fatGrams: targetCalc.fatGrams,
        });
      }

      res.status(200).json({
        success: true,
        data: {
          user,
          profile: userProfile,
          dietary: userDietary,
          targets: userTargets,
          streak: streak ? { current: streak.currentStreak, longest: streak.longestStreak } : { current: 0, longest: 0 },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const {
        age,
        gender,
        heightCm,
        weightKg,
        fitnessLevel,
        fitnessGoal,
        activityLevel,
        equipmentAccess,
        sessionMinutes,
        daysPerWeek,
      } = req.body;

      const profile = await UserProfile.findOneAndUpdate(
        { userId },
        {
          userId,
          age,
          gender,
          heightCm,
          weightKg,
          fitnessLevel,
          fitnessGoal,
          activityLevel,
          equipmentAccess,
          sessionMinutes,
          daysPerWeek,
        },
        { upsert: true, new: true, runValidators: true }
      );

      // Log initial weight entry into WeightLog if no entries exist
      const existingWeight = await WeightLog.findOne({ userId });
      if (!existingWeight && weightKg) {
        await WeightLog.create({ userId, weightKg, notes: 'Baseline weight' });
      }

      // Check dietary preference for macro calibration
      const dietary = await DietaryPreference.findOne({ userId });

      // Automatically compute and save scientific Mifflin-St Jeor targets
      const targetCalculation = TargetService.computeTargets({
        age: profile.age,
        gender: profile.gender,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        activityLevel: profile.activityLevel,
        fitnessGoal: profile.fitnessGoal,
        dietType: dietary?.dietType,
      });

      const targets = await UserTarget.create({
        userId,
        bmr: targetCalculation.bmr,
        tdee: targetCalculation.tdee,
        calorieTarget: targetCalculation.calorieTarget,
        proteinGrams: targetCalculation.proteinGrams,
        carbsGrams: targetCalculation.carbsGrams,
        fatGrams: targetCalculation.fatGrams,
        effectiveDate: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated and nutritional targets calculated',
        data: {
          profile,
          targets,
          explanation: targetCalculation.explanation,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateDietaryPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { dietType, allergies, medicalFlags } = req.body;

      const dietary = await DietaryPreference.findOneAndUpdate(
        { userId },
        {
          userId,
          dietType,
          allergies: allergies || [],
          medicalFlags: medicalFlags || [],
          disclaimerAcknowledgedAt: new Date(),
        },
        { upsert: true, new: true, runValidators: true }
      );

      // Recalculate targets with new diet type
      const profile = await UserProfile.findOne({ userId });
      let updatedTargets = null;
      if (profile) {
        const targetCalc = TargetService.computeTargets({
          age: profile.age,
          gender: profile.gender,
          heightCm: profile.heightCm,
          weightKg: profile.weightKg,
          activityLevel: profile.activityLevel,
          fitnessGoal: profile.fitnessGoal,
          dietType: dietary.dietType,
        });

        updatedTargets = await UserTarget.create({
          userId,
          bmr: targetCalc.bmr,
          tdee: targetCalc.tdee,
          calorieTarget: targetCalc.calorieTarget,
          proteinGrams: targetCalc.proteinGrams,
          carbsGrams: targetCalc.carbsGrams,
          fatGrams: targetCalc.fatGrams,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Dietary preferences and medical restrictions updated',
        data: {
          dietary,
          targets: updatedTargets,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getTargets(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const targets = await UserTarget.findOne({ userId }).sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        data: targets,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async recalculateTargets(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const [profile, dietary] = await Promise.all([
        UserProfile.findOne({ userId }),
        DietaryPreference.findOne({ userId }),
      ]);

      if (!profile) {
        throw new AppError('Profile required before recalculating targets', 400);
      }

      const targetCalc = TargetService.computeTargets({
        age: profile.age,
        gender: profile.gender,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        activityLevel: profile.activityLevel,
        fitnessGoal: profile.fitnessGoal,
        dietType: dietary?.dietType,
      });

      const targets = await UserTarget.create({
        userId,
        bmr: targetCalc.bmr,
        tdee: targetCalc.tdee,
        calorieTarget: targetCalc.calorieTarget,
        proteinGrams: targetCalc.proteinGrams,
        carbsGrams: targetCalc.carbsGrams,
        fatGrams: targetCalc.fatGrams,
      });

      res.status(200).json({
        success: true,
        message: 'Targets successfully recalculated',
        data: {
          targets,
          explanation: targetCalc.explanation,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      await Promise.all([
        User.findByIdAndDelete(userId),
        UserProfile.deleteMany({ userId }),
        DietaryPreference.deleteMany({ userId }),
        UserTarget.deleteMany({ userId }),
        WorkoutPlan.deleteMany({ userId }),
        WorkoutSession.deleteMany({ userId }),
        MealPlan.deleteMany({ userId }),
        MealLog.deleteMany({ userId }),
        WeightLog.deleteMany({ userId }),
        ProgressPhoto.deleteMany({ userId }),
        Streak.deleteMany({ userId }),
      ]);

      res.status(200).json({
        success: true,
        message: 'User account and associated records deleted permanently',
      });
    } catch (error) {
      next(error);
    }
  }
}
