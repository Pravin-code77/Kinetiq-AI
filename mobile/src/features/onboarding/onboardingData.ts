export interface OnboardingFormState {
  // Step 1: Personal
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Extremely Active';

  // Step 2: Goal
  fitnessGoal: 'Weight Loss' | 'Muscle Gain' | 'General Fitness' | 'Recomposition' | 'Endurance';

  // Step 3: Level
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';

  // Step 4: Dietary & Restrictions
  dietType: 'Vegetarian' | 'Vegan' | 'Non-Vegetarian' | 'Balanced' | 'High Protein' | 'Low Carb' | 'Keto';
  allergies: string[];
  medicalFlags: string[];

  // Step 5: Equipment & Availability
  equipmentAccess: 'No Equipment' | 'Home Equipment' | 'Full Gym';
  sessionMinutes: number;
  daysPerWeek: number;
}

export const defaultOnboardingState: OnboardingFormState = {
  age: 26,
  gender: 'male',
  heightCm: 175,
  weightKg: 74,
  activityLevel: 'Moderately Active',
  fitnessGoal: 'Muscle Gain',
  fitnessLevel: 'Intermediate',
  dietType: 'High Protein',
  allergies: [],
  medicalFlags: [],
  equipmentAccess: 'Home Equipment',
  sessionMinutes: 45,
  daysPerWeek: 4,
};

let currentOnboardingState: OnboardingFormState = { ...defaultOnboardingState };

export const getOnboardingState = (): OnboardingFormState => currentOnboardingState;

export const updateOnboardingState = (updates: Partial<OnboardingFormState>): OnboardingFormState => {
  currentOnboardingState = { ...currentOnboardingState, ...updates };
  return currentOnboardingState;
};

export const resetOnboardingState = (): void => {
  currentOnboardingState = { ...defaultOnboardingState };
};
