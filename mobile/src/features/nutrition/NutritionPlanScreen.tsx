import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Utensils,
  Plus,
  Camera,
  RefreshCw,
  Flame,
  CheckCircle,
  Sparkles,
} from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../app/theme/theme';
import { useAppStore } from '../../store/useAppStore';
import { CalorieProgressCard } from '../../components/cards/CalorieProgressCard';
import { MacroProgressBar } from '../../components/cards/MacroProgressBar';
import { MealCard } from '../../components/cards/MealCard';
import { nutritionService } from '../../services/api';
import { PlannedMeal, MealLog } from '../../types';

export const NutritionPlanScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    todayMealPlan,
    fetchTodayMealPlan,
    todayLoggedMeals,
    fetchTodayMeals,
    dashboardSummary,
    fetchDashboard,
    dietary,
  } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchTodayMealPlan(), fetchTodayMeals(), fetchDashboard()]);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTodayMealPlan(), fetchTodayMeals(), fetchDashboard()]);
    setRefreshing(false);
  };

  const handleRegenerate = async () => {
    Alert.alert(
      'Regenerate Meal Plan',
      'Generate a fresh meal plan matching your macro goals and dietary preferences?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          style: 'default',
          onPress: async () => {
            try {
              setRegenerating(true);
              await nutritionService.generatePlan(dietary?.dietType || 'High Protein');
              await Promise.all([fetchTodayMealPlan(), fetchDashboard()]);
              Alert.alert('Success', 'Fresh smart meal plan generated!');
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Failed to generate meal plan');
            } finally {
              setRegenerating(false);
            }
          },
        },
      ]
    );
  };

  const handleLogPlannedMeal = async (meal: PlannedMeal) => {
    try {
      await nutritionService.logMeal({
        mealSlot: meal.slot,
        items: [
          {
            name: meal.name,
            portionGrams: Math.round(150 * (meal.portionScale || 1)),
            calories: meal.calories,
            protein: meal.protein,
            carbohydrates: meal.carbohydrates,
            fat: meal.fat,
          },
        ],
        photoUrl: meal.imageUrl,
      });

      await Promise.all([fetchTodayMeals(), fetchDashboard()]);
      Alert.alert('Meal Logged', `Logged ${meal.name} to ${meal.slot}!`);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Could not log meal');
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    Alert.alert('Remove Meal', 'Are you sure you want to remove this logged meal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await nutritionService.deleteMeal(mealId);
            await Promise.all([fetchTodayMeals(), fetchDashboard()]);
          } catch (err: any) {
            Alert.alert('Error', 'Could not delete meal');
          }
        },
      },
    ]);
  };

  const calories = dashboardSummary?.calories || {
    target: 2200,
    consumed: 0,
    remaining: 2200,
  };

  const macros = dashboardSummary?.macros || {
    protein: { consumed: 0, target: 160 },
    carbs: { consumed: 0, target: 220 },
    fat: { consumed: 0, target: 70 },
  };

  const plannedMeals = todayMealPlan?.meals || [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>NUTRITION & MACROS</Text>
          <Text style={styles.headerTitle}>
            {dietary?.dietType ? `${dietary.dietType} Plan` : 'Smart Nutrition'}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionIconButton}
            onPress={() => navigation.navigate('FoodScannerModal')}
            activeOpacity={0.8}
          >
            <Camera size={18} color={COLORS.accentPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionIconButton, styles.logIconButton]}
            onPress={() => navigation.navigate('FoodLogger')}
            activeOpacity={0.8}
          >
            <Plus size={18} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.accentPrimary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.accentPrimary}
              colors={[COLORS.accentPrimary]}
            />
          }
        >
          {/* Calorie Ring Progress Card */}
          <CalorieProgressCard
            consumed={calories.consumed}
            target={calories.target}
            remaining={calories.remaining}
          />

          {/* Macro Progress Bars */}
          <MacroProgressBar
            protein={macros.protein}
            carbs={macros.carbs}
            fat={macros.fat}
          />

          {/* Action Banner */}
          <View style={styles.quickLogBanner}>
            <TouchableOpacity
              style={styles.quickLogBtn}
              onPress={() => navigation.navigate('FoodLogger')}
              activeOpacity={0.8}
            >
              <Plus size={16} color={COLORS.textInverse} />
              <Text style={styles.quickLogBtnText}>Log Custom Food</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.scanBtn}
              onPress={() => navigation.navigate('FoodScannerModal')}
              activeOpacity={0.8}
            >
              <Camera size={16} color={COLORS.accentPrimary} />
              <Text style={styles.scanBtnText}>AI Photo Scanner</Text>
            </TouchableOpacity>
          </View>

          {/* Smart Meal Plan Section */}
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>SMART MEAL PLAN</Text>
              <Text style={styles.sectionSubtitle}>
                AI macro-balanced suggestions for today
              </Text>
            </View>

            <TouchableOpacity
              style={styles.regenerateBtn}
              onPress={handleRegenerate}
              disabled={regenerating}
            >
              {regenerating ? (
                <ActivityIndicator size="small" color={COLORS.accentPrimary} />
              ) : (
                <>
                  <RefreshCw size={13} color={COLORS.accentPrimary} />
                  <Text style={styles.regenerateText}>Regenerate</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {plannedMeals.length > 0 ? (
            plannedMeals.map((meal, idx) => (
              <MealCard
                key={`${meal.slot}-${idx}`}
                slot={meal.slot}
                name={meal.name}
                calories={meal.calories}
                protein={meal.protein}
                carbs={meal.carbohydrates}
                fat={meal.fat}
                imageUrl={meal.imageUrl}
                portionScale={meal.portionScale}
                onAddPress={() => handleLogPlannedMeal(meal)}
              />
            ))
          ) : (
            <View style={styles.emptyPlanCard}>
              <Sparkles size={32} color={COLORS.accentPrimary} />
              <Text style={styles.emptyPlanTitle}>No Meal Plan Generated</Text>
              <Text style={styles.emptyPlanSub}>
                Tap regenerate to create recipes fitted to your specific daily calorie and macro target.
              </Text>
              <TouchableOpacity
                style={styles.emptyGenBtn}
                onPress={handleRegenerate}
              >
                <Text style={styles.emptyGenText}>Generate Today's Plan</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Today's Logged Meals Section */}
          <View style={[styles.sectionHeaderRow, { marginTop: SPACING.xl }]}>
            <View>
              <Text style={styles.sectionTitle}>TODAY'S LOGGED FOODS</Text>
              <Text style={styles.sectionSubtitle}>
                {todayLoggedMeals.length} logged meals
              </Text>
            </View>
          </View>

          {todayLoggedMeals.length > 0 ? (
            todayLoggedMeals.map((log: MealLog) => (
              <MealCard
                key={log._id}
                slot={log.mealSlot}
                name={log.items.map((i) => i.name).join(', ') || 'Logged meal'}
                calories={log.totalCalories}
                protein={log.totalProtein}
                carbs={log.totalCarbs}
                fat={log.totalFat}
                imageUrl={log.photoUrl}
                isLogged={true}
                onDeletePress={() => handleDeleteMeal(log._id)}
              />
            ))
          ) : (
            <View style={styles.noLogsCard}>
              <Utensils size={24} color={COLORS.textMuted} />
              <Text style={styles.noLogsText}>
                No meals logged yet today. Tap + above or log from the meal plan to start tracking!
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    letterSpacing: 1.5,
    color: COLORS.accentSecondary,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  actionIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logIconButton: {
    backgroundColor: COLORS.accentPrimary,
    borderColor: COLORS.accentPrimary,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl * 2,
  },
  quickLogBanner: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginVertical: SPACING.md,
  },
  quickLogBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.accentPrimary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  quickLogBtnText: {
    color: COLORS.textInverse,
    fontSize: 13,
    fontWeight: '700',
  },
  scanBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.borderNeon,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  scanBtnText: {
    color: COLORS.accentPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.caption,
    letterSpacing: 1.5,
    color: COLORS.textSecondary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  regenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.borderNeon,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  regenerateText: {
    color: COLORS.accentPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  emptyPlanCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  emptyPlanTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyPlanSub: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.lg,
  },
  emptyGenBtn: {
    backgroundColor: COLORS.accentPrimary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  emptyGenText: {
    color: COLORS.textInverse,
    fontSize: 13,
    fontWeight: '700',
  },
  noLogsCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  noLogsText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
