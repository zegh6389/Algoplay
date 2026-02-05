// Midnight Black Header Component
// Translucent Midnight Black (#050505) with neon border and high-visibility text
import React, { memo } from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, BorderRadius, Spacing, FontSizes, HeaderTheme, SafetyPadding } from '@/constants/theme';

interface MidnightHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onAction?: () => void;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  showBackButton?: boolean;
  statusText?: string;
  statusType?: 'normal' | 'warning' | 'success';
  style?: ViewStyle;
  children?: React.ReactNode;
}

function MidnightHeaderComponent({
  title,
  subtitle,
  onBack,
  onAction,
  actionIcon = 'ellipsis-vertical',
  showBackButton = true,
  statusText,
  statusType = 'normal',
  style,
  children,
}: MidnightHeaderProps) {
  const insets = useSafeAreaInsets();
  const glowOpacity = useSharedValue(0.3);
  const buttonScale = useSharedValue(1);

  // Subtle glow animation for neon border
  React.useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack?.();
  };

  const handleActionPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAction?.();
  };

  const getStatusColor = () => {
    switch (statusType) {
      case 'warning':
        return HeaderTheme.textSecondary; // Warning Orange #FF9F00
      case 'success':
        return Colors.neonLime;
      default:
        return HeaderTheme.textAccent; // Cyan accent
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={[styles.container, { paddingTop: insets.top }, style]}
    >
      {/* Background with blur effect */}
      <BlurView intensity={80} style={styles.blurBackground}>
        <View style={styles.backgroundOverlay} />
      </BlurView>

      {/* Neon glow effect at bottom */}
      <Animated.View style={[styles.neonGlow, glowStyle]} />

      {/* Neon border line at bottom */}
      <LinearGradient
        colors={[Colors.neonCyan + '00', Colors.neonCyan, Colors.neonPurple, Colors.neonCyan + '00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.neonBorder}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Left: Back Button */}
        {showBackButton && onBack && (
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={24} color={HeaderTheme.textPrimary} />
          </Pressable>
        )}

        {/* Center: Title and Subtitle */}
        <View style={styles.titleContainer}>
          <Animated.Text style={styles.title} numberOfLines={1}>
            {title}
          </Animated.Text>
          {subtitle && (
            <Animated.Text style={[styles.subtitle, { color: getStatusColor() }]} numberOfLines={1}>
              {subtitle}
            </Animated.Text>
          )}
        </View>

        {/* Right: Status or Action Button */}
        <View style={styles.rightSection}>
          {statusText && (
            <View style={[styles.statusBadge, { borderColor: getStatusColor() }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              <Animated.Text style={[styles.statusText, { color: getStatusColor() }]}>
                {statusText}
              </Animated.Text>
            </View>
          )}

          {onAction && (
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleActionPress}
            >
              <LinearGradient
                colors={[Colors.neonCyan, Colors.neonPurple]}
                style={styles.actionButtonGradient}
              >
                <Ionicons name={actionIcon} size={20} color={HeaderTheme.backgroundSolid} />
              </LinearGradient>
            </Pressable>
          )}
        </View>
      </View>

      {/* Optional children (e.g., tabs) */}
      {children && <View style={styles.childrenContainer}>{children}</View>}
    </Animated.View>
  );
}

// Memoized for performance
export const MidnightHeader = memo(MidnightHeaderComponent);

// Tab Bar Component for Header
interface TabItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface MidnightTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function MidnightTabBar({ tabs, activeTab, onTabChange }: MidnightTabBarProps) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.key;
        return (
          <MidnightTabButton
            key={tab.key}
            tab={tab}
            isActive={isActive}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onTabChange(tab.key);
            }}
            index={index}
          />
        );
      })}
    </View>
  );
}

// Individual Tab Button
const MidnightTabButton = memo(function MidnightTabButton({
  tab,
  isActive,
  onPress,
  index,
}: {
  tab: TabItem;
  isActive: boolean;
  onPress: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButtonPressable}
    >
      <Animated.View style={[styles.tabButton, isActive && styles.tabButtonActive, animatedStyle]}>
        <Ionicons
          name={tab.icon}
          size={20}
          color={isActive ? Colors.neonCyan : Colors.gray500}
        />
        <Animated.Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
          {tab.label}
        </Animated.Text>
        {isActive && <View style={styles.tabIndicator} />}
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: HeaderTheme.background,
    borderBottomWidth: HeaderTheme.neonBorderWidth,
    borderBottomColor: HeaderTheme.neonBorderColor + '60',
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: HeaderTheme.background,
  },
  neonGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: HeaderTheme.neonBorderColor,
  },
  neonBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HeaderTheme.neonBorderWidth,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SafetyPadding.minimum,
    paddingVertical: SafetyPadding.minimum,
    gap: SafetyPadding.minimum,
    zIndex: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: SafetyPadding.minimum,
    gap: 2,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: HeaderTheme.textPrimary, // High-visibility white #FFFFFF
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    // Color set dynamically
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SafetyPadding.minimum,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  actionButton: {
    width: 44,
    height: 44,
  },
  actionButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childrenContainer: {
    paddingBottom: SafetyPadding.minimum,
    zIndex: 1,
  },
  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SafetyPadding.minimum,
    paddingVertical: Spacing.xs,
    gap: SafetyPadding.minimum,
  },
  tabButtonPressable: {
    flex: 1,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: 6,
    borderRadius: BorderRadius.lg,
    position: 'relative',
  },
  tabButtonActive: {
    backgroundColor: Colors.neonCyan + '15',
  },
  tabLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.gray500,
  },
  tabLabelActive: {
    color: Colors.neonCyan,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 2,
    backgroundColor: Colors.neonCyan,
    borderRadius: 1,
  },
});

export default MidnightHeader;
