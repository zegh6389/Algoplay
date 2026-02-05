import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  Colors,
  Spacing,
  FontSizes,
  BorderRadius,
  Shadows,
  AlgorithmComplexities,
  AlgorithmComplexity,
  ComplexityNotations,
} from '@/constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Complexity Badge
function ComplexityBadge({ complexity }: { complexity: string }) {
  const notation = ComplexityNotations[complexity as keyof typeof ComplexityNotations];
  const color = notation?.color || Colors.gray400;

  return (
    <View style={[styles.complexityBadge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.complexityBadgeText, { color }]}>{complexity}</Text>
    </View>
  );
}

// Algorithm Row in Table
function AlgorithmTableRow({
  algorithm,
  expanded,
  onToggle,
  index,
}: {
  algorithm: AlgorithmComplexity & { id: string };
  expanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const categoryColors: Record<string, string> = {
    Sorting: Colors.alertCoral,
    Searching: Colors.accent,
    Graphs: Colors.logicGold,
  };

  const categoryColor = categoryColors[algorithm.category] || Colors.info;

  return (
    <Animated.View entering={FadeInDown.delay(100 + index * 30).springify()}>
      <AnimatedTouchable
        style={[styles.tableRow, animatedStyle, expanded && styles.tableRowExpanded]}
        onPress={onToggle}
        onPressIn={() => (scale.value = withSpring(0.98))}
        onPressOut={() => (scale.value = withSpring(1))}
        activeOpacity={0.8}
      >
        {/* Algorithm Name */}
        <View style={styles.rowHeader}>
          <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
          <Text style={styles.algorithmName}>{algorithm.name}</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={Colors.gray400}
          />
        </View>

        {/* Complexity Grid */}
        <View style={styles.complexityGrid}>
          <View style={styles.complexityColumn}>
            <Text style={styles.complexityLabel}>Best</Text>
            <ComplexityBadge complexity={algorithm.timeComplexity.best} />
          </View>
          <View style={styles.complexityColumn}>
            <Text style={styles.complexityLabel}>Avg</Text>
            <ComplexityBadge complexity={algorithm.timeComplexity.average} />
          </View>
          <View style={styles.complexityColumn}>
            <Text style={styles.complexityLabel}>Worst</Text>
            <ComplexityBadge complexity={algorithm.timeComplexity.worst} />
          </View>
          <View style={styles.complexityColumn}>
            <Text style={styles.complexityLabel}>Space</Text>
            <ComplexityBadge complexity={algorithm.spaceComplexity} />
          </View>
        </View>

        {/* Expanded Details */}
        {expanded && (
          <Animated.View entering={FadeInDown.springify()} style={styles.expandedContent}>
            {/* Properties */}
            {(algorithm.stable !== undefined || algorithm.inPlace !== undefined) && (
              <View style={styles.propertiesRow}>
                {algorithm.stable !== undefined && (
                  <View style={[styles.propertyBadge, algorithm.stable && styles.propertyBadgeActive]}>
                    <Ionicons
                      name={algorithm.stable ? 'checkmark-circle' : 'close-circle'}
                      size={14}
                      color={algorithm.stable ? Colors.success : Colors.gray500}
                    />
                    <Text style={[styles.propertyText, algorithm.stable && styles.propertyTextActive]}>
                      Stable
                    </Text>
                  </View>
                )}
                {algorithm.inPlace !== undefined && (
                  <View style={[styles.propertyBadge, algorithm.inPlace && styles.propertyBadgeActive]}>
                    <Ionicons
                      name={algorithm.inPlace ? 'checkmark-circle' : 'close-circle'}
                      size={14}
                      color={algorithm.inPlace ? Colors.success : Colors.gray500}
                    />
                    <Text style={[styles.propertyText, algorithm.inPlace && styles.propertyTextActive]}>
                      In-Place
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* When to Use */}
            <View style={styles.whenToUseContainer}>
              <View style={styles.whenToUseHeader}>
                <Ionicons name="bulb" size={16} color={Colors.logicGold} />
                <Text style={styles.whenToUseLabel}>When to Use</Text>
              </View>
              <Text style={styles.whenToUseText}>{algorithm.whenToUse}</Text>
            </View>
          </Animated.View>
        )}
      </AnimatedTouchable>
    </Animated.View>
  );
}

// Category Section
function CategorySection({
  title,
  algorithms,
  color,
  expandedId,
  onToggle,
  startIndex,
}: {
  title: string;
  algorithms: (AlgorithmComplexity & { id: string })[];
  color: string;
  expandedId: string | null;
  onToggle: (id: string) => void;
  startIndex: number;
}) {
  return (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: color + '20' }]}>
          <View style={[styles.categoryIconDot, { backgroundColor: color }]} />
        </View>
        <Text style={styles.categoryTitle}>{title}</Text>
        <Text style={styles.categoryCount}>{algorithms.length} algorithms</Text>
      </View>
      <View style={styles.categoryAlgorithms}>
        {algorithms.map((algo, index) => (
          <AlgorithmTableRow
            key={algo.id}
            algorithm={algo}
            expanded={expandedId === algo.id}
            onToggle={() => onToggle(algo.id)}
            index={startIndex + index}
          />
        ))}
      </View>
    </View>
  );
}

// Complexity Legend
function ComplexityLegend() {
  const complexities = [
    { notation: 'O(1)', name: 'Constant', color: Colors.success },
    { notation: 'O(log n)', name: 'Logarithmic', color: Colors.accent },
    { notation: 'O(n)', name: 'Linear', color: Colors.logicGold },
    { notation: 'O(n log n)', name: 'Linearithmic', color: Colors.warning },
    { notation: 'O(n²)', name: 'Quadratic', color: Colors.alertCoral },
    { notation: 'O(2^n)', name: 'Exponential', color: Colors.error },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.legendContainer}>
      <BlurView intensity={15} tint="dark" style={styles.legendBlur}>
        <Text style={styles.legendTitle}>Complexity Guide</Text>
        <View style={styles.legendGrid}>
          {complexities.map((c) => (
            <View key={c.notation} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: c.color }]} />
              <Text style={styles.legendNotation}>{c.notation}</Text>
              <Text style={styles.legendName}>{c.name}</Text>
            </View>
          ))}
        </View>
      </BlurView>
    </Animated.View>
  );
}

