import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticate';
import { Streak, Badge, UserBadge } from '../models';

export class GamificationController {
  public static async getStreak(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const streak = await Streak.findOne({ userId });

      res.status(200).json({
        success: true,
        data: {
          currentStreak: streak?.currentStreak || 0,
          longestStreak: streak?.longestStreak || 0,
          lastActiveDate: streak?.lastActiveDate || '',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getBadges(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;

      const [allBadges, userBadges] = await Promise.all([
        Badge.find().lean(),
        UserBadge.find({ userId }).populate('badgeId').lean(),
      ]);

      const earnedBadgeIds = new Set(userBadges.map((ub: any) => ub.badgeId?._id?.toString() || ub.badgeId?.toString()));

      const badgeList = allBadges.map((badge) => {
        const isUnlocked = earnedBadgeIds.has(badge._id.toString());
        const userBadgeMatch = userBadges.find((ub: any) => (ub.badgeId?._id?.toString() || ub.badgeId?.toString()) === badge._id.toString());

        return {
          ...badge,
          unlocked: isUnlocked,
          awardedAt: userBadgeMatch ? userBadgeMatch.awardedAt : null,
        };
      });

      res.status(200).json({
        success: true,
        count: badgeList.length,
        data: badgeList,
      });
    } catch (error) {
      next(error);
    }
  }
}
