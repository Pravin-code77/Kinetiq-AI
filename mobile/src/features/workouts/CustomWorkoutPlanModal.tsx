import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Plus,
  Trash2,
  Dumbbell,
  Calendar,
  Sparkles,
  Check,
  Search,
  Clock,
  Info,
} from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../app/theme/theme';
import { workoutService } from '../../services/api';
import { Exercise } from '../../types';

interface CustomExerciseItem {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  equipmentTag: string;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
}

interface CustomDaySession {
  dayOfWeek: number;
  isWorkout: boolean;
  sessionName: string;
  focusArea: string;
  estimatedDuration: number;
  exercises: CustomExerciseItem[];
}

interface CustomWorkoutPlanModalProps {
  visible: boolean;
  onClose: () => void;
  onPlanCreated: () => Promise<void>;
  initialSplitType?: 'Full Body' | 'Upper/Lower' | 'Push/Pull/Legs';
  initialGoal?: string;
}

const DAYS_OF_WEEK = [
  { day: 1, label: 'Mon', full: 'Monday' },
  { day: 2, label: 'Tue', full: 'Tuesday' },
  { day: 3, label: 'Wed', full: 'Wednesday' },
  { day: 4, label: 'Thu', full: 'Thursday' },
  { day: 5, label: 'Fri', full: 'Friday' },
  { day: 6, label: 'Sat', full: 'Saturday' },
  { day: 7, label: 'Sun', full: 'Sunday' },
];

const SPLIT_OPTIONS: Array<'Full Body' | 'Upper/Lower' | 'Push/Pull/Legs'> = [
  'Push/Pull/Legs',
  'Upper/Lower',
  'Full Body',
];

const GOAL_OPTIONS = [
  'Muscle Gain',
  'Weight Loss',
  'General Fitness',
  'Recomposition',
  'Endurance',
];

const MUSCLE_FILTER_CHIPS = [
  'All',
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Abs',
  'Cardio',
];

const createInitialDays = (): CustomDaySession[] => [
  { dayOfWeek: 1, isWorkout: true, sessionName: 'Push Day (Chest & Shoulders)', focusArea: 'Chest, Shoulders & Triceps', estimatedDuration: 50, exercises: [] },
  { dayOfWeek: 2, isWorkout: true, sessionName: 'Pull Day (Back & Biceps)', focusArea: 'Back & Biceps', estimatedDuration: 50, exercises: [] },
  { dayOfWeek: 3, isWorkout: false, sessionName: 'Rest & Mobility', focusArea: 'Recovery', estimatedDuration: 30, exercises: [] },
  { dayOfWeek: 4, isWorkout: true, sessionName: 'Legs & Core Power', focusArea: 'Legs & Abs', estimatedDuration: 55, exercises: [] },
  { dayOfWeek: 5, isWorkout: true, sessionName: 'Upper Body Pump', focusArea: 'Chest, Back & Arms', estimatedDuration: 45, exercises: [] },
  { dayOfWeek: 6, isWorkout: false, sessionName: 'Active Recovery', focusArea: 'Recovery', estimatedDuration: 30, exercises: [] },
  { dayOfWeek: 7, isWorkout: false, sessionName: 'Full Rest Day', focusArea: 'Recovery', estimatedDuration: 0, exercises: [] },
];

