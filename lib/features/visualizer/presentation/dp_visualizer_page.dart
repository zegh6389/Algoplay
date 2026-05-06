import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../algorithms/models/dp_step.dart';
import '../../../algorithms/dp/dp_algorithms.dart';

/// ═══════════════════════════════════════════════════════════════════════════════
/// DP Visualizer Page
///
/// Step-by-step visualization of Dynamic Programming algorithms:
/// Fibonacci, Knapsack, LCS, and more.
/// ═══════════════════════════════════════════════════════════════════════════════

class DPVisualizerPage extends ConsumerStatefulWidget {
  const DPVisualizerPage({super.key});

  @override
  ConsumerState<DPVisualizerPage> createState() => _DPVisualizerPageState();
}

class _DPVisualizerPageState extends ConsumerState<DPVisualizerPage>
    with WidgetsBindingObserver {
  // Available DP algorithms
  static const _dpAlgorithms = [
    (id: 'fibonacci', name: 'Fibonacci', description: 'Bottom-up tabulation of fib sequence'),
    (id: 'lcs', name: 'LCS', description: 'Longest Common Subsequence'),
    (id: 'knapsack', name: '0/1 Knapsack', description: 'Classic DP optimization problem'),
  ];

  // State
  String _selectedAlgorithmId = 'fibonacci';
  List<DPStep> _steps = [];
  int _currentStepIndex = 0;
  bool _isPlaying = false;
  double _speed = 1.0;
  Timer? _playTimer;

  // Algorithm-specific input state
  int _fibN = 8;
  String _lcsS1 = 'ABCBDAB';
  String _lcsS2 = 'BDCAB';
  List<int> _knapWeights = [2, 3, 4, 5];
  List<int> _knapValues = [3, 4, 5, 6];
  int _knapCapacity = 8;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadAlgorithm();
  }

  void _loadAlgorithm() {
    _playTimer?.cancel();
    setState(() {
      _steps = [];
      _currentStepIndex = 0;
      _isPlaying = false;
    });
    _collectSteps();
  }

  Stream<DPStep> _createStream() {
    switch (_selectedAlgorithmId) {
      case 'fibonacci':
        return fibonacciDp(_fibN);
      case 'lcs':
        return lcsDp(_lcsS1, _lcsS2);
      case 'knapsack':
        return knapsackDp(_knapWeights, _knapValues, _knapCapacity);
      default:
        return fibonacciDp(_fibN);
    }
  }

  Future<void> _collectSteps() async {
    final stream = _createStream();
    final collected = <DPStep>[];
    await for (final step in stream) {
      collected.add(step);
    }
    if (mounted) {
      setState(() {
        _steps = collected;
      });
    }
  }

  // ── Playback controls ────────────────────────────────────────────────────

  void _togglePlay() {
    if (_steps.isEmpty) return;
    setState(() => _isPlaying = !_isPlaying);
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
        setState(() => _currentStepIndex++);
      } else {
        _playTimer?.cancel();
        setState(() => _isPlaying = false);
      }
    });
  }

  void _stepForward() {
    if (_currentStepIndex < _steps.length - 1) {
      setState(() => _currentStepIndex++);
    }
  }

  void _stepBack() {
    if (_currentStepIndex > 0) {
      setState(() => _currentStepIndex--);
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
    if (_isPlaying) _startPlayTimer();
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

  @override
  Widget build(BuildContext context) {
    final currentStep = _steps.isNotEmpty ? _steps[_currentStepIndex] : null;

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
          'DP Visualizer',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline, color: AppColors.textSecondary),
            onPressed: () => _showInfoSheet(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // ── Algorithm Selector ──
          Container(
            color: AppColors.card,
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.md,
            ),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _dpAlgorithms.map((algo) {
                  final isSelected = algo.id == _selectedAlgorithmId;
                  return Padding(
                    padding: const EdgeInsets.only(right: AppSpacing.sm),
                    child: GestureDetector(
                      onTap: () {
                        setState(() => _selectedAlgorithmId = algo.id);
                        _loadAlgorithm();
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.sm,
                        ),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.catDp.withValues(alpha: 0.15)
                              : AppColors.sunken,
                          borderRadius: AppRadius.smBorder,
                          border: Border.all(
                            color: isSelected
                                ? AppColors.catDp
                                : Colors.transparent,
                            width: 1.5,
                          ),
                        ),
                        child: Text(
                          algo.name,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight:
                                isSelected ? FontWeight.w600 : FontWeight.w500,
                            color: isSelected
                                ? AppColors.catDp
                                : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          const Divider(height: 1, color: AppColors.sunken),

          // ── Input Section (algorithm-specific) ──
          _buildInputSection(),

          // ── Visualization Area ──
          Expanded(
            child: Container(
              color: AppColors.card,
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: _steps.isEmpty
                  ? const Center(child: CircularProgressIndicator())
                  : _buildVisualization(currentStep),
            ),
          ),

          // ── Step Info Bar ──
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
                  currentStep?.operation ?? 'Ready',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Step ${_steps.isEmpty ? 0 : _currentStepIndex + 1} / ${_steps.length}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),

          // ── Controls Bar ──
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
                  _GhostButton(icon: Icons.replay, onTap: _reset),
                  _GhostButton(icon: Icons.skip_previous, onTap: _stepBack),
                  SizedBox(
                    width: 56,
                    height: 56,
                    child: FloatingActionButton(
                      onPressed: _togglePlay,
                      backgroundColor: AppColors.catDp,
                      child: Icon(
                        _isPlaying ? Icons.pause : Icons.play_arrow,
                        color: AppColors.textInverse,
                        size: 28,
                      ),
                    ),
                  ),
                  _GhostButton(icon: Icons.skip_next, onTap: _stepForward),
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

  Widget _buildInputSection() {
    return Container(
      color: AppColors.card,
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Input',
            style: AppTypography.caption.copyWith(
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          if (_selectedAlgorithmId == 'fibonacci')
            _buildFibonacciInput()
          else if (_selectedAlgorithmId == 'lcs')
            _buildLcsInput()
          else if (_selectedAlgorithmId == 'knapsack')
            _buildKnapsackInput(),
        ],
      ),
    );
  }

  Widget _buildFibonacciInput() {
    return Row(
      children: [
        const Text('n = ', style: TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        )),
        const SizedBox(width: AppSpacing.sm),
        Container(
          width: 60,
          decoration: BoxDecoration(
            color: AppColors.sunken,
            borderRadius: AppRadius.smBorder,
          ),
          child: TextField(
            controller: TextEditingController(text: '$_fibN'),
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
            decoration: const InputDecoration(
              border: InputBorder.none,
              contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            ),
            onSubmitted: (val) {
              final n = int.tryParse(val);
              if (n != null && n > 0 && n <= 20) {
                setState(() => _fibN = n);
                _loadAlgorithm();
              }
            },
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Text(
          'Compute fib($_fibN)',
          style: AppTypography.caption,
        ),
        const Spacer(),
        ElevatedButton(
          onPressed: () => _loadAlgorithm(),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.catDp,
            foregroundColor: AppColors.textInverse,
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            shape: RoundedRectangleBorder(
              borderRadius: AppRadius.smBorder,
            ),
          ),
          child: const Text('Run'),
        ),
      ],
    );
  }

  Widget _buildLcsInput() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Text('String 1: ', style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            )),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.sunken,
                  borderRadius: AppRadius.smBorder,
                ),
                child: TextField(
                  controller: TextEditingController(text: _lcsS1),
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                  ),
                  onSubmitted: (val) {
                    if (val.isNotEmpty) {
                      setState(() => _lcsS1 = val.toUpperCase());
                      _loadAlgorithm();
                    }
                  },
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        Row(
          children: [
            const Text('String 2: ', style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            )),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.sunken,
                  borderRadius: AppRadius.smBorder,
                ),
                child: TextField(
                  controller: TextEditingController(text: _lcsS2),
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                  ),
                  onSubmitted: (val) {
                    if (val.isNotEmpty) {
                      setState(() => _lcsS2 = val.toUpperCase());
                      _loadAlgorithm();
                    }
                  },
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            ElevatedButton(
              onPressed: () => _loadAlgorithm(),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.catDp,
                foregroundColor: AppColors.textInverse,
                elevation: 0,
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                shape: RoundedRectangleBorder(
                  borderRadius: AppRadius.smBorder,
                ),
              ),
              child: const Text('Run'),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildKnapsackInput() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text('Weights: ${_knapWeights.join(", ")}',
                style: AppTypography.caption),
            const Spacer(),
            Text('Values: ${_knapValues.join(", ")}',
                style: AppTypography.caption),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        Row(
          children: [
            Text('Capacity: $_knapCapacity',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                )),
            const Spacer(),
            ElevatedButton(
              onPressed: () => _loadAlgorithm(),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.catDp,
                foregroundColor: AppColors.textInverse,
                elevation: 0,
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                shape: RoundedRectangleBorder(
                  borderRadius: AppRadius.smBorder,
                ),
              ),
              child: const Text('Run'),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildVisualization(DPStep? step) {
    if (step == null) return const SizedBox.shrink();

    if (_selectedAlgorithmId == 'fibonacci') {
      return _buildFibonacciVisualization(step);
    } else if (_selectedAlgorithmId == 'lcs') {
      return _buildLcsVisualization(step);
    } else {
      return _buildKnapsackVisualization(step);
    }
  }

  Widget _buildFibonacciVisualization(DPStep step) {
    final array = step.array;
    final memo = step.memo;
    final maxN = array.length - 1;
    final maxVal = array.isNotEmpty ? array.reduce(max) : 1;

    return Column(
      children: [
        // ── Memo table ──
        Expanded(
          child: Row(
            children: [
              // Call stack / info
              Expanded(
                flex: 2,
                child: Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.sunken,
                    borderRadius: AppRadius.mdBorder,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Call Stack',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      if (step.callStack != null)
                        Wrap(
                          spacing: AppSpacing.xs,
                          runSpacing: AppSpacing.xs,
                          children: step.callStack!.map((v) {
                            return Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.sm,
                                vertical: AppSpacing.xs,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.catDp.withValues(alpha: 0.2),
                                borderRadius: AppRadius.smBorder,
                              ),
                              child: Text(
                                'fib($v)',
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.catDp,
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      const SizedBox(height: AppSpacing.lg),
                      const Text(
                        'Memo Table',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Expanded(
                        child: SingleChildScrollView(
                          child: Wrap(
                            spacing: AppSpacing.xs,
                            runSpacing: AppSpacing.xs,
                            children: List.generate(maxN + 1, (i) {
                              final val = memo['$i'] ?? 0;
                              final isComputed = val > 0 || i <= 1;
                              return Container(
                                width: 48,
                                padding: const EdgeInsets.symmetric(
                                  vertical: AppSpacing.xs,
                                ),
                                decoration: BoxDecoration(
                                  color: isComputed
                                      ? AppColors.catDp.withValues(alpha: 0.15)
                                      : AppColors.sunken,
                                  borderRadius: AppRadius.smBorder,
                                  border: Border.all(
                                    color: step.currentIndex == i
                                        ? AppColors.catDp
                                        : Colors.transparent,
                                    width: 2,
                                  ),
                                ),
                                child: Column(
                                  children: [
                                    Text(
                                      'fib($i)',
                                      style: const TextStyle(
                                        fontSize: 9,
                                        fontWeight: FontWeight.w500,
                                        color: AppColors.textMuted,
                                      ),
                                    ),
                                    Text(
                                      '$val',
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                        color: isComputed
                                            ? AppColors.catDp
                                            : AppColors.textMuted,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              // Bar chart of computed values
              Expanded(
                flex: 3,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'DP Table (Bottom-Up)',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Expanded(
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: List.generate(array.length, (i) {
                          final val = array[i];
                          final barHeight = maxVal > 0
                              ? (val / maxVal) * 200
                              : 0.0;
                          final isHighlighted = step.comparing.contains(i) ||
                              step.currentIndex == i;

                          return Expanded(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 2),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  Text(
                                    '$val',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: isHighlighted
                                          ? AppColors.catDp
                                          : AppColors.textMuted,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    height: barHeight.clamp(4.0, 200.0),
                                    decoration: BoxDecoration(
                                      color: isHighlighted
                                          ? AppColors.catDp
                                          : AppColors.catDp.withValues(alpha: 0.3),
                                      borderRadius: const BorderRadius.vertical(
                                        top: Radius.circular(3),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'fib($i)',
                                    style: const TextStyle(
                                      fontSize: 9,
                                      color: AppColors.textMuted,
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
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildLcsVisualization(DPStep step) {
    // Build grid from memo
    final memo = step.memo;
    final s1Len = _lcsS1.length;
    final s2Len = _lcsS2.length;

    // Extract grid rows
    final gridRows = <List<int>>[];
    for (var i = 0; i <= s1Len; i++) {
      final row = <int>[];
      for (var j = 0; j <= s2Len; j++) {
        row.add(memo['$i,$j'] ?? 0);
      }
      gridRows.add(row);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // String labels
        Row(
          children: [
            const SizedBox(width: 40), // offset for row labels
            ..._lcsS2.split('').map((c) => Expanded(
              child: Center(
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: AppColors.catDp.withValues(alpha: 0.15),
                    borderRadius: AppRadius.smBorder,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    c,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.catDp,
                    ),
                  ),
                ),
              ),
            )),
          ],
        ),
        const SizedBox(height: AppSpacing.xs),
        // Grid
        Expanded(
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header row (S2 chars)
                // Data rows
                ...List.generate(s1Len + 1, (i) {
                  return Row(
                    children: [
                      // Row label (S1 char)
                      if (i == 0)
                        const SizedBox(width: 40)
                      else
                        Container(
                          width: 40,
                          height: 36,
                          decoration: BoxDecoration(
                            color: AppColors.catDp.withValues(alpha: 0.15),
                            borderRadius: AppRadius.smBorder,
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            _lcsS1[i - 1],
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppColors.catDp,
                            ),
                          ),
                        ),
                      // Grid cells
                      ...List.generate(s2Len + 1, (j) {
                        final val = gridRows[i][j];
                        final isCurrent = step.currentIndex == i * (s2Len + 1) + j;
                        return Container(
                          width: 36,
                          height: 36,
                          margin: const EdgeInsets.all(1),
                          decoration: BoxDecoration(
                            color: isCurrent
                                ? AppColors.catDp
                                : val > 0
                                    ? AppColors.catDp.withValues(alpha: 0.15)
                                    : AppColors.sunken,
                            borderRadius: AppRadius.smBorder,
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            '$val',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: isCurrent
                                  ? AppColors.textInverse
                                  : AppColors.textPrimary,
                            ),
                          ),
                        );
                      }),
                    ],
                  );
                }),
              ],
            ),
          ),
        ),
        if (step.result != null) ...[
          const SizedBox(height: AppSpacing.md),
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.catDp.withValues(alpha: 0.1),
              borderRadius: AppRadius.mdBorder,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.check_circle, color: AppColors.catDp, size: 20),
                const SizedBox(width: AppSpacing.sm),
                Text(
                  'LCS = ${step.result}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.catDp,
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildKnapsackVisualization(DPStep step) {
    final n = _knapWeights.length;
    final capacity = _knapCapacity;
    final memo = step.memo;

    // Extract DP table
    final dpTable = <List<int>>[];
    for (var i = 0; i <= n; i++) {
      final row = <int>[];
      for (var w = 0; w <= capacity; w++) {
        row.add(memo['$i,$w'] ?? 0);
      }
      dpTable.add(row);
    }

    return Column(
      children: [
        // Item info
        Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.sunken,
                  borderRadius: AppRadius.smBorder,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: List.generate(n, (i) {
                    return Column(
                      children: [
                        Text(
                          'Item ${i + 1}',
                          style: const TextStyle(
                            fontSize: 10,
                            color: AppColors.textMuted,
                          ),
                        ),
                        Text(
                          'wt=${_knapWeights[i]}, val=${_knapValues[i]}',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.catDp,
                          ),
                        ),
                      ],
                    );
                  }),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        // DP Table
        Expanded(
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header row (weights)
                Row(
                  children: [
                    Container(
                      width: 48,
                      height: 32,
                      alignment: Alignment.center,
                      child: const Text(
                        'Items',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ),
                    ...List.generate(capacity + 1, (w) {
                      return Container(
                        width: 44,
                        height: 32,
                        margin: const EdgeInsets.all(1),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: AppColors.catDp.withValues(alpha: 0.1),
                          borderRadius: AppRadius.smBorder,
                        ),
                        child: Text(
                          'w=$w',
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: AppColors.catDp,
                          ),
                        ),
                      );
                    }),
                  ],
                ),
                // Data rows
                ...List.generate(n + 1, (i) {
                  return Row(
                    children: [
                      Container(
                        width: 48,
                        height: 44,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: i == 0
                              ? AppColors.sunken
                              : AppColors.catDp.withValues(alpha: 0.1),
                          borderRadius: AppRadius.smBorder,
                        ),
                        child: Text(
                          i == 0 ? '—' : 'Item $i',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: i == 0
                                ? AppColors.textMuted
                                : AppColors.catDp,
                          ),
                        ),
                      ),
                      ...List.generate(capacity + 1, (w) {
                        final val = dpTable[i][w];
                        final isCurrent = step.currentIndex == i * (capacity + 1) + w;
                        return Container(
                          width: 44,
                          height: 44,
                          margin: const EdgeInsets.all(1),
                          decoration: BoxDecoration(
                            color: isCurrent
                                ? AppColors.catDp
                                : val > 0
                                    ? AppColors.catDp.withValues(alpha: 0.15)
                                    : AppColors.sunken,
                            borderRadius: AppRadius.smBorder,
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            '$val',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: isCurrent
                                  ? AppColors.textInverse
                                  : AppColors.textPrimary,
                            ),
                          ),
                        );
                      }),
                    ],
                  );
                }),
              ],
            ),
          ),
        ),
        if (step.result != null) ...[
          const SizedBox(height: AppSpacing.md),
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.catDp.withValues(alpha: 0.1),
              borderRadius: AppRadius.mdBorder,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.check_circle, color: AppColors.catDp, size: 20),
                const SizedBox(width: AppSpacing.sm),
                Text(
                  'Max Value = ${step.result}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.catDp,
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  void _showInfoSheet(BuildContext context) {
    final algo = _dpAlgorithms.firstWhere((a) => a.id == _selectedAlgorithmId);

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
              Text(algo.name, style: AppTypography.h2),
              const SizedBox(height: AppSpacing.sm),
              Text(algo.description, style: AppTypography.caption),
              const SizedBox(height: AppSpacing.lg),
              _infoRow('Time Complexity', 'O(n²) or O(mn)'),
              const SizedBox(height: AppSpacing.sm),
              _infoRow('Space Complexity', 'O(n) or O(mn)'),
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

/// Ghost-style icon button for the controls bar.
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
