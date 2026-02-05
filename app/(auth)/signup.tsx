import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@fastshot/auth';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signUpWithEmail, signInWithGoogle, signInWithApple, isLoading, error, pendingEmailVerification } = useAuth();

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    try {
      const result = await signUpWithEmail(email.trim(), password);
      if (result.emailConfirmationRequired) {
        Alert.alert('Verify Email', `A verification link has been sent to ${result.email}. Please check your inbox.`);
      }
    } catch (err) {
      // Error handled by useAuth
    }
  };

  if (pendingEmailVerification) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={[Colors.background, Colors.backgroundDark]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.verificationContainer}>
          <Animated.View entering={FadeInDown.springify()} style={styles.verificationCard}>
            <View style={styles.verificationIcon}>
              <Ionicons name="mail" size={48} color={Colors.accent} />
            </View>
            <Text style={styles.verificationTitle}>Check Your Email</Text>
            <Text style={styles.verificationSubtitle}>
              We&apos;ve sent a verification link to your email address. Please click the link to verify your account.
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity style={styles.verificationButton}>
                <Text style={styles.verificationButtonText}>Go to Sign In</Text>
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Algoplay and start mastering algorithms</Text>
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
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.gray400} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={Colors.gray500}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.gray400}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.gray400} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor={Colors.gray500}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                />
              </View>

              {/* Password Requirements */}
              <View style={styles.passwordRequirements}>
                <View style={styles.requirementItem}>
                  <Ionicons
                    name={password.length >= 6 ? 'checkmark-circle' : 'ellipse-outline'}
                    size={16}
                    color={password.length >= 6 ? Colors.success : Colors.gray500}
                  />
                  <Text style={[styles.requirementText, password.length >= 6 && styles.requirementMet]}>
                    At least 6 characters
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Ionicons
                    name={password === confirmPassword && password.length > 0 ? 'checkmark-circle' : 'ellipse-outline'}
                    size={16}
                    color={password === confirmPassword && password.length > 0 ? Colors.success : Colors.gray500}
                  />
                  <Text style={[styles.requirementText, password === confirmPassword && password.length > 0 && styles.requirementMet]}>
                    Passwords match
                  </Text>
                </View>
              </View>

              {error && (
                <Animated.View entering={FadeInUp} style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={Colors.error} />
                  <Text style={styles.errorText}>{error.message}</Text>
                </Animated.View>
              )}

              <TouchableOpacity
                style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
                onPress={handleSignUp}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[Colors.electricPurple, Colors.electricPurpleDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.signupButtonGradient}
                >
                  {isLoading ? (
                    <Text style={styles.signupButtonText}>Creating account...</Text>
                  ) : (
                    <>
                      <Text style={styles.signupButtonText}>Create Account</Text>
                      <Ionicons name="arrow-forward" size={20} color={Colors.textPrimary} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>

          {/* Divider */}
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign up with</Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          {/* Social Buttons */}
          <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.socialContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={signInWithGoogle}
              disabled={isLoading}
            >
              <Ionicons name="logo-google" size={22} color="#EA4335" />
            </TouchableOpacity>
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={signInWithApple}
                disabled={isLoading}
              >
                <Ionicons name="logo-apple" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Sign In Link */}
          <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.signinContainer}>
            <Text style={styles.signinText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.signinLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.electricPurple + '10',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -50,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: Colors.accent + '10',
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
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.gray400,
  },
  formContainer: {
    marginBottom: Spacing.lg,
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
  passwordRequirements: {
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  requirementText: {
    fontSize: FontSizes.sm,
    color: Colors.gray500,
  },
  requirementMet: {
    color: Colors.success,
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
  signupButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  signupButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray700,
  },
  dividerText: {
    fontSize: FontSizes.sm,
    color: Colors.gray500,
    marginHorizontal: Spacing.md,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.small,
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signinText: {
    fontSize: FontSizes.md,
    color: Colors.gray400,
  },
  signinLink: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.electricPurple,
  },
  // Verification Screen
  verificationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  verificationCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.medium,
  },
  verificationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  verificationTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  verificationSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.gray400,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  verificationButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  verificationButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.background,
  },
});
