import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticate';
import { NotificationPreference } from '../models';

export class NotificationController {
  public static async getPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      let prefs = await NotificationPreference.findOne({ userId });

      if (!prefs) {
        prefs = await NotificationPreference.create({ userId });
      }

      res.status(200).json({
        success: true,
        data: prefs,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updatePreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const {
        workoutReminders,
        mealReminders,
        hydrationReminders,
        checkinReminders,
        quietHoursStart,
        quietHoursEnd,
        fcmToken,
      } = req.body;

      const prefs = await NotificationPreference.findOneAndUpdate(
        { userId },
        {
          workoutReminders,
          mealReminders,
          hydrationReminders,
          checkinReminders,
          quietHoursStart,
          quietHoursEnd,
          ...(fcmToken && { fcmToken }),
        },
        { upsert: true, new: true }
      );

      res.status(200).json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: prefs,
      });
    } catch (error) {
      next(error);
    }
  }
}
