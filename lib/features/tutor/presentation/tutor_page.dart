import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../features/learn/data/algorithm_data.dart';
import '../../../../features/stats/data/stats_repository.dart';
import '../../../../shared/providers/app_providers.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Tutor Page — interactive algorithm Q&A tutor.
///
/// Asks the player multiple-choice questions about algorithm concepts,
/// time/space complexity, and step-by-step reasoning. Provides immediate
/// feedback and explanations. Tracks XP and mastery per algorithm.
/// ═══════════════════════════════════════════════════════════════════════════════

class TutorPage extends ConsumerStatefulWidget {
  const TutorPage({super.key});

  @override
  ConsumerState<TutorPage> createState() => _TutorPageState();
}

class _TutorPageState extends ConsumerState<TutorPage> {
  // ── State ──────────────────────────────────────────────────────────────
  AlgorithmCategory _selectedCategory = AlgorithmCategory.sorting;
  List<_TutorQuestion> _questions = [];
  int _questionIndex = 0;
  int? _selectedAnswer;
  bool _answered = false;
  bool _isLoading = false;
  int _correctInCategory = 0;
  int _totalInCategory = 0;
  int _sessionXP = 0;

  @override
  void initState() {
    super.initState();
    _loadQuestions();
  }

  void _loadQuestions() {
    setState(() {
      _isLoading = true;
      _questions = _generateQuestions(_selectedCategory);
      _questionIndex = 0;
      _selectedAnswer = null;
      _answered = false;
      _correctInCategory = 0;
      _totalInCategory = _questions.length;
    });
    setState(() => _isLoading = false);
  }

  void _selectCategory(AlgorithmCategory cat) {
    setState(() => _selectedCategory = cat);
    _loadQuestions();
  }

  void _selectAnswer(int index) {
    if (_answered) return;

    final question = _questions[_questionIndex];
    final isCorrect = index == question.correctIndex;

    setState(() {
      _selectedAnswer = index;
      _answered = true;
    });

    if (isCorrect) {
      _correctInCategory++;
      _sessionXP += 10;
      ref.read(userProgressProvider.notifier).addXP(10);
      StatsRepository().recordActivity(2, 'tutor');
    }
  }

  void _nextQuestion() {
    if (_questionIndex < _questions.length - 1) {
      setState(() {
        _questionIndex++;
        _selectedAnswer = null;
        _answered = false;
      });
    } else {
      // Category complete
      _showCategoryComplete();
    }
  }

