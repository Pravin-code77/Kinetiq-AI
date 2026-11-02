import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Flame, Target, PieChart } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../../app/theme/theme';

interface CalorieProgressCardProps {
  consumed: number;
  target: number;
  remaining: number;
}

export const CalorieProgressCard: React.FC<CalorieProgressCardProps> = ({
  consumed,
  target,
  remaining,
}) => {
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const validTarget = Math.max(1, target || 2000);
  const percentage = Math.min(100, Math.round((consumed / validTarget) * 100));
  const strokeDashoffset = circumference - (circumference * Math.min(1, consumed / validTarget));

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Flame size={20} color={COLORS.accentPrimary} />
          <Text style={styles.cardTitle}>Daily Calorie Tracker</Text>
        </View>
        <View style={styles.pctBadge}>
          <Text style={styles.pctText}>{percentage}%</Text>
        </View>
      </View>

      <View style={styles.bodyContainer}>
        {/* SVG Circular Ring */}
        <View style={styles.ringWrapper}>
          <Svg width={size} height={size}>
            {/* Background Track */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={COLORS.border}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Animated Progress Ring */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={COLORS.accentPrimary}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          <View style={styles.centerTextContainer}>
            <Text style={styles.centerNumber}>{remaining}</Text>
            <Text style={styles.centerLabel}>KCAL LEFT</Text>
          </View>
        </View>

        {/* Breakdown Stats */}
        <View style={styles.statsColumn}>
          <View style={styles.statBox}>
            <View style={styles.statIconRow}>
              <View style={[styles.dot, { backgroundColor: COLORS.accentSecondary }]} />
              <Text style={styles.statLabel}>Consumed</Text>
            </View>
            <Text style={styles.statValue}>{consumed} <Text style={styles.statUnit}>kcal</Text></Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statBox}>
            <View style={styles.statIconRow}>
              <View style={[styles.dot, { backgroundColor: COLORS.textMuted }]} />
              <Text style={styles.statLabel}>Target</Text>
            </View>
            <Text style={styles.statValue}>{target} <Text style={styles.statUnit}>kcal</Text></Text>
          </View>
        </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  pctBadge: {
    backgroundColor: 'rgba(183, 243, 107, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  pctText: {
    color: COLORS.accentPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  bodyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: SPACING.xs,
  },
  ringWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerNumber: {
    color: COLORS.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  centerLabel: {
    color: COLORS.accentPrimary,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 1,
  },
  statsColumn: {
    flex: 1,
    paddingLeft: SPACING.xl,
    justifyContent: 'center',
  },
  statBox: {
    marginVertical: SPACING.xs,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  statUnit: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
});
