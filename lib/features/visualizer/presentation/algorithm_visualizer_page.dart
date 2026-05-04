import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../algorithms/models/algorithm_models.dart';
import '../../../algorithms/sorting/sorting_algorithms.dart';
import '../../../algorithms/searching/searching_algorithms.dart';
import '../../learn/data/algorithm_data.dart';

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
    extends ConsumerState<AlgorithmVisualizerPage> {
  // ── State ────────────────────────────────────────────────────────────────
  List<dynamic> _steps = [];
  int _currentStepIndex = 0;
  bool _isPlaying = false;
  double _speed = 1.0; // 1x, 2x, 4x
  Timer? _playTimer;
  AlgorithmInfo? _algorithmInfo;
  List<String> _pseudocode = [];

  // Sample data for the algorithm
  late List<int> _sampleArray;

  @override
  void initState() {
    super.initState();
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
  }

  List<int> _generateSampleArray() {
    if (_algorithmInfo?.category == AlgorithmCategory.searching) {
      // Sorted array for searching algorithms
      return [3, 7, 11, 15, 22, 28, 35, 42, 56, 68];
    }
    // Random-ish array for sorting
    return [64, 34, 25, 12, 22, 11, 90, 45, 78, 33];
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

  Future<void> _collectSteps() async {
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
      // Searching algorithms
      case 'linear-search':
        stream = linearSearch(
          _sampleArray,
          _sampleArray[4], // search for 5th element
        );
        break;
      case 'binary-search':
        stream = binarySearch(
          _sampleArray,
          _sampleArray[3], // search for 4th element (15)
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

  @override
  void dispose() {
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

  bool get _isSorting =>
      _algorithmInfo?.category == AlgorithmCategory.sorting;

  // ── Build ────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final algorithmName = _algorithmInfo?.name ?? widget.algorithmId;
    final currentStep =
        _steps.isNotEmpty ? _steps[_currentStepIndex] : null;

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
          IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: () => _showAlgorithmInfoSheet(context),
          ),
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () {
              // Share placeholder
            },
          ),
        ],
      ),
      body: Column(
        children: [
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
                  : _isSorting
                      ? _buildSortingVisualization(currentStep as SortStep?)
                      : _buildSearchingVisualization(currentStep as SearchStep?),
            ),
          ),

          // ── Step Info Bar ──────────────────────────────────────────────
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.md,
            ),
            decoration: const BoxDecoration(
              color: AppColors.sunken,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  currentStep is SortStep
                      ? currentStep.operation
                      : currentStep is SearchStep
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
                  _GhostButton(
                    icon: Icons.replay,
                    onTap: _reset,
                  ),
                  // Step Back
                  _GhostButton(
                    icon: Icons.skip_previous,
                    onTap: _stepBack,
                  ),
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
                  _GhostButton(
                    icon: Icons.skip_next,
                    onTap: _stepForward,
                  ),
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

  // ── Sorting visualization (vertical bars) ─────────────────────────────

  Widget _buildSortingVisualization(SortStep? step) {
    if (step == null) return const SizedBox.shrink();

    final array = step.array;
    final maxValue = array.reduce((a, b) => a > b ? a : b);

    return LayoutBuilder(
      builder: (context, constraints) {
        final availableWidth = constraints.maxWidth;
        final availableHeight = constraints.maxHeight - 32; // space for value labels
        final barWidth = (availableWidth - (array.length - 1) * 2) / array.length;

        return Column(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            // Bars
            SizedBox(
              height: availableHeight,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: List.generate(array.length, (i) {
                  final barHeight = (array[i] / maxValue) * availableHeight;
                  final isComparing = step.comparing.contains(i);
                  final isSwapping = step.swapping.contains(i);
                  final isSorted = step.sorted.contains(i);
                  final isPivot = step.pivot == i;

                  Color barColor;
                  if (isSorted || isSwapping) {
                    barColor = AppColors.success600;
                  } else if (isPivot) {
                    barColor = AppColors.secondary500;
                  } else if (isComparing) {
                    barColor = _categoryColor;
                  } else {
                    barColor = _categoryColor.withValues(alpha: 0.4);
                  }

                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 1),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            height: barHeight.clamp(4.0, availableHeight),
                            decoration: BoxDecoration(
                              color: barColor,
                              borderRadius: const BorderRadius.vertical(
                                top: Radius.circular(3),
                              ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${array[i]}',
                            style: TextStyle(
                              fontSize: barWidth > 30 ? 11 : 9,
                              fontWeight: FontWeight.w600,
                              color: isComparing || isSwapping || isSorted
                                  ? AppColors.textPrimary
                                  : AppColors.textMuted,
                            ),
                          ),
                        ],
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

  // ── Searching visualization (horizontal cells) ────────────────────────

  Widget _buildSearchingVisualization(SearchStep? step) {
    if (step == null) return const SizedBox.shrink();

    final array = step.array;
    final comparing = step.comparing;
    final eliminated = step.eliminated;
    final found = step.found;

    return LayoutBuilder(
      builder: (context, constraints) {
        final availableWidth = constraints.maxWidth;
        final cellWidth = (availableWidth - (array.length - 1) * 4) / array.length;

        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Target indicator
            if (step.target != 0)
              Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.md),
                child: Text(
                  'Target: ${step.target}',
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
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

                Color bgColor;
                Color textColor;
                if (isFound) {
                  bgColor = AppColors.primary500;
                  textColor = AppColors.textInverse;
                } else if (isComparing) {
                  bgColor = AppColors.primary500;
                  textColor = AppColors.textInverse;
                } else if (isEliminated) {
                  bgColor = AppColors.sunken;
                  textColor = AppColors.textMuted;
                } else {
                  bgColor = AppColors.primary100;
                  textColor = AppColors.textPrimary;
                }

                return AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: cellWidth.clamp(28.0, 60.0),
                  height: 48,
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  decoration: BoxDecoration(
                    color: bgColor,
                    borderRadius: AppRadius.smBorder,
                  ),
                  alignment: Alignment.center,
                  child: FittedBox(
                    child: Text(
                      '${array[i]}',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: textColor,
                      ),
                    ),
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
                    child: Text(
                      '$i',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 10,
                        color: AppColors.textMuted,
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

  // ── Algorithm Info Bottom Sheet ────────────────────────────────────────

  void _showAlgorithmInfoSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(AppRadius.lg),
        ),
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
              _infoRow('Time Complexity', _algorithmInfo?.timeComplexity ?? '—'),
              const SizedBox(height: AppSpacing.sm),

              // Space Complexity
              _infoRow('Space Complexity', _algorithmInfo?.spaceComplexity ?? '—'),
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

// ═══════════════════════════════════════════════════════════════════════════════
/// Ghost-style icon button used in the controls bar.
// ═══════════════════════════════════════════════════════════════════════════════

class _GhostButton extends StatelessWidget {
  final IconData icon;
  final String? label;
  final VoidCallback onTap;

  const _GhostButton({
    required this.icon,
    this.label,
    required this.onTap,
  });

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
