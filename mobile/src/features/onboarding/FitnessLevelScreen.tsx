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
import { Award, Zap, Trophy } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../../app/theme/theme';
import { getOnboardingState, updateOnboardingState } from './onboardingData';

export const FitnessLevelScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const current = getOnboardingState();
  const [level, setLevel] = useState(current.fitnessLevel);

  const levelOptions = [
    {
      key: 'Beginner',
      title: 'Beginner Athlete',
      timeframe: 'Under 6 months regular training',
      desc: 'Focus on foundational movement mechanics, joint conditioning, and baseline work capacity with generous rest intervals.',
      icon: <Award size={24} color={COLORS.accentSecondary} />,
    },
    {
      key: 'Intermediate',
      title: 'Intermediate Athlete',
      timeframe: '6 months to 2 years consistent training',
      desc: 'Balanced volume and progressive overload targeting muscle hypertrophy, strength plateaus, and athletic conditioning.',
      icon: <Zap size={24} color={COLORS.accentPrimary} />,
    },
    {
      key: 'Advanced',
      title: 'Advanced / Elite Athlete',
      timeframe: '2+ years dedicated periodized lifting',
      desc: 'Higher training volume, specialized compound intensities, and optimized metabolic density to challenge elite neuromuscular adaptation.',
      icon: <Trophy size={24} color={COLORS.accentGold} />,
    },
  ];

  const handleNext = () => {
    updateOnboardingState({ fitnessLevel: level as any });
    navigation.navigate('OnboardingDiet');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <OnboardingProgress
          currentStep={3}
          title="Experience Level"
          subtitle="Sets, repetitions, and rest periods calibrate directly to your training background."
        />

        <View style={styles.optionsList}>
          {levelOptions.map((opt) => {
            const isSelected = level === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.levelCard, isSelected && styles.levelCardActive]}
                onPress={() => setLevel(opt.key as any)}
                activeOpacity={0.8}
              >
                <View style={styles.iconCircle}>{opt.icon}</View>
                <View style={styles.textCol}>
                  <Text style={[styles.levelTitle, isSelected && styles.levelTitleActive]}>
                    {opt.title}
                  </Text>
                  <Text style={styles.timeframe}>{opt.timeframe}</Text>
                  <Text style={styles.levelDesc}>{opt.desc}</Text>
                </View>
                <View style={[styles.checkCircle, isSelected && styles.checkCircleActive]}>
                  {isSelected && <View style={styles.checkDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <PrimaryButton
          title="Continue to Dietary Preferences"
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
  levelCard: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  levelCardActive: {
    borderColor: COLORS.accentPrimary,
    backgroundColor: 'rgba(183, 243, 107, 0.08)',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  textCol: {
    flex: 1,
  },
  levelTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  levelTitleActive: {
    color: COLORS.accentPrimary,
  },
  timeframe: {
    color: COLORS.accentSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  levelDesc: {
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
    marginTop: 4,
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
