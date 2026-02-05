import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import CyberBackground from '@/components/CyberBackground';

interface Algorithm {
  id: string;
  name: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  isUnlocked: boolean;
}

// Tree Algorithms
const treeAlgorithms: Algorithm[] = [
  {
    id: 'bst-insert',
    name: 'Binary Search Tree',
    category: 'trees',
    difficulty: 'Medium',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(n)',
    description: 'Insert and search in a balanced tree structure',
    isUnlocked: true,
  },
  {
    id: 'heap-sort',
    name: 'Heap & Heap Sort',
    category: 'trees',
    difficulty: 'Medium',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    description: 'Build heaps and sort using the heap property',
    isUnlocked: true,
  },
  {
    id: 'tree-traversal',
    name: 'Tree Traversals',
    category: 'trees',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    description: 'In-order, Pre-order, Post-order, and Level-order',
    isUnlocked: true,
  },
];

const algorithms: Algorithm[] = [
  // Sorting
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'sorting',
    difficulty: 'Easy',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Compare adjacent elements and swap if out of order',
    isUnlocked: true,
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'sorting',
    difficulty: 'Easy',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Find minimum element and place at beginning',
    isUnlocked: true,
  },
  {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'sorting',
    difficulty: 'Easy',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Build sorted array one element at a time',
    isUnlocked: true,
  },
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'sorting',
    difficulty: 'Medium',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: 'Divide and conquer with efficient merging',
    isUnlocked: true,
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'sorting',
    difficulty: 'Medium',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    description: 'Partition around pivot and sort recursively',
    isUnlocked: true,
  },
  // Graphs
  {
    id: 'bfs',
    name: 'Breadth-First Search',
    category: 'graphs',
    difficulty: 'Medium',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    description: 'Explore all neighbors before going deeper',
    isUnlocked: true,
  },
  {
    id: 'dfs',
    name: 'Depth-First Search',
    category: 'graphs',
    difficulty: 'Medium',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    description: 'Explore as deep as possible before backtracking',
    isUnlocked: true,
  },
  {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    category: 'graphs',
    difficulty: 'Hard',
    timeComplexity: 'O((V+E) log V)',
    spaceComplexity: 'O(V)',
    description: 'Find shortest paths from source to all vertices',
    isUnlocked: true,
  },
  {
    id: 'astar',
    name: 'A* Search',
    category: 'graphs',
    difficulty: 'Hard',
    timeComplexity: 'O(E)',
    spaceComplexity: 'O(V)',
    description: 'Heuristic-guided pathfinding algorithm',
    isUnlocked: true,
  },
  // Searching
  {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'searching',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Check each element sequentially',
    isUnlocked: true,
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'searching',
    difficulty: 'Easy',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'Divide search space in half each time',
    isUnlocked: true,
  },
  // Dynamic Programming
  {
    id: 'fibonacci',
    name: 'Fibonacci (DP)',
    category: 'dynamic-programming',
    difficulty: 'Easy',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Classic memoization example',
    isUnlocked: true,
  },
];

const categories = [
  { id: 'all', name: 'All', icon: 'apps' as const, color: Colors.neonCyan },
  { id: 'sorting', name: 'Sorting', icon: 'bar-chart' as const, color: Colors.neonPink },
  { id: 'trees', name: 'Trees', icon: 'git-branch' as const, color: Colors.neonLime },
  { id: 'searching', name: 'Searching', icon: 'search' as const, color: Colors.neonCyan },
  { id: 'graphs', name: 'Graphs', icon: 'git-network' as const, color: Colors.neonYellow },
  { id: 'dynamic-programming', name: 'DP', icon: 'layers' as const, color: Colors.neonPurple },
];

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'Easy':
      return Colors.success;
    case 'Medium':
      return Colors.logicGold;
    case 'Hard':
      return Colors.alertCoral;
    default:
      return Colors.gray400;
  }
}

