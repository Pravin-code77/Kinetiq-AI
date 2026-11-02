import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authenticate';
import {
  MealPlan,
  MealLog,
  NutritionItem,
  Recipe,
  DailySummary,
  UserTarget,
} from '../models';
import { MealPlannerService } from '../services/mealPlanner.service';
import { FoodRecognitionService } from '../services/foodRecognition.service';
import { GamificationService } from '../services/gamification.service';
import { AppError } from '../middleware/errorHandler';

export class NutritionController {
  public static async getTodayPlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let plan: any = await MealPlan.findOne({
        userId,
        planDate: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      }).populate('meals.recipeId');

      if (!plan) {
        plan = await MealPlannerService.generateDailyPlan({ userId, targetDate: today });
        if (plan) {
          await plan.populate('meals.recipeId');
        }
      }

      res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async generatePlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { dietType, targetDate } = req.body;

      const plan = await MealPlannerService.generateDailyPlan({
        userId,
        targetDate: targetDate ? new Date(targetDate) : new Date(),
        dietTypeOverride: dietType,
      });
      await plan.populate('meals.recipeId');

      res.status(201).json({
        success: true,
        message: 'Personalized meal plan generated successfully',
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async logMeal(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { mealSlot, items, photoUrl, loggedAt } = req.body;

      if (!mealSlot || !Array.isArray(items) || items.length === 0) {
        throw new AppError('Meal slot and at least one food item are required', 400);
      }

      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      const mappedItems = items.map((item: any) => {
        const cal = Number(item.calories) || 0;
        const p = Number(item.protein) || 0;
        const c = Number(item.carbohydrates) || 0;
        const f = Number(item.fat) || 0;

        totalCalories += cal;
        totalProtein += p;
        totalCarbs += c;
        totalFat += f;

        return {
          name: item.name,
          portionGrams: Number(item.portionGrams) || 100,
          calories: cal,
          protein: p,
          carbohydrates: c,
          fat: f,
        };
      });

      const mealLog = new MealLog({
        userId,
        mealSlot,
        items: mappedItems,
        photoUrl: photoUrl || '',
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      });
      await mealLog.save();

      // Update DailySummary
      const todayStr = (mealLog.loggedAt as Date).toISOString().split('T')[0];
      const target = await UserTarget.findOne({ userId }).sort({ createdAt: -1 });

      await DailySummary.findOneAndUpdate(
        { userId, summaryDate: todayStr },
        {
          $inc: {
            caloriesIn: totalCalories,
            protein: totalProtein,
            carbs: totalCarbs,
            fat: totalFat,
          },
          $setOnInsert: {
            calorieTarget: target?.calorieTarget || 2000,
          },
        },
        { upsert: true }
      );

      // Streak & Badge checks
      await GamificationService.recordActivity(userId);
      await GamificationService.checkMealBadges(userId);

      res.status(201).json({
        success: true,
        message: 'Meal logged successfully',
        data: mealLog,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getMeals(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { date } = req.query;

      let dateFilter: any = {};
      if (date) {
        const targetDay = new Date(String(date));
        targetDay.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDay.getTime() + 24 * 60 * 60 * 1000);
        dateFilter = { loggedAt: { $gte: targetDay, $lt: nextDay } };
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        dateFilter = { loggedAt: { $gte: today, $lt: tomorrow } };
      }

      const meals = await MealLog.find({ userId, ...dateFilter }).sort({ loggedAt: -1 });

      // Calculate totals
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      for (const m of meals) {
        totalCalories += m.totalCalories;
        totalProtein += m.totalProtein;
        totalCarbs += m.totalCarbs;
        totalFat += m.totalFat;
      }

      res.status(200).json({
        success: true,
        data: {
          meals,
          totals: {
            calories: totalCalories,
            protein: totalProtein,
            carbs: totalCarbs,
            fat: totalFat,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteMeal(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const meal = await MealLog.findOneAndDelete({ _id: id, userId });
      if (!meal) {
        throw new AppError('Meal record not found', 404);
      }

      // Reconcile DailySummary
      const dateStr = (meal.loggedAt as Date).toISOString().split('T')[0];
      await DailySummary.findOneAndUpdate(
        { userId, summaryDate: dateStr },
        {
          $inc: {
            caloriesIn: -meal.totalCalories,
            protein: -meal.totalProtein,
            carbs: -meal.totalCarbs,
            fat: -meal.totalFat,
          },
        }
      );

      res.status(200).json({
        success: true,
        message: 'Meal removed and daily totals updated',
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateMeal(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { items } = req.body;

      const existing = await MealLog.findOne({ _id: id, userId });
      if (!existing) {
        throw new AppError('Meal record not found', 404);
      }

      // Revert previous calories in summary
      const dateStr = (existing.loggedAt as Date).toISOString().split('T')[0];
      await DailySummary.findOneAndUpdate(
        { userId, summaryDate: dateStr },
        {
          $inc: {
            caloriesIn: -existing.totalCalories,
            protein: -existing.totalProtein,
            carbs: -existing.totalCarbs,
            fat: -existing.totalFat,
          },
        }
      );

      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      const mappedItems = items.map((item: any) => {
        const cal = Number(item.calories) || 0;
        const p = Number(item.protein) || 0;
        const c = Number(item.carbohydrates) || 0;
        const f = Number(item.fat) || 0;

        totalCalories += cal;
        totalProtein += p;
        totalCarbs += c;
        totalFat += f;

        return {
          name: item.name,
          portionGrams: Number(item.portionGrams) || 100,
          calories: cal,
          protein: p,
          carbohydrates: c,
          fat: f,
        };
      });

      existing.items = mappedItems;
      existing.totalCalories = totalCalories;
      existing.totalProtein = totalProtein;
      existing.totalCarbs = totalCarbs;
      existing.totalFat = totalFat;
      await existing.save();

      // Add new calories in summary
      await DailySummary.findOneAndUpdate(
        { userId, summaryDate: dateStr },
        {
          $inc: {
            caloriesIn: totalCalories,
            protein: totalProtein,
            carbs: totalCarbs,
            fat: totalFat,
          },
        }
      );

      res.status(200).json({
        success: true,
        message: 'Meal portion and nutrients updated',
        data: existing,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async recognizeMeal(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { imageUrl, imageBase64 } = req.body;
      const result = await FoodRecognitionService.analyzeMealImage(imageBase64 || imageUrl || '');
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async searchNutritionItems(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, category } = req.query;
      const filter: any = {};

      if (query) {
        filter.name = { $regex: String(query), $options: 'i' };
      }
      if (category) {
        filter.category = category;
      }

      const items = await NutritionItem.find(filter).limit(30).lean();

      res.status(200).json({
        success: true,
        count: items.length,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }
}
