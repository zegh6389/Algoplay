import 'dart:math';

/// A single algorithm quiz question for the battle arena.
class BattleQuestion {
  final String question;
  final String correctAnswer;
  final List<String> options;
  final String hint;
  final int timeLimitSeconds;
  final String category;

  const BattleQuestion({
    required this.question,
    required this.correctAnswer,
    required this.options,
    required this.hint,
    required this.timeLimitSeconds,
    required this.category,
  });
}

/// Generates sets of algorithm quiz questions for battle mode.
class QuestionBank {
  /// Master pool of 36 questions across 6 categories.
  static const _allQuestions = <BattleQuestion>[
    // ── Sorting ────────────────────────────────────────────────────────────
    BattleQuestion(
      question: 'Which sorting algorithm has O(n log n) average case and is not stable?',
      correctAnswer: 'Quick Sort',
      options: ['Merge Sort', 'Quick Sort', 'Insertion Sort', 'Bubble Sort'],
      hint: 'It picks a pivot element to partition the array.',
      timeLimitSeconds: 15,
      category: 'sorting',
    ),
    BattleQuestion(
      question: 'What is the best-case time complexity of bubble sort?',
      correctAnswer: 'O(n)',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
      hint: 'When the array is already sorted, only one pass is needed.',
      timeLimitSeconds: 12,
      category: 'sorting',
    ),
    BattleQuestion(
      question: 'Which sorting algorithm builds a sorted array one element at a time?',
      correctAnswer: 'Insertion Sort',
      options: ['Merge Sort', 'Quick Sort', 'Insertion Sort', 'Selection Sort'],
      hint: 'It "inserts" each element into its correct position.',
      timeLimitSeconds: 12,
      category: 'sorting',
    ),
    BattleQuestion(
      question: 'Merge sort uses which algorithmic paradigm?',
      correctAnswer: 'Divide and conquer',
      options: ['Greedy', 'Dynamic programming', 'Divide and conquer', 'Backtracking'],
      hint: 'It splits the problem, solves halves, then merges.',
      timeLimitSeconds: 15,
      category: 'sorting',
    ),
    BattleQuestion(
      question: 'What is the worst-case time complexity of selection sort?',
      correctAnswer: 'O(n²)',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
      hint: 'It scans the remaining unsorted portion each time.',
      timeLimitSeconds: 12,
      category: 'sorting',
    ),
    BattleQuestion(
      question: 'Which sort is considered a "comparison-based" sort?',
      correctAnswer: 'Heap Sort',
      options: ['Counting Sort', 'Radix Sort', 'Heap Sort', 'Bucket Sort'],
      hint: 'It uses a binary heap and compares elements.',
      timeLimitSeconds: 15,
      category: 'sorting',
    ),
    // ── Searching ──────────────────────────────────────────────────────────
    BattleQuestion(
      question: 'What is the time complexity of binary search?',
      correctAnswer: 'O(log n)',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      hint: 'Divides the search space in half each step.',
      timeLimitSeconds: 15,
      category: 'searching',
    ),
    BattleQuestion(
      question: 'Binary search requires the array to be what?',
      correctAnswer: 'Sorted',
      options: ['Sorted', 'Unsorted', 'Reversed', 'Random'],
      hint: 'It compares to the middle element to decide direction.',
      timeLimitSeconds: 10,
      category: 'searching',
    ),
    BattleQuestion(
      question: 'What is the time complexity of linear search?',
      correctAnswer: 'O(n)',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      hint: 'It checks each element one by one.',
      timeLimitSeconds: 10,
      category: 'searching',
    ),
    BattleQuestion(
      question: 'Which data structure enables O(1) average-case lookup by key?',
      correctAnswer: 'Hash table',
      options: ['Array', 'Linked list', 'Hash table', 'Binary tree'],
      hint: 'It maps keys to indices using a hash function.',
      timeLimitSeconds: 12,
      category: 'searching',
    ),
    BattleQuestion(
      question: 'Interpolation search works best on what kind of data?',
      correctAnswer: 'Uniformly distributed',
      options: ['Random', 'Uniformly distributed', 'Reversed', 'Nearly sorted'],
      hint: 'It estimates the position based on value distribution.',
      timeLimitSeconds: 15,
      category: 'searching',
    ),
    // ── Graphs ─────────────────────────────────────────────────────────────
    BattleQuestion(
      question: 'What data structure does BFS use?',
      correctAnswer: 'Queue',
      options: ['Stack', 'Queue', 'Heap', 'Tree'],
      hint: 'First-in, first-out.',
      timeLimitSeconds: 10,
      category: 'graphs',
    ),
    BattleQuestion(
      question: 'What data structure does DFS use?',
      correctAnswer: 'Stack',
      options: ['Stack', 'Queue', 'Heap', 'Array'],
      hint: 'Last-in, first-out — can also use recursion.',
      timeLimitSeconds: 10,
      category: 'graphs',
    ),
    BattleQuestion(
      question: 'Which algorithm finds the shortest path in a weighted graph with non-negative edges?',
      correctAnswer: "Dijkstra's",
      options: ['DFS', 'BFS', "Dijkstra's", 'Binary Search'],
      hint: 'Named after a Dutch computer scientist.',
      timeLimitSeconds: 15,
      category: 'graphs',
    ),
    BattleQuestion(
      question: "Kruskal's algorithm is used to find what?",
      correctAnswer: 'Minimum spanning tree',
      options: ['Shortest path', 'Minimum spanning tree', 'Maximum flow', 'Topological order'],
      hint: 'It greedily adds the cheapest edge that doesn\'t form a cycle.',
      timeLimitSeconds: 15,
      category: 'graphs',
    ),
    BattleQuestion(
      question: 'Topological sort is applicable to what type of graph?',
      correctAnswer: 'Directed acyclic graph',
      options: ['Undirected graph', 'Directed acyclic graph', 'Complete graph', 'Bipartite graph'],
      hint: 'DAG — a directed graph with no cycles.',
      timeLimitSeconds: 15,
      category: 'graphs',
    ),
    BattleQuestion(
      question: "Bellman-Ford can handle graphs with what special feature?",
      correctAnswer: 'Negative edge weights',
      options: ['Positive cycles', 'Negative edge weights', 'Self-loops only', 'Parallel edges'],
      hint: 'Unlike Dijkstra, it tolerates negative weights.',
      timeLimitSeconds: 15,
      category: 'graphs',
    ),
    // ── Dynamic Programming ────────────────────────────────────────────────
    BattleQuestion(
      question: 'What is the key idea behind dynamic programming?',
      correctAnswer: 'Overlapping subproblems + optimal substructure',
      options: [
        'Random sampling',
        'Overlapping subproblems + optimal substructure',
        'Always greedy choice',
        'Backtracking only',
      ],
      hint: 'Store and reuse solutions to subproblems.',
      timeLimitSeconds: 15,
      category: 'dp',
    ),
    BattleQuestion(
      question: 'The Fibonacci sequence is a classic example of which technique?',
      correctAnswer: 'Memoization',
      options: ['Greedy', 'Memoization', 'Two pointers', 'Sliding window'],
      hint: 'Caching previously computed results.',
      timeLimitSeconds: 12,
      category: 'dp',
    ),
    BattleQuestion(
      question: 'What is the time complexity of the standard DP solution for the 0/1 knapsack problem?',
      correctAnswer: 'O(n × W)',
      options: ['O(n)', 'O(n²)', 'O(n × W)', 'O(2ⁿ)'],
      hint: 'n = number of items, W = knapsack capacity.',
      timeLimitSeconds: 15,
      category: 'dp',
    ),
    BattleQuestion(
      question: 'In DP, bottom-up approach fills the table in what order?',
      correctAnswer: 'Smallest subproblems first',
      options: [
        'Largest subproblems first',
        'Smallest subproblems first',
        'Random order',
        'Reverse order',
      ],
      hint: 'Start from the base cases and build up.',
      timeLimitSeconds: 12,
      category: 'dp',
    ),
    BattleQuestion(
      question: 'Longest Common Subsequence (LCS) between "ABC" and "AC" is what?',
      correctAnswer: 'AC',
      options: ['AB', 'AC', 'BC', 'ABC'],
      hint: 'A subsequence need not be contiguous.',
      timeLimitSeconds: 12,
      category: 'dp',
    ),
    BattleQuestion(
      question: 'Edit distance between "kitten" and "sitting" is:',
      correctAnswer: '3',
      options: ['2', '3', '4', '5'],
      hint: 'k→s, e→i, insert g at end.',
      timeLimitSeconds: 15,
      category: 'dp',
    ),
    // ── Trees ──────────────────────────────────────────────────────────────
    BattleQuestion(
      question: 'In a binary search tree, left child values are always what?',
      correctAnswer: 'Less than the parent',
      options: ['Greater than the parent', 'Less than the parent', 'Equal to parent', 'Random'],
      hint: 'BST property: left < parent < right.',
      timeLimitSeconds: 10,
      category: 'trees',
    ),
    BattleQuestion(
      question: 'What is the height of a perfectly balanced binary tree with n nodes?',
      correctAnswer: 'O(log n)',
      options: ['O(n)', 'O(log n)', 'O(√n)', 'O(1)'],
      hint: 'Each level doubles the number of nodes.',
      timeLimitSeconds: 12,
      category: 'trees',
    ),
    BattleQuestion(
      question: 'In-order traversal of a BST produces elements in what order?',
      correctAnswer: 'Ascending order',
      options: ['Random order', 'Descending order', 'Ascending order', 'Level order'],
      hint: 'Left → Node → Right.',
      timeLimitSeconds: 12,
      category: 'trees',
    ),
    BattleQuestion(
      question: 'An AVL tree is what type of tree?',
      correctAnswer: 'Self-balancing BST',
      options: ['B-tree', 'Self-balancing BST', 'Red-black tree', 'Trie'],
      hint: 'It maintains balance factor of at most 1.',
      timeLimitSeconds: 15,
      category: 'trees',
    ),
    BattleQuestion(
      question: 'A trie is best suited for which operation?',
      correctAnswer: 'Prefix matching',
      options: ['Sorting numbers', 'Prefix matching', 'Finding median', 'Heap operations'],
      hint: 'Also called a prefix tree.',
      timeLimitSeconds: 12,
      category: 'trees',
    ),
    BattleQuestion(
      question: 'What is the minimum number of nodes in a complete binary tree of height h?',
      correctAnswer: '2ʰ',
      options: ['h', '2ʰ', '2ʰ⁺¹ − 1', 'h + 1'],
      hint: 'Each level must be fully filled except possibly the last.',
      timeLimitSeconds: 15,
      category: 'trees',
    ),
    // ── Greedy ─────────────────────────────────────────────────────────────
    BattleQuestion(
      question: 'A greedy algorithm always makes what kind of choice?',
      correctAnswer: 'Locally optimal',
      options: ['Globally optimal', 'Locally optimal', 'Random', 'Worst-case'],
      hint: 'It picks the best option at each step without backtracking.',
      timeLimitSeconds: 12,
      category: 'greedy',
    ),
    BattleQuestion(
      question: "Huffman's algorithm is an example of which paradigm?",
      correctAnswer: 'Greedy',
      options: ['DP', 'Greedy', 'Divide and conquer', 'Backtracking'],
      hint: 'It greedily merges the two smallest-frequency nodes.',
      timeLimitSeconds: 12,
      category: 'greedy',
    ),
    BattleQuestion(
      question: 'Activity selection problem is solved optimally by which approach?',
      correctAnswer: 'Greedy by earliest finish time',
      options: [
        'DP by total weight',
        'Greedy by earliest finish time',
        'Greedy by shortest duration',
        'Backtracking',
      ],
      hint: 'Pick the activity that finishes first, then repeat.',
      timeLimitSeconds: 15,
      category: 'greedy',
    ),
    BattleQuestion(
      question: 'Does a greedy algorithm always produce the optimal solution?',
      correctAnswer: 'No — only for problems with greedy-choice property',
      options: [
        'Yes, always',
        'No — only for problems with greedy-choice property',
        'Only for graph problems',
        'Only for sorting',
      ],
      hint: 'Greedy works for matroids and certain optimal structures.',
      timeLimitSeconds: 15,
      category: 'greedy',
    ),
    // ── Complexity ─────────────────────────────────────────────────────────
    BattleQuestion(
      question: 'What is the space complexity of merge sort?',
      correctAnswer: 'O(n)',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      hint: 'Requires auxiliary space proportional to input size.',
      timeLimitSeconds: 12,
      category: 'complexity',
    ),
    BattleQuestion(
      question: 'Which complexity class does O(n log n) belong to?',
      correctAnswer: 'Linearithmic',
      options: ['Linear', 'Quadratic', 'Linearithmic', 'Exponential'],
      hint: 'Between linear and quadratic.',
      timeLimitSeconds: 12,
      category: 'complexity',
    ),
    BattleQuestion(
      question: 'What does "P" in P vs NP stand for?',
      correctAnswer: 'Polynomial time',
      options: ['Probabilistic', 'Polynomial time', 'Parallel', 'Prime'],
      hint: 'Problems solvable in polynomial time by a deterministic TM.',
      timeLimitSeconds: 12,
      category: 'complexity',
    ),
  ];

  /// Generate [count] questions, shuffled by [seed].
  /// Guarantees: no duplicates, correct answer in options, multiple categories.
  static List<BattleQuestion> generate({int count = 10, int? seed}) {
    final rng = Random(seed);
    // Shuffle the master pool
    final pool = List<BattleQuestion>.from(_allQuestions);
    pool.shuffle(rng);

    // Take `count` questions (clamped to pool size)
    final selected = pool.take(count.clamp(0, pool.length)).toList();

    // Shuffle each question's options deterministically
    return selected.map((q) {
      final opts = List<String>.from(q.options);
      opts.shuffle(rng);
      return BattleQuestion(
        question: q.question,
        correctAnswer: q.correctAnswer,
        options: opts,
        hint: q.hint,
        timeLimitSeconds: q.timeLimitSeconds,
        category: q.category,
      );
    }).toList();
  }
}
