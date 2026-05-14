import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/services/ad_service.dart';
import '../../../core/services/premium_service.dart';
import '../../../algorithms/models/algorithm_models.dart';
import '../../../algorithms/sorting/sorting_algorithms.dart';
import '../../../algorithms/searching/searching_algorithms.dart';
import '../../../algorithms/pathfinding/pathfinding_algorithms.dart';
import '../../../algorithms/trees/tree_algorithms.dart';
import '../../../algorithms/dp/dp_algorithms.dart';
import '../../../algorithms/greedy/greedy_algorithms.dart';
import '../../../algorithms/code/code_implementations.dart';
import '../../learn/data/algorithm_data.dart';
import '../../../shared/providers/premium_provider.dart';
import '../widgets/animated_sort_bar.dart';
import '../widgets/array_input_sheet.dart';
import '../widgets/code_viewer.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Algorithm Visualizer Page
///
/// The main screen where users watch algorithms run step-by-step.
/// Supports both sorting (bar visualization) and searching (cell visualization).
// ═══════════════════════════════════════════════════════════════════════════════

class AlgorithmVisualizerPage extends ConsumerStatefulWidget {
  final String algorithmId;

  const AlgorithmVisualizerPage({super.key, required this.algorithmId});

  @override
  ConsumerState<AlgorithmVisualizerPage> createState() =>
      _AlgorithmVisualizerPageState();
}

