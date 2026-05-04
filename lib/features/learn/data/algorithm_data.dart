// ═══════════════════════════════════════════════════════════════════════════════
/// Algorithm catalog — static data matching the React app.
// ═══════════════════════════════════════════════════════════════════════════════

/// Category enum for algorithm grouping.
enum AlgorithmCategory {
  sorting('Sorting', 'sorting'),
  searching('Searching', 'searching'),
  graphs('Graphs', 'graphs'),
  dp('Dynamic Programming', 'dp'),
  greedy('Greedy', 'greedy'),
  trees('Trees', 'trees');

  const AlgorithmCategory(this.label, this.id);

  /// Human-readable label shown in UI pills.
  final String label;

  /// Slug used as the filter key and in route IDs.
  final String id;
}

/// Difficulty levels.
enum AlgorithmDifficulty { easy, medium, hard }

/// Immutable data model for a single algorithm entry.
class AlgorithmInfo {
  final String id;
  final String name;
  final AlgorithmCategory category;
  final AlgorithmDifficulty difficulty;
  final String timeComplexity;
  final String spaceComplexity;
  final String description;

  const AlgorithmInfo({
    required this.id,
    required this.name,
    required this.category,
    required this.difficulty,
    required this.timeComplexity,
    required this.spaceComplexity,
    required this.description,
  });
}

// ── Master list ─────────────────────────────────────────────────────────────

