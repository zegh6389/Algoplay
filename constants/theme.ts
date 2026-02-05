// Algoplay Theme Constants - One Dark Pro Theme
export const Colors = {
  // One Dark Pro - Primary Backgrounds
  background: '#282c34', // Deep charcoal - main background
  backgroundDark: '#21252b', // Darker variant
  backgroundLight: '#3d4451', // Slightly lighter charcoal

  // One Dark Pro - Surface/Cards
  surface: '#3d4451', // Slightly lighter charcoal for cards
  surfaceDark: '#2c313a', // Darker surface variant
  surfaceLight: '#4b5263', // Lighter surface

  // One Dark Pro - Typography
  textPrimary: '#abb2bf', // Light gray - primary text
  textSecondary: '#5c6370', // Muted gray - secondary text
  textMuted: '#4b5263', // Even more muted
  white: '#FFFFFF',

  // One Dark Pro - Accent Colors
  accent: '#61afef', // Bright blue - primary accent
  accentDark: '#528bbd', // Darker blue
  accentLight: '#8bc5f4', // Lighter blue

  accentSecondary: '#56b6c2', // Cyan - secondary accent
  accentSecondaryDark: '#449da8', // Darker cyan
  accentSecondaryLight: '#7ec9d2', // Lighter cyan

  // One Dark Pro - Semantic/Status Colors
  success: '#98c379', // Green
  successDark: '#7ba35e', // Darker green
  successLight: '#b2d49a', // Lighter green

  warning: '#e5c07b', // Yellow/Gold
  warningDark: '#c9a45c', // Darker gold
  warningLight: '#f0d49b', // Lighter gold

  error: '#e06c75', // Red/Coral
  errorDark: '#c4565e', // Darker red
  errorLight: '#e99099', // Lighter red

  info: '#61afef', // Same as accent (blue)

  // One Dark Pro - Syntax Highlighting Colors (for code)
  syntaxKeyword: '#ff79c6', // Pink - keywords
  syntaxString: '#a6e3a1', // Green - strings
  syntaxNumber: '#f9e2af', // Yellow - numbers
  syntaxComment: '#6272a4', // Gray-blue - comments
  syntaxFunction: '#50fa7b', // Bright green - functions
  syntaxOperator: '#ff9671', // Orange - operators
  syntaxVariable: '#bd93f9', // Purple - variables
  syntaxType: '#8be9fd', // Cyan - types

  // Legacy color mappings (for backward compatibility)
  midnightBlue: '#282c34',
  midnightBlueDark: '#21252b',
  midnightBlueLight: '#3d4451',

  actionTeal: '#61afef', // Now mapped to accent blue
  actionTealDark: '#528bbd',
  actionTealLight: '#8bc5f4',

  electricPurple: '#c678dd', // One Dark Pro purple
  electricPurpleDark: '#a855b4',
  electricPurpleLight: '#d49be8',

  alertCoral: '#e06c75', // Now mapped to error
  alertCoralDark: '#c4565e',
  alertCoralLight: '#e99099',

  logicGold: '#e5c07b', // Now mapped to warning
  logicGoldDark: '#c9a45c',
  logicGoldLight: '#f0d49b',

  // Neutral Colors (One Dark Pro palette)
  gray100: '#e5e9f0',
  gray200: '#d8dee9',
  gray300: '#abb2bf',
  gray400: '#7f848e',
  gray500: '#5c6370',
  gray600: '#4b5263',
  gray700: '#3d4451',
  gray800: '#2c313a',

  // Card backgrounds
  cardBackground: '#3d4451',
  cardBackgroundDark: '#2c313a',

  // Glass-morphism backgrounds
  glassBackground: 'rgba(61, 68, 81, 0.8)',
  glassBorder: 'rgba(171, 178, 191, 0.15)',

  // Algorithm-specific colors
  comparing: '#e5c07b', // Warning color
  swapping: '#e06c75', // Error color
  sorted: '#98c379', // Success color
  active: '#61afef', // Accent color
  visited: '#61afef', // Info blue
  frontier: '#c678dd', // Purple
  obstacle: '#5c6370', // Gray
  start: '#98c379', // Success green
  end: '#e06c75', // Error red
  path: '#e5c07b', // Warning gold
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
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
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
    color: Colors.accent,
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
  'O(log n)': { label: 'O(log n)', name: 'Logarithmic', color: Colors.accent },
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
    backgroundColor: 'rgba(97, 175, 239, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(97, 175, 239, 0.15)',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden' as const,
  },
};

// Battle Arena Colors
export const BattleColors = {
  player1: Colors.accent,
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
