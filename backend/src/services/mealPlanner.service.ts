import { Types } from 'mongoose';
import {
  Recipe,
  IRecipe,
  MealPlan,
  IMealPlan,
  UserTarget,
  DietaryPreference,
  UserProfile,
} from '../models';

export interface GenerateMealPlanParams {
  userId: string | Types.ObjectId;
  targetDate?: Date;
  dietTypeOverride?: string;
}

export class MealPlannerService {
  /**
   * Generates a daily meal plan matching the user's calorie and macronutrient targets
   */
  public static async generateDailyPlan(params: GenerateMealPlanParams): Promise<IMealPlan> {
    const userId = params.userId;
    const planDate = params.targetDate ? new Date(params.targetDate) : new Date();
    planDate.setHours(0, 0, 0, 0);

    // Fetch user targets and dietary preferences
    const [userTarget, dietaryPref, userProfile] = await Promise.all([
      UserTarget.findOne({ userId }).sort({ createdAt: -1 }),
      DietaryPreference.findOne({ userId }),
      UserProfile.findOne({ userId }),
    ]);

    const targetCalories = userTarget?.calorieTarget || 2000;
    const targetProtein = userTarget?.proteinGrams || 150;
    const targetCarbs = userTarget?.carbsGrams || 200;
    const targetFat = userTarget?.fatGrams || 65;

    const dietType = params.dietTypeOverride || dietaryPref?.dietType || 'Balanced';
    const allergies = dietaryPref?.allergies || [];

    // Caloric distribution per meal slot:
    // Breakfast: 25%, Lunch: 35%, Dinner: 30%, Snacks: 10%
    const slotTargetCalories: Record<string, number> = {
      Breakfast: Math.round(targetCalories * 0.25),
      Lunch: Math.round(targetCalories * 0.35),
      Dinner: Math.round(targetCalories * 0.30),
      Snacks: Math.round(targetCalories * 0.10),
    };

    // Filter recipes matching dietary preferences and excluding allergens
    const recipeQuery: any = {};
    if (dietType !== 'Balanced') {
      recipeQuery.dietType = dietType;
    }
    if (allergies.length > 0) {
      recipeQuery.allergens = { $nin: allergies };
    }

    let allAvailableRecipes = await Recipe.find(recipeQuery).lean();

    // Fallback if strict filter yields insufficient recipes
    if (allAvailableRecipes.length < 4) {
      allAvailableRecipes = await Recipe.find({ allergens: { $nin: allergies } }).lean();
    }

    const slots: Array<'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'> = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
    const chosenMeals: any[] = [];
    let cumulativeCalories = 0;
    let cumulativeProtein = 0;
    let cumulativeCarbs = 0;
    let cumulativeFat = 0;

    for (const slot of slots) {
      // Find candidate recipes for this slot
      let slotCandidates = allAvailableRecipes.filter((r) => r.mealSlot === slot);
      if (slotCandidates.length === 0) {
        slotCandidates = allAvailableRecipes; // fallback across any slot
      }

      // Best-fit selection: recipe closest to slot target calories
      const idealCal = slotTargetCalories[slot];
      slotCandidates.sort((a, b) => Math.abs(a.calories - idealCal) - Math.abs(b.calories - idealCal));

      const selectedRecipe = slotCandidates[0] || {
        _id: new Types.ObjectId(),
        name: `Wholesome ${slot} Bowl`,
        calories: idealCal,
        protein: Math.round((idealCal * 0.3) / 4),
        carbohydrates: Math.round((idealCal * 0.45) / 4),
        fat: Math.round((idealCal * 0.25) / 9),
        imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
      };

      // Slight portion scale (0.8 - 1.2) to match exact target slot
      const scale = Math.min(1.3, Math.max(0.7, idealCal / (selectedRecipe.calories || idealCal)));
      const adjustedCalories = Math.round(selectedRecipe.calories * scale);
      const adjustedProtein = Math.round(selectedRecipe.protein * scale);
      const adjustedCarbs = Math.round(selectedRecipe.carbohydrates * scale);
      const adjustedFat = Math.round(selectedRecipe.fat * scale);

      chosenMeals.push({
        slot,
        recipeId: selectedRecipe._id,
        name: selectedRecipe.name,
        portionScale: Math.round(scale * 10) / 10,
        calories: adjustedCalories,
        protein: adjustedProtein,
        carbohydrates: adjustedCarbs,
        fat: adjustedFat,
        imageUrl: selectedRecipe.imageUrl,
      });

      cumulativeCalories += adjustedCalories;
      cumulativeProtein += adjustedProtein;
      cumulativeCarbs += adjustedCarbs;
      cumulativeFat += adjustedFat;
    }

    // Delete or update existing plan for this date
    await MealPlan.deleteOne({ userId, planDate });

    const newMealPlan = new MealPlan({
      userId,
      planDate,
      meals: chosenMeals,
      totalCalories: cumulativeCalories,
      totalProtein: cumulativeProtein,
      totalCarbs: cumulativeCarbs,
      totalFat: cumulativeFat,
    });

    await newMealPlan.save();
    return newMealPlan;
  }
}
