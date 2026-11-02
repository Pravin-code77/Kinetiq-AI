import { Types } from 'mongoose';
import {
  Exercise,
  IExercise,
  WorkoutPlan,
  IWorkoutPlan,
  WorkoutSession,
  IWorkoutSession,
  UserProfile,
  DietaryPreference,
} from '../models';

export interface GenerateWorkoutPlanParams {
  userId: string | Types.ObjectId;
  goalOverride?: 'Weight Loss' | 'Muscle Gain' | 'General Fitness' | 'Recomposition' | 'Endurance';
  levelOverride?: 'Beginner' | 'Intermediate' | 'Advanced';
  equipmentOverride?: 'No Equipment' | 'Home Equipment' | 'Full Gym';
  durationOverride?: number;
  daysOverride?: number;
}

export class WorkoutRecommendationService {
  /**
   * Generates a fully personalized, rules-based weekly workout plan
   */
  public static async generatePlan(params: GenerateWorkoutPlanParams): Promise<{
    plan: IWorkoutPlan;
    sessions: IWorkoutSession[];
  }> {
    const userId = params.userId;

    // Fetch user profile and dietary/medical flags
    const profile = await UserProfile.findOne({ userId });
    const dietary = await DietaryPreference.findOne({ userId });

    const goal = params.goalOverride || profile?.fitnessGoal || 'General Fitness';
    const level = params.levelOverride || profile?.fitnessLevel || 'Beginner';
    const equipment = params.equipmentOverride || profile?.equipmentAccess || 'No Equipment';
    const duration = params.durationOverride || profile?.sessionMinutes || 45;
    const daysPerWeek = params.daysOverride || profile?.daysPerWeek || 3;
    const medicalFlags = dietary?.medicalFlags || [];

    // Determine workout split based on weekly frequency
    let splitType: 'Full Body' | 'Upper/Lower' | 'Push/Pull/Legs' = 'Full Body';
    if (daysPerWeek >= 5) {
      splitType = 'Push/Pull/Legs';
    } else if (daysPerWeek === 4) {
      splitType = 'Upper/Lower';
    } else {
      splitType = 'Full Body';
    }

    // Determine number of exercises based on session duration
    let exerciseCountPerSession = 5;
    if (duration <= 15) exerciseCountPerSession = 3;
    else if (duration <= 30) exerciseCountPerSession = 4;
    else if (duration <= 45) exerciseCountPerSession = 6;
    else exerciseCountPerSession = 8;

    // Determine default sets, reps, and rest according to level and goal
    let baseSets = 3;
    let baseReps = 12;
    let baseRest = 60;

    if (level === 'Beginner') {
      baseSets = 3;
      baseReps = 10;
      baseRest = 75;
    } else if (level === 'Intermediate') {
      baseSets = 3;
      baseReps = 12;
      baseRest = 60;
    } else if (level === 'Advanced') {
      baseSets = 4;
      baseReps = goal === 'Muscle Gain' ? 8 : 15;
      baseRest = goal === 'Muscle Gain' ? 90 : 45;
    }

    // Equipment filter mapping
    let equipmentFilter: any = {};
    if (equipment === 'No Equipment') {
      equipmentFilter = { equipmentTag: 'No Equipment' };
    } else if (equipment === 'Home Equipment') {
      equipmentFilter = { equipmentTag: { $in: ['No Equipment', 'Home Equipment'] } };
    }
    // Full Gym has access to all equipment

    // Filter exercises matching equipment and excluding medical restriction flags
    const query: any = { ...equipmentFilter };
    if (medicalFlags.length > 0) {
      query.exclusionTags = { $nin: medicalFlags };
    }

    const availableExercises = await Exercise.find(query).lean();

    // Fallback if DB not seeded yet
    if (availableExercises.length === 0) {
      console.warn('[WorkoutRecommendationService] No exercises found for query. Please run database seed.');
    }

    // Define session templates for the split
    const sessionBlueprints = this.buildSessionBlueprints(splitType, daysPerWeek, goal);

    // Archive previous active plans for this user
    await WorkoutPlan.updateMany({ userId, status: 'active' }, { status: 'archived' });

    // Generate rationale / explanation
    const explanation = `Rules-Based Engine selected a ${splitType} split (${daysPerWeek} days/week, ~${duration} mins/session) calibrated for ${goal} at ${level} level with ${equipment} access. Medical exclusions applied: [${medicalFlags.join(', ') || 'None'}]. Adaptive progression: sets scaled to ${baseSets} sets × ${baseReps} reps with ${baseRest}s rest intervals.`;

    // Create the master plan record
    const newPlan = new WorkoutPlan({
      userId,
      weekStartDate: new Date(),
      splitType,
      goal,
      status: 'active',
      explanation,
      sessions: [],
    });
    await newPlan.save();

    const createdSessions: IWorkoutSession[] = [];

    // Build each session with targeted exercises
    for (const blueprint of sessionBlueprints) {
      const selectedExercises: any[] = [];
      const sessionPool = this.filterExercisesForSession(availableExercises, blueprint.focusMuscles);

      // Select diverse exercises from the pool
      const poolCopy = [...sessionPool];
      for (let i = 0; i < Math.min(exerciseCountPerSession, poolCopy.length); i++) {
        const randomIndex = Math.floor(Math.random() * poolCopy.length);
        const chosen = poolCopy.splice(randomIndex, 1)[0];

        selectedExercises.push({
          exerciseId: chosen._id,
          targetSets: baseSets,
          targetReps: chosen.defaultReps || baseReps,
          restSeconds: chosen.defaultRestSeconds || baseRest,
          order: i + 1,
        });
      }

      // Calculate estimated session calories based on MET and duration
      const estimatedCalories = Math.round((duration * 6.5) * (level === 'Advanced' ? 1.2 : 1.0));

      const session = new WorkoutSession({
        userId,
        workoutPlanId: newPlan._id,
        dayOfWeek: blueprint.dayOfWeek,
        sessionName: blueprint.name,
        focusArea: blueprint.focusArea,
        estimatedDuration: duration,
        estimatedCalories,
        exercises: selectedExercises,
        completed: false,
      });

      await session.save();
      createdSessions.push(session);
    }

    newPlan.sessions = createdSessions.map((s) => s._id as Types.ObjectId);
    await newPlan.save();

    return { plan: newPlan, sessions: createdSessions };
  }

