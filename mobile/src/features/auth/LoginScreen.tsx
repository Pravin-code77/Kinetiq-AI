import React, { useState, useEffect } from 'react';
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
import { Mail, Lock, ArrowLeft, CheckCircle, AlertCircle, UserPlus } from 'lucide-react-native';
import { InputField } from '../../components/common/InputField';
import { PrimaryButton } from '../../components/common/Buttons';
import { COLORS, RADIUS, SPACING } from '../../app/theme/theme';
import { useAppStore } from '../../store/useAppStore';

export const LoginScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const { login, isLoading } = useAppStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isUserNotFound, setIsUserNotFound] = useState(false);
  const [isIncorrectPassword, setIsIncorrectPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (route?.params?.prefillEmail) {
      setEmail(route.params.prefillEmail);
    }
    if (route?.params?.justRegistered) {
      setSuccessMessage('Account created successfully! Please enter your password to sign in.');
      setErrorMessage('');
      setIsUserNotFound(false);
      setIsIncorrectPassword(false);
    }
  }, [route?.params]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email and password');
      setIsUserNotFound(false);
      setIsIncorrectPassword(false);
      return;
    }
    setErrorMessage('');
    setSuccessMessage('');
    setIsUserNotFound(false);
    setIsIncorrectPassword(false);
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err: any) {
      const status = err.response?.status;
      const code = err.response?.data?.code;
      const msg = err.response?.data?.message || 'Failed to log in. Please verify your credentials.';
      const notFound =
        status === 404 ||
        code === 'USER_NOT_FOUND' ||
        msg.toLowerCase().includes('create account') ||
        msg.toLowerCase().includes('no account found') ||
        msg.toLowerCase().includes('user not found');


      const wrongPassword =
        status === 401 ||
        code === 'INVALID_CREDENTIALS' ||
        msg.toLowerCase().includes('incorrect password') ||
        msg.toLowerCase().includes('reset your password');

      if (notFound) {
        setIsUserNotFound(true);
        setIsIncorrectPassword(false);
        setErrorMessage('No account found with this email. Please create an account first, then log in.');
      } else if (wrongPassword) {
        setIsUserNotFound(false);
        setIsIncorrectPassword(true);
        setErrorMessage('Incorrect password. Please try again or reset your password.');
      } else {
        setIsUserNotFound(false);
        setIsIncorrectPassword(false);
        setErrorMessage(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            disabled={submitting}
          >
            <ArrowLeft size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Enter your credentials to access your fitness dashboard</Text>
          </View>

          {!!successMessage && (
            <View style={styles.successBanner}>
              <CheckCircle size={18} color={COLORS.success} />
              <Text style={styles.successBannerText}>{successMessage}</Text>
            </View>
          )}

          {!!errorMessage && (
            <View style={[styles.errorBanner, isUserNotFound && styles.notFoundBanner]}>
              <View style={styles.errorBannerRow}>
                <AlertCircle
                  size={18}
                  color={isUserNotFound ? COLORS.warning : COLORS.error}
                  style={{ marginTop: 2 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.errorBannerText, isUserNotFound && styles.notFoundText]}>
                    {errorMessage}
                  </Text>

                  {isUserNotFound && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.createAccountBtn}
                        onPress={() =>
                          navigation.navigate('Register', { prefillEmail: email.trim() })
                        }
                        activeOpacity={0.8}
                      >
                        <UserPlus size={14} color={COLORS.textInverse} />
                        <Text style={styles.createAccountBtnText}>Create Account First</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.welcomeBtn}
                        onPress={() => navigation.navigate('Welcome')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.welcomeBtnText}>Welcome Screen</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {isIncorrectPassword && (
                    <TouchableOpacity
                      style={styles.resetPasswordBtn}
                      onPress={() =>
                        navigation.navigate('ForgotPassword', { prefillEmail: email.trim() })
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.resetPasswordBtnText}>Forgot / Reset Password?</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}

          <View style={styles.form}>
            <InputField
              label="Email Address"
              placeholder="athlete@example.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (errorMessage) {
                  setErrorMessage('');
                  setIsUserNotFound(false);
                  setIsIncorrectPassword(false);
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!submitting}
              icon={<Mail size={18} color={COLORS.textSecondary} />}
            />

            <InputField
              label="Password"
              placeholder="••••••••••••"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (errorMessage) {
                  setErrorMessage('');
                  setIsUserNotFound(false);
                  setIsIncorrectPassword(false);
                }
              }}
              isPassword
              editable={!submitting}
              icon={<Lock size={18} color={COLORS.textSecondary} />}
            />

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() =>
                navigation.navigate('ForgotPassword', { prefillEmail: email.trim() })
              }
              disabled={submitting}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <PrimaryButton
              title="Log In"
              onPress={handleLogin}
              loading={submitting}
              disabled={submitting}
              style={styles.submitBtn}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.signupLink}>Sign Up</Text>
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
    marginBottom: SPACING.lg,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.successBackground,
    borderWidth: 1,
    borderColor: COLORS.success,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  successBannerText: {
    color: COLORS.success,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  errorBanner: {
    backgroundColor: COLORS.errorBackground,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  notFoundBanner: {
    backgroundColor: 'rgba(255, 184, 77, 0.12)',
    borderColor: COLORS.warning,
  },
  errorBannerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  errorBannerText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  notFoundText: {
    color: COLORS.warning,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: SPACING.sm + 2,
    flexWrap: 'wrap',
  },
  createAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.accentPrimary,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
  },
  createAccountBtnText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  welcomeBtn: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
  },
  welcomeBtnText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  resetPasswordBtn: {
    backgroundColor: COLORS.error,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm + 2,
  },
  resetPasswordBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  form: {
    flex: 1,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.xl,
    marginTop: -SPACING.xs,
  },
  forgotText: {
    color: COLORS.accentPrimary,
    fontSize: 13,
    fontWeight: '600',
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
  signupLink: {
    color: COLORS.accentPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});
