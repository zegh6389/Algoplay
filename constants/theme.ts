// Algoplay Theme Constants
export const Colors = {
  // Primary Colors
  midnightBlue: '#0F172A',
  midnightBlueDark: '#0A1120',
  midnightBlueLight: '#1E293B',

  // Accent Colors
  actionTeal: '#2DD4BF',
  actionTealDark: '#14B8A6',
  actionTealLight: '#5EEAD4',

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
