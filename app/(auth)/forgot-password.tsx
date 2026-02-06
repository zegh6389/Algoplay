import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/components/AuthProvider';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const { resetPassword, isLoading, error, pendingPasswordReset } = useAuth();

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    try {
      await resetPassword(email.trim());
    } catch (err) {
      // Error handled by useAuth
    }
  };

  if (pendingPasswordReset) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={[Colors.background, Colors.backgroundDark]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.successContainer}>
          <Animated.View entering={FadeInDown.springify()} style={styles.successCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
            </View>
            <Text style={styles.successTitle}>Email Sent!</Text>
            <Text style={styles.successSubtitle}>
              Check your inbox for password reset instructions. The link will expire in 24 hours.
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity style={styles.successButton}>
                <Text style={styles.successButtonText}>Back to Sign In</Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundDark]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative Circles */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Back Button */}
          <Animated.View entering={FadeInDown.delay(100)}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </Animated.View>

          {/* Header */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="key" size={40} color={Colors.logicGold} />
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              No worries! Enter your email address and we&apos;ll send you a link to reset your password.
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.formContainer}>
            <BlurView intensity={20} tint="dark" style={styles.glassCard}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={Colors.gray400} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor={Colors.gray500}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  autoFocus
                />
              </View>

              {error && (
                <Animated.View entering={FadeInUp} style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={Colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
              )}

              <TouchableOpacity
                style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[Colors.logicGold, Colors.logicGoldDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.resetButtonGradient}
                >
                  {isLoading ? (
                    <Text style={styles.resetButtonText}>Sending...</Text>
                  ) : (
                    <>
                      <Text style={styles.resetButtonText}>Send Reset Link</Text>
                      <Ionicons name="send" size={18} color={Colors.background} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>

          {/* Back to Login Link */}
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.loginContainer}>
            <Ionicons name="arrow-back" size={16} color={Colors.gray500} />
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Back to Sign In</Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: Colors.logicGold + '10',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.accent + '08',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.xxxl,
    marginBottom: Spacing.xxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.logicGold + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.gray400,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
  formContainer: {
    marginBottom: Spacing.xl,
  },
  glassCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundDark,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    marginLeft: Spacing.sm,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '20',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  errorText: {
    fontSize: FontSizes.sm,
    color: Colors.error,
    flex: 1,
  },
  resetButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  resetButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.background,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  loginLink: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    color: Colors.gray400,
  },
  // Success Screen
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  successCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.medium,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.gray400,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  successButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  successButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.background,
  },
});
