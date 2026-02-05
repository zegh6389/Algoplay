import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/constants/theme';
import { PracticeProblem, getDifficultyColor } from '@/utils/practiceProblems';

interface PracticeProblemCardProps {
  problem: PracticeProblem;
  index?: number;
  expanded?: boolean;
  onPress?: () => void;
}

export default function PracticeProblemCard({
  problem,
  index = 0,
  expanded = false,
  onPress,
}: PracticeProblemCardProps) {
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isExpanded, setIsExpanded] = useState(expanded);

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.98, {}, () => {
      scale.value = withSpring(1);
    });
    setIsExpanded(!isExpanded);
    onPress?.();
  };

  const toggleHint = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowHint(!showHint);
  };

  const toggleSolution = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowSolution(!showSolution);
  };

  const difficultyColor = getDifficultyColor(problem.difficulty);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={[styles.container, animatedStyle]}
    >
      {/* Card Header - Always visible */}
      <TouchableOpacity
        style={styles.header}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor + '20' }]}>
            <Text style={[styles.difficultyText, { color: difficultyColor }]}>
              {problem.difficulty}
            </Text>
          </View>
          <Text style={styles.title} numberOfLines={isExpanded ? undefined : 1}>
            {problem.title}
          </Text>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={Colors.gray400}
        />
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.content}>
          {/* Tags */}
          <View style={styles.tagsContainer}>
            {problem.tags.map((tag, idx) => (
              <View key={idx} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Problem Statement */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Problem</Text>
            <Text style={styles.statementText}>{problem.statement}</Text>
          </View>

          {/* Examples */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Examples</Text>
            {problem.examples.map((example, idx) => (
              <View key={idx} style={styles.exampleBox}>
                <View style={styles.exampleRow}>
                  <Text style={styles.exampleLabel}>Input:</Text>
                  <Text style={styles.exampleCode}>{example.input}</Text>
                </View>
                <View style={styles.exampleRow}>
                  <Text style={styles.exampleLabel}>Output:</Text>
                  <Text style={styles.exampleCode}>{example.output}</Text>
                </View>
                {example.explanation && (
                  <View style={styles.exampleRow}>
                    <Text style={styles.exampleExplanation}>
                      {example.explanation}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Constraints */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Constraints</Text>
            {problem.constraints.map((constraint, idx) => (
              <View key={idx} style={styles.constraintRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.constraintText}>{constraint}</Text>
              </View>
            ))}
          </View>

          {/* Complexity Info */}
          <View style={styles.complexityContainer}>
            <View style={styles.complexityItem}>
              <Ionicons name="time-outline" size={16} color={Colors.actionTeal} />
              <Text style={styles.complexityLabel}>Time:</Text>
              <Text style={styles.complexityValue}>{problem.timeComplexity}</Text>
            </View>
            <View style={styles.complexityItem}>
              <Ionicons name="cube-outline" size={16} color={Colors.logicGold} />
              <Text style={styles.complexityLabel}>Space:</Text>
              <Text style={styles.complexityValue}>{problem.spaceComplexity}</Text>
            </View>
          </View>

          {/* Hint Toggle */}
          <TouchableOpacity
            style={[styles.toggleButton, showHint && styles.toggleButtonActive]}
            onPress={toggleHint}
            activeOpacity={0.8}
          >
            <Ionicons
              name={showHint ? 'bulb' : 'bulb-outline'}
              size={20}
              color={showHint ? Colors.midnightBlue : Colors.logicGold}
            />
            <Text style={[styles.toggleButtonText, showHint && styles.toggleButtonTextActive]}>
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </Text>
          </TouchableOpacity>

          {/* Hint Content */}
          {showHint && (
            <Animated.View entering={FadeIn.duration(200)} style={styles.hintBox}>
              <Text style={styles.hintText}>{problem.hint}</Text>
            </Animated.View>
          )}

          {/* Solution Toggle */}
          <TouchableOpacity
            style={[styles.toggleButton, styles.solutionToggle, showSolution && styles.toggleButtonSolutionActive]}
            onPress={toggleSolution}
            activeOpacity={0.8}
          >
            <Ionicons
              name={showSolution ? 'code-slash' : 'code-outline'}
              size={20}
              color={showSolution ? Colors.midnightBlue : Colors.actionTeal}
            />
            <Text style={[styles.toggleButtonText, styles.solutionToggleText, showSolution && styles.toggleButtonTextActive]}>
              {showSolution ? 'Hide Solution' : 'Show Solution'}
            </Text>
          </TouchableOpacity>

          {/* Solution Content */}
          {showSolution && (
            <Animated.View entering={FadeIn.duration(200)}>
              {/* Approach */}
              <View style={styles.approachBox}>
                <Text style={styles.approachTitle}>
                  <Ionicons name="flash" size={16} color={Colors.actionTeal} /> Approach
                </Text>
                <Text style={styles.approachText}>{problem.approach}</Text>
              </View>

              {/* Code Solution */}
              <View style={styles.codeBox}>
                <View style={styles.codeHeader}>
                  <Ionicons name="logo-python" size={16} color={Colors.logicGold} />
                  <Text style={styles.codeHeaderText}>Python Solution</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.codeScroll}
                >
                  <Text style={styles.codeText}>{problem.solution}</Text>
                </ScrollView>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      )}
    </Animated.View>
  );
}

// Compact version for lists
export function PracticeProblemCardCompact({
  problem,
  index = 0,
  onPress,
}: PracticeProblemCardProps) {
  const difficultyColor = getDifficultyColor(problem.difficulty);

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <TouchableOpacity
        style={styles.compactCard}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.compactLeft}>
          <View style={[styles.difficultyDot, { backgroundColor: difficultyColor }]} />
          <View style={styles.compactContent}>
            <Text style={styles.compactTitle} numberOfLines={1}>
              {problem.title}
            </Text>
            <View style={styles.compactTags}>
              {problem.tags.slice(0, 2).map((tag, idx) => (
                <Text key={idx} style={styles.compactTag}>
                  {tag}
                </Text>
              ))}
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.gray500} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.gray700,
    ...Shadows.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  difficultyText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  title: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.white,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray700,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  tag: {
    backgroundColor: Colors.actionTeal + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    fontSize: FontSizes.xs,
    color: Colors.actionTeal,
    fontWeight: '500',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  statementText: {
    fontSize: FontSizes.sm,
    color: Colors.gray300,
    lineHeight: 22,
  },
  exampleBox: {
    backgroundColor: Colors.midnightBlueDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  exampleRow: {
    marginBottom: Spacing.xs,
  },
  exampleLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginBottom: 2,
  },
  exampleCode: {
    fontSize: FontSizes.sm,
    color: Colors.actionTeal,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  exampleExplanation: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
  constraintRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bulletPoint: {
    color: Colors.gray500,
    marginRight: Spacing.xs,
  },
  constraintText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  complexityContainer: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.midnightBlueDark,
    borderRadius: BorderRadius.md,
  },
  complexityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  complexityLabel: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
  },
  complexityValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.white,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.logicGold + '15',
    borderWidth: 1,
    borderColor: Colors.logicGold + '40',
    marginBottom: Spacing.md,
  },
  toggleButtonActive: {
    backgroundColor: Colors.logicGold,
  },
  solutionToggle: {
    backgroundColor: Colors.actionTeal + '15',
    borderColor: Colors.actionTeal + '40',
  },
  toggleButtonSolutionActive: {
    backgroundColor: Colors.actionTeal,
  },
  toggleButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.logicGold,
  },
  solutionToggleText: {
    color: Colors.actionTeal,
  },
  toggleButtonTextActive: {
    color: Colors.midnightBlue,
  },
  hintBox: {
    backgroundColor: Colors.logicGold + '10',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.logicGold,
  },
  hintText: {
    fontSize: FontSizes.sm,
    color: Colors.gray300,
    lineHeight: 22,
  },
  approachBox: {
    backgroundColor: Colors.actionTeal + '10',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.actionTeal,
  },
  approachTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.actionTeal,
    marginBottom: Spacing.sm,
  },
  approachText: {
    fontSize: FontSizes.sm,
    color: Colors.gray300,
    lineHeight: 22,
  },
  codeBox: {
    backgroundColor: Colors.midnightBlueDark,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.gray700 + '50',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray700,
  },
  codeHeaderText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.gray400,
  },
  codeScroll: {
    padding: Spacing.md,
  },
  codeText: {
    fontSize: FontSizes.xs,
    color: Colors.gray300,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 18,
  },
  // Compact Card Styles
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  compactLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
  },
  compactTags: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  compactTag: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
  },
});
