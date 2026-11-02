import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell, Zap } from 'lucide-react-native';
import { COLORS, SPACING } from '../../app/theme/theme';
import { useAppStore } from '../../store/useAppStore';

export const SplashScreen: React.FC<{ navigation?: any }> = () => {
  const { checkAuth } = useAppStore();

  useEffect(() => {
    // Call checkAuth — when done, isLoading goes false, RootNavigator re-evaluates
    // and routes to Auth or MainApp automatically based on token validity
    checkAuth();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.logoBadge}>
        <Dumbbell size={42} color={COLORS.textInverse} />
      </View>
      <View style={styles.titleRow}>
        <Text style={styles.brandTitle}>KINETIQ</Text>
        <Text style={styles.brandAi}>AI</Text>
      </View>
      <Text style={styles.tagline}>Intelligent Fitness & Nutrition</Text>

      <View style={styles.footer}>
        <Zap size={14} color={COLORS.accentPrimary} />
        <Text style={styles.footerText}>Powered by Rules-Based Adaptation</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.accentPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    color: COLORS.textPrimary,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandAi: {
    color: COLORS.accentPrimary,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
  },
  tagline: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginTop: SPACING.xs,
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
});
