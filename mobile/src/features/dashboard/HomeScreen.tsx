import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame, Dumbbell, Sparkles, User, Calendar, ArrowRight } from 'lucide-react-native';
import { CalorieProgressCard } from '../../components/cards/CalorieProgressCard';
import { MacroProgressBar } from '../../components/cards/MacroProgressBar';
import { WorkoutCard } from '../../components/cards/WorkoutCard';
import { MealCard } from '../../components/cards/MealCard';
import { SectionHeader } from '../../components/common/SectionHeader';
import { COLORS, RADIUS, SPACING } from '../../app/theme/theme';
import { useAppStore } from '../../store/useAppStore';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    user,
    profile,
    dashboardSummary,
    fetchDashboard,
    setActiveSession,
    currentWorkoutPlan,
    fetchWorkoutPlan,
    todayMealPlan,
    fetchTodayMealPlan,
  } = useAppStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchWorkoutPlan();
    fetchTodayMealPlan();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboard(), fetchWorkoutPlan(), fetchTodayMealPlan()]);
    setRefreshing(false);
  };

  const athleteName = user?.name || dashboardSummary?.user?.name || 'Athlete';
  const fitnessGoal = profile?.fitnessGoal || dashboardSummary?.user?.fitnessGoal || 'General Fitness';
  const currentStreak = dashboardSummary?.user?.streak || 0;

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

  const todayWorkout = dashboardSummary?.todayWorkout;
  const insights = dashboardSummary?.insights || [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accentPrimary}
            colors={[COLORS.accentPrimary]}
          />
        }
      >
        {/* Header with Greeting & Streak */}
        <View style={styles.topHeader}>
          <View style={styles.greetingCol}>
            <Text style={styles.greetingSub}>WELCOME BACK</Text>
            <Text style={styles.athleteTitle}>{athleteName}</Text>
            <View style={styles.goalPill}>
              <Text style={styles.goalText}>{fitnessGoal.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.headerRightCol}>
            {/* Streak Pill */}
            <View style={styles.streakPill}>
              <Flame size={18} color={COLORS.accentGold} fill={COLORS.accentGold} />
              <Text style={styles.streakNumber}>{currentStreak}</Text>
              <Text style={styles.streakLabel}>DAYS</Text>
            </View>
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => navigation.navigate('ProfileTab')}
              activeOpacity={0.8}
            >
              <User size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dynamic Insights Banner */}
        {insights.length > 0 && (
          <View style={styles.insightBanner}>
            <Sparkles size={18} color={COLORS.accentPrimary} />
            <Text style={styles.insightText}>{insights[0]}</Text>
          </View>
        )}

        {/* Calorie Progress Ring */}
        <CalorieProgressCard
          consumed={calories.consumed}
          target={calories.target}
          remaining={calories.remaining}
        />

        {/* Macronutrient Breakdown */}
        <MacroProgressBar
          protein={macros.protein}
          carbs={macros.carbs}
          fat={macros.fat}
        />

        {/* Today's Workout Section */}
        <SectionHeader
          title="Today's Workout"
          subtitle="Adaptive training calibrated to your weekly split"
          actionText="View All Workouts"
          onActionPress={() => navigation.navigate('WorkoutsTab')}
        />

        {todayWorkout ? (
          <WorkoutCard
            title={todayWorkout.name}
            focusArea={todayWorkout.focusArea}
            durationMinutes={todayWorkout.duration}
            caloriesBurn={todayWorkout.caloriesBurn}
            exerciseCount={todayWorkout.exerciseCount}
            completed={todayWorkout.completed}
            onPress={() => {
              setActiveSession(todayWorkout as any);
              navigation.navigate('ActiveWorkout', { sessionId: todayWorkout._id });
            }}
            onStartPress={() => {
              setActiveSession(todayWorkout as any);
              navigation.navigate('ActiveWorkout', { sessionId: todayWorkout._id });
            }}
          />
        ) : (
          <View style={styles.restDayCard}>
            <Calendar size={28} color={COLORS.accentSecondary} />
            <View style={styles.restDayTextCol}>
              <Text style={styles.restDayTitle}>Active Recovery Day</Text>
              <Text style={styles.restDayDesc}>
                No heavy lifting scheduled today. Focus on mobility, hydration, and hitting your protein target.
              </Text>
            </View>
          </View>
        )}

        {/* Today's Meal Plan Preview Section */}
        <SectionHeader
          title="Today's Meal Plan"
          subtitle="Nutritional suggestions matching your calorie & macro goals"
          actionText="Open Meal Planner"
          onActionPress={() => navigation.navigate('NutritionTab')}
        />

        {todayMealPlan?.meals && todayMealPlan.meals.length > 0 ? (
          todayMealPlan.meals.slice(0, 3).map((meal, idx) => (
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
              onPress={() => navigation.navigate('NutritionTab')}
            />
          ))
        ) : (
          <TouchableOpacity
            style={styles.generateMealsPrompt}
            onPress={() => navigation.navigate('NutritionTab')}
            activeOpacity={0.8}
          >
            <Text style={styles.generateMealsText}>Tap to generate your smart meal plan</Text>
            <ArrowRight size={16} color={COLORS.accentPrimary} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxxl,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  greetingCol: {
    flex: 1,
  },
  greetingSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  athleteTitle: {
    color: COLORS.textPrimary,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginVertical: 2,
  },
  goalPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(183, 243, 107, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginTop: 2,
  },
  goalText: {
    color: COLORS.accentPrimary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerRightCol: {
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(243, 211, 107, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(243, 211, 107, 0.3)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  streakNumber: {
    color: COLORS.accentGold,
    fontSize: 16,
    fontWeight: '800',
  },
  streakLabel: {
    color: COLORS.accentGold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(183, 243, 107, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(183, 243, 107, 0.25)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  insightText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  restDayCard: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  restDayTextCol: {
    flex: 1,
  },
  restDayTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  restDayDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  generateMealsPrompt: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  generateMealsText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
