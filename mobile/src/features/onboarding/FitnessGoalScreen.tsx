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
import { Flame, Dumbbell, HeartPulse, Scale, Activity } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../../app/theme/theme';
import { getOnboardingState, updateOnboardingState } from './onboardingData';

export const FitnessGoalScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const current = getOnboardingState();
  const [goal, setGoal] = useState(current.fitnessGoal);

  const goalOptions = [
    {
      key: 'Weight Loss',
      title: 'Weight Loss',
      desc: 'Moderate 20% caloric deficit with calorie-burning HIIT and full-body circuits to preserve lean mass.',
      icon: <Flame size={24} color={COLORS.accentPrimary} />,
    },
    {
      key: 'Muscle Gain',
      title: 'Muscle Gain',
      desc: 'Controlled 12% surplus powering hypertrophic progressive overload across push/pull/legs splits.',
      icon: <Dumbbell size={24} color={COLORS.accentPrimary} />,
    },
    {
      key: 'General Fitness',
      title: 'General Fitness',
      desc: 'Balanced caloric maintenance prioritizing strength, cardiovascular stamina, and everyday vitality.',
      icon: <HeartPulse size={24} color={COLORS.accentPrimary} />,
    },
    {
      key: 'Recomposition',
      title: 'Body Recomposition',
      desc: 'Near-maintenance calories engineered for simultaneous fat reduction and lean muscle density.',
      icon: <Scale size={24} color={COLORS.accentPrimary} />,
    },
    {
      key: 'Endurance',
      title: 'Endurance & Stamina',
      desc: 'Higher carbohydrate distribution optimizing glycogen stores for prolonged athletic output.',
      icon: <Activity size={24} color={COLORS.accentPrimary} />,
    },
  ];

  const handleNext = () => {
    updateOnboardingState({ fitnessGoal: goal as any });
    navigation.navigate('OnboardingLevel');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <OnboardingProgress
          currentStep={2}
          title="Primary Goal"
          subtitle="Your primary objective dictates target caloric adjustments and workout split assignment."
        />

        <View style={styles.optionsList}>
          {goalOptions.map((opt) => {
            const isSelected = goal === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.goalCard, isSelected && styles.goalCardActive]}
                onPress={() => setGoal(opt.key as any)}
                activeOpacity={0.8}
              >
                <View style={styles.iconCircle}>{opt.icon}</View>
                <View style={styles.textCol}>
                  <Text style={[styles.goalTitle, isSelected && styles.goalTitleActive]}>
                    {opt.title}
                  </Text>
                  <Text style={styles.goalDesc}>{opt.desc}</Text>
                </View>
                <View style={[styles.checkCircle, isSelected && styles.checkCircleActive]}>
                  {isSelected && <View style={styles.checkDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <PrimaryButton
          title="Continue to Fitness Level"
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
  optionsList: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  goalCard: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  goalCardActive: {
    borderColor: COLORS.accentPrimary,
    backgroundColor: 'rgba(183, 243, 107, 0.08)',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(183, 243, 107, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  goalTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  goalTitleActive: {
    color: COLORS.accentPrimary,
  },
  goalDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    borderColor: COLORS.accentPrimary,
  },
  checkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accentPrimary,
  },
  nextButton: {
    marginTop: SPACING.sm,
  },
});
