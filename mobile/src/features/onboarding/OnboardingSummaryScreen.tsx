import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingProgress } from './OnboardingProgress';
import { PrimaryButton } from '../../components/common/Buttons';
import {
  Flame,
  Dumbbell,
  Utensils,
  ShieldCheck,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../../app/theme/theme';
import { getOnboardingState } from './onboardingData';
import { authService, workoutService, nutritionService } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';

export const OnboardingSummaryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const form = getOnboardingState();
  const { updateProfileState, fetchDashboard } = useAppStore();

  const [disclaimerAccepted, setDisclaimerAccepted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Mifflin-St Jeor formula calculation
  const bmrBase = 10 * form.weightKg + 6.25 * form.heightCm - 5 * form.age;
  const bmr = form.gender === 'male' ? Math.round(bmrBase + 5) : form.gender === 'female' ? Math.round(bmrBase - 161) : Math.round(bmrBase - 78);

  const activityMultipliers: Record<string, number> = {
    'Sedentary': 1.2,
    'Lightly Active': 1.375,
    'Moderately Active': 1.55,
    'Very Active': 1.725,
    'Extremely Active': 1.9,
  };
  const tdee = Math.round(bmr * (activityMultipliers[form.activityLevel] || 1.4));

  let calorieTarget = tdee;
  if (form.fitnessGoal === 'Weight Loss') {
    calorieTarget = Math.max(form.gender === 'female' ? 1200 : 1500, Math.round(tdee * 0.8));
  } else if (form.fitnessGoal === 'Muscle Gain') {
    calorieTarget = Math.round(tdee * 1.12);
  } else if (form.fitnessGoal === 'Recomposition') {
    calorieTarget = Math.round(tdee * 0.95);
  }

  // Scientific Macro Calculation (ISSN & ACSM Standards)
  const weightKg = Math.max(35, form.weightKg || 70);

  let proteinPerKg = 1.8;
  if (form.fitnessGoal === 'Muscle Gain') {
    proteinPerKg = 2.0;
  } else if (form.fitnessGoal === 'Weight Loss' || form.fitnessGoal === 'Recomposition') {
    proteinPerKg = 2.2;
  } else if (form.fitnessGoal === 'Endurance') {
    proteinPerKg = 1.6;
  }

  if (form.dietType === 'High Protein') {
    proteinPerKg = Math.min(2.4, proteinPerKg + 0.2);
  } else if (form.dietType === 'Keto') {
    proteinPerKg = 1.8;
  }

  let proteinGrams = Math.round(weightKg * proteinPerKg);
  if (proteinGrams * 4 > calorieTarget * 0.40) {
    proteinGrams = Math.round((calorieTarget * 0.35) / 4);
  }

  let fatGrams = 0;
  let carbsGrams = 0;

  if (form.dietType === 'Keto') {
    carbsGrams = 25;
    const remainingCals = calorieTarget - (proteinGrams * 4) - (carbsGrams * 4);
    fatGrams = Math.max(30, Math.round(remainingCals / 9));
  } else if (form.dietType === 'Low Carb') {
    fatGrams = Math.round((calorieTarget * 0.40) / 9);
    const remainingCals = calorieTarget - (proteinGrams * 4) - (fatGrams * 9);
    carbsGrams = Math.max(30, Math.round(remainingCals / 4));
  } else {
    const baseFatGrams = Math.round((calorieTarget * 0.25) / 9);
    const floorFatGrams = Math.round(weightKg * 0.75);
    fatGrams = Math.max(floorFatGrams, baseFatGrams);

    const usedCalories = (proteinGrams * 4) + (fatGrams * 9);
    const remainingCals = Math.max(0, calorieTarget - usedCalories);
    carbsGrams = Math.round(remainingCals / 4);
  }

  // Exact reconciliation so P*4 + C*4 + F*9 === calorieTarget
  const macroDiff = calorieTarget - ((proteinGrams * 4) + (carbsGrams * 4) + (fatGrams * 9));
  if (macroDiff !== 0) {
    if (form.dietType === 'Keto') {
      fatGrams += Math.round(macroDiff / 9);
    } else {
      carbsGrams += Math.round(macroDiff / 4);
    }
  }
  calorieTarget = (proteinGrams * 4) + (carbsGrams * 4) + (fatGrams * 9);

  let splitType = 'Full Body';
  if (form.daysPerWeek >= 5) splitType = 'Push / Pull / Legs';
  else if (form.daysPerWeek === 4) splitType = 'Upper / Lower';

  const handleFinish = async () => {
    if (!disclaimerAccepted) {
      setErrorMsg('Please acknowledge the health and fitness disclaimer');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Save profile and calculate backend targets
      const profileRes = await authService.updateProfile({
        age: form.age,
        gender: form.gender,
        heightCm: form.heightCm,
        weightKg: form.weightKg,
        fitnessLevel: form.fitnessLevel,
        fitnessGoal: form.fitnessGoal,
        activityLevel: form.activityLevel,
        equipmentAccess: form.equipmentAccess,
        sessionMinutes: form.sessionMinutes,
        daysPerWeek: form.daysPerWeek,
      });

      // 2. Save dietary preferences and medical exclusions
      await authService.updateDietaryPreferences({
        dietType: form.dietType,
        allergies: form.allergies,
        medicalFlags: form.medicalFlags,
      });

      // 3. Generate initial rules-based workout plan
      await workoutService.generatePlan({
        goal: form.fitnessGoal,
        level: form.fitnessLevel,
        equipment: form.equipmentAccess,
        duration: form.sessionMinutes,
        daysPerWeek: form.daysPerWeek,
      });

      // 4. Generate initial smart meal plan
      await nutritionService.generatePlan(form.dietType);

      // 5. Update state and refresh dashboard
      if (profileRes?.profile) {
        updateProfileState(profileRes.profile, profileRes.targets);
      }
      await fetchDashboard();

      // 6. Enter application — RootNavigator will switch to MainApp automatically
      // since hasCompletedOnboarding is now true from updateProfileState
    } catch (err: any) {
      console.error('Onboarding save error', err);
      setErrorMsg(
        err.response?.data?.message || 'Failed to initialize plans. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <OnboardingProgress
          currentStep={6}
          title="Plan Blueprint"
          subtitle="Review your calculated metabolic baseline and rules-based training blueprint."
        />

        {!!errorMsg && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Metabolic Calculations Card */}
        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <Flame size={20} color={COLORS.accentPrimary} />
            <Text style={styles.cardTitle}>Metabolic Calculations (Mifflin-St Jeor)</Text>
          </View>

          <View style={styles.twoColumnMetrics}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Basal Rate (BMR)</Text>
              <Text style={styles.metricValue}>{bmr} <Text style={styles.unit}>kcal</Text></Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Daily Energy (TDEE)</Text>
              <Text style={styles.metricValue}>{tdee} <Text style={styles.unit}>kcal</Text></Text>
            </View>
          </View>

          <View style={styles.targetBanner}>
            <Text style={styles.targetTitle}>CALCULATED DAILY TARGET</Text>
            <Text style={styles.targetCalories}>{calorieTarget} <Text style={styles.unitLg}>kcal / day</Text></Text>
            <Text style={styles.targetGoalNote}>
              Calibrated for {form.fitnessGoal} ({form.activityLevel} activity).
            </Text>
          </View>

          {/* Macro Breakdown Chips */}
          <View style={styles.macroRow}>
            <View style={styles.macroBox}>
              <Text style={styles.macroLabel}>PROTEIN</Text>
              <Text style={[styles.macroVal, { color: COLORS.accentPrimary }]}>{proteinGrams}g</Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={styles.macroLabel}>CARBS</Text>
              <Text style={[styles.macroVal, { color: COLORS.info }]}>{carbsGrams}g</Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={styles.macroLabel}>FATS</Text>
              <Text style={[styles.macroVal, { color: COLORS.warning }]}>{fatGrams}g</Text>
            </View>
          </View>
        </View>

        {/* Workout Split Blueprint Card */}
        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <Dumbbell size={20} color={COLORS.accentPrimary} />
            <Text style={styles.cardTitle}>Training Recommendation</Text>
          </View>

          <View style={styles.blueprintItem}>
            <Text style={styles.bpLabel}>Workout Split</Text>
            <Text style={styles.bpValue}>{splitType} ({form.daysPerWeek} days/week)</Text>
          </View>

          <View style={styles.blueprintItem}>
            <Text style={styles.bpLabel}>Equipment Mode</Text>
            <Text style={styles.bpValue}>{form.equipmentAccess}</Text>
          </View>

          <View style={styles.blueprintItem}>
            <Text style={styles.bpLabel}>Session Length</Text>
            <Text style={styles.bpValue}>~{form.sessionMinutes} minutes</Text>
          </View>

          {form.medicalFlags.length > 0 && (
            <View style={styles.blueprintItem}>
              <Text style={styles.bpLabel}>Excluded Flags</Text>
              <Text style={[styles.bpValue, { color: COLORS.warning }]}>
                {form.medicalFlags.join(', ')}
              </Text>
            </View>
          )}
        </View>

        {/* Nutrition Blueprint Card */}
        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <Utensils size={20} color={COLORS.accentPrimary} />
            <Text style={styles.cardTitle}>Nutrition Parameters</Text>
          </View>

          <View style={styles.blueprintItem}>
            <Text style={styles.bpLabel}>Dietary Pattern</Text>
            <Text style={styles.bpValue}>{form.dietType}</Text>
          </View>

          <View style={styles.blueprintItem}>
            <Text style={styles.bpLabel}>Allergen Filters</Text>
            <Text style={styles.bpValue}>
              {form.allergies.length > 0 ? form.allergies.join(', ') : 'None specified'}
            </Text>
          </View>
        </View>

        {/* Health Disclaimer Agreement */}
        <TouchableOpacity
          style={styles.disclaimerRow}
          onPress={() => setDisclaimerAccepted((p) => !p)}
          activeOpacity={0.8}
        >
          {disclaimerAccepted ? (
            <CheckSquare size={20} color={COLORS.accentPrimary} />
          ) : (
            <Square size={20} color={COLORS.textMuted} />
          )}
          <View style={styles.disclaimerTextCol}>
            <Text style={styles.disclaimerTitle}>Health & Fitness Disclaimer</Text>
            <Text style={styles.disclaimerDesc}>
              I confirm that I am participating in physical exercise voluntarily. Kinetiq AI outputs are algorithmic suggestions and do not substitute medical advice.
            </Text>
          </View>
        </TouchableOpacity>

        <PrimaryButton
          title="Generate My Plans & Launch App"
          onPress={handleFinish}
          loading={loading}
          icon={<Sparkles size={18} color={COLORS.textInverse} />}
          style={styles.finishButton}
        />
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
    padding: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  errorCard: {
    backgroundColor: COLORS.errorBackground,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.cardLg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  twoColumnMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  metricValue: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  unit: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '400',
  },
  targetBanner: {
    backgroundColor: 'rgba(183, 243, 107, 0.1)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  targetTitle: {
    color: COLORS.accentPrimary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  targetCalories: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    marginVertical: 2,
  },
  unitLg: {
    color: COLORS.accentPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  targetGoalNote: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  macroRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  macroBox: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  macroLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  macroVal: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  blueprintItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  bpLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  bpValue: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  disclaimerTextCol: {
    flex: 1,
  },
  disclaimerTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  disclaimerDesc: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  finishButton: {
    marginBottom: SPACING.lg,
  },
});
