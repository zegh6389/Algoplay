import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import CyberBackground from '@/components/CyberBackground';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface GameCard {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradientColors: readonly [string, string];
  route: string;
  badge?: string;
}

const games: GameCard[] = [
  {
    id: 'playground',
    title: 'Algorithm Playground',
    description: 'Ultimate gamified learning! Mastery tree, challenges, quests & AI coach.',
    icon: 'game-controller',
    gradientColors: [Colors.neonYellow, Colors.neonLime] as const,
    route: '/playground',
    badge: '🔥 NEW',
  },
  {
    id: 'battle-arena',
    title: 'Battle Arena',
    description: 'High-stakes algorithm battles! Watch two algorithms race head-to-head.',
    icon: 'flash',
    gradientColors: [Colors.neonCyan, Colors.neonPurple] as const,
    route: '/game/battle-arena',
  },
  {
    id: 'the-sorter',
    title: 'The Sorter',
    description: 'Race against algorithms! Manually sort elements faster than the computer.',
    icon: 'swap-vertical',
    gradientColors: [Colors.neonPink, Colors.neonPurple] as const,
    route: '/game/the-sorter',
    badge: 'Popular',
  },
  {
    id: 'grid-escape',
    title: 'Grid Escape',
    description: 'Place obstacles and watch pathfinding algorithms find the exit.',
    icon: 'grid',
    gradientColors: [Colors.neonCyan, Colors.neonLime] as const,
    route: '/game/grid-escape',
  },
  {
    id: 'race-mode',
    title: 'Race Mode',
    description: 'Pit two algorithms against each other on the same dataset.',
    icon: 'flag',
    gradientColors: [Colors.neonYellow, Colors.neonOrange] as const,
    route: '/game/race-mode',
  },
];

