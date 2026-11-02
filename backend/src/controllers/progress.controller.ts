import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticate';
import { WeightLog, ProgressPhoto, UserProfile } from '../models';
import { AppError } from '../middleware/errorHandler';

export class ProgressController {
  public static async logWeight(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { weightKg, loggedAt, notes } = req.body;

      if (!weightKg || weightKg < 20 || weightKg > 350) {
        throw new AppError('Valid weight value in kg is required (20 - 350 kg)', 400);
      }

      const entry = await WeightLog.create({
        userId,
        weightKg: Number(weightKg),
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
        notes: notes || '',
      });

      // Update current weight in profile
      await UserProfile.findOneAndUpdate({ userId }, { weightKg: Number(weightKg) });

      res.status(201).json({
        success: true,
        message: 'Weight logged successfully',
        data: entry,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getWeightHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const logs = await WeightLog.find({ userId }).sort({ loggedAt: 1 }).lean();

      // Calculate 7-day moving average
      const trendData = logs.map((log, index) => {
        const windowStart = Math.max(0, index - 6);
        const windowLogs = logs.slice(windowStart, index + 1);
        const sum = windowLogs.reduce((acc, curr) => acc + curr.weightKg, 0);
        const movingAverage = Math.round((sum / windowLogs.length) * 10) / 10;

        return {
          ...log,
          movingAverage,
        };
      });

      res.status(200).json({
        success: true,
        count: trendData.length,
        data: trendData,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async uploadPhoto(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { photoUrl, angle, notes, takenAt } = req.body;

      if (!photoUrl) {
        throw new AppError('Photo URL or base64 image data is required', 400);
      }

      const photo = await ProgressPhoto.create({
        userId,
        photoUrl,
        angle: angle || 'front',
        notes: notes || '',
        takenAt: takenAt ? new Date(takenAt) : new Date(),
      });

      res.status(201).json({
        success: true,
        message: 'Progress photo saved successfully',
        data: photo,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getPhotos(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { angle } = req.query;

      const filter: any = { userId };
      if (angle) filter.angle = angle;

      const photos = await ProgressPhoto.find(filter).sort({ takenAt: -1 }).lean();

      // Group photos by angle for convenient before-and-after comparison
      const grouped = {
        front: photos.filter((p) => p.angle === 'front'),
        side: photos.filter((p) => p.angle === 'side'),
        back: photos.filter((p) => p.angle === 'back'),
      };

      res.status(200).json({
        success: true,
        count: photos.length,
        data: {
          all: photos,
          grouped,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
