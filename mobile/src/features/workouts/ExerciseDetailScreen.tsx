import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Dumbbell,
  Timer,
  Flame,
  CheckCircle,
  AlertCircle,
  Zap,
} from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../app/theme/theme';
import { workoutService } from '../../services/api';
import { Exercise } from '../../types';

export const ExerciseDetailScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { exerciseId, targetSets, targetReps, restSeconds } = route.params || {};

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [exerciseId]);

  const fetchDetail = async () => {
    if (!exerciseId) return;
    try {
      setLoading(true);
      const data = await workoutService.getExerciseById(exerciseId);
      setExercise(data);
    } catch (err) {
      console.warn('Exercise detail fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const defaultImg =
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accentPrimary} />
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Exercise not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* Scrollable details */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: exercise.imageUrl || defaultImg }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.imageGradientOverlay} />

          {/* Floating Back Button */}
          <TouchableOpacity
            style={styles.floatingBack}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <ChevronLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* Badge Row Overlay */}
          <View style={styles.imageBadgeRow}>
            <View style={styles.muscleBadge}>
              <Text style={styles.muscleBadgeText}>{exercise.muscleGroup.toUpperCase()}</Text>
            </View>
            <View style={styles.equipBadge}>
              <Text style={styles.equipBadgeText}>{exercise.equipmentTag}</Text>
            </View>
            <View style={styles.diffBadge}>
              <Text style={styles.diffBadgeText}>{exercise.difficulty}</Text>
            </View>
          </View>
        </View>

        {/* Content body */}
        <View style={styles.bodyContainer}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.exerciseDesc}>{exercise.description}</Text>

          {/* Quick Metrics Cards */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Dumbbell size={18} color={COLORS.accentPrimary} />
              <Text style={styles.metricValue}>
                {targetSets || exercise.defaultSets || 3} Sets
              </Text>
              <Text style={styles.metricLabel}>Recommended</Text>
            </View>

            <View style={styles.metricCard}>
              <Zap size={18} color={COLORS.accentSecondary} />
              <Text style={styles.metricValue}>
                {targetReps || exercise.defaultReps || 10} Reps
              </Text>
              <Text style={styles.metricLabel}>Per Set</Text>
            </View>

            <View style={styles.metricCard}>
              <Timer size={18} color={COLORS.accentGold} />
              <Text style={styles.metricValue}>
                {restSeconds || exercise.defaultRestSeconds || 60}s
              </Text>
              <Text style={styles.metricLabel}>Rest Period</Text>
            </View>

            <View style={styles.metricCard}>
              <Flame size={18} color={COLORS.warning} />
              <Text style={styles.metricValue}>
                {exercise.estimatedCaloriesPerMinute || 6} kcal
              </Text>
              <Text style={styles.metricLabel}>Per Minute</Text>
            </View>
          </View>

          {/* Technique Cues & Instructions */}
          <Text style={styles.sectionHeading}>STEP-BY-STEP TECHNIQUE</Text>

          <View style={styles.instructionsContainer}>
            {exercise.instructions && exercise.instructions.length > 0 ? (
              exercise.instructions.map((step, idx) => (
                <View key={idx} style={styles.stepRow}>
                  <View style={styles.stepNumberCircle}>
                    <Text style={styles.stepNumberText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.stepInstructionText}>{step}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noInstructionsText}>
                Perform exercise in a controlled cadence, focusing on full range of motion.
              </Text>
            )}
          </View>

          {/* Coaching Pro Tips */}
          <View style={styles.proTipCard}>
            <View style={styles.proTipHeader}>
              <CheckCircle size={18} color={COLORS.accentPrimary} />
              <Text style={styles.proTipTitle}>COACHING TIP</Text>
            </View>
            <Text style={styles.proTipText}>
              Inhale on the eccentric phase (lowering the weight) and exhale forcefully on the concentric phase (lifting). Maintain tension in your core throughout.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    marginBottom: SPACING.md,
  },
  backBtn: {
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  backBtnText: {
    color: COLORS.textPrimary,
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl * 2,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.backgroundSecondary,
  },
  imageGradientOverlay: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: 'rgba(16, 23, 19, 0.45)',
  },
  floatingBack: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 23, 19, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBadgeRow: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.lg,
    flexDirection: 'row',
    gap: 8,
  },
  muscleBadge: {
    backgroundColor: COLORS.accentPrimary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  muscleBadgeText: {
    color: COLORS.textInverse,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  equipBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  equipBadgeText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '600',
  },
  diffBadge: {
    backgroundColor: 'rgba(127, 214, 165, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  diffBadgeText: {
    color: COLORS.accentSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  bodyContainer: {
    padding: SPACING.xl,
  },
  exerciseName: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  exerciseDesc: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
  },
  metricValue: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 2,
  },
  metricLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  sectionHeading: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accentSecondary,
    letterSpacing: 1.5,
    marginBottom: SPACING.md,
  },
  instructionsContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  stepNumberCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(183, 243, 107, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: COLORS.accentPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  stepInstructionText: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 22,
  },
  noInstructionsText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
  proTipCard: {
    backgroundColor: COLORS.cardHover,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.borderNeon,
    padding: SPACING.lg,
  },
  proTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.xs,
  },
  proTipTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accentPrimary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  proTipText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
});
