import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Bell, Dumbbell, Utensils, Droplets, Calendar, Award } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../app/theme/theme';
import { notificationService } from '../../services/api';

export const NotificationSettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [mealLoggingReminders, setMealLoggingReminders] = useState(true);
  const [hydrationAlerts, setHydrationAlerts] = useState(true);
  const [restDayTips, setRestDayTips] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);

  useEffect(() => {
    fetchPrefs();
  }, []);

  const fetchPrefs = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getPreferences();
      if (data) {
        if (typeof data.workoutReminders === 'boolean') setWorkoutReminders(data.workoutReminders);
        if (typeof data.mealReminders === 'boolean') setMealLoggingReminders(data.mealReminders);
        if (typeof data.hydrationReminders === 'boolean') setHydrationAlerts(data.hydrationReminders);
      }
    } catch (err) {
      console.warn('Notification prefs fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await notificationService.updatePreferences({
        workoutReminders,
        mealReminders: mealLoggingReminders,
        hydrationReminders: hydrationAlerts,
        restDayReminders: restDayTips,
        streakReminders: streakAlerts,
      });
      Alert.alert('Settings Saved', 'Your notification preferences have been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Could not update preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.accentPrimary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionHeading}>TIMELY ALERTS & REMINDERS</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingIconBg}>
                <Dumbbell size={18} color={COLORS.accentPrimary} />
              </View>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>Workout Reminders</Text>
                <Text style={styles.settingSub}>Alerts when your scheduled workout time is near</Text>
              </View>
              <Switch
                value={workoutReminders}
                onValueChange={setWorkoutReminders}
                trackColor={{ false: COLORS.backgroundSecondary, true: COLORS.accentPrimary }}
                thumbColor={COLORS.textInverse}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingIconBg}>
                <Utensils size={18} color={COLORS.info} />
              </View>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>Meal Logging Reminders</Text>
                <Text style={styles.settingSub}>Nudges around breakfast, lunch, and dinner slots</Text>
              </View>
              <Switch
                value={mealLoggingReminders}
                onValueChange={setMealLoggingReminders}
                trackColor={{ false: COLORS.backgroundSecondary, true: COLORS.accentPrimary }}
                thumbColor={COLORS.textInverse}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingIconBg}>
                <Droplets size={18} color={COLORS.accentSecondary} />
              </View>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>Hydration Alerts</Text>
                <Text style={styles.settingSub}>Hourly reminders to drink water during training</Text>
              </View>
              <Switch
                value={hydrationAlerts}
                onValueChange={setHydrationAlerts}
                trackColor={{ false: COLORS.backgroundSecondary, true: COLORS.accentPrimary }}
                thumbColor={COLORS.textInverse}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingIconBg}>
                <Calendar size={18} color={COLORS.warning} />
              </View>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>Rest Day Mobility Advice</Text>
                <Text style={styles.settingSub}>Tips on recovery, foam rolling, and sleep</Text>
              </View>
              <Switch
                value={restDayTips}
                onValueChange={setRestDayTips}
                trackColor={{ false: COLORS.backgroundSecondary, true: COLORS.accentPrimary }}
                thumbColor={COLORS.textInverse}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingIconBg}>
                <Award size={18} color={COLORS.accentGold} />
              </View>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>Streak & Milestone Alerts</Text>
                <Text style={styles.settingSub}>Celebrate consecutive active training streaks</Text>
              </View>
              <Switch
                value={streakAlerts}
                onValueChange={setStreakAlerts}
                trackColor={{ false: COLORS.backgroundSecondary, true: COLORS.accentPrimary }}
                thumbColor={COLORS.textInverse}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.textInverse} />
            ) : (
              <Text style={styles.saveBtnText}>Save Preferences</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl * 2,
  },
  sectionHeading: {
    ...TYPOGRAPHY.caption,
    letterSpacing: 1.5,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  settingCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  settingIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTextCol: {
    flex: 1,
  },
  settingTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 68,
  },
  saveBtn: {
    backgroundColor: COLORS.accentPrimary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    color: COLORS.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
});
