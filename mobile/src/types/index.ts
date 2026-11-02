export interface User {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface UserProfile {
  _id?: string;
  userId: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  fitnessGoal: 'Weight Loss' | 'Muscle Gain' | 'General Fitness' | 'Recomposition' | 'Endurance';
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Extremely Active';
  equipmentAccess: 'No Equipment' | 'Home Equipment' | 'Full Gym';
  sessionMinutes: number;
  daysPerWeek: number;
}

export interface DietaryPreference {
  _id?: string;
  userId: string;
  dietType: 'Vegetarian' | 'Vegan' | 'Non-Vegetarian' | 'Balanced' | 'High Protein' | 'Low Carb' | 'Keto';
  allergies: string[];
  medicalFlags: string[];
  disclaimerAcknowledgedAt: string;
}

export interface UserTarget {
  _id?: string;
  userId: string;
  bmr: number;
  tdee: number;
  calorieTarget: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  effectiveDate: string;
}

export interface Exercise {
  _id: string;
  name: string;
  description: string;
  muscleGroup: 'Chest' | 'Back' | 'Shoulders' | 'Biceps' | 'Triceps' | 'Legs' | 'Abs' | 'Cardio' | 'Full Body';
  equipmentTag: 'No Equipment' | 'Home Equipment' | 'Full Gym';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  metValue: number;
  instructions: string[];
  imageUrl: string;
  videoUrl?: string;
  exclusionTags: string[];
  progressionType: 'reps' | 'weight' | 'time';
  defaultSets: number;
  defaultReps: number;
  defaultRestSeconds: number;
  estimatedCaloriesPerMinute: number;
}

export interface SessionExercise {
  exerciseId: Exercise;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
  order: number;
}

export interface WorkoutSession {
  _id: string;
  workoutPlanId: string;
  dayOfWeek: number;
  sessionName: string;
  focusArea: string;
  estimatedDuration: number;
  estimatedCalories: number;
  exercises: SessionExercise[];
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface WorkoutPlan {
  _id: string;
  splitType: 'Full Body' | 'Upper/Lower' | 'Push/Pull/Legs';
  goal: string;
  status: 'active' | 'completed' | 'archived';
  sessions: WorkoutSession[];
  explanation: string;
  weekStartDate: string;
  isCustom?: boolean;
  customName?: string;
}

export interface Recipe {
  _id: string;
  name: string;
  description: string;
  dietType: string;
  mealSlot: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  ingredients: Array<{ name: string; amount: string; calories?: number }>;
  preparationInstructions: string[];
  preparationTime: number;
  servings: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  imageUrl: string;
  allergens: string[];
}

export interface PlannedMeal {
  slot: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  recipeId?: Recipe;
  name: string;
  portionScale: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  imageUrl?: string;
}

export interface MealPlan {
  _id: string;
  planDate: string;
  meals: PlannedMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface LoggedFoodItem {
  name: string;
  portionGrams: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

export interface MealLog {
  _id: string;
  mealSlot: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  items: LoggedFoodItem[];
  photoUrl?: string;
  loggedAt: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface WeightLog {
  _id: string;
  weightKg: number;
  loggedAt: string;
  movingAverage?: number;
  notes?: string;
}

export interface ProgressPhoto {
  _id: string;
  photoUrl: string;
  angle: 'front' | 'side' | 'back';
  takenAt: string;
  notes?: string;
}

export interface Badge {
  _id: string;
  code: string;
  title: string;
  description: string;
  iconName: string;
  category: 'workout' | 'nutrition' | 'streak' | 'milestone';
  triggerRule: string;
  points: number;
  unlocked?: boolean;
  awardedAt?: string;
}

export interface DashboardSummary {
  user: {
    name: string;
    email: string;
    fitnessGoal: string;
    fitnessLevel: string;
    streak: number;
  };
  calories: {
    target: number;
    consumed: number;
    remaining: number;
    percentage: number;
  };
  macros: {
    protein: { consumed: number; target: number; percentage: number };
    carbs: { consumed: number; target: number; percentage: number };
    fat: { consumed: number; target: number; percentage: number };
  };
  todayWorkout: {
    _id: string;
    name: string;
    focusArea: string;
    duration: number;
    caloriesBurn: number;
    exerciseCount: number;
    completed: boolean;
    exercises: SessionExercise[];
  } | null;
  todayMealPlan: PlannedMeal[];
  weeklyActivity: {
    workoutsCompleted: number;
    workoutsPlanned: number;
    completionPercentage: number;
    averageDailyCalories: number;
    dailySummaries: any[];
  };
  weightTrend: WeightLog[];
  insights: string[];
}
