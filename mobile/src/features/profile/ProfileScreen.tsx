import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Flame,
  Award,
  Target,
  Bell,
  FileText,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Zap,
  Trash2,
} from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../app/theme/theme';
import { useAppStore } from '../../store/useAppStore';
import { gamificationService } from '../../services/api';
import { Badge } from '../../types';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, profile, targets, streak, logout, deleteAccount, badges, fetchGamification } = useAppStore();

  const [loadingBadges, setLoadingBadges] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    fetchGamification();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your Kinetiq account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await logout();
            } catch (err) {
              console.error('Logout failed:', err);
              Alert.alert('Error', 'Failed to log out cleanly. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your Kinetiq account? All your workout programs, nutrition logs, personal bio-metrics, and badges will be erased immediately. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeletingAccount(true);
              await deleteAccount();
            } catch (err: any) {
              console.error('Delete account failed:', err);
              Alert.alert(
                'Delete Failed',
                err?.response?.data?.message || 'Could not delete your account. Please check your network connection and try again.'
              );
            } finally {
              setIsDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  const athleteName = user?.name || 'Athlete';
  const athleteEmail = user?.email || 'demo@kinetiq.ai';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeftCol}>
          <Text style={styles.headerSubtitle}>ATHLETE ACCOUNT</Text>
          <Text style={styles.headerTitle}>Profile & Badges</Text>
        </View>


      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Athlete Hero Card */}
        <View style={styles.athleteHeroCard}>
          <View style={styles.avatarCircle}>
            <User size={34} color={COLORS.accentPrimary} />
          </View>

          <View style={styles.heroInfo}>
            <Text style={styles.athleteName}>{athleteName}</Text>
            <Text style={styles.athleteEmail}>{athleteEmail}</Text>

            <View style={styles.pillRow}>
              <View style={styles.goalPill}>
                <Text style={styles.goalPillText}>
                  {profile?.fitnessGoal?.toUpperCase() || 'GENERAL FITNESS'}
                </Text>
              </View>

              <View style={styles.streakPill}>
                <Flame size={12} color={COLORS.accentGold} fill={COLORS.accentGold} />
                <Text style={styles.streakPillText}>{streak.current} DAY STREAK</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Nutritional & Energy Calibration Card */}
        <View style={styles.targetCard}>
          <View style={styles.targetHeader}>
            <Target size={16} color={COLORS.accentSecondary} />
            <Text style={styles.targetCardTitle}>METABOLIC PROFILE & MACRO TARGETS</Text>
          </View>

          <View style={styles.targetMetricsGrid}>
            <View style={styles.targetCol}>
              <Text style={styles.targetVal}>{targets?.bmr || 1780}</Text>
              <Text style={styles.targetKey}>BMR (kcal)</Text>
            </View>
            <View style={styles.targetDivider} />
            <View style={styles.targetCol}>
              <Text style={styles.targetVal}>{targets?.tdee || 2450}</Text>
              <Text style={styles.targetKey}>TDEE (kcal)</Text>
            </View>
            <View style={styles.targetDivider} />
            <View style={styles.targetCol}>
              <Text style={[styles.targetVal, { color: COLORS.accentPrimary }]}>
                {targets?.calorieTarget || 2200}
              </Text>
              <Text style={styles.targetKey}>Target (kcal)</Text>
            </View>
          </View>

          <View style={[styles.targetMetricsGrid, { marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.borderLight }]}>
            <View style={styles.targetCol}>
              <Text style={[styles.targetVal, { color: COLORS.accentPrimary }]}>
                {targets?.proteinGrams || 160}g
              </Text>
              <Text style={styles.targetKey}>Protein (4 kcal/g)</Text>
            </View>
            <View style={styles.targetDivider} />
            <View style={styles.targetCol}>
              <Text style={[styles.targetVal, { color: COLORS.info }]}>
                {targets?.carbsGrams || 220}g
              </Text>
              <Text style={styles.targetKey}>Carbs (4 kcal/g)</Text>
            </View>
            <View style={styles.targetDivider} />
            <View style={styles.targetCol}>
              <Text style={[styles.targetVal, { color: COLORS.warning }]}>
                {targets?.fatGrams || 65}g
              </Text>
              <Text style={styles.targetKey}>Fat (9 kcal/g)</Text>
            </View>
          </View>
        </View>

        {/* Gamification Badges Showcase */}
        <View style={styles.badgesSectionHeader}>
          <View style={styles.badgesTitleLeft}>
            <Award size={18} color={COLORS.accentGold} />
            <Text style={styles.sectionHeading}>EARNED BADGES & TROPHIES</Text>
          </View>
          <Text style={styles.badgesCountText}>
            {badges.filter((b) => b.unlocked).length} / {badges.length || 6}
          </Text>
        </View>

        <View style={styles.badgesGrid}>
          {badges.length > 0 ? (
            badges.map((badge) => {
              const isUnlocked = badge.unlocked;
              return (
                <View
                  key={badge._id}
                  style={[
                    styles.badgeCard,
                    isUnlocked && styles.badgeCardUnlocked,
                  ]}
                >
                  <View
                    style={[
                      styles.badgeIconCircle,
                      isUnlocked && styles.badgeIconCircleUnlocked,
                    ]}
                  >
                    <Award
                      size={24}
                      color={isUnlocked ? COLORS.accentGold : COLORS.textMuted}
                    />
                  </View>
                  <Text
                    style={[
                      styles.badgeTitle,
                      isUnlocked && styles.badgeTitleUnlocked,
                    ]}
                    numberOfLines={1}
                  >
                    {badge.title}
                  </Text>
                  <Text style={styles.badgeDesc} numberOfLines={2}>
                    {badge.description}
                  </Text>
                  <View style={styles.pointsBadge}>
                    <Zap size={10} color={isUnlocked ? COLORS.accentPrimary : COLORS.textMuted} />
                    <Text
                      style={[
                        styles.pointsText,
                        isUnlocked && styles.pointsTextUnlocked,
                      ]}
                    >
                      +{badge.points} XP
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.noBadgesCard}>
              <Text style={styles.noBadgesText}>
                Complete workouts and log nutrition to unlock achievement badges!
              </Text>
            </View>
          )}
        </View>

        {/* Settings & Configuration Menu */}
        <Text style={[styles.sectionHeading, { marginTop: SPACING.xl, marginBottom: SPACING.md }]}>
          ACCOUNT SETTINGS
        </Text>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditGoals')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconBg}>
              <Target size={18} color={COLORS.accentPrimary} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Edit Goals & Bio-metrics</Text>
              <Text style={styles.menuSub}>Weight, fitness goal, activity level</Text>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('NotificationSettings')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconBg}>
              <Bell size={18} color={COLORS.accentSecondary} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Notification Preferences</Text>
              <Text style={styles.menuSub}>Workout reminders, meal logging nudges</Text>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Disclaimer')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconBg}>
              <ShieldCheck size={18} color={COLORS.info} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Health & Safety Disclaimer</Text>
              <Text style={styles.menuSub}>Medical advisories & AI guidance notice</Text>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>


        </View>

        {/* Account Action Buttons */}
        <View style={styles.accountActionsContainer}>
          <TouchableOpacity
            style={[
              styles.logoutButton,
              (isLoggingOut || isDeletingAccount) && styles.buttonDisabled,
            ]}
            onPress={handleLogout}
            disabled={isLoggingOut || isDeletingAccount}
            activeOpacity={0.8}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color={COLORS.error} />
            ) : (
              <>
                <LogOut size={18} color={COLORS.error} />
                <Text style={styles.logoutText}>Log Out</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.deleteAccountButton,
              (isLoggingOut || isDeletingAccount) && styles.buttonDisabled,
            ]}
            onPress={handleDeleteAccount}
            disabled={isLoggingOut || isDeletingAccount}
            activeOpacity={0.8}
          >
            {isDeletingAccount ? (
              <ActivityIndicator size="small" color="#FF4D4D" />
            ) : (
              <>
                <Trash2 size={16} color="#FF4D4D" />
                <Text style={styles.deleteAccountText}>Delete Account</Text>
              </>
            )}
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  headerLeftCol: {
    flex: 1,
  },
  headerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
  },
  headerLogoutText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '700',
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
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl * 2,
  },
  athleteHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(183, 243, 107, 0.12)',
    borderWidth: 2,
    borderColor: COLORS.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInfo: {
    flex: 1,
  },
  athleteName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  athleteEmail: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  goalPillText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(243, 211, 107, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  streakPillText: {
    color: COLORS.accentGold,
    fontSize: 10,
    fontWeight: '700',
  },
  targetCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  targetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.md,
  },
  targetCardTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accentSecondary,
    letterSpacing: 1,
  },
  targetMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  targetCol: {
    alignItems: 'center',
  },
  targetVal: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  targetKey: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  targetDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
  badgesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  badgesTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeading: {
    ...TYPOGRAPHY.caption,
    letterSpacing: 1.5,
    color: COLORS.textSecondary,
  },
  badgesCountText: {
    color: COLORS.accentGold,
    fontSize: 12,
    fontWeight: '700',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  badgeCard: {
    width: '47%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
    opacity: 0.65,
  },
  badgeCardUnlocked: {
    borderColor: COLORS.borderNeon,
    backgroundColor: COLORS.cardHover,
    opacity: 1,
  },
  badgeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  badgeIconCircleUnlocked: {
    backgroundColor: 'rgba(243, 211, 107, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.accentGold,
  },
  badgeTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  badgeTitleUnlocked: {
    color: COLORS.textPrimary,
  },
  badgeDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 14,
    height: 28,
    marginBottom: 6,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pointsText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  pointsTextUnlocked: {
    color: COLORS.accentPrimary,
  },
  noBadgesCard: {
    width: '100%',
    padding: SPACING.lg,
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
  },
  noBadgesText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  menuContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 68,
  },
  accountActionsContainer: {
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.error,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '700',
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 77, 77, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.25)',
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  deleteAccountText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