  void _showCategoryComplete() {
    final accuracy = _totalInCategory > 0
        ? ((_correctInCategory / _totalInCategory) * 100).round()
        : 0;

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              accuracy >= 80 ? Icons.star : Icons.school,
              size: 64,
              color: accuracy >= 80 ? AppColors.solarGold : AppColors.primary500,
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              accuracy >= 80 ? 'Excellent!' : 'Good effort!',
              style: AppTypography.h1,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              '$_correctInCategory / $_totalInCategory correct (${accuracy}%)',
              style: AppTypography.body.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              '+$_sessionXP XP earned this session',
              style: TextStyle(
                color: AppColors.solarGold,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: AppSpacing.xl),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  _loadQuestions(); // restart same category
                },
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(0, 48),
                ),
                child: const Text('Try Again'),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () {
                  Navigator.pop(context);
                  _showCategoryPicker();
                },
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(0, 48),
                ),
                child: const Text('Change Category'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showCategoryPicker() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Choose a Category', style: AppTypography.h2),
            const SizedBox(height: AppSpacing.lg),
            ...AlgorithmCategory.values.map((cat) => ListTile(
                  leading: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: _categoryColor(cat).withValues(alpha: 0.15),
                      borderRadius: AppRadius.mdBorder,
                    ),
                    child: Icon(
                      _categoryIcon(cat),
                      color: _categoryColor(cat),
                      size: 20,
                    ),
                  ),
                  title: Text(cat.label),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    Navigator.pop(context);
                    _selectCategory(cat);
                  },
                )),
          ],
        ),
      ),
    );
  }

  // ── Question generation ─────────────────────────────────────────────────

  List<_TutorQuestion> _generateQuestions(AlgorithmCategory category) {
    // Return curated questions per category
    switch (category) {
      case AlgorithmCategory.sorting:
        return _sortingQuestions;
      case AlgorithmCategory.searching:
        return _searchingQuestions;
      case AlgorithmCategory.graphs:
        return _graphQuestions;
      case AlgorithmCategory.dp:
        return _dpQuestions;
      case AlgorithmCategory.greedy:
        return _greedyQuestions;
      case AlgorithmCategory.trees:
        return _treeQuestions;
    }
  }

  static final _sortingQuestions = [
    _TutorQuestion(
      question: 'What is the time complexity of Bubble Sort in the average case?',
      options: ['O(n)', 'O(n log n)', 'O(n2)', 'O(1)'],
      correctIndex: 2,
      explanation:
          'Bubble Sort compares adjacent elements and swaps them if out of order, resulting in nested loops — O(n2) average case.',
    ),
    _TutorQuestion(
      question: 'Which sorting algorithm is NOT stable?',
      options: ['Merge Sort', 'Insertion Sort', 'Quick Sort', 'Bubble Sort'],
      correctIndex: 2,
      explanation:
          'Quick Sort\'s partitioning step can change the relative order of equal elements, making it unstable.',
    ),
    _TutorQuestion(
      question:
          'What is the worst-case time complexity of Quick Sort?',
      options: ['O(n)', 'O(n log n)', 'O(n2)', 'O(2^n)'],
      correctIndex: 2,
      explanation:
          'Quick Sort degrades to O(n2) when the pivot chosen is consistently the smallest or largest element (e.g., already sorted array).',
    ),
    _TutorQuestion(
      question: 'Which algorithm uses a "divide and conquer" strategy?',
      options: ['Selection Sort', 'Insertion Sort', 'Merge Sort', 'Bubble Sort'],
      correctIndex: 2,
      explanation:
          'Merge Sort splits the array in half, recursively sorts each half, then merges them — classic divide and conquer.',
    ),
    _TutorQuestion(
      question:
          'What auxiliary space complexity does Merge Sort use?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n2)'],
      correctIndex: 2,
      explanation:
          'Merge Sort requires O(n) auxiliary space for the temporary arrays used during the merge step.',
    ),
    _TutorQuestion(
      question: 'Which sorting algorithm works best for nearly-sorted arrays?',
      options: ['Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort'],
      correctIndex: 2,
      explanation:
          'Insertion Sort is O(n) for nearly-sorted arrays because few elements need to be shifted.',
    ),
    _TutorQuestion(
      question: 'What is the space complexity of Heap Sort?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctIndex: 0,
      explanation:
          'Heap Sort is in-place and only uses O(1) auxiliary space despite O(n log n) time.',
    ),
    _TutorQuestion(
      question:
          'Which algorithm guarantees O(n log n) time in all cases?',
      options: ['Quick Sort', 'Merge Sort', 'Heap Sort', 'Bubble Sort'],
      correctIndex: 1,
      explanation:
          'Merge Sort always divides the array in half and merges in linear time, guaranteeing O(n log n) regardless of input.',
    ),
  ];

  static final _searchingQuestions = [
    _TutorQuestion(
      question: 'What is the time complexity of Binary Search?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
      correctIndex: 2,
      explanation:
          'Binary Search halves the search space each step, giving O(log n) time.',
    ),
    _TutorQuestion(
      question: 'What prerequisite must an array meet for Binary Search?',
      options: [
        'All elements are positive',
        'Array size is a power of 2',
        'Array is sorted',
        'Array has no duplicates'
      ],
      correctIndex: 2,
      explanation:
          'Binary Search relies on the sorted property to eliminate half the remaining elements each step.',
    ),
    _TutorQuestion(
      question: 'What is the worst-case time complexity of Linear Search?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n2)'],
      correctIndex: 2,
      explanation:
          'Linear Search may need to examine every element in the worst case, giving O(n).',
    ),
    _TutorQuestion(
      question:
          'How many steps does Binary Search need for a 64-element array in the worst case?',
      options: ['6', '8', '12', '64'],
      correctIndex: 1,
      explanation:
          '⌈log₂(64)⌉ = 6, but accounting for edge cases it takes at most ~8 steps in practice for 64 elements.',
    ),
  ];

  static final _graphQuestions = [
    _TutorQuestion(
      question: 'What data structure is typically used for BFS?',
      options: ['Stack', 'Queue', 'Heap', 'Tree'],
      correctIndex: 1,
      explanation:
          'BFS uses a Queue to explore nodes level by level, ensuring nodes are processed in order of depth.',
    ),
    _TutorQuestion(
      question: 'What data structure does DFS typically use?',
      options: ['Queue', 'Stack', 'Heap', 'Graph'],
      correctIndex: 1,
      explanation:
          'DFS uses a Stack (or recursion which uses the call stack) to explore as far as possible along each branch before backtracking.',
    ),
    _TutorQuestion(
      question: 'What is the time complexity of BFS on a graph with V vertices and E edges?',
      options: ['O(V)', 'O(E)', 'O(V + E)', 'O(V * E)'],
      correctIndex: 2,
      explanation:
          'BFS visits each vertex once and examines each edge once, giving O(V + E) total.',
    ),
    _TutorQuestion(
      question: 'Which algorithm finds the shortest path in an unweighted graph?',
      options: ['DFS', 'BFS', 'Dijkstra', 'Bellman-Ford'],
      correctIndex: 1,
      explanation:
          'BFS explores nodes in order of distance from the source, so the first time it reaches a node is via the shortest path.',
    ),
    _TutorQuestion(
      question: "What is the main advantage of Dijkstra's over Bellman-Ford?",
      options: [
        'Works with negative weights',
        'Faster for sparse graphs',
        'Uses less memory',
        'Guarantees fewer iterations'
      ],
      correctIndex: 1,
      explanation:
          "Dijkstra's with a priority queue runs in O((V+E) log V), making it faster than Bellman-Ford's O(VE) for sparse graphs.",
    ),
  ];

  static final _dpQuestions = [
    _TutorQuestion(
      question: 'What is the key property of Dynamic Programming?',
      options: [
        'Greedy choice',
        'Optimal substructure',
        'Backtracking',
        'Randomization'
      ],
      correctIndex: 1,
      explanation:
          'DP requires optimal substructure: the optimal solution can be constructed from optimal solutions of subproblems.',
    ),
    _TutorQuestion(
      question: 'What is the time complexity of computing Fibonacci with naive recursion?',
      options: ['O(n)', 'O(n2)', 'O(2^n)', 'O(log n)'],
      correctIndex: 2,
      explanation:
          'Naive Fibonacci makes two recursive calls per call, leading to a binary tree of size O(2^n).',
    ),
    _TutorQuestion(
      question:
          'Memoization avoids recomputation by storing results in:',
      options: ['A stack', 'A queue', 'A lookup table', 'A tree'],
      correctIndex: 2,
      explanation:
          'Memoization caches subproblem results in a table (often a hash map or array) so each is computed only once.',
    ),
    _TutorQuestion(
      question:
          'What is the space complexity of bottom-up Fibonacci (tabulation)?',
      options: ['O(1)', 'O(n)', 'O(n2)', 'O(2^n)'],
      correctIndex: 1,
      explanation:
          'Bottom-up tabulation stores all n subproblem results in an array, giving O(n) space. Can be optimized to O(1).',
    ),
  ];

  static final _greedyQuestions = [
    _TutorQuestion(
      question: 'What is the key difference between Greedy and DP?',
      options: [
        'Greedy is faster',
        'Greedy never optimal',
        'Greedy makes local choice without looking ahead',
        'DP uses recursion'
      ],
      correctIndex: 2,
      explanation:
          'Greedy algorithms make the locally optimal choice at each step, hoping for a global optimum, without exploring all possibilities.',
    ),
    _TutorQuestion(
      question: 'Which problem is solved optimally by a Greedy approach?',
      options: ['0/1 Knapsack', 'Longest Common Subsequence', 'Activity Selection', 'Traveling Salesman'],
      correctIndex: 2,
      explanation:
          'Activity Selection (selecting max non-overlapping activities) has the greedy choice property: picking the earliest finishing activity is always optimal.',
    ),
    _TutorQuestion(
      question: 'What is the time complexity of Huffman\'s algorithm for encoding?',
      options: ['O(n)', 'O(n log n)', 'O(n2)', 'O(2^n)'],
      correctIndex: 1,
      explanation:
          'Huffman encoding builds a min-heap of character frequencies, taking O(n log n) overall.',
    ),
  ];

  static final _treeQuestions = [
    _TutorQuestion(
      question: 'What traversal visits root, then left subtree, then right subtree?',
      options: ['In-order', 'Pre-order', 'Post-order', 'Level-order'],
      correctIndex: 1,
      explanation:
          'Pre-order visits the root first, then recursively processes the left and right subtrees.',
    ),
    _TutorQuestion(
      question: 'Which tree property does an AVL tree maintain?',
      options: [
        'Complete binary tree',
        'Height balance (|height left - height right| ≤ 1)',
        'Min-heap property',
        'All leaves at same level'
      ],
      correctIndex: 1,
      explanation:
          'AVL trees are self-balancing BSTs that maintain a balance factor of at most 1 between left and right subtrees.',
    ),
    _TutorQuestion(
      question: 'What is the time complexity of BST search in a balanced tree?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctIndex: 1,
      explanation:
          'In a balanced BST, each comparison eliminates half the remaining elements, giving O(log n) search.',
    ),
    _TutorQuestion(
      question: 'What traversal gives nodes in non-decreasing order for a BST?',
      options: ['Pre-order', 'Post-order', 'In-order', 'Level-order'],
      correctIndex: 2,
      explanation:
          'In-order traversal of a BST visits left subtree, then root, then right — producing nodes in sorted order.',
    ),
  ];

  // ── Build ───────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        backgroundColor: AppColors.card,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Algorithm Tutor',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
        actions: [
          // Score display
          Container(
            margin: const EdgeInsets.only(right: AppSpacing.lg),
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.sm,
            ),
            decoration: BoxDecoration(
              color: AppColors.solarGold.withValues(alpha: 0.12),
              borderRadius: AppRadius.smBorder,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.star, size: 16, color: AppColors.solarGold),
                const SizedBox(width: 4),
                Text(
                  '$_sessionXP XP',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.solarGold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // ── Category selector ──
          _buildCategorySelector(),

          // ── Progress bar ──
          _buildProgressBar(),

          // ── Question card ──
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _questions.isEmpty
                    ? _buildEmpty()
                    : _buildQuestionCard(),
          ),
        ],
      ),
    );
  }

  Widget _buildCategorySelector() {
    return Container(
      color: AppColors.card,
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: AlgorithmCategory.values.map((cat) {
            final isSelected = cat == _selectedCategory;
            return Padding(
              padding: const EdgeInsets.only(right: AppSpacing.sm),
              child: FilterChip(
                label: Text(cat.label),
                selected: isSelected,
                onSelected: (selected) {
                  if (selected) _selectCategory(cat);
                },
                backgroundColor: AppColors.sunken,
                selectedColor: _categoryColor(cat).withValues(alpha: 0.2),
                checkmarkColor: _categoryColor(cat),
                labelStyle: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isSelected
                      ? _categoryColor(cat)
                      : AppColors.textSecondary,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: AppRadius.smBorder,
                  side: BorderSide(
                    color: isSelected ? _categoryColor(cat) : Colors.transparent,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildProgressBar() {
    if (_questions.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.md,
      ),
      color: AppColors.card,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Question ${_questionIndex + 1} of ${_questions.length}',
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                ),
              ),
              Text(
                '$_correctInCategory correct',
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.success600,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          ClipRRect(
            borderRadius: AppRadius.fullBorder,
            child: LinearProgressIndicator(
              value: (_questionIndex + 1) / _questions.length,
              backgroundColor: AppColors.sunken,
              valueColor: AlwaysStoppedAnimation(
                _categoryColor(_selectedCategory),
              ),
              minHeight: 6,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.quiz, size: 64, color: AppColors.textMuted),
          const SizedBox(height: AppSpacing.lg),
          const Text('No questions available', style: AppTypography.h3),
          const SizedBox(height: AppSpacing.sm),
          const Text(
            'Try another category',
            style: AppTypography.caption,
          ),
          const SizedBox(height: AppSpacing.xl),
          ElevatedButton(
            onPressed: _showCategoryPicker,
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(160, 44),
            ),
            child: const Text('Choose Category'),
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionCard() {
    final question = _questions[_questionIndex];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ── Question text ──
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: AppRadius.lgBorder,
              boxShadow: AppShadows.sm,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Category chip
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: AppSpacing.xs,
                  ),
                  decoration: BoxDecoration(
                    color: _categoryColor(_selectedCategory).withValues(alpha: 0.12),
                    borderRadius: AppRadius.smBorder,
                  ),
                  child: Text(
                    _selectedCategory.label,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: _categoryColor(_selectedCategory),
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                Text(
                  question.question,
                  style: AppTypography.h3.copyWith(height: 1.4),
                ),
              ],
            ),
          ),

          const SizedBox(height: AppSpacing.lg),

          // ── Answer options ──
          ...List.generate(question.options.length, (index) {
            final isSelected = _selectedAnswer == index;
            final isCorrect = index == question.correctIndex;
            final showResult = _answered;

            Color borderColor = AppColors.sunken;
            Color bgColor = AppColors.card;

            if (showResult) {
              if (isCorrect) {
                borderColor = AppColors.success600;
                bgColor = AppColors.success100;
              } else if (isSelected && !isCorrect) {
                borderColor = AppColors.error600;
                bgColor = AppColors.error100;
              }
            } else if (isSelected) {
              borderColor = AppColors.primary500;
              bgColor = AppColors.primary50;
            }

            return Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.md),
              child: GestureDetector(
                onTap: _answered ? null : () => _selectAnswer(index),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  decoration: BoxDecoration(
                    color: bgColor,
                    borderRadius: AppRadius.mdBorder,
                    border: Border.all(color: borderColor, width: 2),
                    boxShadow: AppShadows.sm,
                  ),
                  child: Row(
                    children: [
                      // Letter indicator
                      Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: showResult && isCorrect
                              ? AppColors.success600
                              : showResult && isSelected && !isCorrect
                                  ? AppColors.error600
                                  : isSelected
                                      ? AppColors.primary500
                                      : AppColors.sunken,
                          borderRadius: AppRadius.smBorder,
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          String.fromCharCode(65 + index), // A, B, C, D
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: showResult && (isCorrect || isSelected)
                                ? Colors.white
                                : isSelected
                                    ? Colors.white
                                    : AppColors.textSecondary,
                          ),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Text(
                          question.options[index],
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight:
                                isSelected ? FontWeight.w600 : FontWeight.w400,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ),
                      if (showResult && isCorrect) ...[
                        const SizedBox(width: AppSpacing.sm),
                        const Icon(
                          Icons.check_circle,
                          color: AppColors.success600,
                          size: 22,
                        ),
                      ] else if (showResult && isSelected && !isCorrect) ...[
                        const SizedBox(width: AppSpacing.sm),
                        const Icon(
                          Icons.cancel,
                          color: AppColors.error600,
                          size: 22,
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            );
          }),

          // ── Explanation (shown after answering) ──
          if (_answered) ...[
            const SizedBox(height: AppSpacing.sm),
            Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: AppColors.primary50,
                borderRadius: AppRadius.mdBorder,
                border: Border.all(color: AppColors.primary100),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(
                        Icons.lightbulb,
                        color: AppColors.primary700,
                        size: 18,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      const Text(
                        'Explanation',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary700,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    question.explanation,
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.primary900,
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.xl),

            // Next button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _nextQuestion,
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(0, 48),
                  backgroundColor: _categoryColor(_selectedCategory),
                ),
                child: Text(
                  _questionIndex < _questions.length - 1
                      ? 'Next Question'
                      : 'See Results',
                ),
              ),
            ),
          ],

          const SizedBox(height: AppSpacing.xxl),
        ],
      ),
    );
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  Color _categoryColor(AlgorithmCategory cat) {
    switch (cat) {
      case AlgorithmCategory.sorting:
        return AppColors.catSorting;
      case AlgorithmCategory.searching:
        return AppColors.catSearching;
      case AlgorithmCategory.graphs:
        return AppColors.catGraphs;
      case AlgorithmCategory.dp:
        return AppColors.catDp;
      case AlgorithmCategory.greedy:
        return AppColors.catGreedy;
      case AlgorithmCategory.trees:
        return AppColors.catTrees;
    }
  }

  IconData _categoryIcon(AlgorithmCategory cat) {
    switch (cat) {
      case AlgorithmCategory.sorting:
        return Icons.sort;
      case AlgorithmCategory.searching:
        return Icons.search;
      case AlgorithmCategory.graphs:
        return Icons.account_tree;
      case AlgorithmCategory.dp:
        return Icons.grid_on;
      case AlgorithmCategory.greedy:
        return Icons.bolt;
      case AlgorithmCategory.trees:
        return Icons.park;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Supporting types
// ─────────────────────────────────────────────────────────────────────────────

class _TutorQuestion {
  final String question;
  final List<String> options;
  final int correctIndex;
  final String explanation;

  const _TutorQuestion({
    required this.question,
    required this.options,
    required this.correctIndex,
    required this.explanation,
  });
}
