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
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@fastshot/auth';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import CyberBackground from '@/components/CyberBackground';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface SocialButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color: string;
  disabled?: boolean;
  index: number;
}

function SocialButton({ icon, label, onPress, color, disabled, index }: SocialButtonProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Animated.View entering={FadeInDown.delay(300 + index * 100).springify()}>
      <AnimatedTouchable
        style={[styles.socialButton, animatedStyle, disabled && styles.socialButtonDisabled]}
        onPress={handlePress}
        onPressIn={() => (scale.value = withSpring(0.95))}
        onPressOut={() => (scale.value = withSpring(1))}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <View style={[styles.socialIconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <Text style={styles.socialButtonText}>{label}</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
      </AnimatedTouchable>
    </Animated.View>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signInWithGoogle, signInWithApple, signInWithEmail, isLoading, error } = useAuth();
  const { setGuestMode } = useAppStore();

  // Animated glow for logo
  const logoGlow = useSharedValue(0.3);
  React.useEffect(() => {
    logoGlow.value = withRepeat(
      withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const logoGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: logoGlow.value,
  }));

  const handleEmailLogin = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    try {
      await signInWithEmail(email.trim(), password);
    } catch (err) {
      // Error is handled by useAuth
    }
  };

  const handleGoogleLogin = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      await signInWithGoogle();
    } catch (err) {
      // Error is handled by useAuth
    }
  };

  const handleAppleLogin = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      await signInWithApple();
    } catch (err) {
      // Error is handled by useAuth
    }
  };

  const handleGuestLogin = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    // Set guest mode in the store
    setGuestMode(true, 'Guest Coder');
    // Navigate to tabs
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Animated Cyber Background */}
      <CyberBackground showGrid showParticles showMatrix intensity="low" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
            <Animated.View style={[styles.logoContainer, logoGlowStyle]}>
              <LinearGradient
                colors={[Colors.neonCyan, Colors.neonPurple]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <Ionicons name="code-slash" size={36} color={Colors.background} />
              </LinearGradient>
            </Animated.View>
            <Text style={styles.title}>Algoplay</Text>
            <Text style={styles.subtitle}>Master algorithms through play</Text>
          </Animated.View>

          {/* Social Login */}
          <View style={styles.socialContainer}>
            <SocialButton
              icon="logo-google"
              label="Continue with Google"
              onPress={handleGoogleLogin}
              color="#EA4335"
              disabled={isLoading}
              index={0}
            />
            {Platform.OS === 'ios' && (
              <SocialButton
                icon="logo-apple"
                label="Continue with Apple"
                onPress={handleAppleLogin}
                color={Colors.white}
                disabled={isLoading}
                index={1}
              />
            )}
          </View>

          {/* Divider */}
          <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with email</Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          {/* Email Form */}
          <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.formContainer}>
            <BlurView intensity={25} tint="dark" style={styles.glassCard}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={Colors.neonCyan} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor={Colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.neonCyan} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={Colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {error && (
                <Animated.View entering={FadeInUp} style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={Colors.error} />
                  <Text style={styles.errorText}>{error.message}</Text>
                </Animated.View>
              )}

              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleEmailLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[Colors.neonCyan, Colors.accentDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButtonGradient}
                >
                  {isLoading ? (
                    <Text style={styles.loginButtonText}>Signing in...</Text>
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>Sign In</Text>
                      <Ionicons name="arrow-forward" size={20} color={Colors.background} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>
              </Link>
            </BlurView>
          </Animated.View>

          {/* Sign Up Link */}
          <Animated.View entering={FadeInDown.delay(700).springify()} style={styles.signupContainer}>
            <Text style={styles.signupText}>Don&apos;t have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>

          {/* Guest Mode Button - Enhanced */}
          <Animated.View entering={FadeInDown.delay(800).springify()}>
            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestLogin}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['transparent', 'transparent']}
                style={styles.guestButtonInner}
              >
                <Ionicons name="flash" size={18} color={Colors.neonLime} />
                <Text style={styles.guestText}>Continue as Guest</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.neonLime} />
              </LinearGradient>
            </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    marginTop: Spacing.xxxl,
    marginBottom: Spacing.xxl,
  },
  logoContainer: {
    marginBottom: Spacing.lg,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neonCyan + '50',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textShadowColor: Colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.gray400,
  },
  socialContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neonBorderCyan,
  },
  socialButtonDisabled: {
    opacity: 0.6,
  },
  socialIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  socialButtonText: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: '600',
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
  formContainer: {
    marginBottom: Spacing.lg,
  },
  glassCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.neonBorderCyan,
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
    borderWidth: 1,
    borderColor: Colors.error + '40',
  },
  errorText: {
    fontSize: FontSizes.sm,
    color: Colors.error,
    flex: 1,
  },
  loginButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.sm,
    ...Shadows.glow,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  loginButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.background,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  forgotPasswordText: {
    fontSize: FontSizes.sm,
    color: Colors.neonCyan,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  signupText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  signupLink: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.neonCyan,
  },
  guestButton: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neonLime + '40',
    overflow: 'hidden',
    backgroundColor: Colors.neonLime + '10',
  },
  guestButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  guestText: {
    fontSize: FontSizes.md,
    color: Colors.neonLime,
    fontWeight: '600',
  },
});