function GameCardComponent({ game, index }: { game: GameCard; index: number }) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  React.useEffect(() => {
    glowOpacity.value = withRepeat(
      withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push(game.route as any);
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <AnimatedTouchable
        style={[styles.gameCard, animatedStyle, glowStyle, { shadowColor: game.gradientColors[0] }]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={game.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gameCardGradient}
        >
          {game.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{game.badge}</Text>
            </View>
          )}

          <View style={styles.gameCardContent}>
            <View style={styles.gameIconContainer}>
              <Ionicons name={game.icon} size={32} color={Colors.white} />
            </View>

            <Text style={styles.gameTitle}>{game.title}</Text>
            <Text style={styles.gameDescription}>{game.description}</Text>

            <View style={styles.playButton}>
              <Text style={styles.playButtonText}>Play</Text>
              <Ionicons name="arrow-forward" size={16} color={game.gradientColors[0]} />
            </View>
          </View>
        </LinearGradient>
      </AnimatedTouchable>
    </Animated.View>
  );
}

function HighScoresSection() {
  const { gameState } = useAppStore();

  return (
    <Animated.View entering={FadeInDown.delay(400)} style={styles.highScoresSection}>
      <Text style={styles.sectionTitle}>High Scores</Text>
      <View style={styles.highScoresContainer}>
        <View style={styles.highScoreCard}>
          <View style={[styles.highScoreIcon, { backgroundColor: Colors.alertCoral + '20' }]}>
            <Ionicons name="trophy" size={20} color={Colors.alertCoral} />
          </View>
          <View style={styles.highScoreContent}>
            <Text style={styles.highScoreLabel}>The Sorter Best</Text>
            <Text style={styles.highScoreValue}>{gameState.highScores.sorterBest}s</Text>
          </View>
        </View>

        <View style={styles.highScoreCard}>
          <View style={[styles.highScoreIcon, { backgroundColor: Colors.accent + '20' }]}>
            <Ionicons name="ribbon" size={20} color={Colors.accent} />
          </View>
          <View style={styles.highScoreContent}>
            <Text style={styles.highScoreLabel}>Grid Escape Wins</Text>
            <Text style={styles.highScoreValue}>{gameState.highScores.gridEscapeWins}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function DailyChallengeSection() {
  const router = useRouter();
  const { gameState, completeDailyChallenge, addXP } = useAppStore();
  const pulse = useSharedValue(1);

  const today = new Date().toISOString().split('T')[0];
  const isCompleted = gameState.dailyChallengeDate === today && gameState.dailyChallengeCompleted;

  React.useEffect(() => {
    if (!isCompleted) {
      pulse.value = withRepeat(
        withSequence(
          withSpring(1.03, { damping: 2 }),
          withSpring(1, { damping: 2 })
        ),
        -1,
        true
      );
    }
  }, [isCompleted]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(300)} style={styles.dailyChallengeSection}>
      <Text style={styles.sectionTitle}>Daily Challenge</Text>
      <AnimatedTouchable
        style={[styles.dailyChallengeCard, animatedStyle, isCompleted && styles.dailyChallengeCompleted]}
        onPress={() => !isCompleted && router.push('/game/the-sorter')}
        activeOpacity={0.9}
        disabled={isCompleted}
      >
        <View style={styles.dailyChallengeLeft}>
          <View style={[styles.dailyChallengeIcon, isCompleted && styles.dailyChallengeIconCompleted]}>
            <Ionicons
              name={isCompleted ? 'checkmark-circle' : 'flame'}
              size={28}
              color={isCompleted ? Colors.success : Colors.logicGold}
            />
          </View>
          <View style={styles.dailyChallengeContent}>
            <Text style={styles.dailyChallengeTitle}>
              {isCompleted ? 'Completed!' : 'Beat the Bubble Sort'}
            </Text>
            <Text style={styles.dailyChallengeSubtitle}>
              {isCompleted ? 'Come back tomorrow!' : 'Sort 10 elements faster than Bubble Sort'}
            </Text>
          </View>
        </View>
        {!isCompleted && (
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>+100 XP</Text>
          </View>
        )}
      </AnimatedTouchable>
    </Animated.View>
  );
}

export default function PlayScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Cyber Background */}
      <CyberBackground showGrid showParticles showMatrix={false} intensity="low" />

      {/* Header */}
      <Animated.View entering={FadeInDown.delay(0)} style={styles.header}>
        <Text style={styles.title}>Play</Text>
        <Text style={styles.subtitle}>Test your algorithmic thinking</Text>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Challenge */}
        <DailyChallengeSection />

        {/* Games */}
        <Text style={styles.sectionTitle}>Mini-Games</Text>
        {games.map((game, index) => (
          <GameCardComponent key={game.id} game={game} index={index} />
        ))}

        {/* High Scores */}
        <HighScoresSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    zIndex: 10,
  },
  title: {
    fontSize: FontSizes.title,
    fontWeight: '700',
    color: Colors.textPrimary,
    textShadowColor: Colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.gray400,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
    textShadowColor: Colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
  },
  gameCard: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.neonBorderCyan,
  },
  gameCardGradient: {
    padding: Spacing.lg,
    minHeight: 160,
  },
  badge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.white + '30',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  badgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.white,
  },
  gameCardContent: {
    flex: 1,
  },
  gameIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  gameTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  gameDescription: {
    fontSize: FontSizes.sm,
    color: Colors.white + 'CC',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  playButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.background,
  },
  dailyChallengeSection: {
    marginBottom: Spacing.md,
  },
  dailyChallengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.neonYellow + '40',
    shadowColor: Colors.neonYellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  dailyChallengeCompleted: {
    borderColor: Colors.success + '40',
  },
  dailyChallengeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dailyChallengeIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.logicGold + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  dailyChallengeIconCompleted: {
    backgroundColor: Colors.success + '20',
  },
  dailyChallengeContent: {
    flex: 1,
  },
  dailyChallengeTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  dailyChallengeSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
  },
  xpBadge: {
    backgroundColor: Colors.logicGold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  xpBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.background,
  },
  highScoresSection: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  highScoresContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  highScoreCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neonBorderCyan,
  },
  highScoreIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  highScoreContent: {
    flex: 1,
  },
  highScoreLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    marginBottom: 2,
  },
  highScoreValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
