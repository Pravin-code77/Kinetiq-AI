import { Types } from 'mongoose';
import { Streak, Badge, UserBadge, WorkoutSession, MealLog } from '../models';

export class GamificationService {
  /**
   * Updates user daily streak upon any activity (logging meal or workout)
   */
  public static async recordActivity(userId: string | Types.ObjectId): Promise<{
    currentStreak: number;
    longestStreak: number;
    isNewDay: boolean;
  }> {
    const today = new Date().toISOString().split('T')[0];

    let streak = await Streak.findOne({ userId });
    if (!streak) {
      streak = new Streak({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
      });
      await streak.save();
      return { currentStreak: 1, longestStreak: 1, isNewDay: true };
    }

    if (streak.lastActiveDate === today) {
      // Already active today
      return {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        isNewDay: false,
      };
    }

    // Check if yesterday
    const lastActive = new Date(streak.lastActiveDate);
    const now = new Date(today);
    const diffTime = Math.abs(now.getTime() - lastActive.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak.currentStreak += 1;
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
    } else {
      // Streak broken
      streak.currentStreak = 1;
    }

    streak.lastActiveDate = today;
    await streak.save();

    // Check streak badges
    if (streak.currentStreak >= 7) {
      await this.awardBadge(userId, 'STREAK_7');
    }

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      isNewDay: true,
    };
  }

  /**
   * Evaluates workout milestones and awards badges
   */
  public static async checkWorkoutBadges(userId: string | Types.ObjectId): Promise<void> {
    const completedWorkouts = await WorkoutSession.countDocuments({ userId, completed: true });

    if (completedWorkouts >= 1) {
      await this.awardBadge(userId, 'FIRST_WORKOUT');
      await this.awardBadge(userId, 'WORKOUT_COMPLETED');
    }
    if (completedWorkouts >= 10) {
      await this.awardBadge(userId, 'WORKOUTS_10');
    }
  }

  /**
   * Evaluates nutrition milestones and awards badges
   */
  public static async checkMealBadges(userId: string | Types.ObjectId): Promise<void> {
    const loggedMealsCount = await MealLog.countDocuments({ userId });
    if (loggedMealsCount >= 1) {
      await this.awardBadge(userId, 'FIRST_MEAL');
    }
  }

  /**
   * Awards a badge if not already unlocked
   */
  public static async awardBadge(userId: string | Types.ObjectId, badgeCode: string): Promise<boolean> {
    const badge = await Badge.findOne({ code: badgeCode });
    if (!badge) return false;

    const existing = await UserBadge.findOne({ userId, badgeId: badge._id });
    if (existing) return false; // already awarded

    const userBadge = new UserBadge({
      userId,
      badgeId: badge._id,
      awardedAt: new Date(),
    });
    await userBadge.save();
    return true;
  }
}
