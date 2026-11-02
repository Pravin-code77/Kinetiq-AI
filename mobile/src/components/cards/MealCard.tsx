import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Flame, Plus, Trash2, Edit2 } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../../app/theme/theme';

interface MealCardProps {
  slot: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
  portionScale?: number;
  onPress?: () => void;
  onEditPortion?: () => void;
  onAddPress?: () => void;
  onDeletePress?: () => void;
  isLogged?: boolean;
}

export const MealCard: React.FC<MealCardProps> = ({
  slot,
  name,
  calories,
  protein,
  carbs,
  fat,
  imageUrl,
  portionScale = 1.0,
  onPress,
  onEditPortion,
  onAddPress,
  onDeletePress,
  isLogged = false,
}) => {
  const defaultImg = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.card, isLogged && styles.loggedCard]}
    >
      <View style={styles.headerRow}>
        <View style={styles.slotBadge}>
          <Text style={styles.slotText}>{slot.toUpperCase()}</Text>
        </View>
        <View style={styles.calorieBadge}>
          <Flame size={13} color={COLORS.accentPrimary} />
          <Text style={styles.calorieText}>{calories} kcal</Text>
        </View>
      </View>

      <View style={styles.bodyRow}>
        <Image
          source={{ uri: imageUrl || defaultImg }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.infoCol}>
          <Text style={styles.title} numberOfLines={2}>
            {name}
          </Text>
          {portionScale !== 1.0 && (
            <Text style={styles.scaleText}>Portion: {Math.round(portionScale * 100)}% standard</Text>
          )}

          {/* Macros Pills */}
          <View style={styles.macroPillsRow}>
            <View style={styles.macroPill}>
              <Text style={[styles.macroPillVal, { color: COLORS.accentPrimary }]}>{protein}g</Text>
              <Text style={styles.macroPillKey}>P</Text>
            </View>
            <View style={styles.macroPill}>
              <Text style={[styles.macroPillVal, { color: COLORS.info }]}>{carbs}g</Text>
              <Text style={styles.macroPillKey}>C</Text>
            </View>
            <View style={styles.macroPill}>
              <Text style={[styles.macroPillVal, { color: COLORS.warning }]}>{fat}g</Text>
              <Text style={styles.macroPillKey}>F</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Footer */}
      <View style={styles.footerRow}>
        {onEditPortion && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onEditPortion}
            activeOpacity={0.7}
          >
            <Edit2 size={14} color={COLORS.textSecondary} />
            <Text style={styles.actionText}>Edit Portion</Text>
          </TouchableOpacity>
        )}

        {onDeletePress && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={onDeletePress}
            activeOpacity={0.7}
          >
            <Trash2 size={14} color={COLORS.error} />
            <Text style={[styles.actionText, { color: COLORS.error }]}>Remove</Text>
          </TouchableOpacity>
        )}

        {onAddPress && (
          <TouchableOpacity
            style={[styles.actionButton, styles.logButton]}
            onPress={onAddPress}
            activeOpacity={0.7}
          >
            <Plus size={14} color={COLORS.textInverse} />
            <Text style={[styles.actionText, { color: COLORS.textInverse, fontWeight: '700' }]}>
              {isLogged ? 'Logged' : 'Log Meal'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  loggedCard: {
    borderColor: 'rgba(127, 214, 165, 0.4)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  slotBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  slotText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  calorieBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(183, 243, 107, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  calorieText: {
    color: COLORS.accentPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
  },
  infoCol: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  scaleText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 6,
  },
  macroPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  macroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.backgroundPrimary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  macroPillVal: {
    fontSize: 11,
    fontWeight: '700',
  },
  macroPillKey: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  logButton: {
    backgroundColor: COLORS.accentPrimary,
  },
});
