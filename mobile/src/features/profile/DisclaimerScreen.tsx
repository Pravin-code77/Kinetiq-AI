import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ShieldCheck, AlertTriangle, HeartPulse, CheckCircle2 } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../app/theme/theme';
import { useAppStore } from '../../store/useAppStore';

export const DisclaimerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { dietary } = useAppStore();

  const ackDate = dietary?.disclaimerAcknowledgedAt
    ? new Date(dietary.disclaimerAcknowledgedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Active';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health & Safety Notice</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Verification Status Pill */}
        <View style={styles.statusCard}>
          <ShieldCheck size={28} color={COLORS.success} />
          <View style={styles.statusTextCol}>
            <Text style={styles.statusTitle}>Disclaimer Acknowledged</Text>
            <Text style={styles.statusSub}>Verified on {ackDate}</Text>
          </View>
        </View>

        {/* Section 1: Non-Medical Advice */}
        <View style={styles.disclaimerSection}>
          <View style={styles.sectionIconRow}>
            <AlertTriangle size={18} color={COLORS.warning} />
            <Text style={styles.sectionTitle}>NOT MEDICAL ADVICE</Text>
          </View>
          <Text style={styles.sectionBody}>
            Kinetiq AI provides algorithmic workout recommendations and macronutrient estimates for educational and athletic performance purposes only. The recommendations generated are not intended to diagnose, treat, prevent, or cure any medical condition.
          </Text>
        </View>

        {/* Section 2: Physician Consultation */}
        <View style={styles.disclaimerSection}>
          <View style={styles.sectionIconRow}>
            <HeartPulse size={18} color={COLORS.error} />
            <Text style={styles.sectionTitle}>PHYSICIAN CONSULTATION</Text>
          </View>
          <Text style={styles.sectionBody}>
            Always consult a licensed physician or medical professional before undertaking any new exercise routine, high-intensity resistance training program, or aggressive dietary regimen, especially if you have a history of cardiovascular issues, diabetes, hypertension, or orthopedic injuries.
          </Text>
        </View>

        {/* Section 3: Allergen & Nutrition Notice */}
        <View style={styles.disclaimerSection}>
          <View style={styles.sectionIconRow}>
            <ShieldCheck size={18} color={COLORS.info} />
            <Text style={styles.sectionTitle}>FOOD ALLERGEN FILTERING</Text>
          </View>
          <Text style={styles.sectionBody}>
            While Kinetiq AI cross-references database ingredients against user-selected allergen preferences (e.g. peanuts, tree nuts, gluten, dairy), commercial recipes and packaged products may undergo factory formulation changes. Always read manufacturer labels.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <CheckCircle2 size={18} color={COLORS.textInverse} />
          <Text style={styles.doneBtnText}>Understood & Acknowledged</Text>
        </TouchableOpacity>
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
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl * 2,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.successBackground,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: 'rgba(165, 232, 135, 0.3)',
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  statusTextCol: {
    flex: 1,
  },
  statusTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.success,
  },
  statusSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  disclaimerSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  sectionBody: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accentPrimary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    marginTop: SPACING.lg,
  },
  doneBtnText: {
    color: COLORS.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
});
