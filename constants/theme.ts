// Algoplay Theme Constants - Cyber-Coder Theme
// High-energy neon aesthetic with deep space backgrounds

export const Colors = {
  // Cyber-Coder - Primary Backgrounds (Deep Space)
  background: '#0a0e17', // Deep space black
  backgroundDark: '#050810', // Near-black
  backgroundLight: '#121a2d', // Midnight navy

  // Cyber-Coder - Surface/Cards (Glass-morphism base)
  surface: '#0f1629', // Dark navy surface
  surfaceDark: '#080c18', // Darker surface variant
  surfaceLight: '#1a2744', // Slightly lighter surface

  // Cyber-Coder - Typography
  textPrimary: '#e4ecff', // Bright cool white
  textSecondary: '#6b7a99', // Muted blue-gray
  textMuted: '#3d4d6b', // Dim blue-gray
  white: '#FFFFFF',

  // Cyber-Coder - Neon Accent Colors
  accent: '#00f0ff', // Electric Cyan - primary accent
  accentDark: '#00b8c9', // Darker cyan
  accentLight: '#66f7ff', // Lighter cyan

  accentSecondary: '#00ff94', // Neon Lime - secondary accent
  accentSecondaryDark: '#00cc77', // Darker lime
  accentSecondaryLight: '#66ffba', // Lighter lime

  // Cyber-Coder - Semantic/Status Colors
  success: '#00ff94', // Neon green/lime
  successDark: '#00cc77',
  successLight: '#66ffba',

  warning: '#ffcc00', // Neon yellow
  warningDark: '#cc9900',
  warningLight: '#ffe066',

  error: '#ff3d71', // Neon pink/red
  errorDark: '#d62d5c',
  errorLight: '#ff7a9c',

  info: '#00f0ff', // Same as accent (cyan)

  // Cyber-Coder - Neon Highlight Colors
  neonCyan: '#00f0ff',
  neonPurple: '#bf00ff', // Neon Purple for P2
  neonPink: '#ff00aa',
  neonLime: '#00ff94',
  neonYellow: '#ffcc00',
  neonOrange: '#ff6b00',

  // Syntax Highlighting Colors (Cyber-themed)
  syntaxKeyword: '#ff00aa', // Neon pink - keywords
  syntaxString: '#00ff94', // Neon lime - strings
  syntaxNumber: '#ffcc00', // Neon yellow - numbers
  syntaxComment: '#3d5a80', // Muted blue - comments
  syntaxFunction: '#00f0ff', // Neon cyan - functions
  syntaxOperator: '#ff6b00', // Neon orange - operators
  syntaxVariable: '#bf00ff', // Neon purple - variables
  syntaxType: '#66f7ff', // Light cyan - types

  // Legacy color mappings (for backward compatibility)
  midnightBlue: '#0a0e17',
  midnightBlueDark: '#050810',
  midnightBlueLight: '#121a2d',

  actionTeal: '#00f0ff', // Now mapped to neon cyan
  actionTealDark: '#00b8c9',
  actionTealLight: '#66f7ff',

  electricPurple: '#bf00ff', // Neon purple
  electricPurpleDark: '#9900cc',
  electricPurpleLight: '#d966ff',

  alertCoral: '#ff3d71', // Now mapped to neon pink/red
  alertCoralDark: '#d62d5c',
  alertCoralLight: '#ff7a9c',

  logicGold: '#ffcc00', // Now mapped to neon yellow
  logicGoldDark: '#cc9900',
  logicGoldLight: '#ffe066',

  // Neutral Colors (Cyber palette)
  gray100: '#e4ecff',
  gray200: '#c0cceb',
  gray300: '#8a9cc4',
  gray400: '#6b7a99',
  gray500: '#4d5c7a',
  gray600: '#3d4d6b',
  gray700: '#1a2744',
  gray800: '#0f1629',

  // Card backgrounds (Glowing glass-morphism)
  cardBackground: 'rgba(15, 22, 41, 0.85)',
  cardBackgroundDark: 'rgba(8, 12, 24, 0.9)',

  // Glass-morphism backgrounds
  glassBackground: 'rgba(15, 22, 41, 0.7)',
  glassBorder: 'rgba(0, 240, 255, 0.15)',
  glassGlow: 'rgba(0, 240, 255, 0.3)',

  // Neon border colors for glass effect
  neonBorderCyan: 'rgba(0, 240, 255, 0.4)',
  neonBorderPurple: 'rgba(191, 0, 255, 0.4)',
  neonBorderLime: 'rgba(0, 255, 148, 0.4)',

  // Algorithm-specific colors
  comparing: '#ffcc00', // Neon yellow
  swapping: '#ff3d71', // Neon pink
  sorted: '#00ff94', // Neon lime
  active: '#00f0ff', // Neon cyan
  visited: '#00b8c9', // Darker cyan
  frontier: '#bf00ff', // Neon purple
  obstacle: '#3d4d6b', // Muted gray
  start: '#00ff94', // Neon lime
  end: '#ff3d71', // Neon pink
  path: '#ffcc00', // Neon yellow
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

// Safety Padding System - Minimum 12dp spacing to eliminate UI congestion
export const SafetyPadding = {
  minimum: 12, // Minimum spacing between all UI elements
  element: 14, // Standard element spacing
  section: 20, // Section divider spacing
  card: 16, // Internal card padding
  button: 12, // Button internal padding
  icon: 8, // Icon margins
  tree: {
    nodeVertical: 120, // Vertical spacing between tree nodes (increased)
    nodeSibling: 80, // Horizontal spacing between sibling nodes (increased)
    branchLength: 60, // Connection line length (increased)
  },
};

// Header Theme - Translucent Midnight Black with Neon Border
export const HeaderTheme = {
  background: 'rgba(5, 5, 5, 0.95)', // Translucent Midnight Black #050505
  backgroundSolid: '#050505',
  neonBorderColor: '#00f0ff', // Cyan neon border
  neonBorderWidth: 2,
  textPrimary: '#FFFFFF', // High-visibility white
  textSecondary: '#FF9F00', // Warning orange
  textAccent: '#00f0ff', // Cyan accent
  glowOpacity: 0.3,
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
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  glowPurple: {
    shadowColor: '#bf00ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  glowLime: {
    shadowColor: '#00ff94',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
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
    color: Colors.neonCyan,
    algorithms: ['linear-search', 'binary-search', 'jump-search'],
  },
  sorting: {
    id: 'sorting',
    name: 'Sorting',
    icon: 'bar-chart',
    color: Colors.neonPink,
    algorithms: ['bubble-sort', 'selection-sort', 'insertion-sort', 'merge-sort', 'quick-sort', 'heap-sort'],
  },
  graphs: {
    id: 'graphs',
    name: 'Graphs',
    icon: 'git-branch',
    color: Colors.neonYellow,
    algorithms: ['bfs', 'dfs', 'dijkstra', 'a-star'],
  },
  dynamicProgramming: {
    id: 'dynamic-programming',
    name: 'Dynamic Programming',
    icon: 'layers',
    color: Colors.neonCyan,
    algorithms: ['fibonacci', 'knapsack', 'longest-common-subsequence'],
  },
  greedy: {
    id: 'greedy',
    name: 'Greedy',
    icon: 'trending-up',
    color: Colors.neonLime,
    algorithms: ['activity-selection', 'huffman-coding', 'fractional-knapsack'],
  },
};

// Complexity notations
export const ComplexityNotations = {
  'O(1)': { label: 'O(1)', name: 'Constant', color: Colors.neonLime },
  'O(log n)': { label: 'O(log n)', name: 'Logarithmic', color: Colors.neonCyan },
  'O(n)': { label: 'O(n)', name: 'Linear', color: Colors.neonYellow },
  'O(n log n)': { label: 'O(n log n)', name: 'Linearithmic', color: Colors.neonOrange },
  'O(n²)': { label: 'O(n²)', name: 'Quadratic', color: Colors.neonPink },
  'O(2^n)': { label: 'O(2^n)', name: 'Exponential', color: Colors.error },
};

// Glass-morphism style helper (Cyber-themed)
export const GlassStyles = {
  container: {
    backgroundColor: Colors.glassBackground,
    borderWidth: 1,
    borderColor: Colors.neonBorderCyan,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden' as const,
  },
  containerPurple: {
    backgroundColor: Colors.glassBackground,
    borderWidth: 1,
    borderColor: Colors.neonBorderPurple,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden' as const,
  },
  containerLime: {
    backgroundColor: Colors.glassBackground,
    borderWidth: 1,
    borderColor: Colors.neonBorderLime,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden' as const,
  },
  containerLight: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden' as const,
  },
};

// Battle Arena Colors (Cyber-themed)
export const BattleColors = {
  player1: Colors.neonCyan, // Electric Cyan for P1
  player2: Colors.neonPurple, // Neon Purple for P2
  winner: Colors.neonYellow,
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
