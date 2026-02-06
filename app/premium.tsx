// Premium Access & Lifetime Purchase Screen with RevenueCat Integration
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { PurchasesPackage } from 'react-native-purchases';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import CyberBackground from '@/components/CyberBackground';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';
import {
  purchasePackage,
  isRevenueCatConfigured,
  presentPaywall,
  PREMIUM_FEATURES,
} from '@/lib/revenuecat';

interface Feature {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  isPro: boolean;
}

const features: Feature[] = [
  {
    icon: 'flash',
    title: 'All Algorithm Visualizations',
    description: 'Access 50+ algorithms including advanced DP, graphs, and trees',
    isPro: true,
  },
  {
    icon: 'code-slash',
    title: 'Multi-Language Code',
    description: 'View implementations in Python, JavaScript, C++, Java, and Go',
    isPro: true,
  },
  {
    icon: 'sparkles',
    title: 'AI Code Tutor',
    description: 'Get personalized explanations and debugging help',
    isPro: true,
  },
  {
    icon: 'trending-up',
    title: 'Advanced Analytics',
    description: 'Track progress with detailed insights and recommendations',
    isPro: true,
  },
  {
    icon: 'trophy',
    title: 'Elite Arena Access',
    description: 'Compete in exclusive challenges and tournaments',
    isPro: true,
  },
  {
    icon: 'download',
    title: 'Offline Mode',
    description: 'Download visualizations and study without internet',
    isPro: true,
  },
  {
    icon: 'briefcase',
    title: 'Interview Prep Pack',
    description: '500+ curated problems from top tech companies',
    isPro: true,
  },
  {
    icon: 'school',
    title: 'Certification Path',
    description: 'Earn certificates to showcase your algorithm mastery',
    isPro: true,
  },
  {
    icon: 'people',
    title: 'Priority Support',
    description: '24/7 expert support via chat',
    isPro: true,
  },
];

interface PlanCardProps {
  title: string;
  subtitle: string;
  price: string;
  label: string;
  features: string[];
  onSelect: () => void;
  isLoading?: boolean;
}

