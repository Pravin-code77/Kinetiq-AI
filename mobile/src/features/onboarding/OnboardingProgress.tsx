import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../app/theme/theme';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps?: number;
  title: string;
  subtitle?: string;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps = 6,
  title,
  subtitle,
}) => {
  return (
    <View style={styles.container}>
      {/* Progress Bars */}
      <View style={styles.barsRow}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.bar,
              index < currentStep && styles.barActive,
              index === currentStep - 1 && styles.barCurrent,
            ]}
          />
        ))}
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.stepCounter}>STEP {currentStep} OF {totalSteps}</Text>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  barsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING.lg,
  },
  bar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.full,
  },
  barActive: {
    backgroundColor: COLORS.accentPrimary,
  },
  barCurrent: {
    backgroundColor: COLORS.accentPrimary,
    shadowColor: COLORS.accentPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  textContainer: {
    marginTop: SPACING.xs,
  },
  stepCounter: {
    color: COLORS.accentPrimary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
});
