import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticate';
import {
  WorkoutPlan,
  WorkoutSession,
  Exercise,
  ExerciseLog,
  DailySummary,
} from '../models';
import { WorkoutRecommendationService } from '../services/workoutRecommendation.service';
import { GamificationService } from '../services/gamification.service';
import { AppError } from '../middleware/errorHandler';

export class WorkoutController {
  public static async getCurrentPlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;

      let plan = await WorkoutPlan.findOne({ userId, status: 'active' })
        .populate({
          path: 'sessions',
          populate: {
            path: 'exercises.exerciseId',
            model: 'Exercise',
          },
        })
        .lean();

      // If no plan exists, generate one automatically
      if (!plan) {
        const generated = await WorkoutRecommendationService.generatePlan({ userId });
        plan = await WorkoutPlan.findById(generated.plan._id)
          .populate({
            path: 'sessions',
            populate: {
              path: 'exercises.exerciseId',
              model: 'Exercise',
            },
          })
          .lean();
      }

      const adaptiveInfo = await WorkoutRecommendationService.evaluateAdaptiveProgression(userId);

      res.status(200).json({
        success: true,
        data: {
          plan,
          adaptiveProgression: adaptiveInfo,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async generatePlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { goal, level, equipment, duration, daysPerWeek } = req.body;

      const result = await WorkoutRecommendationService.generatePlan({
        userId,
        goalOverride: goal,
        levelOverride: level,
        equipmentOverride: equipment,
        durationOverride: duration,
        daysOverride: daysPerWeek,
      });

      const populatedPlan = await WorkoutPlan.findById(result.plan._id)
        .populate({
          path: 'sessions',
          populate: {
            path: 'exercises.exerciseId',
            model: 'Exercise',
          },
        })
        .lean();

      res.status(201).json({
        success: true,
        message: 'Personalized workout plan generated successfully',
        data: populatedPlan,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createCustomPlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { customName, splitType, goal, sessions } = req.body;

      if (!Array.isArray(sessions) || sessions.length === 0) {
        throw new AppError('A custom workout plan must have at least one session', 400);
      }

      // Archive previous active plans for this user
      await WorkoutPlan.updateMany({ userId, status: 'active' }, { status: 'archived' });

      // Create new custom plan
      const newPlan = new WorkoutPlan({
        userId,
        weekStartDate: new Date(),
        splitType: splitType || 'Full Body',
        goal: goal || 'General Fitness',
        status: 'active',
        isCustom: true,
        customName: customName || 'My Custom Plan',
        explanation: `Custom user-designed workout plan (${customName || 'My Custom Routine'}).`,
        sessions: [],
      });
      await newPlan.save();

      const createdSessions = [];

      for (const s of sessions) {
        const exercises = Array.isArray(s.exercises)
          ? s.exercises.map((ex: any, idx: number) => ({
              exerciseId: ex.exerciseId,
              targetSets: ex.targetSets || 3,
              targetReps: ex.targetReps || 12,
              restSeconds: ex.restSeconds || 60,
              order: ex.order || idx + 1,
            }))
          : [];

        const session = new WorkoutSession({
          userId,
          workoutPlanId: newPlan._id,
          dayOfWeek: s.dayOfWeek || 1,
          sessionName: s.sessionName || 'Custom Workout Session',
          focusArea: s.focusArea || 'General',
          estimatedDuration: s.estimatedDuration || 45,
          estimatedCalories: s.estimatedCalories || 280,
          exercises,
          completed: false,
        });

        await session.save();
        createdSessions.push(session._id);
      }

      newPlan.sessions = createdSessions as any;
      await newPlan.save();

      const populatedPlan = await WorkoutPlan.findById(newPlan._id)
        .populate({
          path: 'sessions',
          populate: {
            path: 'exercises.exerciseId',
            model: 'Exercise',
          },
        })
        .lean();

      res.status(201).json({
        success: true,
        message: 'Custom workout plan created and activated successfully',
        data: populatedPlan,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getExercises(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { muscleGroup, equipmentTag, difficulty, search } = req.query;
      const filter: any = {};

      if (muscleGroup) filter.muscleGroup = muscleGroup;
      if (equipmentTag) filter.equipmentTag = equipmentTag;
      if (difficulty) filter.difficulty = difficulty;
      if (search) {
        filter.name = { $regex: String(search), $options: 'i' };
      }

      const exercises = await Exercise.find(filter).sort({ name: 1 }).lean();

      res.status(200).json({
        success: true,
        count: exercises.length,
        data: exercises,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getExerciseById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const exercise = await Exercise.findById(req.params.id);
      if (!exercise) {
        throw new AppError('Exercise not found', 404);
      }
      res.status(200).json({
        success: true,
        data: exercise,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async logSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { sessionId } = req.params;
      const { loggedExercises, rpe, notes } = req.body;

      const session = await WorkoutSession.findOne({ _id: sessionId, userId });
      if (!session) {
        throw new AppError('Workout session not found', 404);
      }

      // Mark session completed
      session.completed = true;
      session.completedAt = new Date();
      if (notes) session.notes = notes;
      await session.save();

      // Log exercise sets
      if (Array.isArray(loggedExercises)) {
        for (const item of loggedExercises) {
          if (item.exerciseId && Array.isArray(item.sets)) {
            const normalizedSets = item.sets.map((s: any) => ({
              setNumber: s.setNumber,
              repsCompleted: s.repsCompleted !== undefined ? s.repsCompleted : (s.reps || 0),
              weightKg: s.weightKg || 0,
              completed: s.completed !== undefined ? s.completed : true,
            }));

            await ExerciseLog.create({
              userId,
              sessionId: sessionId as string,
              exerciseId: item.exerciseId,
              loggedSets: normalizedSets,
              rpe: rpe || 7,
              completedAt: new Date(),
            });
          }
        }
      }

      // Update DailySummary
      const today = new Date().toISOString().split('T')[0];
      await DailySummary.findOneAndUpdate(
        { userId, summaryDate: today },
        { $inc: { workoutsCompleted: 1 } },
        { upsert: true }
      );

      // Record activity streak and evaluate badges
      const streakResult = await GamificationService.recordActivity(userId);
      await GamificationService.checkWorkoutBadges(userId);

      res.status(200).json({
        success: true,
        message: 'Workout session logged and completed successfully!',
        data: {
          session,
          streak: streakResult,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const limit = parseInt(req.query.limit as string) || 20;

      const history = await WorkoutSession.find({ userId, completed: true })
        .sort({ completedAt: -1 })
        .limit(limit)
        .populate({
          path: 'exercises.exerciseId',
          model: 'Exercise',
        })
        .lean();

      res.status(200).json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }
}
