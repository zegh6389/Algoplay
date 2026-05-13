// PremiumGate — blocks access to premium features with ad-supported access.
// Free users watch an ad each time they access a premium feature.
// Premium subscribers never see ads.
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';
import { checkPremiumAccess, isRevenueCatConfigured } from '@/lib/revenuecat';
import {
  showRewardedAd,
  canShowAd,
  preloadRewardedAd,
} from '@/lib/adService';

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
 * For premium users: renders children directly.
 * For free users: automatically plays a rewarded ad, then shows the content
 * with a top banner to go ad-free.
 */
export default function PremiumGate({
  children,
  featureName = 'This Feature',
  softLock = false,
}: PremiumGateProps) {
  const router = useRouter();
  const { isPremium, recordAdWatched } = useSubscriptionStore();
  const [verified, setVerified] = useState<boolean | null>(null); // null = checking
  const [adPlaying, setAdPlaying] = useState(false);
  const [adGranted, setAdGranted] = useState(false);
  const adAttempted = useRef(false);

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
            // Preload ad for free users
            if (!serverPremium) preloadRewardedAd();
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

  // Auto-play ad for free users once verification completes
  useEffect(() => {
    if (verified === false && !adAttempted.current && !softLock && canShowAd()) {
      adAttempted.current = true;
      playAd();
    }
  }, [verified]);

  // Play a rewarded ad
  const playAd = useCallback(async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setAdPlaying(true);
    try {
      const result = await showRewardedAd();
      if (result.rewarded) {
        recordAdWatched();
        setAdGranted(true);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else if (result.reason) {
        Alert.alert('Ad Not Completed', result.reason);
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setAdPlaying(false);
    }
  }, [recordAdWatched]);

  // Still verifying
  if (verified === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.neonCyan} />
      </View>
    );
  }

  // Premium user — render content directly, no ads ever
  if (verified && isPremium) {
    return <>{children}</>;
  }

  // Free user who just watched an ad — show content with ad-free banner at top
  if (adGranted) {
    return (
      <View style={{ flex: 1 }}>
        <Animated.View entering={FadeIn} style={styles.adFreeBanner}>
          <Ionicons name="diamond-outline" size={16} color={Colors.neonCyan} />
          <Text style={styles.adFreeBannerText}>
            Remove ads forever
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/premium');
            }}
            style={styles.adFreeBannerBtn}
          >
            <LinearGradient
              colors={[Colors.neonCyan, Colors.neonPurple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.adFreeBannerBtnText}>Go Ad-Free</Text>
          </TouchableOpacity>
        </Animated.View>
        {children}
      </View>
    );
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

  // Ad is loading/playing — show loading state
  if (adPlaying) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.neonCyan} />
        <Text style={[styles.subtitle, { marginTop: Spacing.md }]}>Loading ad...</Text>
      </View>
    );
  }

  // Free user, ad not played or failed — show lock screen with Watch Ad + Upgrade options
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

        <Text style={styles.title}>{featureName}</Text>
        <Text style={styles.subtitle}>
          Watch a short video to access this feature,{'\n'}
          or go ad-free with Algoplay Pro.
        </Text>

        {/* Watch Ad Button — Primary action */}
        {Platform.OS !== 'web' && (
          <TouchableOpacity
            style={styles.watchAdButton}
            onPress={playAd}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.neonOrange + 'CC', Colors.neonYellow + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="play-circle" size={24} color={Colors.background} />
            <Text style={styles.watchAdButtonText}>Watch Ad to Continue</Text>
          </TouchableOpacity>
        )}

        {/* OR divider */}
        <View style={styles.orDivider}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        {/* Go Ad-Free / Upgrade Button */}
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
          <Text style={styles.upgradeButtonText}>Go Ad-Free — Algoplay Pro</Text>
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
  // Watch Ad button & related styles
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    width: '100%',
    marginVertical: Spacing.md,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray700 ?? '#2a2a3a',
  },
  orText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  watchAdButton: {
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
  watchAdButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.background,
  },
  // Ad-free banner (shown at top after watching ad)
  adFreeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neonCyan + '30',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  adFreeBannerText: {
    flex: 1,
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  adFreeBannerBtn: {
    borderRadius: BorderRadius.md,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    overflow: 'hidden',
  },
  adFreeBannerBtnText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.white,
  },
});