const List<AlgorithmInfo> allAlgorithms = [
  // ── Sorting ─────────────────────────────────────────────────────────────
  AlgorithmInfo(
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: AlgorithmCategory.sorting,
    difficulty: AlgorithmDifficulty.easy,
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description:
        'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
  ),
  AlgorithmInfo(
    id: 'selection-sort',
    name: 'Selection Sort',
    category: AlgorithmCategory.sorting,
    difficulty: AlgorithmDifficulty.easy,
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description:
        'Divides the input into a sorted and unsorted region, repeatedly selecting the smallest element from the unsorted region.',
  ),
  AlgorithmInfo(
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: AlgorithmCategory.sorting,
    difficulty: AlgorithmDifficulty.easy,
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description:
        'Builds the sorted array one item at a time by inserting each element into its correct position.',
  ),
  AlgorithmInfo(
    id: 'merge-sort',
    name: 'Merge Sort',
    category: AlgorithmCategory.sorting,
    difficulty: AlgorithmDifficulty.medium,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description:
        'A divide-and-conquer algorithm that splits the array in half, recursively sorts each half, then merges them.',
  ),
  AlgorithmInfo(
    id: 'quick-sort',
    name: 'Quick Sort',
    category: AlgorithmCategory.sorting,
    difficulty: AlgorithmDifficulty.medium,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    description:
        'Selects a pivot element and partitions the array around it, then recursively sorts the sub-arrays.',
  ),
  AlgorithmInfo(
    id: 'heap-sort',
    name: 'Heap Sort',
    category: AlgorithmCategory.sorting,
    difficulty: AlgorithmDifficulty.hard,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    description:
        'Converts the array into a max-heap, then repeatedly extracts the maximum element to build the sorted output.',
  ),

  // ── Searching ───────────────────────────────────────────────────────────
  AlgorithmInfo(
    id: 'linear-search',
    name: 'Linear Search',
    category: AlgorithmCategory.searching,
    difficulty: AlgorithmDifficulty.easy,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description:
        'Sequentially checks each element of the list until a match is found or the whole list has been searched.',
  ),
  AlgorithmInfo(
    id: 'binary-search',
    name: 'Binary Search',
    category: AlgorithmCategory.searching,
    difficulty: AlgorithmDifficulty.easy,
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description:
        'Repeatedly divides the sorted search interval in half. Only works on sorted arrays.',
  ),

  // ── Graphs ──────────────────────────────────────────────────────────────
  AlgorithmInfo(
    id: 'bfs',
    name: 'BFS',
    category: AlgorithmCategory.graphs,
    difficulty: AlgorithmDifficulty.medium,
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    description:
        'Breadth-First Search explores all neighbors at the present depth before moving to nodes at the next depth level.',
  ),
  AlgorithmInfo(
    id: 'dfs',
    name: 'DFS',
    category: AlgorithmCategory.graphs,
    difficulty: AlgorithmDifficulty.medium,
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    description:
        'Depth-First Search explores as far as possible along each branch before backtracking.',
  ),
  AlgorithmInfo(
    id: 'dijkstra',
    name: "Dijkstra's",
    category: AlgorithmCategory.graphs,
    difficulty: AlgorithmDifficulty.hard,
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    description:
        'Finds the shortest path from a source node to all other nodes in a weighted graph with non-negative weights.',
  ),
  AlgorithmInfo(
    id: 'a-star',
    name: 'A*',
    category: AlgorithmCategory.graphs,
    difficulty: AlgorithmDifficulty.hard,
    timeComplexity: 'O(E log V)',
    spaceComplexity: 'O(V)',
    description:
        'Combines Dijkstra\'s algorithm with a heuristic to efficiently find the shortest path using best-first search.',
  ),

  // ── Dynamic Programming ─────────────────────────────────────────────────
  AlgorithmInfo(
    id: 'fibonacci',
    name: 'Fibonacci',
    category: AlgorithmCategory.dp,
    difficulty: AlgorithmDifficulty.easy,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description:
        'Computes the nth Fibonacci number using dynamic programming (bottom-up tabulation) instead of naive recursion.',
  ),
  AlgorithmInfo(
    id: 'knapsack',
    name: 'Knapsack',
    category: AlgorithmCategory.dp,
    difficulty: AlgorithmDifficulty.hard,
    timeComplexity: 'O(nW)',
    spaceComplexity: 'O(nW)',
    description:
        'The 0/1 Knapsack problem — select items with given weights and values to maximize total value without exceeding capacity.',
  ),
  AlgorithmInfo(
    id: 'lcs',
    name: 'LCS',
    category: AlgorithmCategory.dp,
    difficulty: AlgorithmDifficulty.medium,
    timeComplexity: 'O(mn)',
    spaceComplexity: 'O(mn)',
    description:
        'Longest Common Subsequence — finds the longest subsequence common to two sequences using dynamic programming.',
  ),

  // ── Greedy ──────────────────────────────────────────────────────────────
  AlgorithmInfo(
    id: 'activity-selection',
    name: 'Activity Selection',
    category: AlgorithmCategory.greedy,
    difficulty: AlgorithmDifficulty.medium,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    description:
        'Selects the maximum number of non-overlapping activities from a set, sorted by finish time.',
  ),
  AlgorithmInfo(
    id: 'huffman',
    name: 'Huffman',
    category: AlgorithmCategory.greedy,
    difficulty: AlgorithmDifficulty.hard,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description:
        'Builds an optimal prefix-free binary tree for lossless data compression using a greedy frequency-based approach.',
  ),

  // ── Trees ───────────────────────────────────────────────────────────────
  AlgorithmInfo(
    id: 'bst-operations',
    name: 'BST Operations',
    category: AlgorithmCategory.trees,
    difficulty: AlgorithmDifficulty.medium,
    timeComplexity: 'O(log n) avg',
    spaceComplexity: 'O(log n)',
    description:
        'Insert, search, and delete operations on a Binary Search Tree maintaining the BST property.',
  ),
  AlgorithmInfo(
    id: 'avl-tree',
    name: 'AVL Tree',
    category: AlgorithmCategory.trees,
    difficulty: AlgorithmDifficulty.hard,
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(log n)',
    description:
        'A self-balancing binary search tree where the heights of two child subtrees differ by at most one.',
  ),
  AlgorithmInfo(
    id: 'tree-traversals',
    name: 'Tree Traversals',
    category: AlgorithmCategory.trees,
    difficulty: AlgorithmDifficulty.easy,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    description:
        'In-order, pre-order, post-order, and level-order traversal of binary trees.',
  ),
  AlgorithmInfo(
    id: 'heap-sort-tree',
    name: 'Heap Sort',
    category: AlgorithmCategory.trees,
    difficulty: AlgorithmDifficulty.hard,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    description:
        'Heap-based sorting viewed through the lens of tree operations — building and extracting from a binary heap.',
  ),
];
