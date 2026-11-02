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
import { Check, AlertCircle } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../../app/theme/theme';
import { getOnboardingState, updateOnboardingState } from './onboardingData';

export const DietaryPreferencesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const current = getOnboardingState();

  const [dietType, setDietType] = useState(current.dietType);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(current.allergies || []);
  const [selectedMedicalFlags, setSelectedMedicalFlags] = useState<string[]>(current.medicalFlags || []);

  const dietTypes = [
    { key: 'High Protein', label: 'High Protein', desc: '40% Protein focus for hypertrophy & satiety' },
    { key: 'Balanced', label: 'Balanced Macro', desc: 'Even distribution of protein, carbs & healthy fats' },
    { key: 'Low Carb', label: 'Low Carbohydrate', desc: 'Lower glycemic index to stabilize insulin' },
    { key: 'Keto', label: 'Ketogenic (Keto)', desc: '70% healthy fats, under 20g net carbs daily' },
    { key: 'Vegetarian', label: 'Vegetarian', desc: 'Plant-forward nutrition with eggs and dairy' },
    { key: 'Vegan', label: '100% Plant-Based (Vegan)', desc: 'Zero animal byproducts with complete plant proteins' },
    { key: 'Non-Vegetarian', label: 'Non-Vegetarian', desc: 'Includes poultry, beef, fish, eggs, and dairy' },
  ];

  const commonAllergies = [
    'Peanuts',
    'Tree Nuts',
    'Dairy',
    'Gluten',
    'Shellfish',
    'Soy',
    'Eggs',
    'Fish',
  ];

  const medicalRestrictions = [
    'Knee Injury',
    'Lower Back Pain',
    'Hypertension',
    'Shoulder Impingement',
    'Wrist Pain',
  ];

  const toggleAllergy = (item: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleMedical = (item: string) => {
    setSelectedMedicalFlags((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleNext = () => {
    updateOnboardingState({
      dietType: dietType as any,
      allergies: selectedAllergies,
      medicalFlags: selectedMedicalFlags,
    });
    navigation.navigate('OnboardingEquipment');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <OnboardingProgress
          currentStep={4}
          title="Nutrition & Health"
          subtitle="All recipes with selected allergens and workouts conflicting with medical flags are filtered out automatically."
        />

        {/* Diet Preference Selection */}
        <Text style={styles.sectionHeader}>PRIMARY DIETARY PATTERN</Text>
        <View style={styles.dietList}>
          {dietTypes.map((d) => {
            const isSelected = dietType === d.key;
            return (
              <TouchableOpacity
                key={d.key}
                style={[styles.dietCard, isSelected && styles.dietCardActive]}
                onPress={() => setDietType(d.key as any)}
                activeOpacity={0.8}
              >
                <View style={styles.dietTextCol}>
                  <Text style={[styles.dietLabel, isSelected && styles.dietLabelActive]}>
                    {d.label}
                  </Text>
                  <Text style={styles.dietDesc}>{d.desc}</Text>
                </View>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Allergies Multi-Select */}
        <Text style={styles.sectionHeader}>FOOD ALLERGIES & EXCLUSIONS</Text>
        <Text style={styles.helperText}>Tap any allergen to ensure it is never suggested in meal plans.</Text>
        <View style={styles.tagsContainer}>
          {commonAllergies.map((allergy) => {
            const isChecked = selectedAllergies.includes(allergy);
            return (
              <TouchableOpacity
                key={allergy}
                style={[styles.tagPill, isChecked && styles.tagPillActive]}
                onPress={() => toggleAllergy(allergy)}
                activeOpacity={0.7}
              >
                {isChecked && <Check size={14} color={COLORS.textInverse} style={styles.checkIcon} />}
                <Text style={[styles.tagText, isChecked && styles.tagTextActive]}>
                  {allergy}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Medical Restriction Flags */}
        <View style={styles.medicalHeaderRow}>
          <AlertCircle size={16} color={COLORS.warning} />
          <Text style={styles.sectionHeader}>MEDICAL RESTRICTIONS (OPTIONAL)</Text>
        </View>
        <Text style={styles.helperText}>
          The workout engine excludes exercises that aggravate designated physical limitations.
        </Text>
        <View style={styles.tagsContainer}>
          {medicalRestrictions.map((flag) => {
            const isChecked = selectedMedicalFlags.includes(flag);
            return (
              <TouchableOpacity
                key={flag}
                style={[styles.tagPill, isChecked && styles.medicalPillActive]}
                onPress={() => toggleMedical(flag)}
                activeOpacity={0.7}
              >
                {isChecked && <Check size={14} color={COLORS.textInverse} style={styles.checkIcon} />}
                <Text style={[styles.tagText, isChecked && styles.tagTextActive]}>
                  {flag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <PrimaryButton
          title="Continue to Equipment & Availability"
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
  helperText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: SPACING.md,
    lineHeight: 16,
  },
  dietList: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  dietCard: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dietCardActive: {
    borderColor: COLORS.accentPrimary,
    backgroundColor: 'rgba(183, 243, 107, 0.08)',
  },
  dietTextCol: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  dietLabel: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  dietLabelActive: {
    color: COLORS.accentPrimary,
  },
  dietDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: COLORS.accentPrimary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accentPrimary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  tagPillActive: {
    backgroundColor: COLORS.accentPrimary,
    borderColor: COLORS.accentPrimary,
  },
  medicalPillActive: {
    backgroundColor: COLORS.warning,
    borderColor: COLORS.warning,
  },
  checkIcon: {
    marginRight: 4,
  },
  tagText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  tagTextActive: {
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  medicalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xs,
  },
  nextButton: {
    marginTop: SPACING.sm,
  },
});