// Quick Tips Section
function QuickTips() {
  const tips = [
    {
      icon: 'flash' as const,
      title: 'For Speed',
      tip: 'Quick Sort or Merge Sort for large datasets. Insertion Sort for small/nearly sorted.',
      color: Colors.accent,
    },
    {
      icon: 'hardware-chip' as const,
      title: 'For Memory',
      tip: 'Heap Sort gives O(n log n) with O(1) space. Quick Sort uses O(log n) stack space.',
      color: Colors.electricPurple,
    },
    {
      icon: 'shield-checkmark' as const,
      title: 'For Stability',
      tip: 'Merge Sort preserves order of equal elements. Use when sorting objects by multiple keys.',
      color: Colors.logicGold,
    },
    {
      icon: 'navigate' as const,
      title: 'For Pathfinding',
      tip: 'BFS for unweighted shortest path. Dijkstra for weighted. A* when you have a heuristic.',
      color: Colors.alertCoral,
    },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.tipsSection}>
      <Text style={styles.tipsSectionTitle}>Interview Quick Tips</Text>
      <View style={styles.tipsGrid}>
        {tips.map((tip, index) => (
          <Animated.View
            key={tip.title}
            entering={FadeInDown.delay(150 + index * 50).springify()}
            style={styles.tipCard}
          >
            <View style={[styles.tipIconContainer, { backgroundColor: tip.color + '20' }]}>
              <Ionicons name={tip.icon} size={20} color={tip.color} />
            </View>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipText}>{tip.tip}</Text>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
}

export default function CheatSheetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Convert algorithm complexities to array with IDs
  const algorithms = useMemo(() => {
    return Object.entries(AlgorithmComplexities).map(([id, algo]) => ({
      id,
      ...algo,
    }));
  }, []);

  // Filter algorithms based on search
  const filteredAlgorithms = useMemo(() => {
    if (!searchQuery.trim()) return algorithms;
    const query = searchQuery.toLowerCase();
    return algorithms.filter(
      (algo) =>
        algo.name.toLowerCase().includes(query) ||
        algo.category.toLowerCase().includes(query) ||
        algo.whenToUse.toLowerCase().includes(query)
    );
  }, [algorithms, searchQuery]);

  // Group algorithms by category
  const groupedAlgorithms = useMemo(() => {
    const groups: Record<string, (AlgorithmComplexity & { id: string })[]> = {};
    filteredAlgorithms.forEach((algo) => {
      if (!groups[algo.category]) {
        groups[algo.category] = [];
      }
      groups[algo.category].push(algo);
    });
    return groups;
  }, [filteredAlgorithms]);

  const categories = Object.keys(groupedAlgorithms);

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  let runningIndex = 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundDark]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <Animated.View entering={FadeInDown} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="book" size={22} color={Colors.logicGold} />
          <Text style={styles.headerTitle}>Cheat Sheet</Text>
        </View>
        <View style={{ width: 44 }} />
      </Animated.View>

      {/* Search Bar */}
      <Animated.View entering={FadeInDown.delay(50)} style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.gray500} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search algorithms..."
          placeholderTextColor={Colors.gray500}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.gray500} />
          </TouchableOpacity>
        )}
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Complexity Legend */}
        <ComplexityLegend />

        {/* Quick Tips */}
        {!searchQuery && <QuickTips />}

        {/* Algorithm Categories */}
        {categories.map((category) => {
          const categoryColors: Record<string, string> = {
            Sorting: Colors.alertCoral,
            Searching: Colors.accent,
            Graphs: Colors.logicGold,
          };
          const color = categoryColors[category] || Colors.info;
          const categoryAlgorithms = groupedAlgorithms[category];
          const startIdx = runningIndex;
          runningIndex += categoryAlgorithms.length;

          return (
            <CategorySection
              key={category}
              title={category}
              algorithms={categoryAlgorithms}
              color={color}
              expandedId={expandedId}
              onToggle={handleToggle}
              startIndex={startIdx}
            />
          );
        })}

        {/* No Results */}
        {filteredAlgorithms.length === 0 && (
          <View style={styles.noResults}>
            <Ionicons name="search" size={48} color={Colors.gray600} />
            <Text style={styles.noResultsText}>No algorithms found</Text>
            <Text style={styles.noResultsSubtext}>Try a different search term</Text>
          </View>
        )}
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  // Legend
  legendContainer: {
    marginBottom: Spacing.lg,
  },
  legendBlur: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  legendTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray400,
    marginBottom: Spacing.sm,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: Spacing.md,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendNotation: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  legendName: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
  },
  // Tips Section
  tipsSection: {
    marginBottom: Spacing.xl,
  },
  tipsSectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  tipsGrid: {
    gap: Spacing.sm,
  },
  tipCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  tipIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  tipTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  tipText: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    lineHeight: 18,
  },
  // Category Section
  categorySection: {
    marginBottom: Spacing.xl,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  categoryIconDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  categoryCount: {
    fontSize: FontSizes.sm,
    color: Colors.gray500,
  },
  categoryAlgorithms: {
    gap: Spacing.sm,
  },
  // Table Row
  tableRow: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  tableRowExpanded: {
    borderColor: Colors.gray600,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  algorithmName: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  complexityGrid: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  complexityColumn: {
    flex: 1,
    alignItems: 'center',
  },
  complexityLabel: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    marginBottom: 4,
  },
  complexityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    minWidth: 55,
    alignItems: 'center',
  },
  complexityBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  // Expanded Content
  expandedContent: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray700,
  },
  propertiesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  propertyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray700 + '50',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  propertyBadgeActive: {
    backgroundColor: Colors.success + '20',
  },
  propertyText: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
  },
  propertyTextActive: {
    color: Colors.success,
  },
  whenToUseContainer: {
    backgroundColor: Colors.logicGold + '10',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.logicGold + '20',
  },
  whenToUseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  whenToUseLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.logicGold,
  },
  whenToUseText: {
    fontSize: FontSizes.sm,
    color: Colors.gray300,
    lineHeight: 18,
  },
  // No Results
  noResults: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  noResultsText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.gray400,
    marginTop: Spacing.md,
  },
  noResultsSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.gray500,
    marginTop: Spacing.xs,
  },
});
