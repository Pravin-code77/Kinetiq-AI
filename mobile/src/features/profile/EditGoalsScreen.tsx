import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Check,
  Target,
  Sparkles,
} from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../app/theme/theme';
import { useAppStore } from '../../store/useAppStore';
import { authService } from '../../services/api';

const FITNESS_GOALS = [
  'Weight Loss',
  'Muscle Gain',
  'General Fitness',
  'Recomposition',
  'Endurance',
];

const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const ACTIVITY_LEVELS = [
  'Sedentary',
  'Lightly Active',
  'Moderately Active',
  'Very Active',
  'Extremely Active',
];

const EQUIPMENT_OPTIONS = ['No Equipment', 'Home Equipment', 'Full Gym'];

export const EditGoalsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { profile, updateProfileState, fetchDashboard } = useAppStore();

  const [weightKg, setWeightKg] = useState(profile?.weightKg ? profile.weightKg.toString() : '78');
  const [heightCm, setHeightCm] = useState(profile?.heightCm ? profile.heightCm.toString() : '180');
  const [fitnessGoal, setFitnessGoal] = useState<any>(profile?.fitnessGoal || 'Muscle Gain');
  const [fitnessLevel, setFitnessLevel] = useState<any>(profile?.fitnessLevel || 'Intermediate');
  const [activityLevel, setActivityLevel] = useState<any>(profile?.activityLevel || 'Moderately Active');
  const [equipmentAccess, setEquipmentAccess] = useState<any>(profile?.equipmentAccess || 'Home Equipment');
  const [daysPerWeek, setDaysPerWeek] = useState(profile?.daysPerWeek || 4);
  const [sessionMinutes, setSessionMinutes] = useState(profile?.sessionMinutes || 45);

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm);

    if (isNaN(w) || w <= 30 || w >= 300) {
      Alert.alert('Invalid Weight', 'Please provide a realistic weight in kg.');
      return;
    }

    if (isNaN(h) || h <= 100 || h >= 250) {
      Alert.alert('Invalid Height', 'Please provide a realistic height in cm.');
      return;
    }

    try {
      setSaving(true);
      const updatedProfile = await authService.updateProfile({
        weightKg: w,
        heightCm: h,
        fitnessGoal,
        fitnessLevel,
        activityLevel,
        equipmentAccess,
        daysPerWeek,
        sessionMinutes,
      });

      const updatedTargets = await authService.recalculateTargets();
      updateProfileState(updatedProfile, updatedTargets);
      await fetchDashboard();

      Alert.alert(
        'Calibration Complete',
        `Bio-metrics updated!\n• Calories: ${updatedTargets.calorieTarget} kcal\n• Protein: ${updatedTargets.proteinGrams}g\n• Carbs: ${updatedTargets.carbsGrams}g\n• Fat: ${updatedTargets.fatGrams}g`,
        [{ text: 'Great!', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Update Failed', err?.response?.data?.message || 'Could not update goals');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Fitness Goals</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Weight & Height Row */}
        <View style={styles.twoColRow}>
          <View style={styles.col}>
            <Text style={styles.inputLabel}>WEIGHT (KG)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={weightKg}
              onChangeText={setWeightKg}
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.inputLabel}>HEIGHT (CM)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={heightCm}
              onChangeText={setHeightCm}
            />
          </View>
        </View>

        {/* Primary Fitness Goal */}
        <Text style={styles.sectionHeading}>PRIMARY FITNESS GOAL</Text>
        <View style={styles.optionsWrap}>
          {FITNESS_GOALS.map((goal) => {
            const isSelected = fitnessGoal === goal;
            return (
              <TouchableOpacity
                key={goal}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => setFitnessGoal(goal)}
              >
                <Text style={[styles.optionCardText, isSelected && styles.optionCardTextSelected]}>
                  {goal}
                </Text>
                {isSelected && <Check size={16} color={COLORS.accentPrimary} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Activity Level */}
        <Text style={styles.sectionHeading}>DAILY ACTIVITY LEVEL</Text>
        <View style={styles.optionsWrap}>
          {ACTIVITY_LEVELS.map((lvl) => {
            const isSelected = activityLevel === lvl;
            return (
              <TouchableOpacity
                key={lvl}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => setActivityLevel(lvl)}
              >
                <Text style={[styles.optionCardText, isSelected && styles.optionCardTextSelected]}>
                  {lvl}
                </Text>
                {isSelected && <Check size={16} color={COLORS.accentPrimary} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Equipment Access */}
        <Text style={styles.sectionHeading}>EQUIPMENT ACCESS</Text>
        <View style={styles.optionsWrap}>
          {EQUIPMENT_OPTIONS.map((equip) => {
            const isSelected = equipmentAccess === equip;
            return (
              <TouchableOpacity
                key={equip}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => setEquipmentAccess(equip)}
              >
                <Text style={[styles.optionCardText, isSelected && styles.optionCardTextSelected]}>
                  {equip}
                </Text>
                {isSelected && <Check size={16} color={COLORS.accentPrimary} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Training Frequency */}
        <Text style={styles.sectionHeading}>DAYS PER WEEK</Text>
        <View style={styles.numbersRow}>
          {[2, 3, 4, 5, 6].map((num) => {
            const isSelected = daysPerWeek === num;
            return (
              <TouchableOpacity
                key={num}
                style={[styles.numBtn, isSelected && styles.numBtnSelected]}
                onPress={() => setDaysPerWeek(num)}
              >
                <Text style={[styles.numBtnText, isSelected && styles.numBtnTextSelected]}>
                  {num}d
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save & Recalculate Button */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.textInverse} />
          ) : (
            <>
              <Sparkles size={18} color={COLORS.textInverse} />
              <Text style={styles.saveBtnText}>Save & Recalculate Targets</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl * 2,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  col: {
    flex: 1,
  },
  inputLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accentSecondary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    padding: SPACING.md,
  },
  sectionHeading: {
    ...TYPOGRAPHY.caption,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  optionsWrap: {
    gap: 8,
    marginBottom: SPACING.md,
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  optionCardSelected: {
    borderColor: COLORS.accentPrimary,
    backgroundColor: COLORS.cardHover,
  },
  optionCardText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  optionCardTextSelected: {
    color: COLORS.textPrimary,
  },
  numbersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.xl,
  },
  numBtn: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  numBtnSelected: {
    backgroundColor: COLORS.accentPrimary,
    borderColor: COLORS.accentPrimary,
  },
  numBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  numBtnTextSelected: {
    color: COLORS.textInverse,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accentPrimary,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    marginTop: SPACING.lg,
  },
  saveBtnText: {
    color: COLORS.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
});
