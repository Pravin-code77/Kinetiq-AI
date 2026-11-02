import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../app/theme/theme';

interface MacroItem {
  label: string;
  consumed: number;
  target: number;
  color: string;
}

interface MacroProgressBarProps {
  protein: { consumed: number; target: number };
  carbs: { consumed: number; target: number };
  fat: { consumed: number; target: number };
}

export const MacroProgressBar: React.FC<MacroProgressBarProps> = ({
  protein,
  carbs,
  fat,
}) => {
  const items: MacroItem[] = [
    {
      label: 'Protein',
      consumed: protein.consumed,
      target: protein.target || 150,
      color: COLORS.accentPrimary,
    },
    {
      label: 'Carbohydrates',
      consumed: carbs.consumed,
      target: carbs.target || 200,
      color: COLORS.info,
    },
    {
      label: 'Fats',
      consumed: fat.consumed,
      target: fat.target || 65,
      color: COLORS.warning,
    },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Macronutrient Breakdown</Text>
      <View style={styles.rowsContainer}>
        {items.map((item, idx) => {
          const validTarget = Math.max(1, item.target);
          const ratio = Math.min(1, item.consumed / validTarget);
          const pct = Math.round((item.consumed / validTarget) * 100);

          return (
            <View key={item.label} style={[styles.macroRow, idx !== items.length - 1 && styles.rowDivider]}>
              <View style={styles.labelRow}>
                <View style={styles.nameIndicator}>
                  <View style={[styles.colorBadge, { backgroundColor: item.color }]} />
                  <Text style={styles.macroName}>{item.label}</Text>
                </View>
                <Text style={styles.macroGrams}>
                  <Text style={[styles.consumedText, { color: item.color }]}>{item.consumed}g</Text>
                  <Text style={styles.targetText}> / {item.target}g ({pct}%)</Text>
                </Text>
              </View>

              {/* Progress bar track */}
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: item.color,
                      width: `${Math.max(2, ratio * 100)}%`,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.cardLg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  rowsContainer: {
    gap: SPACING.md,
  },
  macroRow: {
    paddingVertical: 2,
  },
  rowDivider: {
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  nameIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  macroName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  macroGrams: {
    fontSize: 13,
  },
  consumedText: {
    fontWeight: '700',
  },
  targetText: {
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  barTrack: {
    height: 8,
    backgroundColor: COLORS.backgroundPrimary,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
});