export const CustomWorkoutPlanModal: React.FC<CustomWorkoutPlanModalProps> = ({
  visible,
  onClose,
  onPlanCreated,
  initialSplitType = 'Push/Pull/Legs',
  initialGoal = 'Muscle Gain',
}) => {
  const [customName, setCustomName] = useState('My Custom Routine');
  const [splitType, setSplitType] = useState<'Full Body' | 'Upper/Lower' | 'Push/Pull/Legs'>(initialSplitType);
  const [goal, setGoal] = useState(initialGoal);
  const [days, setDays] = useState<CustomDaySession[]>(createInitialDays);
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);

  // Exercise pool
  const [exercisePool, setExercisePool] = useState<Exercise[]>([]);
  const [poolLoading, setPoolLoading] = useState(false);

  // Exercise Picker Modal
  const [pickerVisible, setPickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState('All');

  // Saving state
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      loadExercisePool();
    }
  }, [visible]);

  const loadExercisePool = async () => {
    try {
      setPoolLoading(true);
      const exList = await workoutService.getExercises();
      setExercisePool(exList || []);
    } catch (err) {
      console.warn('Failed to load exercises for custom plan builder:', err);
    } finally {
      setPoolLoading(false);
    }
  };

  const currentDaySession = useMemo(() => {
    return days.find((d) => d.dayOfWeek === selectedDayNum) || days[0];
  }, [days, selectedDayNum]);

  const totalWorkoutDays = useMemo(() => days.filter((d) => d.isWorkout).length, [days]);
  const totalExercises = useMemo(
    () => days.reduce((sum, d) => sum + (d.isWorkout ? d.exercises.length : 0), 0),
    [days]
  );

  const handleToggleDayWorkout = (dayNum: number) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek !== dayNum) return d;
        const newIsWorkout = !d.isWorkout;
        return {
          ...d,
          isWorkout: newIsWorkout,
          sessionName: newIsWorkout
            ? d.sessionName || `Workout Day ${dayNum}`
            : 'Active Recovery',
          focusArea: newIsWorkout ? d.focusArea || 'General Strength' : 'Recovery',
        };
      })
    );
  };

  const updateCurrentSessionField = (field: keyof CustomDaySession, value: any) => {
    setDays((prev) =>
      prev.map((d) => (d.dayOfWeek === selectedDayNum ? { ...d, [field]: value } : d))
    );
  };

  const handleAddExerciseToCurrentDay = (exercise: Exercise) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek !== selectedDayNum) return d;
        const newItem: CustomExerciseItem = {
          exerciseId: exercise._id,
          name: exercise.name,
          muscleGroup: exercise.muscleGroup,
          equipmentTag: exercise.equipmentTag,
          targetSets: exercise.defaultSets || 3,
          targetReps: exercise.defaultReps || 10,
          restSeconds: exercise.defaultRestSeconds || 60,
        };
        return {
          ...d,
          exercises: [...d.exercises, newItem],
        };
      })
    );
    setPickerVisible(false);
  };

  const handleRemoveExercise = (dayNum: number, exerciseIndex: number) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek !== dayNum) return d;
        const updatedExercises = [...d.exercises];
        updatedExercises.splice(exerciseIndex, 1);
        return { ...d, exercises: updatedExercises };
      })
    );
  };

  const updateExerciseParam = (
    dayNum: number,
    exerciseIndex: number,
    param: 'targetSets' | 'targetReps' | 'restSeconds',
    delta: number
  ) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek !== dayNum) return d;
        const updated = [...d.exercises];
        const item = { ...updated[exerciseIndex] };
        if (param === 'targetSets') {
          item.targetSets = Math.max(1, Math.min(10, item.targetSets + delta));
        } else if (param === 'targetReps') {
          item.targetReps = Math.max(1, Math.min(50, item.targetReps + delta));
        } else if (param === 'restSeconds') {
          item.restSeconds = Math.max(15, Math.min(300, item.restSeconds + delta));
        }
        updated[exerciseIndex] = item;
        return { ...d, exercises: updated };
      })
    );
  };

  // Quick Preset Helper: Auto-fills standard splits with real exercises from pool
  const applyPreset = (presetType: 'Push/Pull/Legs' | 'Upper/Lower' | 'Full Body') => {
    if (exercisePool.length === 0) {
      Alert.alert('Notice', 'Exercises are still loading. Please try again in a moment.');
      return;
    }

    setSplitType(presetType);
    setCustomName(`My Custom ${presetType} Plan`);

    const findExercises = (muscleGroups: string[], limit: number): CustomExerciseItem[] => {
      const filtered = exercisePool.filter((e) =>
        muscleGroups.some((mg) => mg.toLowerCase() === e.muscleGroup.toLowerCase())
      );
      return filtered.slice(0, limit).map((ex) => ({
        exerciseId: ex._id,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        equipmentTag: ex.equipmentTag,
        targetSets: ex.defaultSets || 3,
        targetReps: ex.defaultReps || 10,
        restSeconds: ex.defaultRestSeconds || 60,
      }));
    };

    if (presetType === 'Push/Pull/Legs') {
      const pushExercises = findExercises(['Chest', 'Shoulders', 'Triceps'], 5);
      const pullExercises = findExercises(['Back', 'Biceps'], 5);
      const legExercises = findExercises(['Legs', 'Abs'], 5);

      setDays([
        { dayOfWeek: 1, isWorkout: true, sessionName: 'Push Session A', focusArea: 'Chest, Shoulders & Triceps', estimatedDuration: 55, exercises: pushExercises },
        { dayOfWeek: 2, isWorkout: true, sessionName: 'Pull Session A', focusArea: 'Back & Biceps', estimatedDuration: 55, exercises: pullExercises },
        { dayOfWeek: 3, isWorkout: true, sessionName: 'Legs & Core', focusArea: 'Legs & Abs', estimatedDuration: 55, exercises: legExercises },
        { dayOfWeek: 4, isWorkout: false, sessionName: 'Active Recovery', focusArea: 'Recovery', estimatedDuration: 30, exercises: [] },
        { dayOfWeek: 5, isWorkout: true, sessionName: 'Upper Hypertrophy', focusArea: 'Chest & Back', estimatedDuration: 50, exercises: [...pushExercises.slice(0, 2), ...pullExercises.slice(0, 2)] },
        { dayOfWeek: 6, isWorkout: true, sessionName: 'Lower & Abs Burn', focusArea: 'Legs & Abs', estimatedDuration: 50, exercises: legExercises.slice(0, 4) },
        { dayOfWeek: 7, isWorkout: false, sessionName: 'Full Rest Day', focusArea: 'Recovery', estimatedDuration: 0, exercises: [] },
      ]);
    } else if (presetType === 'Upper/Lower') {
      const upperExercises = findExercises(['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'], 5);
      const lowerExercises = findExercises(['Legs', 'Abs'], 5);

      setDays([
        { dayOfWeek: 1, isWorkout: true, sessionName: 'Upper Body Power', focusArea: 'Chest, Back & Shoulders', estimatedDuration: 50, exercises: upperExercises },
        { dayOfWeek: 2, isWorkout: true, sessionName: 'Lower Body Strength', focusArea: 'Quads, Hamstrings & Core', estimatedDuration: 50, exercises: lowerExercises },
        { dayOfWeek: 3, isWorkout: false, sessionName: 'Rest & Mobility', focusArea: 'Recovery', estimatedDuration: 30, exercises: [] },
        { dayOfWeek: 4, isWorkout: true, sessionName: 'Upper Hypertrophy', focusArea: 'Upper Body', estimatedDuration: 50, exercises: upperExercises },
        { dayOfWeek: 5, isWorkout: true, sessionName: 'Lower & Core Stability', focusArea: 'Lower Body & Abs', estimatedDuration: 50, exercises: lowerExercises },
        { dayOfWeek: 6, isWorkout: false, sessionName: 'Active Recovery', focusArea: 'Recovery', estimatedDuration: 30, exercises: [] },
        { dayOfWeek: 7, isWorkout: false, sessionName: 'Rest Day', focusArea: 'Recovery', estimatedDuration: 0, exercises: [] },
      ]);
    } else {
      // Full Body
      const fullExercises = findExercises(['Chest', 'Back', 'Legs', 'Shoulders', 'Abs'], 5);
      setDays([
        { dayOfWeek: 1, isWorkout: true, sessionName: 'Full Body A', focusArea: 'Full Body Compound', estimatedDuration: 60, exercises: fullExercises },
        { dayOfWeek: 2, isWorkout: false, sessionName: 'Rest & Recovery', focusArea: 'Recovery', estimatedDuration: 30, exercises: [] },
        { dayOfWeek: 3, isWorkout: true, sessionName: 'Full Body B', focusArea: 'Full Body Strength', estimatedDuration: 60, exercises: fullExercises },
        { dayOfWeek: 4, isWorkout: false, sessionName: 'Rest Day', focusArea: 'Recovery', estimatedDuration: 30, exercises: [] },
        { dayOfWeek: 5, isWorkout: true, sessionName: 'Full Body C', focusArea: 'Full Body Hypertrophy', estimatedDuration: 60, exercises: fullExercises },
        { dayOfWeek: 6, isWorkout: false, sessionName: 'Mobility & Stretch', focusArea: 'Recovery', estimatedDuration: 25, exercises: [] },
        { dayOfWeek: 7, isWorkout: false, sessionName: 'Rest Day', focusArea: 'Recovery', estimatedDuration: 0, exercises: [] },
      ]);
    }

    Alert.alert('Preset Loaded', `${presetType} blueprint applied! You can customize any day or exercise.`);
  };

  const handleSaveCustomPlan = async () => {
    if (!customName.trim()) {
      Alert.alert('Plan Name Required', 'Please enter a name for your custom workout plan.');
      return;
    }

    const activeSessions = days
      .filter((d) => d.isWorkout && d.exercises.length > 0)
      .map((d) => ({
        dayOfWeek: d.dayOfWeek,
        sessionName: d.sessionName.trim() || `Day ${d.dayOfWeek} Session`,
        focusArea: d.focusArea.trim() || 'General Strength',
        estimatedDuration: d.estimatedDuration || 45,
        exercises: d.exercises.map((ex, idx) => ({
          exerciseId: ex.exerciseId,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps,
          restSeconds: ex.restSeconds,
          order: idx + 1,
        })),
      }));

    if (activeSessions.length === 0) {
      Alert.alert(
        'Add Exercises',
        'Your custom plan must include at least one workout day with at least one exercise.'
      );
      return;
    }

    try {
      setSaving(true);
      await workoutService.createCustomPlan({
        customName: customName.trim(),
        splitType,
        goal,
        sessions: activeSessions,
      });

      await onPlanCreated();
      Alert.alert('Success', `"${customName.trim()}" activated as your active workout plan!`);
      onClose();
    } catch (err: any) {
      Alert.alert(
        'Save Failed',
        err?.response?.data?.message || 'Could not save your custom plan. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  // Filtered exercises for Exercise Picker Modal
  const filteredExercises = useMemo(() => {
    return exercisePool.filter((item) => {
      const matchSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase());
      const matchMuscle =
        selectedMuscleFilter === 'All' ||
        item.muscleGroup.toLowerCase() === selectedMuscleFilter.toLowerCase();
      return matchSearch && matchMuscle;
    });
  }, [exercisePool, searchQuery, selectedMuscleFilter]);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitles}>
            <View style={styles.badgeRow}>
              <Sparkles size={14} color={COLORS.accentPrimary} />
              <Text style={styles.customBadgeText}>CUSTOM PLAN BUILDER</Text>
            </View>
            <Text style={styles.modalTitle}>Design Your Workout Plan</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <X size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Plan Settings Card */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>PLAN NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. My 4-Day Hypertrophy Routine"
              placeholderTextColor={COLORS.textMuted}
              value={customName}
              onChangeText={setCustomName}
              maxLength={40}
            />

            <Text style={[styles.sectionLabel, { marginTop: SPACING.md }]}>SPLIT ARCHITECTURE</Text>
            <View style={styles.chipRow}>
              {SPLIT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.chip, splitType === opt && styles.chipActive]}
                  onPress={() => setSplitType(opt)}
                >
                  <Text style={[styles.chipText, splitType === opt && styles.chipTextActive]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: SPACING.md }]}>PRIMARY FITNESS GOAL</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.goalRow}>
              {GOAL_OPTIONS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.chip, goal === g && styles.chipActive]}
                  onPress={() => setGoal(g)}
                >
                  <Text style={[styles.chipText, goal === g && styles.chipTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Quick Auto-Fill Presets */}
            <View style={styles.presetContainer}>
              <View style={styles.presetHeader}>
                <Sparkles size={14} color={COLORS.accentSecondary} />
                <Text style={styles.presetTitle}>Quick Blueprints (Pre-Fill Days & Exercises)</Text>
              </View>
              <View style={styles.presetButtonsRow}>
                <TouchableOpacity
                  style={styles.presetBtn}
                  onPress={() => applyPreset('Push/Pull/Legs')}
                >
                  <Text style={styles.presetBtnText}>⚡ Push/Pull/Legs</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetBtn}
                  onPress={() => applyPreset('Upper/Lower')}
                >
                  <Text style={styles.presetBtnText}>⚡ Upper/Lower</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetBtn}
                  onPress={() => applyPreset('Full Body')}
                >
                  <Text style={styles.presetBtnText}>⚡ Full Body</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 7-Day Weekday Selector */}
          <Text style={styles.weeklyHeaderTitle}>WEEKLY SCHEDULE</Text>
          <View style={styles.daysScrollContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysBar}>
              {days.map((item) => {
                const isSelected = selectedDayNum === item.dayOfWeek;
                const dayMeta = DAYS_OF_WEEK.find((d) => d.day === item.dayOfWeek);
                return (
                  <TouchableOpacity
                    key={item.dayOfWeek}
                    style={[styles.dayTab, isSelected && styles.dayTabSelected]}
                    onPress={() => setSelectedDayNum(item.dayOfWeek)}
                  >
                    <Text style={[styles.dayTabLabel, isSelected && styles.dayTabLabelSelected]}>
                      {dayMeta?.label}
                    </Text>
                    <Text style={[styles.dayTabNum, isSelected && styles.dayTabNumSelected]}>
                      D{item.dayOfWeek}
                    </Text>
                    <View style={styles.dayStatusIndicator}>
                      {item.isWorkout ? (
                        <View style={styles.dayWorkoutBadge}>
                          <Text style={styles.dayWorkoutBadgeText}>{item.exercises.length} ex</Text>
                        </View>
                      ) : (
                        <Text style={styles.dayRestBadgeText}>Rest</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Selected Day Configuration */}
          <View style={styles.sessionCard}>
            <View style={styles.dayTitleRow}>
              <View>
                <Text style={styles.dayTitleHeading}>
                  {DAYS_OF_WEEK.find((d) => d.day === selectedDayNum)?.full} (Day {selectedDayNum})
                </Text>
                <Text style={styles.dayTitleSub}>
                  {currentDaySession.isWorkout
                    ? `${currentDaySession.exercises.length} Exercises Scheduled`
                    : 'Designated Recovery Day'}
                </Text>
              </View>

              {/* Workout vs Rest Toggle */}
              <TouchableOpacity
                style={[
                  styles.toggleWorkoutBtn,
                  currentDaySession.isWorkout ? styles.toggleActiveWorkout : styles.toggleActiveRest,
                ]}
                onPress={() => handleToggleDayWorkout(selectedDayNum)}
              >
                {currentDaySession.isWorkout ? (
                  <Text style={styles.toggleWorkoutText}>Active Workout</Text>
                ) : (
                  <Text style={styles.toggleRestText}>Rest Day</Text>
                )}
              </TouchableOpacity>
            </View>

            {currentDaySession.isWorkout ? (
              <View style={styles.workoutDayBody}>
                {/* Session Name & Focus inputs */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>SESSION NAME</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Push Power Day"
                    placeholderTextColor={COLORS.textMuted}
                    value={currentDaySession.sessionName}
                    onChangeText={(text) => updateCurrentSessionField('sessionName', text)}
                  />
                </View>

                <View style={styles.twoColumnRow}>
                  <View style={[styles.inputGroup, { flex: 2, marginRight: SPACING.sm }]}>
                    <Text style={styles.inputLabel}>FOCUS AREA</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Chest & Triceps"
                      placeholderTextColor={COLORS.textMuted}
                      value={currentDaySession.focusArea}
                      onChangeText={(text) => updateCurrentSessionField('focusArea', text)}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>DURATION (MIN)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="45"
                      placeholderTextColor={COLORS.textMuted}
                      value={String(currentDaySession.estimatedDuration || 45)}
                      onChangeText={(val) =>
                        updateCurrentSessionField('estimatedDuration', parseInt(val, 10) || 45)
                      }
                    />
                  </View>
                </View>

                {/* Exercises list */}
                <View style={styles.exercisesHeaderRow}>
                  <Text style={styles.sectionHeading}>
                    EXERCISES ({currentDaySession.exercises.length})
                  </Text>
                  <TouchableOpacity
                    style={styles.addExerciseBtn}
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedMuscleFilter('All');
                      setPickerVisible(true);
                    }}
                  >
                    <Plus size={16} color={COLORS.textInverse} />
                    <Text style={styles.addExerciseBtnText}>Add Exercise</Text>
                  </TouchableOpacity>
                </View>

                {currentDaySession.exercises.length === 0 ? (
                  <View style={styles.emptyExerciseBox}>
                    <Dumbbell size={32} color={COLORS.textMuted} />
                    <Text style={styles.emptyExerciseTitle}>No exercises assigned yet</Text>
                    <Text style={styles.emptyExerciseSub}>
                      Tap "+ Add Exercise" or choose a Quick Blueprint above to load exercises.
                    </Text>
                  </View>
                ) : (
                  currentDaySession.exercises.map((item, idx) => (
                    <View key={`${item.exerciseId}-${idx}`} style={styles.exerciseRowCard}>
                      <View style={styles.exerciseCardTop}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.exerciseNameText}>{item.name}</Text>
                          <View style={styles.exerciseMetaRow}>
                            <View style={styles.tagBadge}>
                              <Text style={styles.tagBadgeText}>{item.muscleGroup}</Text>
                            </View>
                            <View style={[styles.tagBadge, styles.tagBadgeAlt]}>
                              <Text style={styles.tagBadgeAltText}>{item.equipmentTag}</Text>
                            </View>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={styles.trashBtn}
                          onPress={() => handleRemoveExercise(selectedDayNum, idx)}
                        >
                          <Trash2 size={16} color={COLORS.error} />
                        </TouchableOpacity>
                      </View>

                      {/* Sets, Reps, Rest Steppers */}
                      <View style={styles.steppersContainer}>
                        {/* Sets */}
                        <View style={styles.stepperBlock}>
                          <Text style={styles.stepperLabel}>SETS</Text>
                          <View style={styles.stepperControls}>
                            <TouchableOpacity
                              style={styles.stepperBtn}
                              onPress={() =>
                                updateExerciseParam(selectedDayNum, idx, 'targetSets', -1)
                              }
                            >
                              <Text style={styles.stepperBtnText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.stepperVal}>{item.targetSets}</Text>
                            <TouchableOpacity
                              style={styles.stepperBtn}
                              onPress={() =>
                                updateExerciseParam(selectedDayNum, idx, 'targetSets', 1)
                              }
                            >
                              <Text style={styles.stepperBtnText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Reps */}
                        <View style={styles.stepperBlock}>
                          <Text style={styles.stepperLabel}>REPS</Text>
                          <View style={styles.stepperControls}>
                            <TouchableOpacity
                              style={styles.stepperBtn}
                              onPress={() =>
                                updateExerciseParam(selectedDayNum, idx, 'targetReps', -1)
                              }
                            >
                              <Text style={styles.stepperBtnText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.stepperVal}>{item.targetReps}</Text>
                            <TouchableOpacity
                              style={styles.stepperBtn}
                              onPress={() =>
                                updateExerciseParam(selectedDayNum, idx, 'targetReps', 1)
                              }
                            >
                              <Text style={styles.stepperBtnText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Rest */}
                        <View style={styles.stepperBlock}>
                          <Text style={styles.stepperLabel}>REST (SEC)</Text>
                          <View style={styles.stepperControls}>
                            <TouchableOpacity
                              style={styles.stepperBtn}
                              onPress={() =>
                                updateExerciseParam(selectedDayNum, idx, 'restSeconds', -15)
                              }
                            >
                              <Text style={styles.stepperBtnText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.stepperVal}>{item.restSeconds}s</Text>
                            <TouchableOpacity
                              style={styles.stepperBtn}
                              onPress={() =>
                                updateExerciseParam(selectedDayNum, idx, 'restSeconds', 15)
                              }
                            >
                              <Text style={styles.stepperBtnText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            ) : (
              <View style={styles.restDayBox}>
                <Calendar size={36} color={COLORS.accentSecondary} />
                <Text style={styles.restDayTitle}>Recovery & Repair Day</Text>
                <Text style={styles.restDaySub}>
                  No lifting session scheduled on this day. Focus on optimal protein intake, 8h sleep,
                  and light active recovery.
                </Text>
                <TouchableOpacity
                  style={styles.enableWorkoutBtn}
                  onPress={() => handleToggleDayWorkout(selectedDayNum)}
                >
                  <Plus size={16} color={COLORS.accentPrimary} />
                  <Text style={styles.enableWorkoutBtnText}>Switch to Workout Day</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footerContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryCount}>
              {totalWorkoutDays} Workout Days • {totalExercises} Total Exercises
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSaveCustomPlan}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.textInverse} />
            ) : (
              <>
                <Check size={20} color={COLORS.textInverse} />
                <Text style={styles.saveBtnText}>Save & Activate Custom Plan</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Sub-Modal: Exercise Picker */}
        <Modal
          visible={pickerVisible}
          animationType="slide"
          onRequestClose={() => setPickerVisible(false)}
        >
          <SafeAreaView style={styles.pickerContainer} edges={['top', 'bottom', 'left', 'right']}>
            <View style={styles.pickerHeader}>
              <View>
                <Text style={styles.pickerTitle}>Add Exercise</Text>
                <Text style={styles.pickerSub}>
                  {DAYS_OF_WEEK.find((d) => d.day === selectedDayNum)?.full} Session
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setPickerVisible(false)}
              >
                <X size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Search size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by exercise name..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
            </View>

            {/* Muscle Filter Chips */}
            <View style={styles.filterScrollWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
                {MUSCLE_FILTER_CHIPS.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.filterChip,
                      selectedMuscleFilter === cat && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedMuscleFilter(cat)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedMuscleFilter === cat && styles.filterChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Exercise List */}
            {poolLoading ? (
              <View style={styles.pickerCenter}>
                <ActivityIndicator size="large" color={COLORS.accentPrimary} />
              </View>
            ) : (
              <FlatList
                data={filteredExercises}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.pickerList}
                renderItem={({ item }) => {
                  const alreadyAdded = currentDaySession.exercises.some(
                    (e) => e.exerciseId === item._id
                  );
                  return (
                    <TouchableOpacity
                      style={styles.pickerItemCard}
                      onPress={() => handleAddExerciseToCurrentDay(item)}
                      activeOpacity={0.8}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pickerItemName}>{item.name}</Text>
                        <View style={styles.pickerItemMeta}>
                          <View style={styles.tagBadge}>
                            <Text style={styles.tagBadgeText}>{item.muscleGroup}</Text>
                          </View>
                          <View style={[styles.tagBadge, styles.tagBadgeAlt]}>
                            <Text style={styles.tagBadgeAltText}>{item.equipmentTag}</Text>
                          </View>
                          <Text style={styles.pickerItemStats}>
                            {item.defaultSets || 3} sets × {item.defaultReps || 10} reps
                          </Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.pickerAddCircle,
                          alreadyAdded && styles.pickerAddedCircle,
                        ]}
                      >
                        {alreadyAdded ? (
                          <Check size={16} color={COLORS.success} />
                        ) : (
                          <Plus size={18} color={COLORS.accentPrimary} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.pickerCenter}>
                    <Text style={styles.emptyExerciseTitle}>No exercises found</Text>
                    <Text style={styles.emptyExerciseSub}>Try adjusting your search or muscle filter.</Text>
                  </View>
                }
              />
            )}
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </Modal>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitles: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  customBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentPrimary,
    letterSpacing: 1.2,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl * 2,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentSecondary,
    letterSpacing: 1.2,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  goalRow: {
    gap: 8,
    marginTop: 4,
    paddingRight: SPACING.md,
  },
  chip: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
  },
  chipActive: {
    backgroundColor: COLORS.cardHover,
    borderColor: COLORS.accentPrimary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.accentPrimary,
    fontWeight: '700',
  },
  presetContainer: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  presetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  presetTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accentSecondary,
  },
  presetButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetBtn: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderNeon,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
  },
  presetBtnText: {
    color: COLORS.accentPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  weeklyHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
  },
  daysScrollContainer: {
    marginBottom: SPACING.lg,
  },
  daysBar: {
    gap: 8,
  },
  dayTab: {
    width: 62,
    height: 78,
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 4,
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
  dayTabNum: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  dayTabNumSelected: {
    color: COLORS.textPrimary,
  },
  dayStatusIndicator: {
    marginTop: 4,
  },
  dayWorkoutBadge: {
    backgroundColor: COLORS.successBackground,
    borderRadius: RADIUS.full,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  dayWorkoutBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.accentPrimary,
  },
  dayRestBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  sessionCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  dayTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dayTitleHeading: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  dayTitleSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  toggleWorkoutBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  toggleActiveWorkout: {
    backgroundColor: COLORS.successBackground,
    borderColor: COLORS.accentPrimary,
  },
  toggleActiveRest: {
    backgroundColor: COLORS.backgroundSecondary,
    borderColor: COLORS.border,
  },
  toggleWorkoutText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentPrimary,
  },
  toggleRestText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  workoutDayBody: {},
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
    letterSpacing: 1,
  },
  twoColumnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exercisesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.2,
  },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.accentPrimary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  addExerciseBtnText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyExerciseBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: RADIUS.md,
    gap: 8,
  },
  emptyExerciseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  emptyExerciseSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  exerciseRowCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  exerciseCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  exerciseNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  exerciseMetaRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  tagBadge: {
    backgroundColor: COLORS.cardHover,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.accentSecondary,
  },
  tagBadgeAlt: {
    backgroundColor: COLORS.backgroundPrimary,
  },
  tagBadgeAltText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  trashBtn: {
    padding: 6,
  },
  steppersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  stepperBlock: {
    flex: 1,
    alignItems: 'center',
  },
  stepperLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    color: COLORS.accentPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  stepperVal: {
    minWidth: 32,
    textAlign: 'center',
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  restDayBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    gap: 8,
  },
  restDayTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  restDaySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: SPACING.md,
  },
  enableWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderNeon,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    marginTop: SPACING.sm,
  },
  enableWorkoutBtnText: {
    color: COLORS.accentPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  footerContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.backgroundPrimary,
  },
  summaryRow: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryCount: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accentSecondary,
  },
  saveBtn: {
    backgroundColor: COLORS.accentPrimary,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: COLORS.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  pickerSub: {
    fontSize: 12,
    color: COLORS.accentSecondary,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  filterScrollWrapper: {
    marginTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  filterChipsRow: {
    paddingHorizontal: SPACING.xl,
    gap: 8,
  },
  filterChip: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.cardHover,
    borderColor: COLORS.accentPrimary,
  },
  filterChipText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: COLORS.accentPrimary,
    fontWeight: '700',
  },
  pickerList: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
    gap: 10,
  },
  pickerItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  pickerItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  pickerItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  pickerItemStats: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  pickerAddCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.cardHover,
    borderWidth: 1,
    borderColor: COLORS.borderNeon,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  pickerAddedCircle: {
    backgroundColor: COLORS.successBackground,
    borderColor: COLORS.success,
  },
  pickerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: 6,
  },
});
