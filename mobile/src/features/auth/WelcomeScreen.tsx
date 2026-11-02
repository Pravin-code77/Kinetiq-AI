import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '../../app/theme/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const WelcomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={styles.root}>
      {/* Background Hero Image */}
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1200&q=80',
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Dark Vignette Overlay */}
      <View style={styles.overlayTop} />
      <View style={styles.overlayBottom} />

      <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom', 'left', 'right']}>
        {/* Brand Bar */}
        <View style={styles.brandRow}>
          <Text style={styles.brandTitle}>KINETIQ</Text>
          <Text style={styles.brandAi}>AI</Text>
        </View>

        {/* Bottom Content Area */}
        <View style={styles.bottomContent}>
          {/* Main Headline */}
          <Text style={styles.headline}>
            Take your{'\n'}
            <Text style={styles.headlineAccent}>fitness</Text> to the{'\n'}
            next level
          </Text>

          {/* Subtext */}
          <Text style={styles.subtext}>
            Precision fitness splits and instant Gemini AI nutrition tracking. Snap any meal to calculate macros and elevate your training.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            {/* Get Started Button */}
            <TouchableOpacity
              style={styles.getStartedButton}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0E0B',
  },
  backgroundImage: {
    ...(StyleSheet.absoluteFill as any),
    width: '100%',
    height: '100%',
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.4,
    backgroundColor: 'rgba(10, 14, 11, 0.35)',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.72,
    backgroundColor: 'rgba(10, 14, 11, 0.88)',
  },
  safeContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xxl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.md,
    gap: 4,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandAi: {
    color: COLORS.accentPrimary,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  bottomContent: {
    paddingBottom: SPACING.xl,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 48,
    letterSpacing: -0.8,
    marginBottom: SPACING.md,
  },
  headlineAccent: {
    color: COLORS.accentPrimary,
  },
  subtext: {
    color: '#A2ABA5',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: SPACING.xxl,
    maxWidth: '92%',
  },
  buttonsContainer: {
    gap: 12,
  },
  getStartedButton: {
    backgroundColor: COLORS.accentPrimary,
    borderRadius: RADIUS.sm,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    color: '#101713',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loginButton: {
    backgroundColor: 'rgba(20, 26, 22, 0.7)',
    borderRadius: RADIUS.sm,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
