import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/services/ad_service.dart';
import '../../../core/services/premium_service.dart';
import '../../../algorithms/models/algorithm_models.dart';
import '../../../algorithms/sorting/sorting_algorithms.dart';
import '../../../algorithms/searching/searching_algorithms.dart';
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

class _AlgorithmVisualizerPageState extends ConsumerState<AlgorithmVisualizerPage>
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

  bool get _isSorting =>
      _algorithmInfo?.category == AlgorithmCategory.sorting;

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
      showTarget: !_isSorting,
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
          // Edit array button
          IconButton(
            icon: const Icon(Icons.edit_note),
            tooltip: 'Edit Array',
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
    final maxValue = array.isEmpty ? 1.0 : array.reduce((a, b) => a > b ? a : b).toDouble();

    // Convert SortStep to SortBarData list
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
      return SortBarData(value: array[i], state: state);
    });

    return AnimatedSortBar(
      bars: bars,
      maxValue: maxValue,
    );
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
        final cellWidth = (availableWidth - (array.length - 1) * 4) / array.length;

        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Target badge
            if (step.target != 0)
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
                    const Icon(Icons.search, color: AppColors.secondary500, size: 18),
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
                  right: availableWidth - (searchRange.right + 1) * (cellWidth + 4),
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
                final inRange = i >= searchRange.left &&
                    i <= searchRange.right;

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
                    child: Text(
                      '[$i]',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 9,
                        color: AppColors.textMuted.withValues(alpha: 0.6),
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
            : null;
    return CodeViewer(
      code: code,
      currentLine: currentLine,
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
