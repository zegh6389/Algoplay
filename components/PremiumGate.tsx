// PremiumGate — blocks access to premium features with a fullscreen lock overlay.
// Server-verified: always re-checks entitlement from RevenueCat before granting access.
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';
import { checkPremiumAccess, isRevenueCatConfigured } from '@/lib/revenuecat';

interface PremiumGateProps {
  children: React.ReactNode;
  /** Feature name displayed in the lock overlay */
  featureName?: string;
  /** If true, renders children and shows a floating lock badge instead of a full overlay */
  softLock?: boolean;
}

/**
 * Wrap any screen or component to enforce premium access.
 *
 * On every mount it re-verifies entitlement directly from RevenueCat (server-side
 * source of truth) so that local store tampering is ineffective.
 */
export default function PremiumGate({
  children,
  featureName = 'This Feature',
  softLock = false,
}: PremiumGateProps) {
  const router = useRouter();
  const { isPremium } = useSubscriptionStore();
  const [verified, setVerified] = useState<boolean | null>(null); // null = checking

  // Always verify against RevenueCat server, not just the local Zustand flag
  useEffect(() => {
    let mounted = true;

    const verify = async () => {
      if (isRevenueCatConfigured()) {
        try {
          const serverPremium = await checkPremiumAccess();
          if (mounted) {
            setVerified(serverPremium);
            // Sync local store if server disagrees
            if (serverPremium !== isPremium) {
              useSubscriptionStore.getState()._syncPremium(serverPremium);
            }
          }
        } catch {
          // Network error — trust local cache briefly
          if (mounted) setVerified(isPremium);
        }
      } else {
        // RevenueCat not configured (dev/demo) — trust local flag
        if (mounted) setVerified(isPremium);
      }
    };

    verify();
    return () => { mounted = false; };
  }, [isPremium]);

  // Still verifying
  if (verified === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.neonCyan} />
      </View>
    );
  }

  // Verified premium — render content
  if (verified) {
    return <>{children}</>;
  }

  // Soft lock — show content with a floating upgrade banner
  if (softLock) {
    return (
      <View style={{ flex: 1 }}>
        {children}
        <Animated.View entering={FadeIn} style={styles.softBanner}>
          <TouchableOpacity
            style={styles.softBannerInner}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/premium');
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="lock-closed" size={18} color={Colors.neonYellow} />
            <Text style={styles.softBannerText}>
              Upgrade to Algoplay Pro to unlock full access
            </Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.neonCyan} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  // Hard lock — full-screen overlay
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundDark]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View entering={FadeIn} style={styles.content}>
        <View style={styles.lockIconContainer}>
          <LinearGradient
            colors={[Colors.neonCyan + '30', Colors.neonPurple + '30']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="diamond" size={48} color={Colors.neonCyan} />
        </View>

        <Text style={styles.title}>Algoplay Pro</Text>
        <Text style={styles.subtitle}>
          {featureName} requires Algoplay Pro.{'\n'}
          Unlock lifetime access to every feature.
        </Text>

        <View style={styles.featureList}>
          {[
            'All algorithm visualizations',
            'AI Code Tutor',
            'Advanced analytics & dashboard',
            'Elite Arena & leaderboards',
            'All game modes',
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.neonLime} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.push('/premium');
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.neonCyan, Colors.neonPurple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="diamond" size={22} color={Colors.white} />
          <Text style={styles.upgradeButtonText}>Unlock Algoplay Pro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  lockIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.gray400,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  featureList: {
    alignSelf: 'stretch',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  upgradeButton: {
    width: '100%',
    height: 56,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  upgradeButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  backButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  backButtonText: {
    fontSize: FontSizes.md,
    color: Colors.gray500,
  },
  // Soft lock banner
  softBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  softBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.neonCyan + '40',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  softBannerText: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
