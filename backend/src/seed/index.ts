import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ENV } from '../config/env';
import {
  User,
  UserProfile,
  DietaryPreference,
  UserTarget,
  Exercise,
  NutritionItem,
  Recipe,
  Badge,
  Streak,
  NotificationPreference,
} from '../models';
import { seedExercises } from './exercises.seed';
import { seedNutritionItems, seedRecipes } from './recipes.seed';
import { seedBadges } from './badges.seed';
import { TargetService } from '../services/target.service';
import { WorkoutRecommendationService } from '../services/workoutRecommendation.service';
import { MealPlannerService } from '../services/mealPlanner.service';

const runSeed = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB at', ENV.MONGODB_URI);
    await mongoose.connect(ENV.MONGODB_URI);

    console.log('[Seed] Clearing previous catalog collections...');
    await Promise.all([
      Exercise.deleteMany({}),
      NutritionItem.deleteMany({}),
      Recipe.deleteMany({}),
      Badge.deleteMany({}),
    ]);

    console.log(`[Seed] Inserting ${seedExercises.length} exercises...`);
    await Exercise.insertMany(seedExercises);

    console.log(`[Seed] Inserting ${seedNutritionItems.length} nutrition items...`);
    await NutritionItem.insertMany(seedNutritionItems);

    console.log(`[Seed] Inserting ${seedRecipes.length} curated recipes...`);
    await Recipe.insertMany(seedRecipes);

    console.log(`[Seed] Inserting ${seedBadges.length} gamification badges...`);
    await Badge.insertMany(seedBadges);

    console.log('[Seed] Checking for demo athlete user (demo@kinetiq.ai)...');
    let demoUser = await User.findOne({ email: 'demo@kinetiq.ai' });
    if (!demoUser) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Password123!', salt);

      demoUser = await User.create({
        name: 'Alex Hunter',
        email: 'demo@kinetiq.ai',
        passwordHash,
      });

      console.log('[Seed] Created demo user:', demoUser.email);
    }

    const userId = demoUser._id;

    // Set up default profile for demo user
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      {
        userId,
        age: 28,
        gender: 'male',
        heightCm: 180,
        weightKg: 78,
        fitnessLevel: 'Intermediate',
        fitnessGoal: 'Muscle Gain',
        activityLevel: 'Moderately Active',
        equipmentAccess: 'Home Equipment',
        sessionMinutes: 45,
        daysPerWeek: 4,
      },
      { upsert: true, new: true }
    );

    // Set up dietary preferences
    const dietary = await DietaryPreference.findOneAndUpdate(
      { userId },
      {
        userId,
        dietType: 'High Protein',
        allergies: [],
        medicalFlags: [],
        disclaimerAcknowledgedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Calculate targets
    const targetCalc = TargetService.computeTargets({
      age: profile.age,
      gender: profile.gender,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      activityLevel: profile.activityLevel,
      fitnessGoal: profile.fitnessGoal,
      dietType: dietary.dietType,
    });

    await UserTarget.create({
      userId,
      bmr: targetCalc.bmr,
      tdee: targetCalc.tdee,
      calorieTarget: targetCalc.calorieTarget,
      proteinGrams: targetCalc.proteinGrams,
      carbsGrams: targetCalc.carbsGrams,
      fatGrams: targetCalc.fatGrams,
    });

    // Setup initial streak & notification preferences
    await Streak.findOneAndUpdate(
      { userId },
      { userId, currentStreak: 3, longestStreak: 7, lastActiveDate: new Date().toISOString().split('T')[0] },
      { upsert: true }
    );
    await NotificationPreference.findOneAndUpdate({ userId }, { userId }, { upsert: true });

    // Generate initial workout plan for demo user
    console.log('[Seed] Generating initial personalized workout plan for demo user...');
    await WorkoutRecommendationService.generatePlan({ userId });

    // Generate initial meal plan for demo user
    console.log('[Seed] Generating initial smart meal plan for demo user...');
    await MealPlannerService.generateDailyPlan({ userId });

    console.log('=====================================================');
    console.log('✅ DATABASE SEED COMPLETED SUCCESSFULLY!');
    console.log(`   - Exercises:      ${seedExercises.length}`);
    console.log(`   - Nutrition Items: ${seedNutritionItems.length}`);
    console.log(`   - Recipes:        ${seedRecipes.length}`);
    console.log(`   - Badges:         ${seedBadges.length}`);
    console.log(`   - Demo User:      demo@kinetiq.ai / Password123!`);
    console.log('=====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
};

runSeed();
