import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingProgress } from './OnboardingProgress';
import { PrimaryButton } from '../../components/common/Buttons';
import { Home, Building2, User, Clock, Calendar } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../../app/theme/theme';
import { getOnboardingState, updateOnboardingState } from './onboardingData';

export const EquipmentAvailabilityScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const current = getOnboardingState();

  const [equipment, setEquipment] = useState(current.equipmentAccess);
  const [duration, setDuration] = useState(current.sessionMinutes);
  const [days, setDays] = useState(current.daysPerWeek);

  const equipmentOptions = [
    {
      key: 'No Equipment',
      title: 'No Equipment (Bodyweight)',
      desc: 'Calisthenics, core control, and bodyweight conditioning needing zero gym gear.',
      icon: <User size={22} color={COLORS.accentSecondary} />,
    },
    {
      key: 'Home Equipment',
      title: 'Home Equipment',
      desc: 'Dumbbells, resistance bands, pull-up bar, and adjustable bench.',
      icon: <Home size={22} color={COLORS.accentPrimary} />,
    },
    {
      key: 'Full Gym',
      title: 'Commercial / Full Gym',
      desc: 'Barbells, squat racks, cable towers, leg presses, and heavy dumbbells.',
      icon: <Building2 size={22} color={COLORS.accentGold} />,
    },
  ];

  const durationOptions = [15, 30, 45, 60];
  const dayOptions = [2, 3, 4, 5, 6];

  const getSplitPreview = (numDays: number) => {
    if (numDays >= 5) return 'Push / Pull / Legs Split (Peak Volume)';
    if (numDays === 4) return 'Upper / Lower Split (Balanced Recovery)';
    return 'Full Body Circuit Split (Full Frequency)';
  };

  const handleNext = () => {
    updateOnboardingState({
      equipmentAccess: equipment as any,
      sessionMinutes: duration,
      daysPerWeek: days,
    });
    navigation.navigate('OnboardingSummary');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <OnboardingProgress
          currentStep={5}
          title="Equipment & Time"
          subtitle="Configure your training environment and weekly availability."
        />

        {/* Equipment Selector */}
        <Text style={styles.sectionHeader}>EQUIPMENT ACCESS</Text>
        <View style={styles.equipList}>
          {equipmentOptions.map((opt) => {
            const isSelected = equipment === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.equipCard, isSelected && styles.equipCardActive]}
                onPress={() => setEquipment(opt.key as any)}
                activeOpacity={0.8}
              >
                <View style={styles.iconCircle}>{opt.icon}</View>
                <View style={styles.equipTextCol}>
                  <Text style={[styles.equipTitle, isSelected && styles.equipTitleActive]}>
                    {opt.title}
                  </Text>
                  <Text style={styles.equipDesc}>{opt.desc}</Text>
                </View>
                <View style={[styles.checkCircle, isSelected && styles.checkCircleActive]}>
                  {isSelected && <View style={styles.checkDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Duration Selector */}
        <View style={styles.rowHeader}>
          <Clock size={16} color={COLORS.accentPrimary} />
          <Text style={styles.sectionHeader}>WORKOUT DURATION PER SESSION</Text>
        </View>
        <View style={styles.pillsRow}>
          {durationOptions.map((d) => {
            const isSelected = duration === d;
            return (
              <TouchableOpacity
                key={d}
                style={[styles.pill, isSelected && styles.pillActive]}
                onPress={() => setDuration(d)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillNumber, isSelected && styles.pillNumberActive]}>
                  {d}
                </Text>
                <Text style={[styles.pillUnit, isSelected && styles.pillUnitActive]}>
                  mins
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Days Per Week Selector */}
        <View style={[styles.rowHeader, { marginTop: SPACING.xl }]}>
          <Calendar size={16} color={COLORS.accentPrimary} />
          <Text style={styles.sectionHeader}>WORKOUT DAYS PER WEEK</Text>
        </View>
        <View style={styles.pillsRow}>
          {dayOptions.map((d) => {
            const isSelected = days === d;
            return (
              <TouchableOpacity
                key={d}
                style={[styles.pill, isSelected && styles.pillActive]}
                onPress={() => setDays(d)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillNumber, isSelected && styles.pillNumberActive]}>
                  {d}
                </Text>
                <Text style={[styles.pillUnit, isSelected && styles.pillUnitActive]}>
                  days
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Split Logic Callout */}
        <View style={styles.splitBanner}>
          <Text style={styles.splitTag}>RULES-BASED SPLIT LOGIC</Text>
          <Text style={styles.splitHeadline}>{getSplitPreview(days)}</Text>
          <Text style={styles.splitDesc}>
            Engine assigns optimal exercise distribution and recovery intervals matching your {days}-day frequency.
          </Text>
        </View>

        <PrimaryButton
          title="Review My Calculation Summary"
          onPress={handleNext}
          style={styles.nextButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  sectionHeader: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  equipList: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  equipCard: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  equipCardActive: {
    borderColor: COLORS.accentPrimary,
    backgroundColor: 'rgba(183, 243, 107, 0.08)',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  equipTextCol: {
    flex: 1,
  },
  equipTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  equipTitleActive: {
    color: COLORS.accentPrimary,
  },
  equipDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    borderColor: COLORS.accentPrimary,
  },
  checkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accentPrimary,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  pill: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    borderColor: COLORS.accentPrimary,
    backgroundColor: 'rgba(183, 243, 107, 0.12)',
  },
  pillNumber: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  pillNumberActive: {
    color: COLORS.accentPrimary,
  },
  pillUnit: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  pillUnitActive: {
    color: COLORS.accentPrimary,
  },
  splitBanner: {
    backgroundColor: 'rgba(183, 243, 107, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(183, 243, 107, 0.25)',
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  splitTag: {
    color: COLORS.accentPrimary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  splitHeadline: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  splitDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  nextButton: {
    marginTop: SPACING.xs,
  },
});
