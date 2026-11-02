import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, Flame, Dumbbell, Play, CheckCircle2 } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../../app/theme/theme';

interface WorkoutCardProps {
  title: string;
  focusArea: string;
  durationMinutes: number;
  caloriesBurn: number;
  exerciseCount: number;
  completed?: boolean;
  onPress: () => void;
  onStartPress?: () => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  title,
  focusArea,
  durationMinutes,
  caloriesBurn,
  exerciseCount,
  completed = false,
  onPress,
  onStartPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.card, completed && styles.completedCard]}
    >
      <View style={styles.topRow}>
        <View style={styles.focusBadge}>
          <Text style={styles.focusText}>{focusArea.toUpperCase()}</Text>
        </View>
        {completed ? (
          <View style={styles.completedBadge}>
            <CheckCircle2 size={16} color={COLORS.success} />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        ) : (
          <View style={styles.readyBadge}>
            <Text style={styles.readyText}>Scheduled</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Clock size={15} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>{durationMinutes} mins</Text>
        </View>

        <View style={styles.metaDivider} />

        <View style={styles.metaItem}>
          <Flame size={15} color={COLORS.accentPrimary} />
          <Text style={styles.metaText}>{caloriesBurn} kcal</Text>
        </View>

        <View style={styles.metaDivider} />

        <View style={styles.metaItem}>
          <Dumbbell size={15} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>{exerciseCount} exercises</Text>
        </View>
      </View>

      {!completed && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onStartPress || onPress}
          style={styles.startButton}
        >
          <Play size={16} color={COLORS.textInverse} fill={COLORS.textInverse} />
          <Text style={styles.startText}>Start Workout</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  completedCard: {
    borderColor: 'rgba(165, 232, 135, 0.4)',
    backgroundColor: '#18241D',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  focusBadge: {
    backgroundColor: 'rgba(183, 243, 107, 0.12)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  focusText: {
    color: COLORS.accentPrimary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  readyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  readyText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(165, 232, 135, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  completedText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SPACING.md,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  startButton: {
    backgroundColor: COLORS.accentPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    shadowColor: COLORS.accentPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  startText: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
