import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TrendingUp,
  Scale,
  Camera,
  Plus,
  Flame,
  CheckCircle,
  Calendar,
  X,
  ChevronRight,
  Award,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Line, Circle, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../app/theme/theme';
import { progressService, dashboardService } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { WeightLog, ProgressPhoto } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - SPACING.xl * 2;
const CHART_HEIGHT = 160;

export const ProgressScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { profile, streak, dashboardSummary, fetchDashboard } = useAppStore();

  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [photoAngleFilter, setPhotoAngleFilter] = useState<'all' | 'front' | 'side' | 'back'>('all');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Weight Logging Modal State
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState(profile?.weightKg ? profile.weightKg.toString() : '75');
  const [weightNotes, setWeightNotes] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);

  // Photo Upload State
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const [weights, photosData] = await Promise.all([
        progressService.getWeightHistory(),
        progressService.getPhotos(),
      ]);
      setWeightLogs(weights);
      setPhotos(photosData.all || []);
    } catch (err) {
      console.warn('Progress load error', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadProgress(), fetchDashboard()]);
    setRefreshing(false);
  };

  const handleSaveWeight = async () => {
    const val = parseFloat(newWeight);
    if (isNaN(val) || val <= 30 || val >= 300) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight in kg (30 - 300 kg).');
      return;
    }

    try {
      setSavingWeight(true);
      await progressService.logWeight(val, weightNotes.trim() || undefined);
      setShowWeightModal(false);
      setWeightNotes('');
      await loadProgress();
      await fetchDashboard();
      Alert.alert('Success', `Logged weight ${val} kg successfully!`);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Could not log weight');
    } finally {
      setSavingWeight(false);
    }
  };

  const handleUploadPhoto = async (angle: 'front' | 'side' | 'back') => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera roll access is needed to select progress photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [3, 4],
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setUploadingPhoto(true);
        const photoUrl = result.assets[0].uri;
        await progressService.uploadPhoto(photoUrl, angle);
        await loadProgress();
        Alert.alert('Photo Uploaded', `Progress photo (${angle}) saved!`);
      }
    } catch (err: any) {
      Alert.alert('Upload Error', err?.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Compute stats
  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weightKg : profile?.weightKg || 78;
  const initialWeight = weightLogs.length > 0 ? weightLogs[0].weightKg : currentWeight;
  const weightDelta = Math.round((currentWeight - initialWeight) * 10) / 10;

  // Svg Weight Path calculation
  const renderChart = () => {
    if (weightLogs.length < 2) {
      return (
        <View style={styles.chartFallback}>
          <TrendingUp size={24} color={COLORS.accentSecondary} />
          <Text style={styles.chartFallbackText}>
            Log 2 or more weight entries to see your trend curve
          </Text>
        </View>
      );
    }

    const weights = weightLogs.map((w) => w.weightKg);
    const minW = Math.min(...weights) - 1;
    const maxW = Math.max(...weights) + 1;
    const rangeW = maxW - minW || 1;

    const points = weightLogs.map((log, index) => {
      const x = (index / (weightLogs.length - 1)) * (CHART_WIDTH - 40) + 20;
      const y = CHART_HEIGHT - 30 - ((log.weightKg - minW) / rangeW) * (CHART_HEIGHT - 60);
      return { x, y, weight: log.weightKg, date: new Date(log.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) };
    });

    const pathString = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
    const fillString = `${pathString} L ${points[points.length - 1].x} ${CHART_HEIGHT - 20} L ${points[0].x} ${CHART_HEIGHT - 20} Z`;

    return (
      <View style={styles.svgChartWrapper}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={COLORS.accentPrimary} stopOpacity="0.25" />
              <Stop offset="100%" stopColor={COLORS.accentPrimary} stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          <Line x1="10" y1="20" x2={CHART_WIDTH - 10} y2="20" stroke={COLORS.border} strokeWidth="1" strokeDasharray="4 4" />
          <Line x1="10" y1={CHART_HEIGHT / 2} x2={CHART_WIDTH - 10} y2={CHART_HEIGHT / 2} stroke={COLORS.border} strokeWidth="1" strokeDasharray="4 4" />
          <Line x1="10" y1={CHART_HEIGHT - 30} x2={CHART_WIDTH - 10} y2={CHART_HEIGHT - 30} stroke={COLORS.border} strokeWidth="1" />

          {/* Area Fill */}
          <Path d={fillString} fill="url(#chartGradient)" />

          {/* Line Path */}
          <Path d={pathString} fill="none" stroke={COLORS.accentPrimary} strokeWidth="3" />

          {/* Point Markers */}
          {points.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r="4" fill={COLORS.textInverse} stroke={COLORS.accentPrimary} strokeWidth="2.5" />
          ))}
        </Svg>
      </View>
    );
  };

  const filteredPhotos = photoAngleFilter === 'all'
    ? photos
    : photos.filter((p) => p.angle === photoAngleFilter);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>BODY ANALYTICS</Text>
          <Text style={styles.headerTitle}>Progress Tracker</Text>
        </View>

        <TouchableOpacity
          style={styles.logWeightHeaderBtn}
          onPress={() => setShowWeightModal(true)}
          activeOpacity={0.8}
        >
          <Plus size={16} color={COLORS.textInverse} />
          <Text style={styles.logWeightHeaderText}>Log Weight</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accentPrimary}
            colors={[COLORS.accentPrimary]}
          />
        }
      >
        {/* Weight Stat Card */}
        <View style={styles.weightStatCard}>
          <View style={styles.weightStatTop}>
            <View>
              <Text style={styles.weightLabel}>CURRENT WEIGHT</Text>
              <View style={styles.weightNumberRow}>
                <Text style={styles.weightBigNumber}>{currentWeight}</Text>
                <Text style={styles.weightUnit}>kg</Text>
              </View>
            </View>

            <View style={styles.deltaBadge}>
              <TrendingUp size={16} color={weightDelta <= 0 ? COLORS.success : COLORS.warning} />
              <Text
                style={[
                  styles.deltaText,
                  { color: weightDelta <= 0 ? COLORS.success : COLORS.warning },
                ]}
              >
                {weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg
              </Text>
            </View>
          </View>

          {/* Svg Chart */}
          {renderChart()}
        </View>

        {/* Adherence & Consistency Grid */}
        <Text style={styles.sectionHeading}>WEEKLY CONSISTENCY</Text>
        <View style={styles.adherenceGrid}>
          <View style={styles.adherenceCard}>
            <View style={styles.adherenceIconBg}>
              <Flame size={20} color={COLORS.accentGold} />
            </View>
            <Text style={styles.adherenceVal}>{streak.current} Days</Text>
            <Text style={styles.adherenceLabel}>Current Streak</Text>
          </View>

          <View style={styles.adherenceCard}>
            <View style={[styles.adherenceIconBg, { backgroundColor: 'rgba(183, 243, 107, 0.15)' }]}>
              <CheckCircle size={20} color={COLORS.accentPrimary} />
            </View>
            <Text style={styles.adherenceVal}>
              {dashboardSummary?.weeklyActivity?.workoutsCompleted || 0} / {profile?.daysPerWeek || 4}
            </Text>
            <Text style={styles.adherenceLabel}>Workouts Done</Text>
          </View>

          <View style={styles.adherenceCard}>
            <View style={[styles.adherenceIconBg, { backgroundColor: 'rgba(127, 214, 165, 0.15)' }]}>
              <Award size={20} color={COLORS.accentSecondary} />
            </View>
            <Text style={styles.adherenceVal}>
              {dashboardSummary?.weeklyActivity?.completionPercentage || 75}%
            </Text>
            <Text style={styles.adherenceLabel}>Adherence Rate</Text>
          </View>
        </View>

        {/* Progress Photos Gallery */}
        <View style={styles.photosSectionHeader}>
          <View>
            <Text style={styles.sectionHeading}>PROGRESS PHOTOS</Text>
            <Text style={styles.photoCountSub}>{photos.length} transformation photos</Text>
          </View>

          <TouchableOpacity
            style={styles.addPhotoBtn}
            onPress={() => handleUploadPhoto('front')}
            disabled={uploadingPhoto}
            activeOpacity={0.8}
          >
            {uploadingPhoto ? (
              <ActivityIndicator size="small" color={COLORS.accentPrimary} />
            ) : (
              <>
                <Camera size={15} color={COLORS.accentPrimary} />
                <Text style={styles.addPhotoBtnText}>Add Photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Angle Filter Chips */}
        <View style={styles.photoFiltersRow}>
          {(['all', 'front', 'side', 'back'] as const).map((angle) => {
            const isSelected = photoAngleFilter === angle;
            return (
              <TouchableOpacity
                key={angle}
                style={[styles.angleChip, isSelected && styles.angleChipActive]}
                onPress={() => setPhotoAngleFilter(angle)}
              >
                <Text style={[styles.angleChipText, isSelected && styles.angleChipTextActive]}>
                  {angle.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Photos Grid */}
        {filteredPhotos.length > 0 ? (
          <View style={styles.photosGrid}>
            {filteredPhotos.map((photo) => (
              <View key={photo._id} style={styles.photoCard}>
                <Image source={{ uri: photo.photoUrl }} style={styles.photoImg} resizeMode="cover" />
                <View style={styles.photoTag}>
                  <Text style={styles.photoTagText}>{photo.angle.toUpperCase()}</Text>
                </View>
                <Text style={styles.photoDate}>
                  {new Date(photo.takenAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noPhotosCard}>
            <Camera size={32} color={COLORS.textMuted} />
            <Text style={styles.noPhotosTitle}>No Progress Photos Yet</Text>
            <Text style={styles.noPhotosSub}>
              Take weekly physique check-in photos from the front, side, and back to celebrate your transformation.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Log Weight Modal */}
      <Modal
        visible={showWeightModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWeightModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Body Weight</Text>
              <TouchableOpacity onPress={() => setShowWeightModal(false)}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>WEIGHT (KG)</Text>
            <TextInput
              style={styles.weightInput}
              keyboardType="decimal-pad"
              value={newWeight}
              onChangeText={setNewWeight}
              placeholder="75.5"
              placeholderTextColor={COLORS.textMuted}
            />

            <Text style={styles.inputLabel}>OPTIONAL NOTES</Text>
            <TextInput
              style={styles.notesInput}
              value={weightNotes}
              onChangeText={setWeightNotes}
              placeholder="Morning fasted, post-bathroom..."
              placeholderTextColor={COLORS.textMuted}
            />

            <TouchableOpacity
              style={styles.modalSaveBtn}
              onPress={handleSaveWeight}
              disabled={savingWeight}
            >
              {savingWeight ? (
                <ActivityIndicator size="small" color={COLORS.textInverse} />
              ) : (
                <Text style={styles.modalSaveText}>Save Weight Entry</Text>
              )}
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
  logWeightHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.accentPrimary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
  },
  logWeightHeaderText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl * 2,
  },
  weightStatCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  weightStatTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  weightLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  weightNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  weightBigNumber: {
    ...TYPOGRAPHY.h1,
    fontSize: 34,
    color: COLORS.textPrimary,
  },
  weightUnit: {
    fontSize: 16,
    color: COLORS.accentSecondary,
    fontWeight: '600',
  },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deltaText: {
    fontSize: 13,
    fontWeight: '700',
  },
  svgChartWrapper: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  chartFallback: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  chartFallbackText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  sectionHeading: {
    ...TYPOGRAPHY.caption,
    letterSpacing: 1.5,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  adherenceGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  adherenceCard: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
  },
  adherenceIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(243, 211, 107, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  adherenceVal: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  adherenceLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  photosSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  photoCountSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.borderNeon,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  addPhotoBtnText: {
    color: COLORS.accentPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  photoFiltersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  angleChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  angleChipActive: {
    backgroundColor: COLORS.accentPrimary,
    borderColor: COLORS.accentPrimary,
  },
  angleChipText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  angleChipTextActive: {
    color: COLORS.textInverse,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  photoCard: {
    width: (SCREEN_WIDTH - SPACING.xl * 2 - SPACING.md) / 2,
    height: 220,
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  photoTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(16, 23, 19, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  photoTagText: {
    color: COLORS.accentPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  photoDate: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: 'rgba(16, 23, 19, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  noPhotosCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  noPhotosTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  noPhotosSub: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: RADIUS.cardLg,
    borderTopRightRadius: RADIUS.cardLg,
    borderWidth: 1,
    borderColor: COLORS.borderNeon,
    padding: SPACING.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  inputLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accentSecondary,
    marginBottom: 6,
  },
  weightInput: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  notesInput: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: 14,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  modalSaveBtn: {
    backgroundColor: COLORS.accentPrimary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSaveText: {
    color: COLORS.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
});
