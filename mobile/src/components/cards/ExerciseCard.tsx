import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight, Dumbbell, Timer } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../../app/theme/theme';
import { Exercise } from '../../types';

interface ExerciseCardProps {
  exercise: Exercise;
  targetSets?: number;
  targetReps?: number;
  restSeconds?: number;
  onPress: () => void;
  showChevron?: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  targetSets = 3,
  targetReps = 12,
  restSeconds = 60,
  onPress,
  showChevron = true,
}) => {
  const defaultImg = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80';

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      <Image
        source={{ uri: exercise.imageUrl || defaultImg }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.tagRow}>
          <View style={styles.muscleBadge}>
            <Text style={styles.muscleText}>{exercise.muscleGroup}</Text>
          </View>
          <View style={styles.equipBadge}>
            <Text style={styles.equipText}>{exercise.equipmentTag}</Text>
          </View>
        </View>

        <Text style={styles.name} numberOfLines={1}>
          {exercise.name}
        </Text>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Dumbbell size={13} color={COLORS.accentPrimary} />
            <Text style={styles.detailText}>{targetSets} sets × {targetReps} reps</Text>
          </View>
          <View style={styles.detailItem}>
            <Timer size={13} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{restSeconds}s rest</Text>
          </View>
        </View>
      </View>

      {showChevron && (
        <View style={styles.chevronContainer}>
          <ChevronRight size={18} color={COLORS.textSecondary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.backgroundSecondary,
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  muscleBadge: {
    backgroundColor: 'rgba(183, 243, 107, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  muscleText: {
    color: COLORS.accentPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  equipBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  equipText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '500',
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  chevronContainer: {
    paddingLeft: SPACING.xs,
  },
});
