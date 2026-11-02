import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, KeyRound, ArrowLeft, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react-native';
import { InputField } from '../../components/common/InputField';
import { PrimaryButton } from '../../components/common/Buttons';
import { COLORS, RADIUS, SPACING } from '../../app/theme/theme';
import { authService } from '../../services/api';

export const ResetPasswordScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const token = route?.params?.token || '';
  const email = route?.params?.email || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isTokenInvalid, setIsTokenInvalid] = useState(!token);
  const [successMessage, setSuccessMessage] = useState('');

  const handleResetPassword = async () => {
    setErrorMessage('');

    if (!token) {
      setIsTokenInvalid(true);
      setErrorMessage('This password reset link has expired or is invalid. Please request a new one.');
      return;
    }

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setErrorMessage('Please fill in both password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please try again.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.resetPassword({
        token,
        email: email || undefined,
        newPassword,
        confirmPassword,
      });

      const msg =
        res?.message ||
        'Your password has been reset successfully! Please log in with your new password.';
      setSuccessMessage(msg);

      // Auto redirect to login after short delay for user to read success message
      setTimeout(() => {
        navigation.navigate('Login', {
          prefillEmail: email,
          justRegistered: false,
        });
      }, 2000);
    } catch (err: any) {
      const status = err?.response?.status;
      const resMsg = err?.response?.data?.message;

      if (
        status === 400 &&
        (resMsg?.includes('expired') ||
          resMsg?.includes('invalid') ||
          err?.response?.data?.code === 'INVALID_OR_EXPIRED_TOKEN')
      ) {
        setIsTokenInvalid(true);
        setErrorMessage('This password reset link has expired or is invalid. Please request a new one.');
      } else if (resMsg?.includes('match')) {
        setErrorMessage('Passwords do not match. Please try again.');
      } else if (resMsg) {
        setErrorMessage(resMsg);
      } else {
        setErrorMessage('Something went wrong. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <KeyRound size={28} color={COLORS.accentPrimary} />
            </View>
            <Text style={styles.title}>Set New Password</Text>
            <Text style={styles.subtitle}>
              {email ? (
                <>
                  Creating a new password for{' '}
                  <Text style={{ color: COLORS.accentPrimary, fontWeight: '600' }}>
                    {email}
                  </Text>
                </>
              ) : (
                'Choose a strong password with at least 6 characters to secure your account.'
              )}
            </Text>
          </View>

          {/* Success Banner */}
          {!!successMessage && (
            <View style={styles.successBanner}>
              <CheckCircle size={20} color={COLORS.success} />
              <View style={{ flex: 1 }}>
                <Text style={styles.successBannerText}>{successMessage}</Text>
                <Text style={styles.redirectingText}>Redirecting to login screen...</Text>
              </View>
            </View>
          )}

          {/* Error Banner */}
          {!!errorMessage && (
            <View style={[styles.errorBanner, isTokenInvalid && styles.invalidTokenBanner]}>
              <View style={styles.errorRow}>
                <AlertCircle
                  size={18}
                  color={isTokenInvalid ? COLORS.warning : COLORS.error}
                  style={{ marginTop: 2 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.errorText, isTokenInvalid && styles.invalidTokenText]}>
                    {errorMessage}
                  </Text>
                  {isTokenInvalid && (
                    <TouchableOpacity
                      style={styles.requestNewBtn}
                      onPress={() =>
                        navigation.navigate('ForgotPassword', {
                          prefillEmail: email,
                        })
                      }
                      activeOpacity={0.8}
                    >
                      <RefreshCw size={14} color={COLORS.textInverse} />
                      <Text style={styles.requestNewBtnText}>Request New Reset Link</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}

          {!successMessage && (
            <View style={styles.form}>
              <InputField
                label="New Password"
                placeholder="••••••••••••"
                value={newPassword}
                onChangeText={(t) => {
                  setNewPassword(t);
                  if (errorMessage) setErrorMessage('');
                }}
                isPassword
                icon={<Lock size={18} color={COLORS.textSecondary} />}
              />

              <InputField
                label="Confirm New Password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  if (errorMessage) setErrorMessage('');
                }}
                isPassword
                icon={<Lock size={18} color={COLORS.textSecondary} />}
              />

              <PrimaryButton
                title="Reset Password"
                onPress={handleResetPassword}
                loading={loading}
                disabled={loading || !newPassword || !confirmPassword}
                style={styles.submitBtn}
              />

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
              >
                <Text style={styles.cancelBtnText}>Back to Log In</Text>
              </TouchableOpacity>
            </View>
          )}
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
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
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
  form: {
    flex: 1,
  },
  submitBtn: {
    marginTop: SPACING.lg,
  },
  cancelBtn: {
    marginTop: SPACING.md,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.35)',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  successBannerText: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  redirectingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  invalidTokenBanner: {
    backgroundColor: 'rgba(255, 179, 0, 0.12)',
    borderColor: 'rgba(255, 179, 0, 0.35)',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  invalidTokenText: {
    color: COLORS.warning,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  requestNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warning,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
    marginTop: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  requestNewBtnText: {
    color: COLORS.backgroundPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
});
