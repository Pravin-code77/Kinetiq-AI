import { NavigatorScreenParams } from '@react-navigation/native';
import { Exercise, PlannedMeal } from '../types';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: { prefillEmail?: string; justRegistered?: boolean } | undefined;
  Register: { prefillEmail?: string } | undefined;
  ForgotPassword: { prefillEmail?: string } | undefined;
  ResetPassword: { token?: string; email?: string } | undefined;
};

export type OnboardingStackParamList = {
  PersonalInfo: undefined;
  FitnessGoal: undefined;
  FitnessLevel: undefined;
  EquipmentAvailability: undefined;
  DietaryPreferences: undefined;
  OnboardingSummary: undefined;
  OnboardingGoal: undefined;
  OnboardingLevel: undefined;
  OnboardingDiet: undefined;
  OnboardingEquipment: undefined;
};

export type WorkoutStackParamList = {
  WorkoutPlanList: undefined;
  ActiveWorkout: { sessionId: string };
  ExerciseDetail: {
    exerciseId: string;
    targetSets?: number;
    targetReps?: number;
    restSeconds?: number;
  };
};

export type NutritionStackParamList = {
  NutritionPlanHome: undefined;
  FoodLogger: undefined;
  FoodScannerModal: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditGoals: undefined;
  NotificationSettings: undefined;
  Disclaimer: undefined;
};

export type MainTabParamList = {
  DashboardTab: undefined;
  WorkoutsTab: NavigatorScreenParams<WorkoutStackParamList>;
  NutritionTab: NavigatorScreenParams<NutritionStackParamList>;
  ProgressTab: undefined;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  MainApp: NavigatorScreenParams<MainTabParamList>;
  DashboardTab?: undefined;
  ActiveWorkout: { sessionId: string };
  ExerciseDetail: {
    exerciseId: string;
    targetSets?: number;
    targetReps?: number;
    restSeconds?: number;
  };
  FoodLogger: undefined;
  FoodScannerModal: undefined;
  EditGoals: undefined;
  NotificationSettings: undefined;
  Disclaimer: undefined;
};
