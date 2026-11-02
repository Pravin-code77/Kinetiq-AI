import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Lock, CheckSquare, Square, ArrowLeft } from 'lucide-react-native';
import { InputField } from '../../components/common/InputField';
import { PrimaryButton } from '../../components/common/Buttons';
import { COLORS, RADIUS, SPACING } from '../../app/theme/theme';
import { useAppStore } from '../../store/useAppStore';

export const RegisterScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const { register, isLoading } = useAppStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    if (route?.params?.prefillEmail) {
      setEmail(route.params.prefillEmail);
    }
  }, [route?.params]);

  const handleRegister = async () => {
    if (!name.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    if (!agreedTerms) {
      setErrorMessage('Please accept the Health Disclaimer and Terms of Service');
      return;
    }

    setErrorMessage('');
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      // After creating account, navigate to Login screen with success status
      navigation.navigate('Login', {
        prefillEmail: email.trim(),
        justRegistered: true,
      });
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to register account. Please try again.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join Kinetiq AI to unlock rules-based fitness adaptation and smart meal plans.
          </Text>
        </View>

        {!!errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        )}

        <View style={styles.form}>
          <InputField
            label="Full Name"
            placeholder="Alex Hunter"
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (errorMessage) setErrorMessage('');
            }}
            icon={<User size={18} color={COLORS.textSecondary} />}
          />

          <InputField
            label="Email Address"
            placeholder="athlete@example.com"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (errorMessage) setErrorMessage('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={18} color={COLORS.textSecondary} />}
          />

          <InputField
            label="Password"
            placeholder="At least 6 characters"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errorMessage) setErrorMessage('');
            }}
            isPassword
            icon={<Lock size={18} color={COLORS.textSecondary} />}
          />

          <InputField
            label="Confirm Password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              if (errorMessage) setErrorMessage('');
            }}
            isPassword
            icon={<Lock size={18} color={COLORS.textSecondary} />}
          />

          {/* Terms Agreement */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreedTerms((p) => !p)}
            activeOpacity={0.8}
          >
            {agreedTerms ? (
              <CheckSquare size={20} color={COLORS.accentPrimary} />
            ) : (
              <Square size={20} color={COLORS.textMuted} />
            )}
            <Text style={styles.termsText}>
              I acknowledge that Kinetiq AI provides educational fitness recommendations and is not medical advice.
            </Text>
          </TouchableOpacity>

          <PrimaryButton
            title="Create Account & Begin"
            onPress={handleRegister}
            loading={isLoading}
            style={styles.submitBtn}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingTop: SPACING.md,
    flexGrow: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: SPACING.xs,
    lineHeight: 20,
  },
  errorBanner: {
    backgroundColor: COLORS.errorBackground,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  errorBannerText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '500',
  },
  form: {
    flex: 1,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  termsText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  submitBtn: {
    marginBottom: SPACING.xl,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.accentPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});
