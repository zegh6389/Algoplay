import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../algorithms/sorting/sorting_algorithms.dart';
import '../../../../algorithms/searching/searching_algorithms.dart';
import '../../../../algorithms/models/sort_step.dart';
import '../../../../algorithms/models/search_step.dart';
import '../../../../features/learn/data/algorithm_data.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Playground Page — free-form algorithm sandbox.
///
/// The user can:
///   - Pick any algorithm category (sorting, searching, etc.)
///   - Choose a specific algorithm
///   - Adjust array size and speed
///   - Step through the algorithm manually or auto-play
///   - See pseudocode alongside the visualization
///   - Reset and re-randomize at any time
/// ═══════════════════════════════════════════════════════════════════════════════

class PlaygroundPage extends ConsumerStatefulWidget {
  const PlaygroundPage({super.key});

  @override
  ConsumerState<PlaygroundPage> createState() => _PlaygroundPageState();
}

class _PlaygroundPageState extends ConsumerState<PlaygroundPage> {
  // ── State ──────────────────────────────────────────────────────────────
  AlgorithmCategory _selectedCategory = AlgorithmCategory.sorting;
  String _selectedAlgorithmId = 'bubble-sort';
  late List<int> _array;
  List<dynamic> _steps = [];
  int _currentStepIndex = 0;
  bool _isPlaying = false;
  double _speed = 1.0;
  Timer? _playTimer;
  int _arraySize = 12;
  bool _showCode = true;
  bool _showComplexity = true;
  bool _isLoading = false;

  // Sorting/searching algorithm metadata
  List<String> _pseudocode = [];
  String _timeComplexity = '';
  String _spaceComplexity = '';

  // Category-specific algorithms
  static const _sortingAlgorithms = [
    'bubble-sort',
    'selection-sort',
    'insertion-sort',
    'merge-sort',
    'quick-sort',
    'heap-sort',
  ];

  static const _searchingAlgorithms = ['linear-search', 'binary-search'];

  @override
  void initState() {
    super.initState();
    _generateArray();
    _loadAlgorithm();
  }

  @override
  void dispose() {
    _playTimer?.cancel();
    super.dispose();
  }

  void _generateArray() {
    final random = Random();
    if (_selectedCategory == AlgorithmCategory.searching) {
      // For searching, generate a sorted array
      _array = List.generate(
        _arraySize,
        (i) => (i + 1) * random.nextInt(10) + 5,
      );
      _array.sort();
    } else {
      _array = List.generate(_arraySize, (_) => random.nextInt(100) + 5);
    }
    setState(() {});
    _loadAlgorithm();
  }

  void _loadAlgorithm() {
    _playTimer?.cancel();
    setState(() {
      _isPlaying = false;
      _isLoading = true;
      _currentStepIndex = 0;
      _steps = [];
    });

    // Load algorithm metadata
    _loadMetadata();

    // Collect steps from the algorithm generator
    _collectSteps();
  }

  void _loadMetadata() {
    switch (_selectedAlgorithmId) {
      case 'bubble-sort':
        _pseudocode = bubbleSortMeta.pseudocode;
        _timeComplexity = 'O(n²)';
        _spaceComplexity = 'O(1)';
        break;
      case 'selection-sort':
        _pseudocode = selectionSortMeta.pseudocode;
        _timeComplexity = 'O(n²)';
        _spaceComplexity = 'O(1)';
        break;
      case 'insertion-sort':
        _pseudocode = insertionSortMeta.pseudocode;
        _timeComplexity = 'O(n²)';
        _spaceComplexity = 'O(1)';
        break;
      case 'merge-sort':
        _pseudocode = mergeSortMeta.pseudocode;
        _timeComplexity = 'O(n log n)';
        _spaceComplexity = 'O(n)';
        break;
      case 'quick-sort':
        _pseudocode = quickSortMeta.pseudocode;
        _timeComplexity = 'O(n log n) avg';
        _spaceComplexity = 'O(log n)';
        break;
      case 'heap-sort':
        _pseudocode = heapSortMeta.pseudocode;
        _timeComplexity = 'O(n log n)';
        _spaceComplexity = 'O(1)';
        break;
      case 'linear-search':
        _pseudocode = linearSearchMeta.pseudocode;
        _timeComplexity = 'O(n)';
        _spaceComplexity = 'O(1)';
        break;
      case 'binary-search':
        _pseudocode = binarySearchMeta.pseudocode;
        _timeComplexity = 'O(log n)';
        _spaceComplexity = 'O(1)';
        break;
    }
  }

