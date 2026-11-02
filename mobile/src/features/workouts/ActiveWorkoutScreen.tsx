import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Play,
  Pause,
  RotateCcw,
  Check,
  ChevronLeft,
  Timer,
  Flame,
  Award,
  Plus,
  Minus,
  CheckCircle2,
} from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../app/theme/theme';
import { useAppStore } from '../../store/useAppStore';
import { workoutService } from '../../services/api';

interface LoggedSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
}

interface ExerciseTrackerState {
  exerciseId: string;
  name: string;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
  sets: LoggedSet[];
}

export const ActiveWorkoutScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { activeSession, fetchDashboard, fetchWorkoutPlan, fetchGamification } = useAppStore();
  const sessionId = route?.params?.sessionId || activeSession?._id;

  // Session Time state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(true);

  // Rest Timer state
  const [restSecondsRemaining, setRestSecondsRemaining] = useState(0);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [restTargetTotal, setRestTargetTotal] = useState(60);

  // Exercise tracking state
  const [exercisesState, setExercisesState] = useState<ExerciseTrackerState[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  // Post workout details
  const [rpe, setRpe] = useState(7);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Elapsed time counter
  useEffect(() => {
    let interval: any = null;
    if (isSessionActive) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  // Rest timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isRestTimerActive && restSecondsRemaining > 0) {
      interval = setInterval(() => {
        setRestSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsRestTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRestTimerActive, restSecondsRemaining]);

  // Initialize exercises state from session
  useEffect(() => {
    if (activeSession?.exercises) {
      const initialized: ExerciseTrackerState[] = activeSession.exercises.map((item) => {
        const targetSets = item.targetSets || 3;
        const targetReps = item.targetReps || 10;
        const initialSets: LoggedSet[] = Array.from({ length: targetSets }).map((_, i) => ({
          setNumber: i + 1,
          weightKg: 20,
          reps: targetReps,
          completed: false,
        }));

        return {
          exerciseId: (item.exerciseId?._id || item.exerciseId) as string,
          name: item.exerciseId?.name || 'Exercise',
          targetSets,
          targetReps,
          restSeconds: item.restSeconds || 60,
          sets: initialSets,
        };
      });

      setExercisesState(initialized);
    }
  }, [activeSession]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRestTimer = (seconds: number) => {
    setRestTargetTotal(seconds);
    setRestSecondsRemaining(seconds);
    setIsRestTimerActive(true);
  };

  const toggleSetComplete = (exIdx: number, setIdx: number) => {
    setExercisesState((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[exIdx] };
      const targetSets = [...targetEx.sets];
      const wasCompleted = targetSets[setIdx].completed;

      targetSets[setIdx] = {
        ...targetSets[setIdx],
        completed: !wasCompleted,
      };

      targetEx.sets = targetSets;
      updated[exIdx] = targetEx;

      // If completing set, launch rest timer
      if (!wasCompleted) {
        startRestTimer(targetEx.restSeconds || 60);
      }

      return updated;
    });
  };

  const updateSetValues = (
    exIdx: number,
    setIdx: number,
    field: 'weightKg' | 'reps',
    value: number
  ) => {
    setExercisesState((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[exIdx] };
      const targetSets = [...targetEx.sets];

      targetSets[setIdx] = {
        ...targetSets[setIdx],
        [field]: Math.max(0, value),
      };

      targetEx.sets = targetSets;
      updated[exIdx] = targetEx;
      return updated;
    });
  };

  const addSetToExercise = (exIdx: number) => {
    setExercisesState((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[exIdx] };
      const lastSet = targetEx.sets[targetEx.sets.length - 1];
      const newSet: LoggedSet = {
        setNumber: targetEx.sets.length + 1,
        weightKg: lastSet ? lastSet.weightKg : 20,
        reps: lastSet ? lastSet.reps : 10,
        completed: false,
      };
      targetEx.sets = [...targetEx.sets, newSet];
      updated[exIdx] = targetEx;
      return updated;
    });
  };

  const handleFinishWorkout = async () => {
    if (!sessionId) {
      Alert.alert('Error', 'Missing session ID');
      return;
    }

    Alert.alert(
      'Finish Workout',
      'Are you ready to submit your logged exercises and claim your workout points?',
      [
        { text: 'Keep Training', style: 'cancel' },
        {
          text: 'Finish & Save',
          style: 'default',
          onPress: async () => {
            try {
              setSubmitting(true);
              setIsSessionActive(false);

              const loggedExercises = exercisesState.map((ex) => ({
                exerciseId: ex.exerciseId,
                sets: ex.sets.map((s) => ({
                  setNumber: s.setNumber,
                  weightKg: s.weightKg,
                  reps: s.reps,
                  repsCompleted: s.reps,
                  completed: s.completed,
                })),
              }));

              await workoutService.logSession(sessionId, {
                loggedExercises,
                rpe,
                notes: notes.trim() || undefined,
              });

              // Refresh store states
              await Promise.all([
                fetchDashboard(),
                fetchWorkoutPlan(),
                fetchGamification(),
              ]);

              setShowCompletionModal(true);
            } catch (err: any) {
              Alert.alert('Submission Error', err?.response?.data?.message || 'Could not save session');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const currentExercise = exercisesState[currentExerciseIndex];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            Alert.alert('Discard Workout?', 'Your in-progress sets will not be saved.', [
              { text: 'Stay', style: 'cancel' },
              { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
            ]);
          }}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.sessionHeaderCenter}>
          <Text style={styles.sessionName} numberOfLines={1}>
            {activeSession?.sessionName || 'Active Workout'}
          </Text>
          <View style={styles.timerBadge}>
            <Timer size={13} color={COLORS.accentPrimary} />
            <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.finishTopButton}
          onPress={handleFinishWorkout}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.textInverse} />
          ) : (
            <Text style={styles.finishTopText}>FINISH</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Rest Timer HUD Banner (if active) */}
      {isRestTimerActive && (
        <View style={styles.restTimerBanner}>
          <View style={styles.restTimerLeft}>
            <Timer size={20} color={COLORS.accentGold} />
            <View>
              <Text style={styles.restTitle}>REST PERIOD</Text>
              <Text style={styles.restCountdown}>{formatTime(restSecondsRemaining)}</Text>
            </View>
          </View>

          <View style={styles.restControls}>
            <TouchableOpacity
              style={styles.restControlBtn}
              onPress={() => setRestSecondsRemaining((prev) => prev + 15)}
            >
              <Text style={styles.restControlText}>+15s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.restControlBtnSkip}
              onPress={() => setIsRestTimerActive(false)}
            >
              <Text style={styles.restControlSkipText}>SKIP</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Exercise Navigation Dots */}
      <View style={styles.exerciseTabsBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.exerciseTabsScroll}
        >
          {exercisesState.map((ex, idx) => {
            const allSetsDone = ex.sets.length > 0 && ex.sets.every((s) => s.completed);
            const isSelected = idx === currentExerciseIndex;

            return (
              <TouchableOpacity
                key={ex.exerciseId + idx}
                style={[
                  styles.exerciseTabItem,
                  isSelected && styles.exerciseTabItemSelected,
                  allSetsDone && styles.exerciseTabItemDone,
                ]}
                onPress={() => setCurrentExerciseIndex(idx)}
              >
                {allSetsDone ? (
                  <Check size={12} color={COLORS.success} />
                ) : (
                  <Text
                    style={[
                      styles.exerciseTabNumber,
                      isSelected && styles.exerciseTabNumberSelected,
                    ]}
                  >
                    {idx + 1}
                  </Text>
                )}
                <Text
                  style={[
                    styles.exerciseTabName,
                    isSelected && styles.exerciseTabNameSelected,
                  ]}
                  numberOfLines={1}
                >
                  {ex.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Current Exercise Detail & Sets List */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {currentExercise && (
          <View>
            <View style={styles.currentExerciseHeader}>
              <View>
                <Text style={styles.exerciseOrderCaption}>
                  EXERCISE {currentExerciseIndex + 1} OF {exercisesState.length}
                </Text>
                <Text style={styles.currentExerciseTitle}>{currentExercise.name}</Text>
              </View>

              <TouchableOpacity
                style={styles.viewGuideBtn}
                onPress={() =>
                  navigation.navigate('ExerciseDetail', {
                    exerciseId: currentExercise.exerciseId,
                  })
                }
              >
                <Text style={styles.viewGuideText}>Technique Guide</Text>
              </TouchableOpacity>
            </View>

            {/* Set Table Header */}
            <View style={styles.setTableHeader}>
              <Text style={[styles.colHeader, { width: 44 }]}>SET</Text>
              <Text style={[styles.colHeader, { flex: 1 }]}>KG</Text>
              <Text style={[styles.colHeader, { flex: 1 }]}>REPS</Text>
              <Text style={[styles.colHeader, { width: 50, textAlign: 'center' }]}>DONE</Text>
            </View>

            {/* Sets Rows */}
            {currentExercise.sets.map((set, setIdx) => (
              <View
                key={set.setNumber}
                style={[
                  styles.setRow,
                  set.completed && styles.setRowCompleted,
                ]}
              >
                {/* Set Number */}
                <View style={styles.setNumberCol}>
                  <Text
                    style={[
                      styles.setNumberText,
                      set.completed && styles.setNumberTextCompleted,
                    ]}
                  >
                    {set.setNumber}
                  </Text>
                </View>

                {/* Weight Input & Steppers */}
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() =>
                      updateSetValues(
                        currentExerciseIndex,
                        setIdx,
                        'weightKg',
                        set.weightKg - 2.5
                      )
                    }
                  >
                    <Minus size={12} color={COLORS.textSecondary} />
                  </TouchableOpacity>

                  <TextInput
                    style={styles.valueInput}
                    keyboardType="numeric"
                    value={set.weightKg.toString()}
                    onChangeText={(txt) => {
                      const num = parseFloat(txt) || 0;
                      updateSetValues(currentExerciseIndex, setIdx, 'weightKg', num);
                    }}
                  />

                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() =>
                      updateSetValues(
                        currentExerciseIndex,
                        setIdx,
                        'weightKg',
                        set.weightKg + 2.5
                      )
                    }
                  >
                    <Plus size={12} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Reps Input & Steppers */}
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() =>
                      updateSetValues(
                        currentExerciseIndex,
                        setIdx,
                        'reps',
                        set.reps - 1
                      )
                    }
                  >
                    <Minus size={12} color={COLORS.textSecondary} />
                  </TouchableOpacity>

                  <TextInput
                    style={styles.valueInput}
                    keyboardType="numeric"
                    value={set.reps.toString()}
                    onChangeText={(txt) => {
                      const num = parseInt(txt, 10) || 0;
                      updateSetValues(currentExerciseIndex, setIdx, 'reps', num);
                    }}
                  />

                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() =>
                      updateSetValues(
                        currentExerciseIndex,
                        setIdx,
                        'reps',
                        set.reps + 1
                      )
                    }
                  >
                    <Plus size={12} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Complete Checkbox */}
                <TouchableOpacity
                  style={[
                    styles.completeCheckbox,
                    set.completed && styles.completeCheckboxChecked,
                  ]}
                  onPress={() => toggleSetComplete(currentExerciseIndex, setIdx)}
                  activeOpacity={0.8}
                >
                  <Check
                    size={16}
                    color={set.completed ? COLORS.textInverse : COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Set Button */}
            <TouchableOpacity
              style={styles.addSetBtn}
              onPress={() => addSetToExercise(currentExerciseIndex)}
            >
              <Plus size={16} color={COLORS.accentPrimary} />
              <Text style={styles.addSetText}>Add Set</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Workout Intensity / RPE selector */}
        <View style={styles.rpeCard}>
          <Text style={styles.rpeTitle}>SESSION INTENSITY (RPE)</Text>
          <Text style={styles.rpeSubtitle}>
            Rate of Perceived Exertion (1 = Light warmup, 10 = Maximum effort)
          </Text>

          <View style={styles.rpeScaleRow}>
            {[5, 6, 7, 8, 9, 10].map((score) => (
              <TouchableOpacity
                key={score}
                style={[
                  styles.rpePill,
                  rpe === score && styles.rpePillActive,
                ]}
                onPress={() => setRpe(score)}
              >
                <Text
                  style={[
                    styles.rpeScoreText,
                    rpe === score && styles.rpeScoreTextActive,
                  ]}
                >
                  {score}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Notes */}
          <Text style={[styles.rpeTitle, { marginTop: SPACING.lg }]}>WORKOUT NOTES</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="How did your lifts feel? Note energy, fatigue, or PRs..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Big Finish Button */}
        <TouchableOpacity
          style={styles.finishBigBtn}
          onPress={handleFinishWorkout}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.textInverse} />
          ) : (
            <>
              <CheckCircle2 size={20} color={COLORS.textInverse} />
              <Text style={styles.finishBigText}>COMPLETE WORKOUT</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Rewarding Completion Modal */}
      <Modal
        visible={showCompletionModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowCompletionModal(false);
          navigation.navigate('MainApp', { screen: 'DashboardTab' });
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.trophyCircle}>
              <Award size={48} color={COLORS.accentGold} />
            </View>

            <Text style={styles.modalTitle}>Workout Completed!</Text>
            <Text style={styles.modalSub}>
              Crushed your training session in {formatTime(elapsedSeconds)}. Your streak has been updated!
            </Text>

            <View style={styles.modalStatsRow}>
              <View style={styles.modalStatItem}>
                <Flame size={20} color={COLORS.accentGold} />
                <Text style={styles.modalStatValue}>
                  ~{activeSession?.estimatedCalories || 320}
                </Text>
                <Text style={styles.modalStatLabel}>Kcal Burned</Text>
              </View>
              <View style={styles.modalStatDivider} />
              <View style={styles.modalStatItem}>
                <Timer size={20} color={COLORS.accentPrimary} />
                <Text style={styles.modalStatValue}>{formatTime(elapsedSeconds)}</Text>
                <Text style={styles.modalStatLabel}>Duration</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => {
                setShowCompletionModal(false);
                navigation.navigate('MainApp', { screen: 'DashboardTab' });
              }}
            >
              <Text style={styles.modalDoneText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 6,
  },
  sessionHeaderCenter: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  sessionName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timerText: {
    color: COLORS.accentPrimary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  finishTopButton: {
    backgroundColor: COLORS.accentPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  finishTopText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: '800',
  },
  restTimerBanner: {
    backgroundColor: COLORS.cardHover,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderNeon,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  restTimerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  restTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentGold,
    letterSpacing: 1,
  },
  restCountdown: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  restControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  restControlBtn: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  restControlText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  restControlBtnSkip: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.error,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  restControlSkipText: {
    color: COLORS.error,
    fontSize: 11,
    fontWeight: '700',
  },
  exerciseTabsBar: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.backgroundSecondary,
    paddingVertical: SPACING.sm,
  },
  exerciseTabsScroll: {
    paddingHorizontal: SPACING.lg,
    gap: 8,
  },
  exerciseTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxWidth: 150,
  },
  exerciseTabItemSelected: {
    borderColor: COLORS.accentPrimary,
    backgroundColor: COLORS.cardHover,
  },
  exerciseTabItemDone: {
    borderColor: COLORS.success,
  },
  exerciseTabNumber: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  exerciseTabNumberSelected: {
    color: COLORS.accentPrimary,
  },
  exerciseTabName: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  exerciseTabNameSelected: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl * 2,
  },
  currentExerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  exerciseOrderCaption: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accentSecondary,
    letterSpacing: 1.2,
  },
  currentExerciseTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  viewGuideBtn: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.borderNeon,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  viewGuideText: {
    color: COLORS.accentPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  setTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  colHeader: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
    gap: 8,
  },
  setRowCompleted: {
    backgroundColor: 'rgba(165, 232, 135, 0.08)',
    borderColor: 'rgba(165, 232, 135, 0.3)',
  },
  setNumberCol: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumberText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  setNumberTextCompleted: {
    color: COLORS.success,
  },
  stepperContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  stepperBtn: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueInput: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: 6,
  },
  completeCheckbox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeCheckboxChecked: {
    backgroundColor: COLORS.accentPrimary,
    borderColor: COLORS.accentPrimary,
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.borderNeon,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  addSetText: {
    color: COLORS.accentPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  rpeCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  rpeTitle: {
    ...TYPOGRAPHY.caption,
    letterSpacing: 1.2,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  rpeSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  rpeScaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  rpePill: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rpePillActive: {
    backgroundColor: COLORS.accentPrimary,
    borderColor: COLORS.accentPrimary,
  },
  rpeScoreText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  rpeScoreTextActive: {
    color: COLORS.textInverse,
  },
  notesInput: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    padding: SPACING.md,
    textAlignVertical: 'top',
    fontSize: 13,
  },
  finishBigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accentPrimary,
    paddingVertical: 16,
    borderRadius: RADIUS.md,
  },
  finishBigText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.cardLg,
    borderWidth: 1,
    borderColor: COLORS.borderNeon,
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  trophyCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(243, 211, 107, 0.15)',
    borderWidth: 2,
    borderColor: COLORS.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  modalSub: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  modalStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginVertical: 4,
  },
  modalStatLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  modalStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
  },
  modalDoneBtn: {
    width: '100%',
    backgroundColor: COLORS.accentPrimary,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  modalDoneText: {
    color: COLORS.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
});