  /**
   * Helper to create structured blueprints for weekly splits
   */
  private static buildSessionBlueprints(
    splitType: 'Full Body' | 'Upper/Lower' | 'Push/Pull/Legs',
    daysPerWeek: number,
    goal: string
  ): Array<{ dayOfWeek: number; name: string; focusArea: string; focusMuscles: string[] }> {
    if (splitType === 'Push/Pull/Legs') {
      const base = [
        { dayOfWeek: 1, name: 'Push Day A (Chest, Shoulders & Triceps)', focusArea: 'Upper Body Push', focusMuscles: ['Chest', 'Shoulders', 'Triceps'] },
        { dayOfWeek: 2, name: 'Pull Day A (Back & Biceps Focus)', focusArea: 'Upper Body Pull', focusMuscles: ['Back', 'Biceps'] },
        { dayOfWeek: 3, name: 'Leg Day A (Quads, Hamstrings & Calves)', focusArea: 'Lower Body', focusMuscles: ['Legs', 'Abs'] },
        { dayOfWeek: 4, name: 'Active Recovery / Core & Cardio', focusArea: 'Cardio & Core', focusMuscles: ['Cardio', 'Abs'] },
        { dayOfWeek: 5, name: 'Push Day B (Hypertrophy & Shoulders)', focusArea: 'Upper Body Push', focusMuscles: ['Chest', 'Shoulders', 'Triceps'] },
        { dayOfWeek: 6, name: 'Pull & Legs Combo (Full Athletic Power)', focusArea: 'Compound Power', focusMuscles: ['Back', 'Legs', 'Abs'] },
      ];
      return base.slice(0, Math.min(daysPerWeek, 6));
    }

    if (splitType === 'Upper/Lower') {
      const base = [
        { dayOfWeek: 1, name: 'Upper Body Power (Chest, Back, Arms)', focusArea: 'Upper Body', focusMuscles: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'] },
        { dayOfWeek: 2, name: 'Lower Body & Core (Quads, Glutes, Abs)', focusArea: 'Lower Body', focusMuscles: ['Legs', 'Abs'] },
        { dayOfWeek: 4, name: 'Upper Body Hypertrophy (Volume Focus)', focusArea: 'Upper Body', focusMuscles: ['Chest', 'Back', 'Shoulders'] },
        { dayOfWeek: 5, name: 'Lower Body Strength & HIIT Conditioning', focusArea: 'Lower Body & Conditioning', focusMuscles: ['Legs', 'Cardio', 'Abs'] },
      ];
      return base.slice(0, Math.min(daysPerWeek, 4));
    }

    // Default: Full Body
    const fullBodyNames = [
      { dayOfWeek: 1, name: 'Full Body Circuit A (Foundation & Core)', focusArea: 'Full Body', focusMuscles: ['Chest', 'Back', 'Legs', 'Abs'] },
      { dayOfWeek: 3, name: 'Full Body Circuit B (Strength & Stability)', focusArea: 'Full Body', focusMuscles: ['Legs', 'Shoulders', 'Back', 'Biceps', 'Triceps'] },
      { dayOfWeek: 5, name: 'Full Body Circuit C (HIIT & Endurance)', focusArea: 'Full Body / Cardio', focusMuscles: ['Cardio', 'Abs', 'Chest', 'Legs'] },
    ];
    return fullBodyNames.slice(0, Math.min(daysPerWeek, 3));
  }

  /**
   * Filters candidate exercises matching session focus muscles
   */
  private static filterExercisesForSession(exercises: any[], focusMuscles: string[]): any[] {
    const matching = exercises.filter((ex) => focusMuscles.includes(ex.muscleGroup) || ex.muscleGroup === 'Full Body');
    return matching.length > 0 ? matching : exercises;
  }

  /**
   * Adaptive Volume Adjuster: analyzes recent workout history
   * - High completion (>85%) -> recommend increasing rep count or load
   * - Low completion (<40%) -> suggest de-loading volume to prevent dropout
   */
  public static async evaluateAdaptiveProgression(userId: string | Types.ObjectId): Promise<{
    adjustmentNotice: string;
    shouldAdjustVolume: boolean;
    volumeMultiplier: number;
  }> {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const recentSessions = await WorkoutSession.find({
      userId,
      createdAt: { $gte: twoWeeksAgo },
    }).lean();

    if (recentSessions.length === 0) {
      return {
        adjustmentNotice: 'Consistent baseline. Complete initial sessions to activate adaptive progression.',
        shouldAdjustVolume: false,
        volumeMultiplier: 1.0,
      };
    }

    const completedCount = recentSessions.filter((s) => s.completed).length;
    const completionRate = completedCount / recentSessions.length;

    if (completionRate >= 0.8) {
      return {
        adjustmentNotice: `Impressive ${Math.round(completionRate * 100)}% workout completion! Progressing training volume with +2 reps per set to induce progressive overload.`,
        shouldAdjustVolume: true,
        volumeMultiplier: 1.1,
      };
    } else if (completionRate < 0.4 && recentSessions.length >= 3) {
      return {
        adjustmentNotice: `Workout adherence at ${Math.round(completionRate * 100)}%. Automatically calibrating session volume to lighter sets to facilitate recovery and consistency.`,
        shouldAdjustVolume: true,
        volumeMultiplier: 0.85,
      };
    }

    return {
      adjustmentNotice: `Adherence steady at ${Math.round(completionRate * 100)}%. Maintaining current workout parameters.`,
      shouldAdjustVolume: false,
      volumeMultiplier: 1.0,
    };
  }
}
