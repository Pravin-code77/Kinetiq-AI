import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../store/useAppStore';
import { RootStackParamList, AuthStackParamList, OnboardingStackParamList } from './types';
import { MainTabNavigator } from './MainTabNavigator';

// Auth Screens
import { SplashScreen } from '../features/auth/SplashScreen';
import { WelcomeScreen } from '../features/auth/WelcomeScreen';
import { LoginScreen } from '../features/auth/LoginScreen';
import { RegisterScreen } from '../features/auth/RegisterScreen';
import { ForgotPasswordScreen } from '../features/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../features/auth/ResetPasswordScreen';

// Onboarding Screens
import { PersonalInfoScreen } from '../features/onboarding/PersonalInfoScreen';
import { FitnessGoalScreen } from '../features/onboarding/FitnessGoalScreen';
import { FitnessLevelScreen } from '../features/onboarding/FitnessLevelScreen';
import { EquipmentAvailabilityScreen } from '../features/onboarding/EquipmentAvailabilityScreen';
import { DietaryPreferencesScreen } from '../features/onboarding/DietaryPreferencesScreen';
import { OnboardingSummaryScreen } from '../features/onboarding/OnboardingSummaryScreen';

// Detail & Modal Screens
import { ActiveWorkoutScreen } from '../features/workouts/ActiveWorkoutScreen';
import { ExerciseDetailScreen } from '../features/workouts/ExerciseDetailScreen';
import { FoodLoggerScreen } from '../features/nutrition/FoodLoggerScreen';
import { FoodScannerModal } from '../features/nutrition/FoodScannerModal';
import { EditGoalsScreen } from '../features/profile/EditGoalsScreen';
import { NotificationSettingsScreen } from '../features/profile/NotificationSettingsScreen';
import { DisclaimerScreen } from '../features/profile/DisclaimerScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </AuthStack.Navigator>
);

const OnboardingNavigator = () => (
  <OnboardingStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <OnboardingStack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
    <OnboardingStack.Screen name="FitnessGoal" component={FitnessGoalScreen} />
    <OnboardingStack.Screen name="OnboardingGoal" component={FitnessGoalScreen} />
    <OnboardingStack.Screen name="FitnessLevel" component={FitnessLevelScreen} />
    <OnboardingStack.Screen name="OnboardingLevel" component={FitnessLevelScreen} />
    <OnboardingStack.Screen name="EquipmentAvailability" component={EquipmentAvailabilityScreen} />
    <OnboardingStack.Screen name="OnboardingEquipment" component={EquipmentAvailabilityScreen} />
    <OnboardingStack.Screen name="DietaryPreferences" component={DietaryPreferencesScreen} />
    <OnboardingStack.Screen name="OnboardingDiet" component={DietaryPreferencesScreen} />
    <OnboardingStack.Screen name="OnboardingSummary" component={OnboardingSummaryScreen} />
  </OnboardingStack.Navigator>
);

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, hasCompletedOnboarding, isInitialLoading, checkAuth } = useAppStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isInitialLoading) {
    return <SplashScreen />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <RootStack.Screen name="MainApp" component={MainTabNavigator} />
          <RootStack.Screen name="DashboardTab" component={MainTabNavigator as any} />
          <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
          <RootStack.Screen
            name="ActiveWorkout"
            component={ActiveWorkoutScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <RootStack.Screen
            name="ExerciseDetail"
            component={ExerciseDetailScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <RootStack.Screen
            name="FoodLogger"
            component={FoodLoggerScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <RootStack.Screen
            name="FoodScannerModal"
            component={FoodScannerModal}
            options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
          />
          <RootStack.Screen
            name="EditGoals"
            component={EditGoalsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <RootStack.Screen
            name="NotificationSettings"
            component={NotificationSettingsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <RootStack.Screen
            name="Disclaimer"
            component={DisclaimerScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      )}
    </RootStack.Navigator>
  );
};