function AlgorithmCard({ algorithm, index }: { algorithm: Algorithm; index: number }) {
  const router = useRouter();
  const { completedAlgorithms } = useAppStore((state) => state.userProgress);
  const isCompleted = completedAlgorithms.includes(algorithm.id);

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (algorithm.category === 'graphs') {
      router.push('/game/grid-escape');
    } else if (algorithm.category === 'trees') {
      router.push('/visualizer/tree');
    } else if (algorithm.category === 'dynamic-programming') {
      // Navigate directly to DP visualizer with algorithm parameter
      router.push(`/visualizer/dp?algorithm=${algorithm.id}` as any);
    } else if (algorithm.category === 'sorting') {
      router.push(`/visualizer/${algorithm.id}`);
    } else {
      router.push(`/visualizer/${algorithm.id}`);
    }
  };

  return (
    <Animated.View entering={FadeInRight.delay(index * 50).springify()}>
      <TouchableOpacity
        style={[styles.algorithmCard, !algorithm.isUnlocked && styles.lockedCard]}
        onPress={handlePress}
        disabled={!algorithm.isUnlocked}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.algorithmName}>{algorithm.name}</Text>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark" size={12} color={Colors.white} />
              </View>
            )}
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(algorithm.difficulty) + '20' }]}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(algorithm.difficulty) }]}>
              {algorithm.difficulty}
            </Text>
          </View>
        </View>

        <Text style={styles.algorithmDescription} numberOfLines={2}>
          {algorithm.description}
        </Text>

        <View style={styles.complexityRow}>
          <View style={styles.complexityItem}>
            <Ionicons name="time-outline" size={14} color={Colors.gray400} />
            <Text style={styles.complexityText}>{algorithm.timeComplexity}</Text>
          </View>
          <View style={styles.complexityItem}>
            <Ionicons name="cube-outline" size={14} color={Colors.gray400} />
            <Text style={styles.complexityText}>{algorithm.spaceComplexity}</Text>
          </View>
        </View>

        {!algorithm.isUnlocked && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={24} color={Colors.gray500} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function LearnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string }>();
  const [selectedCategory, setSelectedCategory] = React.useState(params.category || 'all');

  React.useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category);
    }
  }, [params.category]);

  const filteredAlgorithms = React.useMemo(() => {
    const allAlgorithms = [...algorithms, ...treeAlgorithms];
    if (selectedCategory === 'all') {
      return allAlgorithms;
    }
    return allAlgorithms.filter((alg) => alg.category === selectedCategory);
  }, [selectedCategory]);

  const handleCategoryPress = (catId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCategory(catId);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Cyber Background */}
      <CyberBackground showGrid showParticles={false} showMatrix={false} intensity="low" />

      {/* Header */}
      <Animated.View entering={FadeInDown.delay(0)} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Learn</Text>
            <Text style={styles.subtitle}>Master algorithms step by step</Text>
          </View>
          <TouchableOpacity
            style={styles.libraryButton}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push('/library');
            }}
          >
            <Ionicons name="library" size={20} color={Colors.neonYellow} />
            <Text style={styles.libraryButtonText}>Library</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Category Tabs */}
      <Animated.View entering={FadeInDown.delay(100)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryTab,
                selectedCategory === cat.id && styles.categoryTabActive,
                selectedCategory === cat.id && cat.color && { borderColor: cat.color },
              ]}
              onPress={() => handleCategoryPress(cat.id)}
            >
              <Ionicons
                name={cat.icon}
                size={16}
                color={selectedCategory === cat.id ? (cat.color || Colors.accent) : Colors.gray500}
              />
              <Text
                style={[
                  styles.categoryTabText,
                  selectedCategory === cat.id && styles.categoryTabTextActive,
                  selectedCategory === cat.id && cat.color && { color: cat.color },
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Algorithm List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredAlgorithms.map((algorithm, index) => (
          <AlgorithmCard key={algorithm.id} algorithm={algorithm} index={index} />
        ))}
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  libraryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neonYellow + '20',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neonYellow + '40',
    gap: Spacing.xs,
    shadowColor: Colors.neonYellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  libraryButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.neonYellow,
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
    zIndex: 10,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBackground,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.neonBorderCyan,
  },
  categoryTabActive: {
    backgroundColor: Colors.neonCyan + '15',
    borderColor: Colors.neonCyan,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryTabText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.gray400,
    marginLeft: Spacing.xs,
  },
  categoryTabTextActive: {
    color: Colors.neonCyan,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  algorithmCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neonBorderCyan,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  lockedCard: {
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  algorithmName: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  completedBadge: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    marginLeft: Spacing.sm,
  },
  difficultyText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  algorithmDescription: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  complexityRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  complexityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  complexityText: {
    fontSize: FontSizes.sm,
    color: Colors.gray400,
    marginLeft: Spacing.xs,
    fontFamily: 'monospace',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background + '80',
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
