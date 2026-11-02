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
import { InputField } from '../../components/common/InputField';
import { PrimaryButton } from '../../components/common/Buttons';
import { COLORS, RADIUS, SPACING } from '../../app/theme/theme';
import { getOnboardingState, updateOnboardingState } from './onboardingData';

export const PersonalInfoScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const current = getOnboardingState();

  const [age, setAge] = useState(String(current.age));
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(current.gender);
  const [heightCm, setHeightCm] = useState(String(current.heightCm));
  const [weightKg, setWeightKg] = useState(String(current.weightKg));
  const [activityLevel, setActivityLevel] = useState(current.activityLevel);

  const activityOptions = [
    { key: 'Sedentary', title: 'Sedentary', desc: 'Desk job, minimal physical activity' },
    { key: 'Lightly Active', title: 'Lightly Active', desc: 'Light exercise 1-3 days per week' },
    { key: 'Moderately Active', title: 'Moderately Active', desc: 'Moderate exercise 3-5 days per week' },
    { key: 'Very Active', title: 'Very Active', desc: 'Hard training 6-7 days per week' },
    { key: 'Extremely Active', title: 'Extremely Active', desc: 'Athletic endurance training or physical labor' },
  ];

  const handleNext = () => {
    updateOnboardingState({
      age: parseInt(age) || 25,
      gender,
      heightCm: parseFloat(heightCm) || 175,
      weightKg: parseFloat(weightKg) || 70,
      activityLevel: activityLevel as any,
    });
    navigation.navigate('OnboardingGoal');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <OnboardingProgress
          currentStep={1}
          title="About You"
          subtitle="Your metrics power the Mifflin-St Jeor metabolic equations for basal expenditure."
        />

        {/* Gender Selection */}
        <Text style={styles.sectionLabel}>BIOLOGICAL GENDER</Text>
        <View style={styles.genderRow}>
          {(['male', 'female', 'other'] as const).map((g) => {
            const isSelected = gender === g;
            return (
              <TouchableOpacity
                key={g}
                style={[styles.genderCard, isSelected && styles.genderCardActive]}
                onPress={() => setGender(g)}
                activeOpacity={0.8}
              >
                <Text style={[styles.genderText, isSelected && styles.genderTextActive]}>
                  {g === 'male' ? 'Male' : g === 'female' ? 'Female' : 'Other'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Numerical Metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metricHalf}>
            <InputField
              label="Age (Years)"
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              placeholder="26"
            />
          </View>
          <View style={styles.metricHalf}>
            <InputField
              label="Height (cm)"
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="numeric"
              placeholder="175"
            />
          </View>
        </View>

        <InputField
          label="Current Weight (kg)"
          value={weightKg}
          onChangeText={setWeightKg}
          keyboardType="numeric"
          placeholder="74"
        />

        {/* Activity Level Selector */}
        <Text style={styles.sectionLabel}>DAILY ACTIVITY LEVEL</Text>
        <View style={styles.activityList}>
          {activityOptions.map((opt) => {
            const isSelected = activityLevel === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.activityCard, isSelected && styles.activityCardActive]}
                onPress={() => setActivityLevel(opt.key as any)}
                activeOpacity={0.8}
              >
                <View style={styles.activityHeader}>
                  <Text style={[styles.activityTitle, isSelected && styles.activityTitleActive]}>
                    {opt.title}
                  </Text>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </View>
                <Text style={styles.activityDesc}>{opt.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <PrimaryButton
          title="Continue to Fitness Goals"
          onPress={handleNext}
          style={styles.nextButton}
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
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  genderRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  genderCard: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  genderCardActive: {
    borderColor: COLORS.accentPrimary,
    backgroundColor: 'rgba(183, 243, 107, 0.08)',
  },
  genderText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  genderTextActive: {
    color: COLORS.accentPrimary,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  metricHalf: {
    flex: 1,
  },
  activityList: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  activityCard: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  activityCardActive: {
    borderColor: COLORS.accentPrimary,
    backgroundColor: 'rgba(183, 243, 107, 0.06)',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  activityTitleActive: {
    color: COLORS.accentPrimary,
  },
  activityDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: COLORS.accentPrimary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accentPrimary,
  },
  nextButton: {
    marginTop: SPACING.md,
  },
});
