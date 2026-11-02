import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Dumbbell,
  Calendar,
  Flame,
  Clock,
  RefreshCw,
  CheckCircle,
  Play,
  ChevronRight,
  Info,
  Plus,
  Sparkles,
  RotateCcw,
  Sliders,
} from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../app/theme/theme';
import { useAppStore } from '../../store/useAppStore';
import { ExerciseCard } from '../../components/cards/ExerciseCard';
import { PrimaryButton } from '../../components/common/Buttons';
import { workoutService } from '../../services/api';
import { WorkoutSession } from '../../types';
import { CustomWorkoutPlanModal } from './CustomWorkoutPlanModal';

export const WorkoutPlanScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    currentWorkoutPlan,
    fetchWorkoutPlan,
    setActiveSession,
    profile,
  } = useAppStore();

  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [customModalVisible, setCustomModalVisible] = useState(false);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    setLoading(true);
    await fetchWorkoutPlan();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWorkoutPlan();
    setRefreshing(false);
  };

  const handleRegenerate = async () => {
    Alert.alert(
      'Regenerate Workout Plan',
      'Generate a fresh, adaptive plan aligned with your latest fitness goal and equipment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'default',
          onPress: async () => {
            try {
              setRegenerating(true);
              await workoutService.generatePlan({
                goal: profile?.fitnessGoal,
                level: profile?.fitnessLevel,
                equipment: profile?.equipmentAccess,
                daysPerWeek: profile?.daysPerWeek || 4,
              });
              await fetchWorkoutPlan();
              Alert.alert('Success', 'New adaptive workout plan generated!');
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Failed to regenerate plan');
            } finally {
              setRegenerating(false);
            }
          },
        },
      ]
    );
  };

  const handleRestoreDefaultPlan = async () => {
    Alert.alert(
      'Switch to Default (AI) Plan',
      'This will switch your active workout plan back to the default AI-recommended plan tailored to your profile. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch to Default',
          style: 'default',
          onPress: async () => {
            try {
              setRegenerating(true);
              await workoutService.generatePlan({
                goal: profile?.fitnessGoal,
                level: profile?.fitnessLevel,
                equipment: profile?.equipmentAccess,
                daysPerWeek: profile?.daysPerWeek || 4,
              });
              await fetchWorkoutPlan();
              Alert.alert('Default Plan Active', 'Switched back to your AI adaptive workout plan.');
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Failed to restore default plan');
            } finally {
              setRegenerating(false);
            }
          },
        },
      ]
    );
  };

  const isCustomPlan = Boolean(currentWorkoutPlan?.isCustom);
  const sessions = currentWorkoutPlan?.sessions || [];
  const currentSession: WorkoutSession | undefined = sessions.find(
    (s) => s.dayOfWeek === selectedDay
  );

  const daysLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerSubtitle}>
            {isCustomPlan ? '★ CUSTOM WORKOUT PLAN' : 'WORKOUT SCHEDULE'}
          </Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {isCustomPlan
              ? currentWorkoutPlan?.customName || 'Custom Plan'
              : currentWorkoutPlan?.splitType || 'Adaptive Training'}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.customPlanButton}
            onPress={() => setCustomModalVisible(true)}
            activeOpacity={0.8}
          >
            <Plus size={14} color={COLORS.textInverse} />
            <Text style={styles.customPlanButtonText}>Custom</Text>
          </TouchableOpacity>

          {isCustomPlan ? (
            <TouchableOpacity
              style={styles.revertButton}
              onPress={handleRestoreDefaultPlan}
              disabled={regenerating}
              activeOpacity={0.8}
            >
              {regenerating ? (
                <ActivityIndicator size="small" color={COLORS.accentSecondary} />
              ) : (
                <>
                  <RotateCcw size={13} color={COLORS.accentSecondary} />
                  <Text style={styles.revertButtonText}>Default</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.regenerateButton}
              onPress={handleRegenerate}
              disabled={regenerating}
            >
              {regenerating ? (
                <ActivityIndicator size="small" color={COLORS.accentPrimary} />
              ) : (
                <>
                  <RefreshCw size={13} color={COLORS.accentPrimary} />
                  <Text style={styles.regenerateText}>AI Reset</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Plan Mode Banner */}
      <View style={styles.bannerContainer}>
        <View
          style={[
            styles.bannerBadge,
            isCustomPlan ? styles.bannerBadgeCustom : styles.bannerBadgeDefault,
          ]}
        >
          {isCustomPlan ? (
            <Sparkles size={12} color={COLORS.accentGold} />
          ) : (
            <Dumbbell size={12} color={COLORS.accentPrimary} />
          )}
          <Text
            style={[
              styles.bannerBadgeText,
              isCustomPlan ? styles.bannerBadgeTextCustom : styles.bannerBadgeTextDefault,
            ]}
          >
            {isCustomPlan ? 'Custom Plan Active' : 'Default AI Plan Active'}
          </Text>
        </View>

        <Text style={styles.bannerDescription}>
          {isCustomPlan
            ? 'You are following your personalized custom workout plan. You can tweak it or switch back anytime.'
            : 'Generated by Kinetiq AI based on your profile. You can also build your own custom plan.'}
        </Text>
      </View>

      {/* Weekday Selector */}
      <View style={styles.daysBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysBar}
        >
          {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
            const hasSession = sessions.some((s) => s.dayOfWeek === dayNum);
            const isCompleted = sessions.find((s) => s.dayOfWeek === dayNum)?.completed;
            const isSelected = selectedDay === dayNum;

            return (
              <TouchableOpacity
                key={dayNum}
                onPress={() => setSelectedDay(dayNum)}
                activeOpacity={0.8}
                style={[
                  styles.dayTab,
                  isSelected && styles.dayTabSelected,
                ]}
              >
                <Text
                  style={[
                    styles.dayTabLabel,
                    isSelected && styles.dayTabLabelSelected,
                  ]}
                >
                  {daysLabels[dayNum - 1]}
                </Text>
                <Text
                  style={[
                    styles.dayTabNumber,
                    isSelected && styles.dayTabNumberSelected,
                  ]}
                >
                  D{dayNum}
                </Text>

                {isCompleted ? (
                  <View style={styles.completedDot}>
                    <CheckCircle size={10} color={COLORS.success} />
                  </View>
                ) : hasSession ? (
                  <View
                    style={[
                      styles.sessionIndicatorDot,
                      isSelected && styles.sessionIndicatorDotActive,
                    ]}
                  />
                ) : (
                  <View style={styles.restIndicatorDot} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content Area */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.accentPrimary} />
        </View>
      ) : (
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.accentPrimary}
              colors={[COLORS.accentPrimary]}
            />
          }
        >
          {currentSession ? (
            <View>
              {/* Session Overview Card */}
              <View style={styles.sessionCard}>
                <View style={styles.sessionCardHeader}>
                  <View style={styles.focusBadge}>
                    <Text style={styles.focusBadgeText}>
                      {currentSession.focusArea.toUpperCase()}
                    </Text>
                  </View>
                  {currentSession.completed && (
                    <View style={styles.completedBadge}>
                      <CheckCircle size={13} color={COLORS.success} />
                      <Text style={styles.completedBadgeText}>COMPLETED</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.sessionTitle}>{currentSession.sessionName}</Text>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Clock size={16} color={COLORS.accentSecondary} />
                    <Text style={styles.statText}>
                      {currentSession.estimatedDuration} mins
                    </Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Flame size={16} color={COLORS.accentGold} />
                    <Text style={styles.statText}>
                      ~{currentSession.estimatedCalories} kcal
                    </Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Dumbbell size={16} color={COLORS.accentPrimary} />
                    <Text style={styles.statText}>
                      {currentSession.exercises?.length || 0} exercises
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.startSessionButton}
                  activeOpacity={0.85}
                  onPress={() => {
                    setActiveSession(currentSession);
                    navigation.navigate('ActiveWorkout', { sessionId: currentSession._id });
                  }}
                >
                  <Play size={18} color={COLORS.textInverse} fill={COLORS.textInverse} />
                  <Text style={styles.startSessionText}>
                    {currentSession.completed ? 'Repeat Workout' : 'Start Workout Tracker'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Exercise List */}
              <View style={styles.exercisesHeaderRow}>
                <Text style={styles.sectionHeading}>EXERCISES</Text>
                <Text style={styles.exerciseCountText}>
                  {currentSession.exercises?.length || 0} Items
                </Text>
              </View>

              {currentSession.exercises?.map((item, index) => {
                const exerciseObj = item.exerciseId;
                if (!exerciseObj) return null;

                return (
                  <ExerciseCard
                    key={`${exerciseObj._id}-${index}`}
                    exercise={exerciseObj}
                    targetSets={item.targetSets}
                    targetReps={item.targetReps}
                    restSeconds={item.restSeconds}
                    onPress={() =>
                      navigation.navigate('ExerciseDetail', {
                        exerciseId: exerciseObj._id,
                        targetSets: item.targetSets,
                        targetReps: item.targetReps,
                        restSeconds: item.restSeconds,
                      })
                    }
                  />
                );
              })}
            </View>
          ) : (
            /* Rest Day State */
            <View style={styles.restDayContainer}>
              <View style={styles.restDayIconCircle}>
                <Calendar size={36} color={COLORS.accentSecondary} />
              </View>
              <Text style={styles.restDayHeading}>Active Recovery Day</Text>
              <Text style={styles.restDaySubtext}>
                Muscles repair and grow during rest periods. Take time to stretch, hydrate,
                and maintain your macro targets today.
              </Text>

              <View style={styles.recoveryTipsCard}>
                <View style={styles.tipRow}>
                  <Info size={16} color={COLORS.accentPrimary} />
                  <Text style={styles.tipText}>Drink at least 2.5 - 3 liters of water</Text>
                </View>
                <View style={styles.tipRow}>
                  <Info size={16} color={COLORS.accentPrimary} />
                  <Text style={styles.tipText}>
                    15–20 minutes of light mobility or walking
                  </Text>
                </View>
                <View style={styles.tipRow}>
                  <Info size={16} color={COLORS.accentPrimary} />
                  <Text style={styles.tipText}>Ensure you meet your daily protein goal</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Custom Workout Plan Builder Modal */}
      <CustomWorkoutPlanModal
        visible={customModalVisible}
        onClose={() => setCustomModalVisible(false)}
        onPlanCreated={loadPlan}
        initialSplitType={currentWorkoutPlan?.splitType}
        initialGoal={profile?.fitnessGoal}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    letterSpacing: 1.5,
    color: COLORS.accentSecondary,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.accentPrimary,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
  },
  customPlanButtonText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  revertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.accentSecondary,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
  },
  revertButtonText: {
    color: COLORS.accentSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  bannerContainer: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginBottom: 6,
  },
  bannerBadgeCustom: {
    backgroundColor: '#352C16',
    borderWidth: 1,
    borderColor: COLORS.accentGold,
  },
  bannerBadgeDefault: {
    backgroundColor: COLORS.cardHover,
    borderWidth: 1,
    borderColor: COLORS.borderNeon,
  },
  bannerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bannerBadgeTextCustom: {
    color: COLORS.accentGold,
  },
  bannerBadgeTextDefault: {
    color: COLORS.accentPrimary,
  },
  bannerDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.borderNeon,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
  },
  regenerateText: {
    color: COLORS.accentPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  daysBarContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
  },
  daysBar: {
    paddingHorizontal: SPACING.xl,
    gap: 8,
  },
  dayTab: {
    width: 54,
    height: 70,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayTabSelected: {
    backgroundColor: COLORS.cardHover,
    borderColor: COLORS.accentPrimary,
  },
  dayTabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  dayTabLabelSelected: {
    color: COLORS.accentPrimary,
  },
  dayTabNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  dayTabNumberSelected: {
    color: COLORS.textPrimary,
  },
  sessionIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textMuted,
    marginTop: 6,
  },
  sessionIndicatorDotActive: {
    backgroundColor: COLORS.accentPrimary,
  },
  restIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
    marginTop: 6,
  },
  completedDot: {
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl * 2,
  },
  sessionCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  focusBadge: {
    backgroundColor: 'rgba(183, 243, 107, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  focusBadgeText: {
    color: COLORS.accentPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.successBackground,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  completedBadgeText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: '700',
  },
  sessionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.border,
  },
  startSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accentPrimary,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  startSessionText: {
    color: COLORS.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
  exercisesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionHeading: {
    ...TYPOGRAPHY.caption,
    letterSpacing: 1.5,
    color: COLORS.textSecondary,
  },
  exerciseCountText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  restDayContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  restDayIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  restDayHeading: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  restDaySubtext: {
    ...TYPOGRAPHY.bodyMedium,
    textAlign: 'center',
    color: COLORS.textSecondary,
    lineHeight: 20,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  recoveryTipsCard: {
    width: '100%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  tipText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
});
