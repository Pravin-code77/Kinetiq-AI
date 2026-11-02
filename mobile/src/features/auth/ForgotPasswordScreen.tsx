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
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, UserPlus, Send, KeyRound } from 'lucide-react-native';
import { InputField } from '../../components/common/InputField';
import { PrimaryButton } from '../../components/common/Buttons';
import { COLORS, RADIUS, SPACING } from '../../app/theme/theme';
import { authService } from '../../services/api';

export const ForgotPasswordScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route,
}) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUserNotFound, setIsUserNotFound] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [receivedToken, setReceivedToken] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  useEffect(() => {
    if (route?.params?.prefillEmail) {
      setEmail(route.params.prefillEmail);
    }
  }, [route?.params?.prefillEmail]);

  const handleSendResetLink = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid Gmail address.');
      setIsUserNotFound(false);
      return;
    }

    setErrorMessage('');
    setIsUserNotFound(false);
    setLoading(true);

    try {
      const res = await authService.forgotPassword(cleanEmail);
      const msg =
        res?.message ||
        'Password reset link sent! Please check your Gmail inbox to reset your password.';
      setSuccessMessage(msg);
      if (res?.data?.resetToken) {
        setReceivedToken(res.data.resetToken);
      }
      if (res?.data?.tempPassword) {
        setTempPassword(res.data.tempPassword);
      }
      setSubmitted(true);
    } catch (err: any) {
      const status = err?.response?.status;
      const resMsg = err?.response?.data?.message;

      if (
        status === 404 ||
        err?.response?.data?.code === 'USER_NOT_FOUND' ||
        resMsg?.includes('create an account') ||
        resMsg?.includes('No account found')
      ) {
        setIsUserNotFound(true);
        setErrorMessage(
          'No account found with this email. Please create an account first, then log in.'
        );
      } else if (resMsg) {
        setIsUserNotFound(false);
        setErrorMessage(resMsg);
      } else {
        setIsUserNotFound(false);
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
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            disabled={loading}
          >
            <ArrowLeft size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your registered Gmail address. We'll send you a secure link to reset your password.
            </Text>
          </View>

          {/* Success State */}
          {submitted ? (
            <View style={styles.successCard}>
              <View style={styles.successIconWrapper}>
                <CheckCircle2 size={42} color={COLORS.success} />
              </View>
              <Text style={styles.successTitle}>Check Your Gmail</Text>
              <Text style={styles.successDesc}>
                {successMessage ||
                  'Password reset link sent! Please check your Gmail inbox to reset your password.'}
              </Text>
              <Text style={styles.emailHighlight}>{email}</Text>

              {!!tempPassword && (
                <View style={styles.tempPassCard}>
                  <Text style={styles.tempPassLabel}>TEMPORARY LOGIN PASSWORD</Text>
                  <Text style={styles.tempPassCode}>{tempPassword}</Text>
                  <Text style={styles.tempPassHint}>
                    Dispatched to your email. You can also log in directly with this password.
                  </Text>
                </View>
              )}

              {!!receivedToken && (
                <TouchableOpacity
                  style={styles.directResetBtn}
                  onPress={() =>
                    navigation.navigate('ResetPassword', {
                      token: receivedToken,
                      email: email.trim(),
                    })
                  }
                  activeOpacity={0.8}
                >
                  <KeyRound size={16} color={COLORS.backgroundPrimary} />
                  <Text style={styles.directResetBtnText}>
                    Open Reset Password Screen (Direct Test)
                  </Text>
                </TouchableOpacity>
              )}

              <PrimaryButton
                title={tempPassword ? 'Log In With This Password' : 'Return to Login'}
                onPress={() => navigation.navigate('Login', { prefillEmail: email })}
                style={styles.returnBtn}
              />
            </View>
          ) : (
            <View style={styles.form}>
              {/* Error Banner */}
              {!!errorMessage && (
                <View style={[styles.errorBanner, isUserNotFound && styles.notFoundBanner]}>
                  <View style={styles.errorRow}>
                    <AlertCircle
                      size={18}
                      color={isUserNotFound ? COLORS.warning : COLORS.error}
                      style={{ marginTop: 2 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.errorText, isUserNotFound && styles.notFoundText]}>
                        {errorMessage}
                      </Text>
                      {isUserNotFound && (
                        <TouchableOpacity
                          style={styles.createAccountBtn}
                          onPress={() =>
                            navigation.navigate('Register', {
                              prefillEmail: email.trim(),
                            })
                          }
                          activeOpacity={0.8}
                        >
                          <UserPlus size={14} color={COLORS.textInverse} />
                          <Text style={styles.createAccountBtnText}>Create Account First</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              )}

              <InputField
                label="Registered Gmail Address"
                placeholder="athlete@gmail.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMessage) {
                    setErrorMessage('');
                    setIsUserNotFound(false);
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
                icon={<Mail size={18} color={COLORS.textSecondary} />}
              />

              <PrimaryButton
                title="Send Reset Link"
                onPress={handleSendResetLink}
                loading={loading}
                disabled={loading || !email.trim() || !email.includes('@')}
                style={styles.submitBtn}
              />

              <TouchableOpacity
                style={styles.backToLoginBtn}
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.backToLoginText}>
                  Remember your password? <Text style={{ color: COLORS.accentPrimary }}>Log In</Text>
                </Text>
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
    marginTop: SPACING.md,
  },
  backToLoginBtn: {
    marginTop: SPACING.lg,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  backToLoginText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  notFoundBanner: {
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
  notFoundText: {
    color: COLORS.warning,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  createAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentPrimary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
    marginTop: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  createAccountBtnText: {
    color: COLORS.backgroundPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  successCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.cardLg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  successIconWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  successTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  successDesc: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  emailHighlight: {
    color: COLORS.accentPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  tempPassCard: {
    backgroundColor: 'rgba(204, 255, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.3)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  tempPassLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  tempPassCode: {
    color: COLORS.accentPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginVertical: 4,
  },
  tempPassHint: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },
  directResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accentPrimary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  directResetBtnText: {
    color: COLORS.backgroundPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  returnBtn: {
    width: '100%',
  },
});
