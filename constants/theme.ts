// Algoplay Theme Constants
export const Colors = {
  // Primary Colors
  midnightBlue: '#0D1B2A',
  midnightBlueDark: '#0A1120',
  midnightBlueLight: '#1E293B',

  // Accent Colors
  actionTeal: '#2DD4BF',
  actionTealDark: '#14B8A6',
  actionTealLight: '#5EEAD4',

  electricPurple: '#A855F7',
  electricPurpleDark: '#9333EA',
  electricPurpleLight: '#C084FC',

  alertCoral: '#FB7185',
  alertCoralDark: '#F43F5E',
  alertCoralLight: '#FDA4AF',

  logicGold: '#FBBF24',
  logicGoldDark: '#F59E0B',
  logicGoldLight: '#FCD34D',

  // Neutral Colors
  white: '#FFFFFF',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',

  // Semantic Colors
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Card backgrounds
  cardBackground: '#1E293B',
  cardBackgroundDark: '#0F172A',

  // Glass-morphism backgrounds
  glassBackground: 'rgba(30, 41, 59, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',

  // Algorithm-specific colors
  comparing: '#FBBF24',
  swapping: '#FB7185',
  sorted: '#22C55E',
  active: '#2DD4BF',
  visited: '#3B82F6',
  frontier: '#A855F7',
  obstacle: '#64748B',
  start: '#22C55E',
  end: '#EF4444',
  path: '#FBBF24',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  title: 32,
};

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const BorderRadius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const AnimationDurations = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
};

// Algorithm Categories
export const AlgorithmCategories = {
  searching: {
    id: 'searching',
    name: 'Searching',
    icon: 'search',
    color: Colors.actionTeal,
    algorithms: ['linear-search', 'binary-search', 'jump-search'],
  },
  sorting: {
    id: 'sorting',
    name: 'Sorting',
    icon: 'bar-chart',
    color: Colors.alertCoral,
    algorithms: ['bubble-sort', 'selection-sort', 'insertion-sort', 'merge-sort', 'quick-sort', 'heap-sort'],
  },
  graphs: {
    id: 'graphs',
    name: 'Graphs',
    icon: 'git-branch',
    color: Colors.logicGold,
    algorithms: ['bfs', 'dfs', 'dijkstra', 'a-star'],
  },
  dynamicProgramming: {
    id: 'dynamic-programming',
    name: 'Dynamic Programming',
    icon: 'layers',
    color: Colors.info,
    algorithms: ['fibonacci', 'knapsack', 'longest-common-subsequence'],
  },
  greedy: {
    id: 'greedy',
    name: 'Greedy',
    icon: 'trending-up',
    color: Colors.success,
    algorithms: ['activity-selection', 'huffman-coding', 'fractional-knapsack'],
  },
};

// Complexity notations
export const ComplexityNotations = {
  'O(1)': { label: 'O(1)', name: 'Constant', color: Colors.success },
  'O(log n)': { label: 'O(log n)', name: 'Logarithmic', color: Colors.actionTeal },
  'O(n)': { label: 'O(n)', name: 'Linear', color: Colors.logicGold },
  'O(n log n)': { label: 'O(n log n)', name: 'Linearithmic', color: Colors.warning },
  'O(n²)': { label: 'O(n²)', name: 'Quadratic', color: Colors.alertCoral },
  'O(2^n)': { label: 'O(2^n)', name: 'Exponential', color: Colors.error },
};

// Glass-morphism style helper
export const GlassStyles = {
  container: {
    backgroundColor: Colors.glassBackground,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden' as const,
  },
  containerLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden' as const,
  },
};

// Battle Arena Colors
export const BattleColors = {
  player1: Colors.actionTeal,
  player2: Colors.electricPurple,
  winner: Colors.logicGold,
  neutral: Colors.gray500,
};

// Algorithm Big-O Complexity Data
export interface AlgorithmComplexity {
  name: string;
  category: string;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  stable?: boolean;
  inPlace?: boolean;
  whenToUse: string;
}

export const AlgorithmComplexities: Record<string, AlgorithmComplexity> = {
  'bubble-sort': {
    name: 'Bubble Sort',
    category: 'Sorting',
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stable: true,
    inPlace: true,
    whenToUse: 'Small datasets or nearly sorted arrays. Great for learning but avoid in production.',
  },
  'selection-sort': {
    name: 'Selection Sort',
    category: 'Sorting',
    timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stable: false,
    inPlace: true,
    whenToUse: 'When memory writes are expensive (e.g., flash memory). Minimal swaps guaranteed.',
  },
  'insertion-sort': {
    name: 'Insertion Sort',
    category: 'Sorting',
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    stable: true,
    inPlace: true,
    whenToUse: 'Small arrays or nearly sorted data. Often used as base case in hybrid algorithms.',
  },
  'merge-sort': {
    name: 'Merge Sort',
    category: 'Sorting',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(n)',
    stable: true,
    inPlace: false,
    whenToUse: 'When stability matters or guaranteed O(n log n) is needed. Ideal for linked lists.',
  },
  'quick-sort': {
    name: 'Quick Sort',
    category: 'Sorting',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    spaceComplexity: 'O(log n)',
    stable: false,
    inPlace: true,
    whenToUse: 'General-purpose sorting. Fastest in practice for most cases. Use randomized pivot.',
  },
  'heap-sort': {
    name: 'Heap Sort',
    category: 'Sorting',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(1)',
    stable: false,
    inPlace: true,
    whenToUse: 'When O(n log n) worst-case is required with O(1) space. Systems with memory constraints.',
  },
  'linear-search': {
    name: 'Linear Search',
    category: 'Searching',
    timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(1)',
    whenToUse: 'Unsorted arrays, small datasets, or linked lists. Simple and works everywhere.',
  },
  'binary-search': {
    name: 'Binary Search',
    category: 'Searching',
    timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(1)',
    whenToUse: 'Sorted arrays only. Extremely efficient for large datasets with random access.',
  },
  'bfs': {
    name: 'Breadth-First Search',
    category: 'Graphs',
    timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
    spaceComplexity: 'O(V)',
    whenToUse: 'Shortest path in unweighted graphs. Level-order traversal. Finding all nodes at distance k.',
  },
  'dfs': {
    name: 'Depth-First Search',
    category: 'Graphs',
    timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
    spaceComplexity: 'O(V)',
    whenToUse: 'Cycle detection, topological sort, path finding, maze solving. Lower memory than BFS.',
  },
  'dijkstra': {
    name: "Dijkstra's Algorithm",
    category: 'Graphs',
    timeComplexity: { best: 'O((V + E) log V)', average: 'O((V + E) log V)', worst: 'O((V + E) log V)' },
    spaceComplexity: 'O(V)',
    whenToUse: 'Shortest path in weighted graphs with non-negative edges. GPS navigation, network routing.',
  },
  'astar': {
    name: 'A* Search',
    category: 'Graphs',
    timeComplexity: { best: 'O(E)', average: 'O(E)', worst: 'O(E)' },
    spaceComplexity: 'O(V)',
    whenToUse: 'Pathfinding with a known goal. Game AI, robotics. Faster than Dijkstra with good heuristic.',
  },
};