class _AlgorithmVisualizerPageState
    extends ConsumerState<AlgorithmVisualizerPage>
    with WidgetsBindingObserver {
  // ── State ────────────────────────────────────────────────────────────────
  List<dynamic> _steps = [];
  int _currentStepIndex = 0;
  bool _isPlaying = false;
  double _speed = 1.0; // 1x, 2x, 4x
  Timer? _playTimer;
  AlgorithmInfo? _algorithmInfo;
  List<String> _pseudocode = [];

  // Hint state for monetization
  String? _hintText;
  bool _isHintLoading = false;
  // Sample data for the algorithm
  late List<int> _sampleArray;

  /// Precomputed UID maps: stepIndex → uid at each position.
  /// Built once in _collectSteps so build() never mutates state.
  List<List<int>> _stepUids = [];

  /// Build a UID map for each step by replaying swaps from the initial state.
  List<List<int>> _buildStepUidMaps(List<dynamic> steps) {
    final maps = <List<int>>[];
    if (steps.isEmpty) return maps;
    final firstStep = steps[0];
    if (firstStep is! SortStep) {
      for (final _ in steps) {
        maps.add([]);
      }
      return maps;
    }
    final n = firstStep.array.length;
    var current = List<int>.generate(n, (i) => i);
    for (final step in steps) {
      if (step is SortStep && step.swapping.length == 2) {
        final a = step.swapping[0];
        final b = step.swapping[1];
        if (a < current.length && b < current.length) {
          final tmp = current[a];
          current[a] = current[b];
          current[b] = tmp;
        }
      }
      maps.add(List<int>.from(current));
    }
    return maps;
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _algorithmInfo = allAlgorithms.firstWhere(
      (a) => a.id == widget.algorithmId,
      orElse: () => allAlgorithms.first,
    );

    // Generate sample data based on algorithm type
    _sampleArray = _generateSampleArray();

    // Load pseudocode from algorithm metadata
    _loadPseudocode();

    // Collect all steps from the stream
    _collectSteps();

    // Pre-load a rewarded ad for the hint feature (free users only)
    if (!PremiumService.instance.isPremium) {
      AdService.instance.loadRewardedAd();
    }
  }

  List<int> _generateSampleArray() {
    if (_algorithmInfo?.category == AlgorithmCategory.searching) {
      // Sorted array for searching algorithms
      return [3, 7, 11, 15, 22, 28, 35, 42, 56, 68];
    }
    // Random-ish array for sorting and tree demos
    return [64, 34, 25, 12, 22, 11, 90, 45, 78, 33];
  }

  List<List<GridCell>> _generateSampleGrid() {
    const rows = 7;
    const cols = 9;
    const start = (row: 0, col: 0);
    const end = (row: 6, col: 8);
    const obstacles = {'1,2', '2,2', '3,2', '4,2', '1,5', '2,5', '3,5', '5,5'};

    return List.generate(rows, (row) {
      return List.generate(cols, (col) {
        final key = '$row,$col';
        return GridCell(
          row: row,
          col: col,
          isStart: row == start.row && col == start.col,
          isEnd: row == end.row && col == end.col,
          isObstacle: obstacles.contains(key),
        );
      });
    });
  }

  TreeNode? _buildSampleTree() {
    TreeNode? root;
    final values = _sampleArray.isEmpty
        ? [50, 30, 70, 20, 40, 60, 80]
        : _sampleArray;
    for (final value in values) {
      root = _insertTreeNode(root, value, 0);
    }
    return root;
  }

  TreeNode _insertTreeNode(TreeNode? node, int value, int depth) {
    if (node == null) {
      return TreeNode(id: '${value}_$depth', value: value, depth: depth);
    }
    if (value < node.value) {
      node.left = _insertTreeNode(node.left, value, depth + 1);
    } else if (value > node.value) {
      node.right = _insertTreeNode(node.right, value, depth + 1);
    }
    return node;
  }

  void _loadPseudocode() {
    final id = widget.algorithmId;
    // Sorting pseudocode
    for (final algo in sortAlgorithms) {
      final algoId = algo.name.toLowerCase().replaceAll(' ', '-');
      if (algoId == id) {
        _pseudocode = algo.pseudocode;
        return;
      }
    }
    // Searching pseudocode
    for (final algo in searchAlgorithms) {
      final algoId = algo.name.toLowerCase().replaceAll(' ', '-');
      if (algoId == id) {
        _pseudocode = algo.pseudocode;
        return;
      }
    }
  }

  Future<void> _collectSteps({int? target}) async {
    final id = widget.algorithmId;
    Stream<dynamic>? stream;

    switch (id) {
      // Sorting algorithms
      case 'bubble-sort':
        stream = bubbleSort(_sampleArray);
        break;
      case 'selection-sort':
        stream = selectionSort(_sampleArray);
        break;
      case 'insertion-sort':
        stream = insertionSort(_sampleArray);
        break;
      case 'merge-sort':
        stream = mergeSort(_sampleArray);
        break;
      case 'quick-sort':
        stream = quickSort(_sampleArray);
        break;
      case 'heap-sort':
        stream = heapSort(_sampleArray);
        break;
      // Graph/pathfinding algorithms
      case 'bfs':
        stream = bfs(_generateSampleGrid());
        break;
      case 'dfs':
        stream = dfs(_generateSampleGrid());
        break;
      case 'dijkstra':
        stream = dijkstra(_generateSampleGrid());
        break;
      case 'a-star':
        stream = astar(_generateSampleGrid());
        break;
      // Tree algorithms
      case 'bst-operations':
        stream = bstSearch(_buildSampleTree(), target ?? 60);
        break;
      case 'avl-tree':
        stream = avlInsert(_buildSampleTree(), target ?? 65);
        break;
      case 'tree-traversals':
        stream = inorderTraversal(_buildSampleTree());
        break;
      case 'heap-sort-tree':
        stream = heapInsert(_sampleArray, target ?? 88);
        break;
      // Dynamic programming algorithms
      case 'fibonacci':
        stream = fibonacciDp(8);
        break;
      case 'knapsack':
        stream = knapsackDp([2, 3, 4, 5], [3, 4, 5, 8], 8);
        break;
      case 'lcs':
        stream = lcsDp('ALGO', 'PLAY');
        break;
      // Greedy algorithms
      case 'activity-selection':
        stream = activitySelectionGreedy();
        break;
      case 'huffman':
        stream = huffmanGreedy();
        break;
      // Searching algorithms
      case 'linear-search':
        stream = linearSearch(
          _sampleArray,
          target ?? _sampleArray[_sampleArray.length ~/ 2],
        );
        break;
      case 'binary-search':
        stream = binarySearch(
          _sampleArray,
          target ?? _sampleArray[_sampleArray.length ~/ 4],
        );
        break;
    }

    if (stream == null) {
      // Fallback for unsupported algorithms
      if (mounted) {
        setState(() {
          _steps = [
            SortStep(
              array: _sampleArray,
              operation: 'Visualization not yet available for this algorithm',
              line: 0,
            ),
          ];
        });
      }
      return;
    }

    final collected = <dynamic>[];
    await for (final step in stream) {
      collected.add(step);
    }

    if (mounted) {
      setState(() {
        _steps = collected;
        _currentStepIndex = 0;
        _stepUids = _buildStepUidMaps(collected);
      });
    }
  }

  // ── Playback controls ────────────────────────────────────────────────────

  void _togglePlay() {
    if (_steps.isEmpty) return;

    setState(() {
      _isPlaying = !_isPlaying;
    });

    if (_isPlaying) {
      _startPlayTimer();
    } else {
      _playTimer?.cancel();
    }
  }

  void _startPlayTimer() {
    _playTimer?.cancel();
    final intervalMs = (1000 / _speed).round();

    _playTimer = Timer.periodic(Duration(milliseconds: intervalMs), (_) {
      if (!mounted) {
        _playTimer?.cancel();
        return;
      }
      if (_currentStepIndex < _steps.length - 1) {
        setState(() {
          _currentStepIndex++;
        });
      } else {
        // Reached end
        _playTimer?.cancel();
        setState(() {
          _isPlaying = false;
        });
      }
    });
  }

  void _stepForward() {
    if (_currentStepIndex < _steps.length - 1) {
      setState(() {
        _currentStepIndex++;
      });
    }
  }

  void _stepBack() {
    if (_currentStepIndex > 0) {
      setState(() {
        _currentStepIndex--;
      });
    }
  }

  void _reset() {
    _playTimer?.cancel();
    setState(() {
      _isPlaying = false;
      _currentStepIndex = 0;
    });
  }

  void _cycleSpeed() {
    _playTimer?.cancel();
    setState(() {
      if (_speed == 1.0) {
        _speed = 2.0;
      } else if (_speed == 2.0) {
        _speed = 4.0;
      } else {
        _speed = 1.0;
      }
    });
    if (_isPlaying) {
      _startPlayTimer();
    }
  }

  void _pauseForLifecycle() {
    _playTimer?.cancel();
    if (mounted && _isPlaying) {
      setState(() => _isPlaying = false);
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.inactive ||
        state == AppLifecycleState.paused ||
        state == AppLifecycleState.hidden ||
        state == AppLifecycleState.detached) {
      _pauseForLifecycle();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _playTimer?.cancel();
    super.dispose();
  }

  // ── Category color helper ────────────────────────────────────────────────

  Color get _categoryColor {
    switch (_algorithmInfo?.category) {
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
      default:
        return AppColors.primary500;
    }
  }

  bool get _isSorting => _algorithmInfo?.category == AlgorithmCategory.sorting;

  bool get _isSearching =>
      _algorithmInfo?.category == AlgorithmCategory.searching;

  bool get _isGraph => _algorithmInfo?.category == AlgorithmCategory.graphs;

  bool get _isTree => _algorithmInfo?.category == AlgorithmCategory.trees;

  bool get _isDp => _algorithmInfo?.category == AlgorithmCategory.dp;

  bool get _isGreedy => _algorithmInfo?.category == AlgorithmCategory.greedy;

  bool get _supportsCustomInput => _isSorting || _isSearching || _isTree;

  bool get _needsTargetInput =>
      _isSearching || (_isTree && widget.algorithmId != 'tree-traversals');

  VisualizerInputKind get _visualizerInputKind {
    if (_isTree) return VisualizerInputKind.treeValues;
    if (widget.algorithmId == 'binary-search') {
      return VisualizerInputKind.sortedArray;
    }
    return VisualizerInputKind.array;
  }

  String get _customInputTooltip {
    if (_isTree) return 'Edit Tree Values';
    if (_isSearching) return 'Edit Search Data';
    return 'Edit Array';
  }

  // ── Hint logic ──────────────────────────────────────────────────────────

  String _generateHintText() {
    if (_steps.isEmpty) {
      return 'The visualization is loading. Watch how the algorithm works step by step!';
    }
    if (_currentStepIndex >= _steps.length - 1) {
      return 'You\'ve reached the final step. The algorithm has finished processing!';
    }
    final nextStep = _steps[_currentStepIndex + 1];
    final nextOp = nextStep is SortStep
        ? nextStep.operation
        : nextStep is SearchStep
        ? nextStep.operation
        : 'the next step';
    return 'Next: $nextOp';
  }

  void _requestHint() {
    final isPremium = ref.read(premiumProvider);
    if (isPremium) {
      _revealHint();
    } else {
      setState(() => _isHintLoading = true);
      AdService.instance.showRewardedAd(
        onReward: () {
          if (mounted) {
            _revealHint();
          }
        },
      );
      // Ad show is async; clear loading after a short delay if dismissed
      Future.delayed(const Duration(seconds: 1), () {
        if (mounted) setState(() => _isHintLoading = false);
      });
    }
  }

  Future<void> _openArrayInput() async {
    final result = await showArrayInputSheet(
      context,
      initialArray: _sampleArray,
      showTarget: _needsTargetInput,
      inputKind: _visualizerInputKind,
    );
    if (result != null && mounted) {
      setState(() {
        _sampleArray = result.array;
        _steps = [];
        _currentStepIndex = 0;
        _isPlaying = false;
      });
      _collectSteps(target: result.target);
    }
  }

  void _revealHint() {
    setState(() {
      _hintText = _generateHintText();
      _isHintLoading = false;
    });
    // Auto-hide hint after 5 seconds
    Future.delayed(const Duration(seconds: 5), () {
      if (mounted) {
        setState(() => _hintText = null);
      }
    });
  }

  // ── Build ────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final isPremium = ref.watch(premiumProvider);
    final algorithmName = _algorithmInfo?.name ?? widget.algorithmId;
    final currentStep = _steps.isNotEmpty ? _steps[_currentStepIndex] : null;

    return Scaffold(
      backgroundColor: AppColors.card,
      appBar: AppBar(
        backgroundColor: AppColors.card,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          algorithmName,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        centerTitle: true,
        actions: [
          if (_supportsCustomInput)
            IconButton(
              icon: const Icon(Icons.edit_note),
              tooltip: _customInputTooltip,
              onPressed: _openArrayInput,
            ),
          // Hint button — premium gets direct hint, free users watch an ad
          IconButton(
            icon: _isHintLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: AppColors.textSecondary,
                    ),
                  )
                : Icon(
                    isPremium ? Icons.lightbulb : Icons.lightbulb_outline,
                    color: AppColors.textSecondary,
                  ),
            tooltip: isPremium ? 'Get Hint' : 'Watch ad for hint',
            onPressed: _requestHint,
          ),
          IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: () => _showAlgorithmInfoSheet(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // ── Hint Banner ───────────────────────────────────────────────
          if (_hintText != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg,
                vertical: AppSpacing.sm,
              ),
              color: AppColors.secondary100,
              child: Row(
                children: [
                  const Icon(
                    Icons.lightbulb,
                    size: 18,
                    color: AppColors.secondary500,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(
                      _hintText!,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: AppColors.secondary500,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),

          // ── Visualization Area ──────────────────────────────────────────
          Expanded(
            flex: 6,
            child: Container(
              color: AppColors.card,
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg,
                vertical: AppSpacing.md,
              ),
              child: _steps.isEmpty
                  ? const Center(child: CircularProgressIndicator())
                  : _buildVisualization(currentStep),
            ),
          ),

          // ── Step Info Bar ──────────────────────────────────────────────
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.md,
            ),
            decoration: const BoxDecoration(color: AppColors.sunken),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  currentStep is SortStep
                      ? currentStep.operation
                      : currentStep is SearchStep
                      ? currentStep.operation
                      : currentStep is PathfindingStep
                      ? currentStep.operation
                      : currentStep is TreeStep
                      ? currentStep.operation
                      : currentStep is DPStep
                      ? currentStep.operation
                      : 'Ready',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Step ${_steps.isEmpty ? 0 : _currentStepIndex + 1} / ${_steps.length}',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w400,
                    color: AppColors.textMuted,
                    height: 1.3,
                    letterSpacing: 0.12,
                  ),
                ),
              ],
            ),
          ),

          // ── Code Terminal ───────────────────────────────────────────────
          Container(
            height: 280,
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.sm,
            ),
            child: _buildCodeViewer(currentStep),
          ),

          // ── Controls Bar ───────────────────────────────────────────────
          Container(
            decoration: const BoxDecoration(
              color: AppColors.card,
              border: Border(
                top: BorderSide(color: AppColors.sunken, width: 1),
              ),
            ),
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.md,
            ),
            child: SafeArea(
              top: false,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  // Reset
                  _GhostButton(icon: Icons.replay, onTap: _reset),
                  // Step Back
                  _GhostButton(icon: Icons.skip_previous, onTap: _stepBack),
                  // Play/Pause
                  SizedBox(
                    width: 56,
                    height: 56,
                    child: FloatingActionButton(
                      onPressed: _togglePlay,
                      backgroundColor: _categoryColor,
                      child: Icon(
                        _isPlaying ? Icons.pause : Icons.play_arrow,
                        color: AppColors.textInverse,
                        size: 28,
                      ),
                    ),
                  ),
                  // Step Forward
                  _GhostButton(icon: Icons.skip_next, onTap: _stepForward),
                  // Speed toggle
                  _GhostButton(
                    icon: Icons.speed,
                    label: '${_speed.toInt()}x',
                    onTap: _cycleSpeed,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Visualization dispatch ─────────────────────────────────────────────

  Widget _buildVisualization(dynamic step) {
    if (_isSorting && step is SortStep) {
      return _buildSortingVisualization(step);
    }
    if (_isSearching && step is SearchStep) {
      return _buildSearchingVisualization(step);
    }
    if (_isGraph && step is PathfindingStep) {
      return _buildPathfindingVisualization(step);
    }
    if (_isTree && step is TreeStep) {
      return _buildTreeVisualization(step);
    }
    if (_isDp && step is DPStep) {
      return _buildDpVisualization(step);
    }
    if (_isGreedy && step is DPStep) {
      return _buildGreedyVisualization(step);
    }
    return const Center(
      child: Text(
        'Visualization is loading…',
        style: TextStyle(color: AppColors.textMuted),
      ),
    );
  }

  // ── Sorting visualization (vertical bars) ─────────────────────────────

  Widget _buildSortingVisualization(SortStep? step) {
    if (step == null) return const SizedBox.shrink();

    final array = step.array;
    final maxValue = array.isEmpty
        ? 1.0
        : array.reduce((a, b) => a > b ? a : b).toDouble();

    // Get precomputed UIDs for this step index (no mutation in build!)
    final uids = _currentStepIndex < _stepUids.length
        ? _stepUids[_currentStepIndex]
        : List.generate(array.length, (i) => i);

    // Build bar data with stable UIDs
    final bars = List.generate(array.length, (i) {
      String state = 'default';
      if (step.sorted.contains(i)) {
        state = 'sorted';
      } else if (step.swapping.contains(i)) {
        state = 'swapping';
      } else if (step.pivot == i) {
        state = 'pivot';
      } else if (step.comparing.contains(i)) {
        state = 'comparing';
      }
      return SortBarData(
        value: array[i],
        state: state,
        uid: i < uids.length ? uids[i] : i,
      );
    });

    return AnimatedSortBar(bars: bars, maxValue: maxValue);
  }

  // ── Searching visualization (horizontal cells with spotlight) ────────────

  Widget _buildSearchingVisualization(SearchStep? step) {
    if (step == null) return const SizedBox.shrink();

    final array = step.array;
    final comparing = step.comparing;
    final eliminated = step.eliminated;
    final found = step.found;
    final searchRange = step.searchRange;

    return LayoutBuilder(
      builder: (context, constraints) {
        final availableWidth = constraints.maxWidth;
        final cellWidth = (availableWidth - array.length * 4) / array.length;

        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Target badge (always show — target is required, 0 is valid)
            Container(
              margin: const EdgeInsets.only(bottom: AppSpacing.md),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.secondary500.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.secondary500, width: 2),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.search,
                    color: AppColors.secondary500,
                    size: 18,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Target: ${step.target}',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.secondary500,
                    ),
                  ),
                ],
              ),
            ),
            // Search range indicator
            if (searchRange.left >= 0)
              Padding(
                padding: EdgeInsets.only(
                  left: searchRange.left * (cellWidth + 4),
                  right:
                      availableWidth -
                      (searchRange.right + 1) * (cellWidth + 4),
                  bottom: 4,
                ),
                child: Container(
                  height: 3,
                  decoration: BoxDecoration(
                    color: const Color(0xFF12D7C5).withValues(alpha: 0.6),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
            // Array cells
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(array.length, (i) {
                final isComparing = comparing.contains(i);
                final isFound = found && isComparing;
                final isEliminated = eliminated.contains(i);
                final inRange = i >= searchRange.left && i <= searchRange.right;

                Color bgColor;
                Color textColor;
                Color borderColor;
                double borderWidth;
                if (isFound) {
                  bgColor = const Color(0xFFA6E3A1).withValues(alpha: 0.2);
                  textColor = const Color(0xFFA6E3A1);
                  borderColor = const Color(0xFFA6E3A1);
                  borderWidth = 3;
                } else if (isComparing) {
                  bgColor = const Color(0xFFE5C07B).withValues(alpha: 0.2);
                  textColor = const Color(0xFFE5C07B);
                  borderColor = const Color(0xFFE5C07B);
                  borderWidth = 3;
                } else if (isEliminated) {
                  bgColor = Colors.grey.withValues(alpha: 0.08);
                  textColor = AppColors.textMuted;
                  borderColor = Colors.transparent;
                  borderWidth = 0;
                } else if (inRange) {
                  bgColor = const Color(0xFF12D7C5).withValues(alpha: 0.1);
                  textColor = const Color(0xFF12D7C5);
                  borderColor = const Color(0xFF12D7C5).withValues(alpha: 0.3);
                  borderWidth = 1;
                } else {
                  bgColor = AppColors.sunken;
                  textColor = AppColors.textMuted;
                  borderColor = Colors.transparent;
                  borderWidth = 0;
                }

                return AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  curve: Curves.easeOutCubic,
                  width: cellWidth.clamp(28.0, 60.0),
                  height: isComparing ? 54.0 : 48.0,
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  decoration: BoxDecoration(
                    color: bgColor,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: borderColor, width: borderWidth),
                    boxShadow: isComparing
                        ? [
                            BoxShadow(
                              color: borderColor.withValues(alpha: 0.4),
                              blurRadius: 12,
                              spreadRadius: 2,
                            ),
                          ]
                        : null,
                  ),
                  alignment: Alignment.center,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      FittedBox(
                        child: Text(
                          '${array[i]}',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: textColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ),
            // Index labels
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.xs),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(array.length, (i) {
                  return SizedBox(
                    width: cellWidth.clamp(28.0, 60.0),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 2),
                      child: Text(
                        '[$i]',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 9,
                          color: AppColors.textMuted.withValues(alpha: 0.6),
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ),
          ],
        );
      },
    );
  }

  // ── Graph/pathfinding visualization ───────────────────────────────────

  Widget _buildPathfindingVisualization(PathfindingStep step) {
    final rows = step.grid.length;
    final cols = rows == 0 ? 0 : step.grid.first.length;
    if (rows == 0 || cols == 0) return const SizedBox.shrink();

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _MetricPill(label: 'Grid', value: '$rows×$cols'),
            _MetricPill(label: 'Visited', value: '${step.nodesVisited}'),
            _MetricPill(label: 'Path', value: '${step.pathLength}'),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        Expanded(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final cell = (constraints.maxWidth / cols).clamp(
                22.0,
                constraints.maxHeight / rows,
              );
              return Center(
                child: SizedBox(
                  width: cell * cols,
                  height: cell * rows,
                  child: GridView.builder(
                    physics: const NeverScrollableScrollPhysics(),
                    padding: EdgeInsets.zero,
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: cols,
                      mainAxisSpacing: 4,
                      crossAxisSpacing: 4,
                    ),
                    itemCount: rows * cols,
                    itemBuilder: (context, index) {
                      final row = index ~/ cols;
                      final col = index % cols;
                      final c = step.grid[row][col];
                      final isCurrent =
                          step.current?.row == row && step.current?.col == col;
                      final color = c.isStart
                          ? const Color(0xFF2563EB)
                          : c.isEnd
                          ? const Color(0xFFE11D48)
                          : c.isPath
                          ? const Color(0xFFF59E0B)
                          : isCurrent
                          ? const Color(0xFF7C3AED)
                          : c.isFrontier
                          ? const Color(0xFF06B6D4)
                          : c.isVisited
                          ? const Color(0xFF059669)
                          : c.isObstacle
                          ? AppColors.textPrimary
                          : AppColors.sunken;
                      final label = c.isStart
                          ? 'S'
                          : c.isEnd
                          ? 'E'
                          : isCurrent
                          ? '•'
                          : '';
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 220),
                        decoration: BoxDecoration(
                          color: color,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isCurrent
                                ? AppColors.textPrimary
                                : Colors.white,
                            width: isCurrent ? 2 : 1,
                          ),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          label,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      );
                    },
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  // ── Tree visualization ────────────────────────────────────────────────

  Widget _buildTreeVisualization(TreeStep step) {
    final root = step.tree;
    final hasArray = step.array.isNotEmpty;
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _MetricPill(
              label: 'Tree',
              value: _algorithmInfo?.id == 'avl-tree'
                  ? 'AVL'
                  : _algorithmInfo?.id == 'heap-sort-tree'
                  ? 'Heap'
                  : 'BST',
            ),
            _MetricPill(label: 'Visited', value: '${step.visitedNodes.length}'),
            _MetricPill(label: 'Path', value: '${step.pathNodes.length}'),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        Expanded(
          child: root == null && !hasArray
              ? const Center(child: Text('Tree is empty'))
              : root != null
              ? CustomPaint(
                  painter: _TreePainter(step),
                  child: const SizedBox.expand(),
                )
              : _buildHeapArrayVisualization(step),
        ),
      ],
    );
  }

  /// Renders heap array with highlighted indices.
  Widget _buildHeapArrayVisualization(TreeStep step) {
    final arr = step.array;
    final highlighted = step.highlightedIndices.toSet();
    return Center(
      child: Wrap(
        alignment: WrapAlignment.center,
        spacing: 8,
        runSpacing: 8,
        children: List.generate(arr.length, (i) {
          final isHighlighted = highlighted.contains(i);
          final color = isHighlighted
              ? const Color(0xFFD97706)
              : const Color(0xFF2563EB);
          return AnimatedContainer(
            duration: const Duration(milliseconds: 220),
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isHighlighted ? AppColors.textPrimary : Colors.white,
                width: isHighlighted ? 2 : 1,
              ),
              boxShadow: isHighlighted
                  ? [
                      BoxShadow(
                        color: color.withValues(alpha: 0.3),
                        blurRadius: 12,
                        spreadRadius: 2,
                      ),
                    ]
                  : null,
            ),
            alignment: Alignment.center,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '[$i]',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.7),
                    fontSize: 9,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  '${arr[i]}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }

  // ── Dynamic programming visualization ─────────────────────────────────

  Widget _buildDpVisualization(DPStep step) {
    final cells = step.array;
    final maxValue = cells.isEmpty
        ? 1
        : cells.reduce((a, b) => a > b ? a : b).clamp(1, 9999);

    // Detect 2D table from memo keys (format: "row,col").
    // Fibonacci memo keys are ints, so guard the key type first.
    final is2D = step.memo.keys.any(
      (key) => key is String && key.contains(','),
    );
    if (is2D) {
      return _buildDp2DTable(step);
    }

    // 1D table (fibonacci etc.)
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const _MetricPill(label: 'State', value: 'DP'),
            _MetricPill(label: 'Cells', value: '${cells.length}'),
            _MetricPill(
              label: 'Result',
              value: step.result?.toString() ?? '...',
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        const Text(
          'DP Table',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 16,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Expanded(
          child: Center(
            child: Wrap(
              alignment: WrapAlignment.center,
              spacing: 8,
              runSpacing: 8,
              children: List.generate(cells.length, (i) {
                final isCurrent = i == step.currentIndex;
                final isComparing = step.comparing.contains(i);
                final isSorted = step.sorted.contains(i);
                final intensity = (cells[i] / maxValue)
                    .clamp(0.08, 1.0)
                    .toDouble();
                final color = isCurrent
                    ? const Color(0xFFD97706)
                    : isComparing
                    ? const Color(0xFF7C3AED)
                    : isSorted
                    ? const Color(0xFF16A34A)
                    : AppColors.primary500.withValues(
                        alpha: 0.25 + intensity * 0.45,
                      );
                return _buildDpCell('$i', '${cells[i]}', color, isCurrent);
              }),
            ),
          ),
        ),
      ],
    );
  }

  /// Render full 2D DP table from memo data (LCS, Knapsack).
  Widget _buildDp2DTable(DPStep step) {
    // Parse memo to build 2D grid
    final rows = <int, Map<int, int>>{};
    for (final entry in step.memo.entries) {
      final key = entry.key;
      if (key is! String) continue;
      final parts = key.split(',');
      if (parts.length != 2) continue;
      final r = int.tryParse(parts[0]) ?? 0;
      final c = int.tryParse(parts[1]) ?? 0;
      final v = entry.value;
      rows.putIfAbsent(r, () => {})[c] = v;
    }
    if (rows.isEmpty) return const SizedBox.shrink();

    final maxRow = rows.keys.reduce((a, b) => a > b ? a : b);
    final maxCol = rows.values
        .expand((m) => m.keys)
        .reduce((a, b) => a > b ? a : b);
    final rowCount = maxRow + 1;
    final colCount = maxCol + 1;

    // Find max value for intensity coloring
    var tableMax = 1;
    for (final rowMap in rows.values) {
      for (final v in rowMap.values) {
        if (v > tableMax) tableMax = v;
      }
    }

    // Determine current cell from linear index (row-major)
    final curRow = step.currentIndex ~/ colCount;
    final curCol = step.currentIndex % colCount;

    // Comparing cells: also convert from linear if needed
    final comparingSet = <String>{};
    for (final idx in step.comparing) {
      comparingSet.add('${idx ~/ colCount},${idx % colCount}');
    }

    // Sorted rows
    final sortedSet = step.sorted.toSet();

    return LayoutBuilder(
      builder: (context, constraints) {
        final availW = constraints.maxWidth;
        final availH = constraints.maxHeight - 40; // leave room for header
        final cellW = (availW / colCount).clamp(28.0, 54.0);
        final cellH = (availH / rowCount).clamp(28.0, 54.0);
        final cellSize = cellW < cellH ? cellW : cellH;

        return Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const _MetricPill(label: 'State', value: 'DP'),
                _MetricPill(label: 'Table', value: '${rowCount}x$colCount'),
                _MetricPill(
                  label: 'Result',
                  value: step.result?.toString() ?? '...',
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            const Text(
              'DP Table',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Expanded(
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: SingleChildScrollView(
                  child: Column(
                    children: List.generate(rowCount, (r) {
                      return Row(
                        children: List.generate(colCount, (c) {
                          final val = rows[r]?[c] ?? 0;
                          final isCurrent = r == curRow && c == curCol;
                          final isComparing = comparingSet.contains('$r,$c');
                          final isSortedRow = sortedSet.contains(r);
                          final intensity = (val / tableMax)
                              .clamp(0.08, 1.0)
                              .toDouble();
                          final color = isCurrent
                              ? const Color(0xFFD97706)
                              : isComparing
                              ? const Color(0xFF7C3AED)
                              : isSortedRow
                              ? const Color(0xFF16A34A)
                              : AppColors.primary500.withValues(
                                  alpha: 0.15 + intensity * 0.5,
                                );
                          return _buildDpCell(
                            '$r,$c',
                            '$val',
                            color,
                            isCurrent,
                            size: cellSize,
                          );
                        }),
                      );
                    }),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  /// Single DP cell widget.
  Widget _buildDpCell(
    String label,
    String value,
    Color color,
    bool isCurrent, {
    double size = 54,
  }) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      width: size,
      height: size,
      margin: const EdgeInsets.all(2),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isCurrent
              ? AppColors.textPrimary
              : Colors.white.withValues(alpha: 0.15),
          width: isCurrent ? 2 : 1,
        ),
        boxShadow: isCurrent
            ? [
                BoxShadow(
                  color: color.withValues(alpha: 0.28),
                  blurRadius: 10,
                  spreadRadius: 2,
                ),
              ]
            : null,
      ),
      alignment: Alignment.center,
      child: FittedBox(
        child: Text(
          value,
          style: TextStyle(
            color: isCurrent ? AppColors.textInverse : AppColors.textPrimary,
            fontSize: size > 36 ? 13 : 11,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
    );
  }

  // ── Greedy visualization ───────────────────────────────────────────────

  Widget _buildGreedyVisualization(DPStep step) {
    final values = step.array;
    final chosen = step.sorted.toSet();
    final current = step.currentIndex;

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        FittedBox(
          fit: BoxFit.scaleDown,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const _MetricPill(label: 'Strategy', value: 'Greedy'),
              _MetricPill(label: 'Chosen', value: '${chosen.length}'),
              _MetricPill(
                label: 'Result',
                value: step.result?.toString() ?? '...',
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        const Text(
          'Greedy Choices',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 16,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Expanded(
          child: Center(
            child: Wrap(
              alignment: WrapAlignment.center,
              spacing: 10,
              runSpacing: 10,
              children: List.generate(values.length, (i) {
                final isChosen = chosen.contains(i);
                final isCurrent = i == current;
                final color = isChosen
                    ? const Color(0xFF16A34A)
                    : isCurrent
                    ? const Color(0xFFD97706)
                    : AppColors.sunken;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 220),
                  width: 74,
                  height: 68,
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isCurrent ? AppColors.textPrimary : Colors.white,
                      width: isCurrent ? 2 : 1,
                    ),
                    boxShadow: isCurrent
                        ? [
                            BoxShadow(
                              color: color.withValues(alpha: 0.30),
                              blurRadius: 14,
                              spreadRadius: 2,
                            ),
                          ]
                        : null,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Choice ${i + 1}',
                        style: TextStyle(
                          color: isChosen || isCurrent
                              ? AppColors.textInverse
                              : AppColors.textMuted,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${values[i]}',
                        style: TextStyle(
                          color: isChosen || isCurrent
                              ? AppColors.textInverse
                              : AppColors.textPrimary,
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ),
          ),
        ),
        if (step.memo.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.sm),
          Wrap(
            alignment: WrapAlignment.center,
            spacing: 6,
            runSpacing: 6,
            children: step.memo.entries.take(4).map((entry) {
              return _MetricPill(
                label: '${entry.key}',
                value: '${entry.value}',
              );
            }).toList(),
          ),
        ],
      ],
    );
  }

  // ── Code Viewer helper ────────────────────────────────────────────────

  Widget _buildCodeViewer(dynamic currentStep) {
    final code = algorithmCodeImplementations[widget.algorithmId];
    if (code == null) {
      return const Center(
        child: Text(
          'Code not available for this algorithm yet.',
          style: TextStyle(color: AppColors.textMuted, fontSize: 13),
        ),
      );
    }
    final currentLine = currentStep is SortStep
        ? currentStep.line
        : currentStep is SearchStep
        ? currentStep.line
        : currentStep is TreeStep
        ? currentStep.line
        : currentStep is DPStep
        ? currentStep.line
        : null;
    return CodeViewer(code: code, currentLine: currentLine);
  }

  // ── Algorithm Info Bottom Sheet ────────────────────────────────────────

  void _showAlgorithmInfoSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.lg)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: AppSpacing.lg),
                  decoration: BoxDecoration(
                    color: AppColors.sunken,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              // Title
              Text(
                _algorithmInfo?.name ?? widget.algorithmId,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),

              // Time Complexity
              _infoRow(
                'Time Complexity',
                _algorithmInfo?.timeComplexity ?? '—',
              ),
              const SizedBox(height: AppSpacing.sm),

              // Space Complexity
              _infoRow(
                'Space Complexity',
                _algorithmInfo?.spaceComplexity ?? '—',
              ),
              const SizedBox(height: AppSpacing.lg),

              // Description
              Text(
                _algorithmInfo?.description ?? '',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                  color: AppColors.textSecondary,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: AppSpacing.xl),

              // Pseudocode
              if (_pseudocode.isNotEmpty) ...[
                const Text(
                  'Pseudocode',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.sunken,
                    borderRadius: AppRadius.mdBorder,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: _pseudocode.map((line) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 1),
                        child: Text(
                          line,
                          style: const TextStyle(
                            fontSize: 12,
                            fontFamily: 'SpaceMono',
                            color: AppColors.textSecondary,
                            height: 1.5,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],

              const SizedBox(height: AppSpacing.xl),
            ],
          ),
        );
      },
    );
  }

  Widget _infoRow(String label, String value) {
    return Row(
      children: [
        SizedBox(
          width: 140,
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            ),
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}

class _MetricPill extends StatelessWidget {
  final String label;
  final String value;

  const _MetricPill({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.sunken,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.sunken),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              color: AppColors.textMuted,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            value,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

class _TreePainter extends CustomPainter {
  final TreeStep step;

  _TreePainter(this.step);

  @override
  void paint(Canvas canvas, Size size) {
    final root = step.tree;
    if (root == null) return;
    final positions = <String, Offset>{};
    _layout(root, size.width / 2, 32, size.width / 4, positions);

    final edgePaint = Paint()
      ..color = AppColors.textMuted.withValues(alpha: 0.28)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    void drawEdges(TreeNode node) {
      final from = positions[node.id]!;
      for (final child in [node.left, node.right]) {
        if (child == null) continue;
        final to = positions[child.id]!;
        canvas.drawLine(from, to, edgePaint);
        drawEdges(child);
      }
    }

    drawEdges(root);
    _drawNodes(canvas, root, positions);
  }

  void _layout(
    TreeNode node,
    double x,
    double y,
    double xGap,
    Map<String, Offset> positions,
  ) {
    positions[node.id] = Offset(x, y);
    final nextGap = xGap * 0.58;
    if (node.left != null) {
      _layout(node.left!, x - xGap, y + 62, nextGap, positions);
    }
    if (node.right != null) {
      _layout(node.right!, x + xGap, y + 62, nextGap, positions);
    }
  }

  void _drawNodes(Canvas canvas, TreeNode node, Map<String, Offset> positions) {
    final center = positions[node.id]!;
    final isVisited = step.visitedNodes.contains(node.id);
    final isPath = step.pathNodes.contains(node.id);
    final isHighlighted = node.isHighlighted || isVisited || isPath;
    final fill = isPath
        ? const Color(0xFF7C3AED)
        : isVisited
        ? const Color(0xFF059669)
        : isHighlighted
        ? const Color(0xFFF59E0B)
        : AppColors.card;
    final border = isHighlighted ? fill : AppColors.sunken;

    final shadowPaint = Paint()
      ..color = fill.withValues(alpha: isHighlighted ? 0.20 : 0.08)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 10);
    canvas.drawCircle(center.translate(0, 2), 24, shadowPaint);

    final nodePaint = Paint()..color = fill;
    canvas.drawCircle(center, 21, nodePaint);
    canvas.drawCircle(
      center,
      21,
      Paint()
        ..color = border
        ..strokeWidth = 2
        ..style = PaintingStyle.stroke,
    );

    final textPainter = TextPainter(
      text: TextSpan(
        text: '${node.value}',
        style: TextStyle(
          color: isHighlighted ? Colors.white : AppColors.textPrimary,
          fontSize: 12,
          fontWeight: FontWeight.w800,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    textPainter.paint(
      canvas,
      center - Offset(textPainter.width / 2, textPainter.height / 2),
    );

    if (node.left != null) _drawNodes(canvas, node.left!, positions);
    if (node.right != null) _drawNodes(canvas, node.right!, positions);
  }

  @override
  bool shouldRepaint(covariant _TreePainter oldDelegate) =>
      oldDelegate.step != step;
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Ghost-style icon button used in the controls bar.
// ═══════════════════════════════════════════════════════════════════════════════

class _GhostButton extends StatelessWidget {
  final IconData icon;
  final String? label;
  final VoidCallback onTap;

  const _GhostButton({required this.icon, this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: AppColors.textSecondary, size: 24),
          if (label != null)
            Padding(
              padding: const EdgeInsets.only(top: 2),
              child: Text(
                label!,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textSecondary,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
