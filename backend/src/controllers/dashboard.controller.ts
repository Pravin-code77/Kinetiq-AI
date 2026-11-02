import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticate';
import {
  User,
  UserProfile,
  UserTarget,
  WorkoutPlan,
  WorkoutSession,
  MealPlan,
  MealLog,
  DailySummary,
  Streak,
  WeightLog,
} from '../models';

export class DashboardController {
  public static async getWeeklySummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      // Fetch user, target, profile, streak
      const [user, profile, targets, streak] = await Promise.all([
        User.findById(userId),
        UserProfile.findOne({ userId }),
        UserTarget.findOne({ userId }).sort({ createdAt: -1 }),
        Streak.findOne({ userId }),
      ]);

      const calorieTarget = targets?.calorieTarget || 2000;
      const proteinTarget = targets?.proteinGrams || 150;
      const carbsTarget = targets?.carbsGrams || 200;
      const fatTarget = targets?.fatGrams || 65;

      // Fetch today's logged meals
      const todayMeals = await MealLog.find({
        userId,
        loggedAt: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      });

      let caloriesConsumed = 0;
      let proteinConsumed = 0;
      let carbsConsumed = 0;
      let fatConsumed = 0;

      for (const meal of todayMeals) {
        caloriesConsumed += meal.totalCalories;
        proteinConsumed += meal.totalProtein;
        carbsConsumed += meal.totalCarbs;
        fatConsumed += meal.totalFat;
      }

      const remainingCalories = Math.max(0, calorieTarget - caloriesConsumed);

      // Fetch today's workout session
      const activePlan = await WorkoutPlan.findOne({ userId, status: 'active' });
      let todayWorkout: any = null;

      if (activePlan) {
        // Map today's day of week: Sunday = 7, Mon = 1, Tue = 2, etc.
        const currentDayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
        todayWorkout = await WorkoutSession.findOne({
          userId,
          workoutPlanId: activePlan._id,
          dayOfWeek: currentDayOfWeek,
        }).populate('exercises.exerciseId');

        // If no workout scheduled for today, provide next upcoming workout in plan
        if (!todayWorkout) {
          todayWorkout = await WorkoutSession.findOne({
            userId,
            workoutPlanId: activePlan._id,
            completed: false,
          }).populate('exercises.exerciseId');
        }
      }

      // Fetch today's meal plan suggestions
      const todayMealPlan = await MealPlan.findOne({
        userId,
        planDate: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      });

      // Weekly statistics (last 7 days)
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

      const weeklySummaries = await DailySummary.find({
        userId,
        summaryDate: { $gte: sevenDaysAgo.toISOString().split('T')[0] },
      }).sort({ summaryDate: 1 });

      const weeklySessions = await WorkoutSession.find({
        userId,
        completedAt: { $gte: sevenDaysAgo },
      });

      const workoutsCompletedThisWeek = weeklySessions.length;
      const plannedWorkoutsThisWeek = profile?.daysPerWeek || 3;
      const workoutCompletionPct = Math.min(
        100,
        Math.round((workoutsCompletedThisWeek / Math.max(1, plannedWorkoutsThisWeek)) * 100)
      );

      // Average daily calories
      const totalCaloriesInWeek = weeklySummaries.reduce((sum, s) => sum + s.caloriesIn, 0) + caloriesConsumed;
      const averageDailyCalories = Math.round(totalCaloriesInWeek / 7);

      // Adherence percentages
      const proteinAdherence = Math.min(100, Math.round((proteinConsumed / Math.max(1, proteinTarget)) * 100));
      const carbsAdherence = Math.min(100, Math.round((carbsConsumed / Math.max(1, carbsTarget)) * 100));
      const fatAdherence = Math.min(100, Math.round((fatConsumed / Math.max(1, fatTarget)) * 100));

      // Fetch weight trend
      const recentWeight = await WeightLog.find({ userId }).sort({ loggedAt: -1 }).limit(7);

      // Rule-based actionable insights
      const insights: string[] = [];
      if (workoutCompletionPct >= 80) {
        insights.push('Great momentum! You are on pace with your weekly training target.');
      } else if (workoutCompletionPct < 50 && today.getDay() >= 4) {
        insights.push('You have sessions remaining this week. Fitting in a 30-min workout today will keep you on track.');
      }

      if (proteinAdherence >= 90) {
        insights.push('Protein intake is optimal to support recovery and muscle preservation.');
      } else if (caloriesConsumed > 0 && proteinAdherence < 60) {
        insights.push('Consider adding a high-protein snack (Greek yogurt, eggs, or protein shake) to hit your target.');
      }

      if (remainingCalories <= 150 && remainingCalories > 0) {
        insights.push('Caloric intake is dialed in tightly with your daily goal.');
      }

      if (insights.length === 0) {
        insights.push('Stay hydrated and prepare for your scheduled training session today.');
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            name: user?.name || 'Athlete',
            email: user?.email,
            fitnessGoal: profile?.fitnessGoal || 'General Fitness',
            fitnessLevel: profile?.fitnessLevel || 'Beginner',
            streak: streak?.currentStreak || 0,
          },
          calories: {
            target: calorieTarget,
            consumed: caloriesConsumed,
            remaining: remainingCalories,
            percentage: Math.min(100, Math.round((caloriesConsumed / calorieTarget) * 100)),
          },
          macros: {
            protein: { consumed: proteinConsumed, target: proteinTarget, percentage: proteinAdherence },
            carbs: { consumed: carbsConsumed, target: carbsTarget, percentage: carbsAdherence },
            fat: { consumed: fatConsumed, target: fatTarget, percentage: fatAdherence },
          },
          todayWorkout: todayWorkout
            ? {
                _id: todayWorkout._id,
                name: todayWorkout.sessionName,
                focusArea: todayWorkout.focusArea,
                duration: todayWorkout.estimatedDuration,
                caloriesBurn: todayWorkout.estimatedCalories,
                exerciseCount: todayWorkout.exercises.length,
                completed: todayWorkout.completed,
                exercises: todayWorkout.exercises,
              }
            : null,
          todayMealPlan: todayMealPlan ? todayMealPlan.meals : [],
          weeklyActivity: {
            workoutsCompleted: workoutsCompletedThisWeek,
            workoutsPlanned: plannedWorkoutsThisWeek,
            completionPercentage: workoutCompletionPct,
            averageDailyCalories,
            dailySummaries: weeklySummaries,
          },
          weightTrend: recentWeight,
          insights,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
