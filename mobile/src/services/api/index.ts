import apiClient, { Storage } from './apiClient';
import {
  User,
  UserProfile,
  DietaryPreference,
  UserTarget,
  WorkoutPlan,
  WorkoutSession,
  Exercise,
  MealPlan,
  MealLog,
  WeightLog,
  ProgressPhoto,
  Badge,
  DashboardSummary,
} from '../../types';

export const authService = {
  async register(data: { name: string; email: string; password: string }) {
    const res = await apiClient.post('/auth/register', data);
    // Do not save tokens to storage on register; user must log in after account creation
    return res.data;
  },

  async login(data: { email: string; password: string }) {
    const res = await apiClient.post('/auth/login', data);
    if (res.data?.data?.accessToken) {
      await Storage.setItem('kinetiq_access_token', res.data.data.accessToken);
      await Storage.setItem('kinetiq_refresh_token', res.data.data.refreshToken);
    }
    return res.data;
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch {}
    await Storage.removeItem('kinetiq_access_token');
    await Storage.removeItem('kinetiq_refresh_token');
  },

  async forgotPassword(email: string) {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(data: {
    token: string;
    email?: string;
    newPassword: string;
    confirmPassword?: string;
  }) {
    const res = await apiClient.post('/auth/reset-password', data);
    return res.data;
  },

  async getMe() {
    const res = await apiClient.get('/users/me');
    return res.data?.data;
  },

  async updateProfile(profileData: Partial<UserProfile>) {
    const res = await apiClient.post('/users/me/profile', profileData);
    return res.data?.data;
  },

  async updateDietaryPreferences(dietData: Partial<DietaryPreference>) {
    const res = await apiClient.post('/users/me/dietary-preferences', dietData);
    return res.data?.data;
  },

  async recalculateTargets() {
    const res = await apiClient.post('/users/me/targets/recalculate');
    return res.data?.data;
  },

  async deleteAccount() {
    const res = await apiClient.delete('/users/me');
    await Storage.removeItem('kinetiq_access_token');
    await Storage.removeItem('kinetiq_refresh_token');
    return res.data;
  },
};

export const workoutService = {
  async getCurrentPlan(): Promise<{ plan: WorkoutPlan; adaptiveProgression: any }> {
    const res = await apiClient.get('/workouts/plan/current');
    return res.data?.data;
  },

  async generatePlan(params?: {
    goal?: string;
    level?: string;
    equipment?: string;
    duration?: number;
    daysPerWeek?: number;
  }): Promise<WorkoutPlan> {
    const res = await apiClient.post('/workouts/plan/generate', params || {});
    return res.data?.data;
  },

  async createCustomPlan(payload: {
    customName: string;
    splitType: string;
    goal?: string;
    sessions: Array<{
      dayOfWeek: number;
      sessionName: string;
      focusArea: string;
      estimatedDuration?: number;
      exercises: Array<{
        exerciseId: string;
        targetSets?: number;
        targetReps?: number;
        restSeconds?: number;
      }>;
    }>;
  }): Promise<WorkoutPlan> {
    const res = await apiClient.post('/workouts/plan/custom', payload);
    return res.data?.data;
  },

  async getExercises(filter?: { muscleGroup?: string; equipmentTag?: string; search?: string }): Promise<Exercise[]> {
    const res = await apiClient.get('/workouts/exercises', { params: filter });
    return res.data?.data || [];
  },

  async getExerciseById(id: string): Promise<Exercise> {
    const res = await apiClient.get(`/workouts/exercises/${id}`);
    return res.data?.data;
  },

  async logSession(sessionId: string, payload: { loggedExercises: any[]; rpe?: number; notes?: string }) {
    const res = await apiClient.post(`/workouts/sessions/${sessionId}/log`, payload);
    return res.data?.data;
  },

  async getHistory(): Promise<WorkoutSession[]> {
    const res = await apiClient.get('/workouts/history');
    return res.data?.data || [];
  },
};

export const nutritionService = {
  async getTodayPlan(): Promise<MealPlan> {
    const res = await apiClient.get('/meal-plans/today');
    return res.data?.data;
  },

  async generatePlan(dietType?: string): Promise<MealPlan> {
    const res = await apiClient.post('/meal-plans/generate', { dietType });
    return res.data?.data;
  },

  async logMeal(payload: { mealSlot: string; items: any[]; photoUrl?: string }) {
    const res = await apiClient.post('/meals', payload);
    return res.data?.data;
  },

  async getMeals(date?: string): Promise<{ meals: MealLog[]; totals: any }> {
    const res = await apiClient.get('/meals', { params: { date } });
    return res.data?.data || { meals: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } };
  },

  async updateMeal(id: string, items: any[]) {
    const res = await apiClient.put(`/meals/${id}`, { items });
    return res.data?.data;
  },

  async deleteMeal(id: string) {
    const res = await apiClient.delete(`/meals/${id}`);
    return res.data;
  },

  async recognizeMeal(imageUrl: string, imageBase64?: string) {
    const res = await apiClient.post('/meals/recognize', { imageUrl, imageBase64 });
    return res.data?.data;
  },

  async searchNutritionItems(query?: string, category?: string) {
    const res = await apiClient.get('/nutrition-items/search', { params: { query, category } });
    return res.data?.data || [];
  },
};

export const progressService = {
  async logWeight(weightKg: number, notes?: string): Promise<WeightLog> {
    const res = await apiClient.post('/progress/weight', { weightKg, notes });
    return res.data?.data;
  },

  async getWeightHistory(): Promise<WeightLog[]> {
    const res = await apiClient.get('/progress/weight');
    return res.data?.data || [];
  },

  async uploadPhoto(photoUrl: string, angle: 'front' | 'side' | 'back', notes?: string): Promise<ProgressPhoto> {
    const res = await apiClient.post('/progress/photos', { photoUrl, angle, notes });
    return res.data?.data;
  },

  async getPhotos(): Promise<{ all: ProgressPhoto[]; grouped: { front: ProgressPhoto[]; side: ProgressPhoto[]; back: ProgressPhoto[] } }> {
    const res = await apiClient.get('/progress/photos');
    return res.data?.data || { all: [], grouped: { front: [], side: [], back: [] } };
  },
};

export const dashboardService = {
  async getWeeklySummary(): Promise<DashboardSummary> {
    const res = await apiClient.get('/dashboard/weekly-summary');
    return res.data?.data;
  },
};

export const gamificationService = {
  async getStreak(): Promise<{ currentStreak: number; longestStreak: number }> {
    const res = await apiClient.get('/gamification/streak');
    return res.data?.data;
  },

  async getBadges(): Promise<Badge[]> {
    const res = await apiClient.get('/gamification/badges');
    return res.data?.data || [];
  },
};

export const notificationService = {
  async getPreferences() {
    const res = await apiClient.get('/notifications/preferences');
    return res.data?.data;
  },

  async updatePreferences(prefs: any) {
    const res = await apiClient.put('/notifications/preferences', prefs);
    return res.data?.data;
  },
};
