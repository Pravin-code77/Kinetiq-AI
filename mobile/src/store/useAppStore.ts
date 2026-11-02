import { create } from 'zustand';
import {
  User,
  UserProfile,
  DietaryPreference,
  UserTarget,
  DashboardSummary,
  WorkoutPlan,
  WorkoutSession,
  MealPlan,
  MealLog,
  Badge,
} from '../types';
import {
  authService,
  dashboardService,
  workoutService,
  nutritionService,
  gamificationService,
} from '../services/api';
import { Storage } from '../services/api/apiClient';

interface AppState {
  user: User | null;
  profile: UserProfile | null;
  dietary: DietaryPreference | null;
  targets: UserTarget | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  isInitialLoading: boolean;
  isLoading: boolean;
  dashboardSummary: DashboardSummary | null;
  currentWorkoutPlan: WorkoutPlan | null;
  activeSession: WorkoutSession | null;
  todayMealPlan: MealPlan | null;
  todayLoggedMeals: MealLog[];
  streak: { current: number; longest: number };
  badges: Badge[];

  // Actions
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<boolean>;
  login: (data: { email: string; password: string }) => Promise<any>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfileState: (profile: UserProfile, targets?: UserTarget) => void;
  fetchDashboard: () => Promise<void>;
  fetchWorkoutPlan: () => Promise<void>;
  setActiveSession: (session: WorkoutSession | null) => void;
  fetchTodayMealPlan: () => Promise<void>;
  fetchTodayMeals: () => Promise<void>;
  fetchGamification: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  profile: null,
  dietary: null,
  targets: null,
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  isInitialLoading: true,
  isLoading: false,
  dashboardSummary: null,
  currentWorkoutPlan: null,
  activeSession: null,
  todayMealPlan: null,
  todayLoggedMeals: [],
  streak: { current: 0, longest: 0 },
  badges: [],

  setLoading: (loading) => set({ isLoading: loading }),

  checkAuth: async () => {
    try {
      const token = await Storage.getItem('kinetiq_access_token');
      if (!token) {
        set({ isAuthenticated: false, isInitialLoading: false, isLoading: false });
        return false;
      }
      const data = await authService.getMe();
      if (data?.user) {
        // App opens directly to MainApp upon successful login
        set({
          user: data.user,
          profile: data.profile || null,
          dietary: data.dietary || null,
          targets: data.targets || null,
          streak: data.streak || { current: 0, longest: 0 },
          isAuthenticated: true,
          hasCompletedOnboarding: true,
          isInitialLoading: false,
          isLoading: false,
        });
        return true;
      }
      set({ isAuthenticated: false, isInitialLoading: false, isLoading: false });
      return false;
    } catch (err) {
      set({ isAuthenticated: false, isInitialLoading: false, isLoading: false });
      return false;
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const res = await authService.login(credentials);
      if (res?.data?.accessToken) {
        await Storage.setItem('kinetiq_access_token', res.data.accessToken);
      }
      if (res?.data?.refreshToken) {
        await Storage.setItem('kinetiq_refresh_token', res.data.refreshToken);
      }
      if (res?.data?.user) {
        set({
          user: res.data.user,
          isAuthenticated: true,
          hasCompletedOnboarding: true,
          isInitialLoading: false,
          isLoading: false,
        });
      }
      get().checkAuth().catch(() => {});
      get().fetchDashboard().catch(() => {});
      return res;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authService.register(data);
      return res;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await authService.logout();
    set({
      user: null,
      profile: null,
      dietary: null,
      targets: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      dashboardSummary: null,
      currentWorkoutPlan: null,
      activeSession: null,
      todayMealPlan: null,
      todayLoggedMeals: [],
      streak: { current: 0, longest: 0 },
      badges: [],
    });
  },

  deleteAccount: async () => {
    await authService.deleteAccount();
    set({
      user: null,
      profile: null,
      dietary: null,
      targets: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      dashboardSummary: null,
      currentWorkoutPlan: null,
      activeSession: null,
      todayMealPlan: null,
      todayLoggedMeals: [],
      streak: { current: 0, longest: 0 },
      badges: [],
    });
  },

  updateProfileState: (profile, targets) => {
    set({
      profile,
      ...(targets && { targets }),
      hasCompletedOnboarding: true,
    });
  },

  fetchDashboard: async () => {
    try {
      const summary = await dashboardService.getWeeklySummary();
      if (summary) {
        set({ dashboardSummary: summary });
      }
    } catch (err) {
      console.warn('fetchDashboard error', err);
    }
  },

  fetchWorkoutPlan: async () => {
    try {
      const result = await workoutService.getCurrentPlan();
      if (result?.plan) {
        set({ currentWorkoutPlan: result.plan });
      }
    } catch (err) {
      console.warn('fetchWorkoutPlan error', err);
    }
  },

  setActiveSession: (session) => set({ activeSession: session }),

  fetchTodayMealPlan: async () => {
    try {
      const plan = await nutritionService.getTodayPlan();
      if (plan) {
        set({ todayMealPlan: plan });
      }
    } catch (err) {
      console.warn('fetchTodayMealPlan error', err);
    }
  },

  fetchTodayMeals: async () => {
    try {
      const result = await nutritionService.getMeals();
      if (result?.meals) {
        set({ todayLoggedMeals: result.meals });
      }
    } catch (err) {
      console.warn('fetchTodayMeals error', err);
    }
  },

  fetchGamification: async () => {
    try {
      const [streak, badges] = await Promise.all([
        gamificationService.getStreak(),
        gamificationService.getBadges(),
      ]);
      set({
        streak: streak
          ? { current: streak.currentStreak, longest: streak.longestStreak }
          : { current: 0, longest: 0 },
        badges: badges || [],
      });
    } catch (err) {
      console.warn('fetchGamification error', err);
    }
  },
}));