function PlanCard({
  title,
  subtitle,
  price,
  label,
  features,
  onSelect,
  isLoading,
}: PlanCardProps) {
  return (
    <TouchableOpacity
      style={[styles.planCard, styles.planCardSelected]}
      onPress={onSelect}
      activeOpacity={0.8}
      disabled={isLoading}
    >
      <View style={styles.popularBadge}>
        <LinearGradient
          colors={[Colors.neonPink, Colors.neonPurple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.popularText}>{label}</Text>
      </View>

      <LinearGradient
        colors={[Colors.neonCyan + '10', Colors.neonPurple + '10']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.planHeader}>
        <View>
          <Text style={styles.planTitle}>{title}</Text>
          <Text style={styles.planSubtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.period}> one-time</Text>
      </View>

      <View style={styles.planFeatures}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.neonLime} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

function FeatureItem({ feature, index }: { feature: Feature; index: number }) {
  return (
    <Animated.View
      entering={FadeIn.delay(index * 50).springify()}
      style={styles.featureCard}
    >
      <View style={styles.featureIconContainer}>
        <LinearGradient
          colors={[Colors.neonCyan + '30', Colors.neonPurple + '30']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Ionicons name={feature.icon} size={24} color={Colors.neonCyan} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
      {feature.isPro && (
        <View style={styles.proBadge}>
          <Text style={styles.proText}>PRO</Text>
        </View>
      )}
    </Animated.View>
  );
}

export default function PremiumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const {
    isPremium,
    isLoading,
    offerings,
    mockOfferings,
    initialize,
    restorePurchases: doRestore,
    _syncPremium,
  } = useSubscriptionStore();

  useEffect(() => {
    initialize();
  }, []);

  // Get the lifetime package from the default offering
  const lifetimePackage = offerings?.current?.availablePackages?.find(
    (p) => p.packageType === 'LIFETIME'
  ) || offerings?.current?.availablePackages?.[0]; // fallback to first package

  const lifetimePrice = lifetimePackage?.product.priceString
    || mockOfferings?.lifetime.product.priceString
    || '$99.99';

  const handlePurchase = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (!isRevenueCatConfigured()) {
      Alert.alert(
        'Demo Mode',
        'RevenueCat is not configured. In production, this would start the purchase process.\n\nFor testing, premium access will be enabled.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable Demo Premium',
            onPress: () => {
              _syncPremium(true);
              Alert.alert('Success!', 'Demo premium access enabled!', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            },
          },
        ]
      );
      return;
    }

    // Try native RevenueCat paywall first
    setIsPurchasing(true);
    try {
      const purchased = await presentPaywall();
      if (purchased) {
        _syncPremium(true);
        Alert.alert(
          'Welcome to Algoplay Pro! \u{1F389}',
          'You now have lifetime access to all premium features.',
          [{ text: 'Start Learning', onPress: () => router.back() }]
        );
        return;
      }
    } catch {
      console.log('Native paywall unavailable, falling back to manual purchase');
    }

    // Fallback: manual package purchase
    if (!lifetimePackage) {
      Alert.alert('Error', 'Unable to load the lifetime package. Please try again.');
      setIsPurchasing(false);
      return;
    }

    try {
      const result = await purchasePackage(lifetimePackage as PurchasesPackage);

      if (result.success && result.isPremium) {
        _syncPremium(true);
        Alert.alert(
          'Welcome to Algoplay Pro! \u{1F389}',
          'You now have lifetime access to all premium features.',
          [{ text: 'Start Learning', onPress: () => router.back() }]
        );
      } else if (result.error && result.error !== 'Purchase cancelled') {
        Alert.alert('Purchase Failed', result.error);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const result = await doRestore();

    Alert.alert(
      result.success ? 'Restore Complete' : 'Restore',
      result.message
    );

    if (result.success && isPremium) {
      router.back();
    }
  };

  // If already premium, show different UI
  if (isPremium) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <CyberBackground />

        <Animated.View entering={FadeInDown} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <LinearGradient
              colors={[Colors.neonCyan, Colors.neonPurple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.crownIconBackground}
            >
              <Ionicons name="diamond" size={24} color={Colors.white} />
            </LinearGradient>
            <Text style={styles.title}>Premium Active</Text>
          </View>
          <View style={{ width: 40 }} />
        </Animated.View>

        <View style={styles.premiumActiveContainer}>
          <Ionicons name="checkmark-circle" size={80} color={Colors.neonLime} />
          <Text style={styles.premiumActiveTitle}>You&apos;re Premium!</Text>
          <Text style={styles.premiumActiveSubtitle}>
            Enjoy unlimited access to all features
          </Text>

          <View style={styles.featuresList}>
            {PREMIUM_FEATURES.slice(0, 5).map((feature, index) => (
              <View key={index} style={styles.activeFeatureRow}>
                <Ionicons name="checkmark" size={20} color={Colors.neonCyan} />
                <Text style={styles.activeFeatureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.back()}
          >
            <Text style={styles.continueButtonText}>Continue Learning</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <CyberBackground />

      {/* Header */}
      <Animated.View entering={FadeInDown} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <LinearGradient
            colors={[Colors.neonCyan, Colors.neonPurple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.crownIconBackground}
          >
            <Ionicons name="diamond" size={24} color={Colors.white} />
          </LinearGradient>
          <Text style={styles.title}>Go Premium</Text>
        </View>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.heroSection}>
          <Text style={styles.heroTitle}>Unlock Your Full Potential</Text>
          <Text style={styles.heroSubtitle}>
            Master algorithms faster with premium features designed for serious learners
          </Text>
        </Animated.View>

        {/* Lifetime Plan */}
        <Animated.View entering={FadeInUp.delay(150)} style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Lifetime Access</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.neonCyan} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <View style={styles.plansContainer}>
              <PlanCard
                title="Algoplay Pro"
                subtitle="Pay once, own it forever"
                price={lifetimePrice}
                label="BEST VALUE"
                features={[
                  'All premium features unlocked',
                  'Lifetime access — no recurring fees',
                  'All future updates included',
                  'Priority support',
                ]}
                onSelect={handlePurchase}
                isLoading={isPurchasing}
              />
            </View>
          )}
        </Animated.View>

        {/* Features List */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Everything Included</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <FeatureItem key={index} feature={feature} index={index} />
            ))}
          </View>
        </Animated.View>

        {/* Testimonials */}
        <Animated.View entering={FadeInUp.delay(250)} style={styles.testimonialSection}>
          <Text style={styles.sectionTitle}>Loved by Algorithm Masters</Text>
          <View style={styles.testimonialCard}>
            <View style={styles.quoteIcon}>
              <Ionicons name="chatbox-ellipses" size={24} color={Colors.neonCyan} />
            </View>
            <Text style={styles.testimonialText}>
              &quot;This app transformed my interview prep. Got offers from 3 FAANG companies!&quot;
            </Text>
            <Text style={styles.testimonialAuthor}>- Sarah K., Software Engineer at Google</Text>
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>50K+</Text>
            <Text style={styles.statLabel}>Premium Users</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.9★</Text>
            <Text style={styles.statLabel}>App Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>95%</Text>
            <Text style={styles.statLabel}>Interview Success</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Subscribe Button */}
      <Animated.View
        entering={FadeInUp.delay(350)}
        style={[styles.subscribeContainer, { paddingBottom: insets.bottom || Spacing.md }]}
      >
        <TouchableOpacity
          style={[styles.subscribeButton, isPurchasing && styles.subscribeButtonDisabled]}
          onPress={handlePurchase}
          activeOpacity={0.8}
          disabled={isPurchasing}
        >
          <LinearGradient
            colors={isPurchasing ? [Colors.gray600, Colors.gray700] : [Colors.neonCyan, Colors.neonPurple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          {isPurchasing ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Ionicons name="diamond" size={24} color={Colors.white} />
              <Text style={styles.subscribeButtonText}>
                Get Lifetime Access — {lifetimePrice}
              </Text>
              <Ionicons name="arrow-forward" size={24} color={Colors.white} />
            </>
          )}
        </TouchableOpacity>
        <View style={styles.subscribeFooter}>
          <Text style={styles.subscribeNote}>
            One-time purchase. No subscriptions.
          </Text>
          <TouchableOpacity onPress={handleRestore} disabled={isPurchasing}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  crownIconBackground: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  heroTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.gray400,
    textAlign: 'center',
    lineHeight: 22,
  },
  plansSection: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  loadingContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: FontSizes.md,
    color: Colors.gray400,
  },
  plansContainer: {
    gap: Spacing.md,
  },
  planCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.medium,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.gray700,
  },
  planCardSelected: {
    borderColor: Colors.neonCyan,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderBottomLeftRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  popularText: {
    fontSize: FontSizes.xs,
    fontWeight: '800',
    color: Colors.white,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  planTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  planSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },
  price: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  period: {
    fontSize: FontSizes.md,
    color: Colors.gray400,
    marginLeft: 4,
  },
  planFeatures: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: FontSizes.sm,
    color: Colors.gray300,
    flex: 1,
  },
  featuresSection: {
    gap: Spacing.md,
  },
  featuresGrid: {
    gap: Spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.small,
    gap: Spacing.md,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
  },
  proBadge: {
    backgroundColor: Colors.neonPurple + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.neonPurple,
  },
  proText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.neonPurple,
  },
  testimonialSection: {
    gap: Spacing.md,
  },
  testimonialCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.small,
    gap: Spacing.md,
  },
  quoteIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neonCyan + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  testimonialText: {
    fontSize: FontSizes.md,
    color: Colors.gray300,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  testimonialAuthor: {
    fontSize: FontSizes.sm,
    color: Colors.gray500,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.neonCyan,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginTop: 4,
  },
  subscribeContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.gray800,
  },
  subscribeButton: {
    height: 56,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  subscribeButtonDisabled: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  subscribeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  subscribeNote: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
  },
  restoreText: {
    fontSize: FontSizes.xs,
    color: Colors.neonCyan,
    fontWeight: '600',
  },
  // Premium Active Styles
  premiumActiveContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  premiumActiveTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.neonLime,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  premiumActiveSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.gray400,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  featuresList: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  activeFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  activeFeatureText: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    flex: 1,
  },
  continueButton: {
    backgroundColor: Colors.neonCyan,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  continueButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.background,
  },
});
