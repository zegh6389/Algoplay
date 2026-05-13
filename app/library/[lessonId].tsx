// Lesson Detail Screen with AI Simplify Feature
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInRight,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTextGeneration } from '@/hooks/useTextGeneration';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import PremiumGate from '@/components/PremiumGate';
import { getLessonById, Lesson } from '@/constants/lessons';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CollapsibleSectionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

function CollapsibleSection({
  title,
  icon,
  children,
  defaultExpanded = true,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const rotation = useSharedValue(defaultExpanded ? 180 : 0);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    rotation.value = withSpring(isExpanded ? 0 : 180);
    setIsExpanded(!isExpanded);
  };

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader} onPress={handleToggle}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name={icon} size={18} color={Colors.accent} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Animated.View style={iconStyle}>
          <Ionicons name="chevron-up" size={20} color={Colors.gray400} />
        </Animated.View>
      </TouchableOpacity>
      {isExpanded && (
        <Animated.View entering={FadeInDown.duration(200)} style={styles.sectionContent}>
          {children}
        </Animated.View>
      )}
    </View>
  );
}

interface SimplifyButtonProps {
  content: string;
  onSimplified: (simplified: string) => void;
}

function SimplifyButton({ content, onSimplified }: SimplifyButtonProps) {
  const [isSimplifying, setIsSimplifying] = useState(false);
  const scale = useSharedValue(1);

  const { generateText, isLoading } = useTextGeneration({
    onSuccess: (response) => {
      onSimplified(response);
      setIsSimplifying(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => {
      setIsSimplifying(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const handleSimplify = async () => {
    if (isLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSimplifying(true);

    const prompt = `You are a friendly computer science tutor. Simplify the following technical explanation for a complete beginner. Use analogies from everyday life, avoid jargon, and keep it under 150 words. Make it engaging and easy to understand.

Technical content to simplify:
${content.slice(0, 1000)}

Simplified explanation:`;

    await generateText(prompt);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      style={[styles.simplifyButton, animatedStyle, isLoading && styles.simplifyButtonLoading]}
      onPress={handleSimplify}
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <ActivityIndicator size="small" color={Colors.background} />
          <Text style={styles.simplifyButtonText}>Simplifying...</Text>
        </>
      ) : (
        <>
          <Ionicons name="sparkles" size={18} color={Colors.background} />
          <Text style={styles.simplifyButtonText}>Simplify with AI</Text>
        </>
      )}
    </AnimatedTouchable>
  );
}

interface SimplifiedCardProps {
  content: string;
  onDismiss: () => void;
}

function SimplifiedCard({ content, onDismiss }: SimplifiedCardProps) {
  return (
    <Animated.View entering={SlideInDown.springify()} style={styles.simplifiedCard}>
      <View style={styles.simplifiedHeader}>
        <View style={styles.simplifiedHeaderLeft}>
          <Ionicons name="sparkles" size={18} color={Colors.logicGold} />
          <Text style={styles.simplifiedTitle}>AI-Simplified</Text>
        </View>
        <TouchableOpacity onPress={onDismiss}>
          <Ionicons name="close-circle" size={22} color={Colors.gray400} />
        </TouchableOpacity>
      </View>
      <Text style={styles.simplifiedText}>{content}</Text>
      <View style={styles.newellBadge}>
        <Text style={styles.newellBadgeText}>Powered by Newell AI</Text>
      </View>
    </Animated.View>
  );
}

function ComplexityChart({ lesson }: { lesson: Lesson }) {
  return (
    <View style={styles.complexityChart}>
      <Text style={styles.complexityChartTitle}>Complexity Analysis</Text>
      <View style={styles.complexityGrid}>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCaseLabel}>Best Case</Text>
          <View style={[styles.complexityBadge, styles.complexityBest]}>
            <Text style={styles.complexityBadgeText}>{lesson.timeComplexity.best}</Text>
          </View>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCaseLabel}>Average Case</Text>
          <View style={[styles.complexityBadge, styles.complexityAverage]}>
            <Text style={styles.complexityBadgeText}>{lesson.timeComplexity.average}</Text>
          </View>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCaseLabel}>Worst Case</Text>
          <View style={[styles.complexityBadge, styles.complexityWorst]}>
            <Text style={styles.complexityBadgeText}>{lesson.timeComplexity.worst}</Text>
          </View>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCaseLabel}>Space</Text>
          <View style={[styles.complexityBadge, styles.complexitySpace]}>
            <Text style={styles.complexityBadgeText}>{lesson.spaceComplexity}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function BulletList({ items, icon = 'checkmark-circle' }: { items: string[]; icon?: keyof typeof Ionicons.glyphMap }) {
  const getIconColor = (index: number) => {
    const colors = [Colors.accent, Colors.logicGold, Colors.info, Colors.success, Colors.alertCoral];
    return colors[index % colors.length];
  };

  return (
    <View style={styles.bulletList}>
      {items.map((item, index) => (
        <Animated.View
          key={index}
          entering={FadeInRight.delay(index * 50)}
          style={styles.bulletItem}
        >
          <Ionicons name={icon} size={16} color={getIconColor(index)} style={styles.bulletIcon} />
          <Text style={styles.bulletText}>{item}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

function CodeBlock({ code }: { code: string[] }) {
  return (
    <View style={styles.codeBlock}>
      {code.map((line, index) => (
        <View key={index} style={styles.codeLine}>
          <Text style={styles.codeLineNumber}>{index + 1}</Text>
          <Text style={styles.codeText}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

export default function LessonDetailScreen() {
  return (
    <PremiumGate featureName="Lesson Details">
      <LessonDetailScreenInner />
    </PremiumGate>
  );
}

function LessonDetailScreenInner() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ lessonId: string }>();
  const lesson = getLessonById(params.lessonId);

  const [simplifiedOverview, setSimplifiedOverview] = useState<string | null>(null);

  if (!lesson) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={Colors.alertCoral} />
          <Text style={styles.errorText}>Lesson not found</Text>
          <TouchableOpacity style={styles.backButtonLarge} onPress={() => router.back()}>
            <Text style={styles.backButtonLargeText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1}>{lesson.title}</Text>
          <View style={[styles.categoryTag, { backgroundColor: lesson.color + '20' }]}>
            <Text style={[styles.categoryTagText, { color: lesson.color }]}>
              {lesson.category}
            </Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Complexity Chart */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <ComplexityChart lesson={lesson} />
        </Animated.View>

        {/* Overview with AI Simplify */}
        <CollapsibleSection title="Overview" icon="information-circle">
          <Text style={styles.contentText}>{lesson.content.overview}</Text>

          <SimplifyButton
            content={lesson.content.overview}
            onSimplified={setSimplifiedOverview}
          />

          {simplifiedOverview && (
            <SimplifiedCard
              content={simplifiedOverview}
              onDismiss={() => setSimplifiedOverview(null)}
            />
          )}
        </CollapsibleSection>

        {/* How It Works */}
        <CollapsibleSection title="How It Works" icon="cog">
          <Text style={styles.contentText}>{lesson.content.howItWorks}</Text>
        </CollapsibleSection>

        {/* Pseudocode */}
        <CollapsibleSection title="Pseudocode" icon="code-slash" defaultExpanded={false}>
          <CodeBlock code={lesson.content.pseudocode} />
        </CollapsibleSection>

        {/* Advantages */}
        <CollapsibleSection title="Advantages" icon="thumbs-up" defaultExpanded={false}>
          <BulletList items={lesson.content.advantages} icon="checkmark-circle" />
        </CollapsibleSection>

        {/* Disadvantages */}
        <CollapsibleSection title="Disadvantages" icon="thumbs-down" defaultExpanded={false}>
          <BulletList items={lesson.content.disadvantages} icon="close-circle" />
        </CollapsibleSection>

        {/* Real-World Applications */}
        <CollapsibleSection title="Real-World Applications" icon="globe" defaultExpanded={false}>
          <BulletList items={lesson.content.realWorldApplications} icon="rocket" />
        </CollapsibleSection>

        {/* Key Insights */}
        <CollapsibleSection title="Key Insights" icon="bulb" defaultExpanded={false}>
          <BulletList items={lesson.content.keyInsights} icon="flash" />
        </CollapsibleSection>

        {/* Try It Button */}
        <Animated.View entering={FadeInDown.delay(500)}>
          <TouchableOpacity
            style={[styles.tryButton, { backgroundColor: lesson.color }]}
            onPress={() => {
              if (lesson.category === 'sorting') {
                router.push(`/visualizer/${lesson.id}`);
              } else if (lesson.category === 'trees') {
                router.push('/visualizer/tree');
              } else if (lesson.category === 'graphs') {
                router.push('/game/grid-escape');
              }
            }}
          >
            <Ionicons name="play" size={20} color={Colors.white} />
            <Text style={styles.tryButtonText}>Visualize {lesson.title}</Text>
          </TouchableOpacity>
        </Animated.View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray800,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  categoryTag: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginLeft: Spacing.sm,
  },
  categoryTagText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  // Complexity Chart
  complexityChart: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  complexityChartTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  complexityGrid: {
    gap: Spacing.sm,
  },
  complexityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  complexityCaseLabel: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
  },
  complexityBadge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  complexityBest: {
    backgroundColor: Colors.success + '20',
  },
  complexityAverage: {
    backgroundColor: Colors.logicGold + '20',
  },
  complexityWorst: {
    backgroundColor: Colors.alertCoral + '20',
  },
  complexitySpace: {
    backgroundColor: Colors.info + '20',
  },
  complexityBadgeText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  // Sections
  section: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sectionContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  contentText: {
    fontSize: FontSizes.md,
    color: Colors.gray300,
    lineHeight: 24,
  },
  // Simplify Button
  simplifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  simplifyButtonLoading: {
    backgroundColor: Colors.gray600,
  },
  simplifyButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.background,
  },
  // Simplified Card
  simplifiedCard: {
    backgroundColor: Colors.logicGold + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.logicGold + '40',
  },
  simplifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  simplifiedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  simplifiedTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.logicGold,
  },
  simplifiedText: {
    fontSize: FontSizes.md,
    color: Colors.gray200,
    lineHeight: 22,
  },
  newellBadge: {
    alignSelf: 'flex-end',
    marginTop: Spacing.sm,
  },
  newellBadgeText: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    fontStyle: 'italic',
  },
  // Bullet List
  bulletList: {
    gap: Spacing.sm,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletIcon: {
    marginRight: Spacing.sm,
    marginTop: 3,
  },
  bulletText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.gray300,
    lineHeight: 22,
  },
  // Code Block
  codeBlock: {
    backgroundColor: Colors.midnightBlueDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  codeLine: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  codeLineNumber: {
    width: 24,
    fontSize: FontSizes.sm,
    color: Colors.gray600,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  codeText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.gray300,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  // Try Button
  tryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.medium,
  },
  tryButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.white,
  },
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxxl,
  },
  errorText: {
    fontSize: FontSizes.lg,
    color: Colors.alertCoral,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  backButtonLarge: {
    backgroundColor: Colors.cardBackground,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  backButtonLargeText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
