import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  Flame,
  Utensils,
} from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../app/theme/theme';
import { nutritionService } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';

interface CatalogItem {
  _id: string;
  name: string;
  category: string;
  defaultServingGrams: number;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

interface StagedFoodItem {
  id: string;
  name: string;
  portionGrams: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

export const FoodLoggerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { fetchTodayMeals, fetchDashboard } = useAppStore();

  const [selectedSlot, setSelectedSlot] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'>('Lunch');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Staged foods for this meal
  const [stagedItems, setStagedItems] = useState<StagedFoodItem[]>([]);
  const [saving, setSaving] = useState(false);

  const categories = ['All', 'Protein', 'Carbohydrates', 'Vegetables', 'Fruits', 'Dairy', 'Snacks'];

  useEffect(() => {
    searchFoods('');
  }, []);

  const searchFoods = async (q: string) => {
    try {
      setLoadingSearch(true);
      const items = await nutritionService.searchNutritionItems(q);
      setCatalogItems(items);
    } catch (err) {
      console.warn('Food search error', err);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSelectCatalogItem = (item: CatalogItem) => {
    const defaultGrams = item.defaultServingGrams || 100;
    const factor = defaultGrams / 100;

    const staged: StagedFoodItem = {
      id: `${item._id}-${Date.now()}`,
      name: item.name,
      portionGrams: defaultGrams,
      calories: Math.round(item.caloriesPer100g * factor),
      protein: Math.round(item.proteinPer100g * factor * 10) / 10,
      carbohydrates: Math.round(item.carbsPer100g * factor * 10) / 10,
      fat: Math.round(item.fatPer100g * factor * 10) / 10,
    };

    setStagedItems((prev) => [...prev, staged]);
  };

  const updateStagedPortion = (id: string, grams: number) => {
    setStagedItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const safeGrams = Math.max(10, grams);
          const ratio = safeGrams / item.portionGrams;
          return {
            ...item,
            portionGrams: safeGrams,
            calories: Math.round(item.calories * ratio),
            protein: Math.round(item.protein * ratio * 10) / 10,
            carbohydrates: Math.round(item.carbohydrates * ratio * 10) / 10,
            fat: Math.round(item.fat * ratio * 10) / 10,
          };
        }
        return item;
      })
    );
  };

  const removeStagedItem = (id: string) => {
    setStagedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const totalCalories = stagedItems.reduce((acc, curr) => acc + curr.calories, 0);
  const totalProtein = Math.round(stagedItems.reduce((acc, curr) => acc + curr.protein, 0));
  const totalCarbs = Math.round(stagedItems.reduce((acc, curr) => acc + curr.carbohydrates, 0));
  const totalFat = Math.round(stagedItems.reduce((acc, curr) => acc + curr.fat, 0));

  const handleSaveMeal = async () => {
    if (stagedItems.length === 0) {
      Alert.alert('No Items', 'Please select at least one food item to log.');
      return;
    }

    try {
      setSaving(true);
      await nutritionService.logMeal({
        mealSlot: selectedSlot,
        items: stagedItems.map((item) => ({
          name: item.name,
          portionGrams: item.portionGrams,
          calories: item.calories,
          protein: item.protein,
          carbohydrates: item.carbohydrates,
          fat: item.fat,
        })),
      });

      await Promise.all([fetchTodayMeals(), fetchDashboard()]);
      Alert.alert('Success', `Logged ${selectedSlot} successfully!`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Could not save meal');
    } finally {
      setSaving(false);
    }
  };

  const slots: Array<'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'> = [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snacks',
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Food</Text>
        <TouchableOpacity
          style={styles.saveTopBtn}
          onPress={handleSaveMeal}
          disabled={saving || stagedItems.length === 0}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.textInverse} />
          ) : (
            <Text
              style={[
                styles.saveTopText,
                stagedItems.length === 0 && styles.saveTopTextDisabled,
              ]}
            >
              SAVE
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Slot Selector */}
      <View style={styles.slotsRow}>
        {slots.map((slot) => {
          const isSelected = selectedSlot === slot;
          return (
            <TouchableOpacity
              key={slot}
              style={[styles.slotTab, isSelected && styles.slotTabActive]}
              onPress={() => setSelectedSlot(slot)}
              activeOpacity={0.8}
            >
              <Text style={[styles.slotTabText, isSelected && styles.slotTabTextActive]}>
                {slot}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Staged Items Card (if any selected) */}
        {stagedItems.length > 0 && (
          <View style={styles.stagedCard}>
            <View style={styles.stagedHeader}>
              <Text style={styles.stagedTitle}>
                {selectedSlot.toUpperCase()} TRAY ({stagedItems.length})
              </Text>
              <View style={styles.stagedTotalBadge}>
                <Flame size={13} color={COLORS.accentPrimary} />
                <Text style={styles.stagedTotalCalories}>{totalCalories} kcal</Text>
              </View>
            </View>

            {/* Macros Summary Pill Row */}
            <View style={styles.macroSummaryRow}>
              <Text style={styles.macroSumItem}>
                P: <Text style={{ color: COLORS.accentPrimary }}>{totalProtein}g</Text>
              </Text>
              <Text style={styles.macroSumItem}>
                C: <Text style={{ color: COLORS.info }}>{totalCarbs}g</Text>
              </Text>
              <Text style={styles.macroSumItem}>
                F: <Text style={{ color: COLORS.warning }}>{totalFat}g</Text>
              </Text>
            </View>

            {/* Staged Items List */}
            {stagedItems.map((item) => (
              <View key={item.id} style={styles.stagedItemRow}>
                <View style={styles.stagedItemInfo}>
                  <Text style={styles.stagedItemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.stagedItemMacros}>
                    {item.calories} kcal • P: {item.protein}g C: {item.carbohydrates}g F: {item.fat}g
                  </Text>
                </View>

                {/* Grams stepper */}
                <View style={styles.portionStepper}>
                  <TouchableOpacity
                    style={styles.portionBtn}
                    onPress={() => updateStagedPortion(item.id, item.portionGrams - 25)}
                  >
                    <Minus size={12} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                  <Text style={styles.portionGramsText}>{item.portionGrams}g</Text>
                  <TouchableOpacity
                    style={styles.portionBtn}
                    onPress={() => updateStagedPortion(item.id, item.portionGrams + 25)}
                  >
                    <Plus size={12} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Delete button */}
                <TouchableOpacity
                  style={styles.deleteStagedBtn}
                  onPress={() => removeStagedItem(item.id)}
                >
                  <Trash2 size={15} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chicken, oats, rice, whey..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={(txt) => {
              setSearchQuery(txt);
              searchFoods(txt);
            }}
          />
        </View>

        {/* Catalog Items Header */}
        <Text style={styles.catalogHeading}>DATABASE CATALOG</Text>

        {/* Catalog Items List */}
        {loadingSearch ? (
          <ActivityIndicator size="small" color={COLORS.accentPrimary} style={{ marginVertical: 20 }} />
        ) : catalogItems.length > 0 ? (
          catalogItems.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.catalogItemRow}
              onPress={() => handleSelectCatalogItem(item)}
              activeOpacity={0.8}
            >
              <View style={styles.catalogItemContent}>
                <Text style={styles.catalogItemName}>{item.name}</Text>
                <Text style={styles.catalogItemServing}>
                  Standard: {item.defaultServingGrams || 100}g • {item.caloriesPer100g} kcal / 100g
                </Text>
                <View style={styles.catalogMacroRow}>
                  <Text style={[styles.catMacroPill, { color: COLORS.accentPrimary }]}>
                    P: {item.proteinPer100g}g
                  </Text>
                  <Text style={[styles.catMacroPill, { color: COLORS.info }]}>
                    C: {item.carbsPer100g}g
                  </Text>
                  <Text style={[styles.catMacroPill, { color: COLORS.warning }]}>
                    F: {item.fatPer100g}g
                  </Text>
                </View>
              </View>

              <View style={styles.addIconCircle}>
                <Plus size={16} color={COLORS.textInverse} />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptySearch}>
            <Utensils size={32} color={COLORS.textMuted} />
            <Text style={styles.emptySearchText}>No matching foods found in catalog</Text>
          </View>
        )}
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
  saveTopBtn: {
    backgroundColor: COLORS.accentPrimary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
  },
  saveTopText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: '800',
  },
  saveTopTextDisabled: {
    opacity: 0.5,
  },
  slotsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.backgroundSecondary,
  },
  slotTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  slotTabActive: {
    backgroundColor: COLORS.accentPrimary,
    borderColor: COLORS.accentPrimary,
  },
  slotTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  slotTabTextActive: {
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl * 2,
  },
  stagedCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.borderNeon,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  stagedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stagedTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accentPrimary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  stagedTotalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stagedTotalCalories: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  macroSummaryRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  macroSumItem: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  stagedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    gap: 8,
  },
  stagedItemInfo: {
    flex: 1,
  },
  stagedItemName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  stagedItemMacros: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  portionStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  portionBtn: {
    padding: 6,
  },
  portionGramsText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
  deleteStagedBtn: {
    padding: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 46,
    gap: 8,
    marginBottom: SPACING.lg,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  catalogHeading: {
    ...TYPOGRAPHY.caption,
    letterSpacing: 1.5,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  catalogItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  catalogItemContent: {
    flex: 1,
  },
  catalogItemName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  catalogItemServing: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginBottom: 4,
  },
  catalogMacroRow: {
    flexDirection: 'row',
    gap: 8,
  },
  catMacroPill: {
    fontSize: 11,
    fontWeight: '600',
  },
  addIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  emptySearch: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    gap: SPACING.sm,
  },
  emptySearchText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
});