  Future<void> _collectSteps() async {
    Stream<dynamic>? stream;

    switch (_selectedAlgorithmId) {
      case 'bubble-sort':
        stream = bubbleSort(_array);
        break;
      case 'selection-sort':
        stream = selectionSort(_array);
        break;
      case 'insertion-sort':
        stream = insertionSort(_array);
        break;
      case 'merge-sort':
        stream = mergeSort(_array);
        break;
      case 'quick-sort':
        stream = quickSort(_array);
        break;
      case 'heap-sort':
        stream = heapSort(_array);
        break;
      case 'linear-search':
        stream = linearSearch(_array, _array[_array.length ~/ 3]);
        break;
      case 'binary-search':
        stream = binarySearch(_array, _array[_array.length ~/ 3]);
        break;
    }

    if (stream == null) {
      setState(() => _isLoading = false);
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
        _isLoading = false;
      });
    }
  }

  // ── Playback controls ───────────────────────────────────────────────────

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
    final intervalMs = (800 / _speed).round();

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
      if (_speed == 0.5) {
        _speed = 1.0;
      } else if (_speed == 1.0) {
        _speed = 2.0;
      } else if (_speed == 4.0) {
        _speed = 0.5;
      } else {
        _speed = 0.5;
      }
    });
    if (_isPlaying) {
      _startPlayTimer();
    }
  }

  // ── Array size control ─────────────────────────────────────────────────

  void _setArraySize(int size) {
    if (size < 4) size = 4;
    if (size > 30) size = 30;
    _arraySize = size;
    _generateArray();
  }

  // ── Current step helpers ────────────────────────────────────────────────

  dynamic get _currentStep =>
      _steps.isNotEmpty ? _steps[_currentStepIndex] : null;

  bool get _isSorting =>
      _selectedCategory == AlgorithmCategory.sorting ||
      _selectedCategory == AlgorithmCategory.dp ||
      _selectedCategory == AlgorithmCategory.greedy ||
      _selectedCategory == AlgorithmCategory.trees;

  // ── Build ───────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.card,
      appBar: AppBar(
        backgroundColor: AppColors.card,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Playground',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
        actions: [
          // Settings toggle
          IconButton(
            icon: Icon(
              _showCode ? Icons.code : Icons.code_off,
              color: AppColors.textSecondary,
            ),
            onPressed: () => setState(() => _showCode = !_showCode),
            tooltip: 'Toggle pseudocode',
          ),
          IconButton(
            icon: Icon(
              _showComplexity ? Icons.analytics : Icons.analytics_outlined,
              color: AppColors.textSecondary,
            ),
            onPressed: () => setState(() => _showComplexity = !_showComplexity),
            tooltip: 'Toggle complexity',
          ),
        ],
      ),
      body: Column(
        children: [
          // ── Algorithm selector bar ──
          _buildAlgorithmSelector(),

          // ── Main content ──
          Expanded(
            child: _showCode
                ? Row(
                    children: [
                      // Visualization
                      Expanded(flex: 3, child: _buildVisualization()),
                      // Pseudocode panel
                      Container(width: 1, color: AppColors.sunken),
                      Expanded(flex: 2, child: _buildPseudocodePanel()),
                    ],
                  )
                : _buildVisualization(),
          ),

          // ── Step info bar ──
          _buildStepInfoBar(),

          // ── Controls ──
          _buildControls(),
        ],
      ),
    );
  }

  Widget _buildAlgorithmSelector() {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.md,
      ),
      color: AppColors.card,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Category chips
          SingleChildScrollView(
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
                      if (selected) {
                        setState(() {
                          _selectedCategory = cat;
                          // Pick first algorithm in category
                          if (cat == AlgorithmCategory.sorting) {
                            _selectedAlgorithmId = 'bubble-sort';
                          } else if (cat == AlgorithmCategory.searching) {
                            _selectedAlgorithmId = 'linear-search';
                          } else {
                            _selectedAlgorithmId = cat.id;
                          }
                        });
                        _loadAlgorithm();
                      }
                    },
                    backgroundColor: AppColors.sunken,
                    selectedColor: _getCategoryColor(
                      cat,
                    ).withValues(alpha: 0.2),
                    checkmarkColor: _getCategoryColor(cat),
                    labelStyle: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: isSelected
                          ? _getCategoryColor(cat)
                          : AppColors.textSecondary,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: AppRadius.smBorder,
                      side: BorderSide(
                        color: isSelected
                            ? _getCategoryColor(cat)
                            : Colors.transparent,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: AppSpacing.sm),

          // Algorithm sub-selector
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _algorithmsForCategory(_selectedCategory).map((algoId) {
                final isSelected = algoId == _selectedAlgorithmId;
                return Padding(
                  padding: const EdgeInsets.only(right: AppSpacing.sm),
                  child: ChoiceChip(
                    label: Text(_algoName(algoId)),
                    selected: isSelected,
                    onSelected: (selected) {
                      if (selected) {
                        setState(() => _selectedAlgorithmId = algoId);
                        _loadAlgorithm();
                      }
                    },
                    backgroundColor: AppColors.canvas,
                    selectedColor: _getCategoryColor(
                      _selectedCategory,
                    ).withValues(alpha: 0.15),
                    labelStyle: TextStyle(
                      fontSize: 12,
                      color: isSelected
                          ? _getCategoryColor(_selectedCategory)
                          : AppColors.textSecondary,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: AppRadius.smBorder,
                    ),
                    side: BorderSide.none,
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: AppSpacing.sm),

          // Array size + speed controls
          Wrap(
            spacing: AppSpacing.md,
            runSpacing: AppSpacing.sm,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Size:',
                    style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  SizedBox(
                    height: 28,
                    child: Row(
                      children: [
                        _MiniIconButton(
                          icon: Icons.remove,
                          onTap: () => _setArraySize(_arraySize - 1),
                        ),
                        Container(
                          width: 32,
                          alignment: Alignment.center,
                          child: Text(
                            '$_arraySize',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        _MiniIconButton(
                          icon: Icons.add,
                          onTap: () => _setArraySize(_arraySize + 1),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              TextButton.icon(
                onPressed: _generateArray,
                icon: const Icon(Icons.shuffle, size: 16),
                label: const Text('Shuffle', style: TextStyle(fontSize: 12)),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.textSecondary,
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                  ),
                  minimumSize: Size.zero,
                ),
              ),
              if (_showComplexity)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: AppSpacing.xs,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.sunken,
                    borderRadius: AppRadius.smBorder,
                  ),
                  child: Text(
                    '$_timeComplexity | $_spaceComplexity',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildVisualization() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_steps.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.play_circle_outline,
              size: 64,
              color: AppColors.textMuted,
            ),
            const SizedBox(height: AppSpacing.md),
            const Text('Press play to start', style: AppTypography.body),
          ],
        ),
      );
    }

    final step = _currentStep;

    if (_isSorting) {
      return _buildSortingViz(step as SortStep?);
    } else {
      return _buildSearchingViz(step as SearchStep?);
    }
  }

  Widget _buildSortingViz(SortStep? step) {
    final arr = step?.array ?? _array;
    final sorted = step?.sorted ?? [];
    final comparing = step?.comparing ?? [];
    final swapping = step?.swapping ?? [];

    final maxVal = arr.reduce((a, b) => a > b ? a : b);

    return Container(
      color: AppColors.card,
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        children: [
          // Legend
          Wrap(
            alignment: WrapAlignment.center,
            spacing: AppSpacing.lg,
            runSpacing: AppSpacing.sm,
            children: [
              _LegendDot(color: AppColors.primary500, label: 'Comparing'),
              _LegendDot(color: AppColors.solarAmber, label: 'Swapping'),
              _LegendDot(color: AppColors.success600, label: 'Sorted'),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),

          // Bars
          Expanded(
            child: LayoutBuilder(
              builder: (context, constraints) {
                const horizontalPaddingPerBar = 4.0;
                final baseBarWidth = _arraySize > 20
                    ? 12.0
                    : (_arraySize > 12 ? 20.0 : 28.0);
                final maxBarWidth =
                    (constraints.maxWidth / arr.length) -
                    horizontalPaddingPerBar;
                final barWidth = max(4.0, min(baseBarWidth, maxBarWidth));

                return Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: List.generate(arr.length, (i) {
                    final height = maxVal > 0 ? (arr[i] / maxVal) * 200 : 10.0;
                    final isSorted = sorted.contains(i);
                    final isComparing = comparing.contains(i);
                    final isSwapping = swapping.contains(i);

                    Color color = AppColors.catSorting.withValues(alpha: 0.5);
                    if (isSorted) {
                      color = AppColors.success600;
                    } else if (isSwapping) {
                      color = AppColors.solarAmber;
                    } else if (isComparing) {
                      color = AppColors.primary500;
                    }

                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 2),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 150),
                        width: barWidth,
                        height: height,
                        decoration: BoxDecoration(
                          color: color,
                          borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(4),
                          ),
                        ),
                        alignment: Alignment.bottomCenter,
                        child: Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: Text(
                            '${arr[i]}',
                            style: TextStyle(
                              fontSize: _arraySize > 15 ? 8 : 10,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    );
                  }),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchingViz(SearchStep? step) {
    final arr = step?.array ?? _array;
    final currentIndex = step?.currentIndex;
    final leftBound = step?.searchRange.left;
    final rightBound = step?.searchRange.right;
    final found = step?.found;

    final maxVal = arr.reduce((a, b) => a > b ? a : b);

    return Container(
      color: AppColors.card,
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        children: [
          // Legend
          Wrap(
            alignment: WrapAlignment.center,
            spacing: AppSpacing.lg,
            runSpacing: AppSpacing.sm,
            children: [
              _LegendDot(color: AppColors.primary500, label: 'Current'),
              _LegendDot(color: AppColors.solarAmber, label: 'Search Range'),
              _LegendDot(color: AppColors.success600, label: 'Found'),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),

          // Search target
          if (step?.target != null) ...[
            Text(
              'Searching for: ${step?.target}',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.catSearching,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
          ],

          // Array cells
          Expanded(
            child: LayoutBuilder(
              builder: (context, constraints) {
                const horizontalPaddingPerCell = 4.0;
                final baseCellWidth = _arraySize > 20
                    ? 14.0
                    : (_arraySize > 12 ? 28.0 : 40.0);
                final maxCellWidth =
                    (constraints.maxWidth / arr.length) -
                    horizontalPaddingPerCell;
                final cellWidth = max(8.0, min(baseCellWidth, maxCellWidth));

                return Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: List.generate(arr.length, (i) {
                    final height = maxVal > 0 ? (arr[i] / maxVal) * 180 : 20.0;
                    final isCurrent = i == currentIndex;
                    final inRange =
                        leftBound != null &&
                        rightBound != null &&
                        i >= leftBound &&
                        i <= rightBound;
                    final isFound = found == true && i == currentIndex;

                    Color color = AppColors.catSearching.withValues(alpha: 0.3);
                    if (isFound) {
                      color = AppColors.success600;
                    } else if (isCurrent) {
                      color = AppColors.primary500;
                    } else if (inRange) {
                      color = AppColors.solarAmber;
                    }

                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 2),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          AnimatedContainer(
                            duration: const Duration(milliseconds: 150),
                            width: cellWidth,
                            height: height,
                            decoration: BoxDecoration(
                              color: color,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              '${arr[i]}',
                              style: TextStyle(
                                fontSize: _arraySize > 15 ? 8 : 11,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          SizedBox(
                            width: cellWidth,
                            child: Text(
                              '$i',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 9,
                                color: isCurrent
                                    ? AppColors.primary500
                                    : AppColors.textMuted,
                                fontWeight: isCurrent ? FontWeight.w700 : null,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPseudocodePanel() {
    if (_pseudocode.isEmpty) {
      return Container(
        color: AppColors.sunken,
        child: const Center(
          child: Text('No pseudocode available', style: AppTypography.caption),
        ),
      );
    }

    return Container(
      color: AppColors.sunken,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Text(
              'Pseudocode',
              style: AppTypography.h3.copyWith(fontSize: 14),
            ),
          ),
          const Divider(height: 1, color: AppColors.sunken),

          // Pseudocode lines
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(AppSpacing.md),
              itemCount: _pseudocode.length,
              itemBuilder: (context, index) {
                final isHighlighted = _currentStep?.line == index + 1;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 100),
                  padding: const EdgeInsets.symmetric(
                    vertical: 2,
                    horizontal: AppSpacing.sm,
                  ),
                  decoration: BoxDecoration(
                    color: isHighlighted
                        ? AppColors.primary100
                        : Colors.transparent,
                    borderRadius: AppRadius.smBorder,
                    border: isHighlighted
                        ? Border.all(color: AppColors.primary300, width: 1)
                        : null,
                  ),
                  child: Text(
                    _pseudocode[index],
                    style: TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 12,
                      height: 1.6,
                      color: isHighlighted
                          ? AppColors.primary900
                          : AppColors.textSecondary,
                      fontWeight: isHighlighted
                          ? FontWeight.w600
                          : FontWeight.w400,
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepInfoBar() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.md,
      ),
      decoration: const BoxDecoration(color: AppColors.sunken),
      child: Row(
        children: [
          Expanded(
            child: Text(
              _currentStep?.operation ?? 'Ready',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: AppColors.textPrimary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Text(
            'Step ${_steps.isEmpty ? 0 : _currentStepIndex + 1} / ${_steps.length}',
            style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
          ),
        ],
      ),
    );
  }

  Widget _buildControls() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        border: const Border(
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
            _ControlButton(
              icon: Icons.replay,
              label: 'Reset',
              onTap: _reset,
              color: AppColors.textSecondary,
            ),
            // Step back
            _ControlButton(
              icon: Icons.skip_previous,
              label: 'Back',
              onTap: _currentStepIndex > 0 ? _stepBack : null,
              color: AppColors.textSecondary,
            ),
            // Play/Pause
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: AppColors.primary500,
                borderRadius: AppRadius.xlBorder,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary500.withValues(alpha: 0.4),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: IconButton(
                icon: Icon(
                  _isPlaying ? Icons.pause : Icons.play_arrow,
                  color: Colors.white,
                  size: 32,
                ),
                onPressed: _steps.isNotEmpty ? _togglePlay : null,
              ),
            ),
            // Step forward
            _ControlButton(
              icon: Icons.skip_next,
              label: 'Next',
              onTap: _currentStepIndex < _steps.length - 1
                  ? _stepForward
                  : null,
              color: AppColors.textSecondary,
            ),
            // Speed
            _ControlButton(
              icon: Icons.speed,
              label: '${_speed}x',
              onTap: _cycleSpeed,
              color: AppColors.primary500,
            ),
          ],
        ),
      ),
    );
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  Color _getCategoryColor(AlgorithmCategory cat) {
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

  List<String> _algorithmsForCategory(AlgorithmCategory cat) {
    switch (cat) {
      case AlgorithmCategory.sorting:
        return _sortingAlgorithms;
      case AlgorithmCategory.searching:
        return _searchingAlgorithms;
      default:
        return [];
    }
  }

  String _algoName(String id) {
    return id
        .split('-')
        .map((w) => w[0].toUpperCase() + w.substring(1))
        .join(' ');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Supporting widgets
// ─────────────────────────────────────────────────────────────────────────────

class _ControlButton extends StatelessWidget {
  const _ControlButton({
    required this.icon,
    required this.label,
    required this.onTap,
    required this.color,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final isEnabled = onTap != null;
    final effectiveColor = isEnabled ? color : AppColors.textMuted;

    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: effectiveColor, size: 24),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: effectiveColor,
            ),
          ),
        ],
      ),
    );
  }
}

class _LegendDot extends StatelessWidget {
  const _LegendDot({required this.color, required this.label});

  final Color color;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
        ),
      ],
    );
  }
}

class _MiniIconButton extends StatelessWidget {
  const _MiniIconButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 28,
        height: 28,
        decoration: BoxDecoration(
          color: AppColors.sunken,
          borderRadius: AppRadius.smBorder,
        ),
        child: Icon(icon, size: 16, color: AppColors.textSecondary),
      ),
    );
  }
}
