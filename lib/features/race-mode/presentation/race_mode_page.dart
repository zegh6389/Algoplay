import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../algorithms/sorting/sorting_algorithms.dart';
import '../../../../features/stats/data/stats_repository.dart';
import '../../../../shared/providers/app_providers.dart';
import '../../../../shared/services/game_result_recorder.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Race Mode — timed sorting challenge.
///
/// The player is given an unsorted array and must manually perform
/// swaps by tapping/swapping elements in the correct order against the clock.
/// The faster and more accurate they are, the higher their score.
/// ═══════════════════════════════════════════════════════════════════════════════

class RaceModePage extends ConsumerStatefulWidget {
  const RaceModePage({super.key});

  @override
  ConsumerState<RaceModePage> createState() => _RaceModePageState();
}

class _RaceModePageState extends ConsumerState<RaceModePage> {
  // ── Game state ──────────────────────────────────────────────────────────
  late List<int> _array;
  late List<int> _solution; // target sorted array
  int _score = 0;
  int _lives = 3;
  int _round = 1;
  int _totalRounds = 8;
  bool _isGameOver = false;
  bool _isRunning = false;
  int _secondsRemaining = 60;
  Timer? _countdownTimer;
  Timer? _gameTimer;

  // For tracking player's swaps
  int _swapCount = 0;
  int _penaltySeconds = 0;

  // Selected elements for swap
  int? _firstSelectedIndex;
  int? _secondSelectedIndex;

  // Correct position tracking
  List<bool> _isElementCorrect = [];

  // Feedback
  bool _showCorrectFlash = false;
  bool _showWrongFlash = false;

  // Difficulty
  int _arraySize = 5;
  int _timeAllowed = 60;

  @override
  void initState() {
    super.initState();
    _startGame();
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _gameTimer?.cancel();
    super.dispose();
  }

  void _startGame() {
    _countdownTimer?.cancel();
    _gameTimer?.cancel();
    setState(() {
      _score = 0;
      _lives = 3;
      _round = 1;
      _isGameOver = false;
      _isRunning = true;
      _secondsRemaining = _timeAllowed;
      _swapCount = 0;
      _penaltySeconds = 0;
      _firstSelectedIndex = null;
      _secondSelectedIndex = null;
    });

    _generateRound();

    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      setState(() {
        if (_secondsRemaining > 0) {
          _secondsRemaining--;
        } else {
          timer.cancel();
          _endGame();
        }
      });
    });
  }

  void _generateRound() {
    // Scale difficulty with rounds
    _arraySize = 5 + ((_round - 1) ~/ 3);
    if (_arraySize > 10) _arraySize = 10;

    _array = generateRandomArray(_arraySize, max: 99);
    _solution = List<int>.from(_array)..sort();

    // Track which elements are in correct position
    _isElementCorrect = List.generate(_array.length, (i) => _array[i] == _solution[i]);

    _swapCount = 0;
    _firstSelectedIndex = null;
    _secondSelectedIndex = null;
  }

  void _handleElementTap(int index) {
    if (!_isRunning) return;

    setState(() {
      if (_firstSelectedIndex == null) {
        _firstSelectedIndex = index;
      } else if (_secondSelectedIndex == null) {
        if (_firstSelectedIndex == index) {
          _firstSelectedIndex = null;
          return;
        }

        _secondSelectedIndex = index;
        _performSwap();
      } else {
        // Reset and start new selection
        _firstSelectedIndex = index;
        _secondSelectedIndex = null;
      }
    });
  }

  void _performSwap() {
    final i = _firstSelectedIndex!;
    final j = _secondSelectedIndex!;

    // Check if this swap moves either element closer to or into its correct position
    final wasCorrectI = _isElementCorrect[i];
    final wasCorrectJ = _isElementCorrect[j];

    // Simulate the swap
    final newArray = List<int>.from(_array);
    final temp = newArray[i];
    newArray[i] = newArray[j];
    newArray[j] = temp;

    // Update correct positions
    final newCorrect = List<bool>.from(_isElementCorrect);
    newCorrect[i] = newArray[i] == _solution[i];
    newCorrect[j] = newArray[j] == _solution[j];

    final becameCorrect = (!wasCorrectI && newCorrect[i]) || (!wasCorrectJ && newCorrect[j]);
    final wasWrongSwap = wasCorrectI || wasCorrectJ; // swapped something that was in correct position

    setState(() {
      _array = newArray;
      _isElementCorrect = newCorrect;
      _swapCount++;
      _firstSelectedIndex = null;
      _secondSelectedIndex = null;
    });

    if (wasWrongSwap) {
      // Penalty: swapped something that was already correct
      _applyPenalty();
    } else if (becameCorrect) {
      // Reward: this swap helped
      _applyReward();
    } else {
      // Neutral: no immediate gain but not harmful
      _applyNeutral();
    }

    _checkRoundComplete();
  }

  void _applyPenalty() {
    setState(() {
      _lives--;
      _showWrongFlash = true;
    });
    Future.delayed(const Duration(milliseconds: 300), () {
      if (mounted) setState(() => _showWrongFlash = false);
    });

    if (_lives <= 0) {
      Future.delayed(const Duration(milliseconds: 800), () {
        if (mounted) _endGame();
      });
    }
  }

  void _applyReward() {
    setState(() {
      _score += 20;
      _showCorrectFlash = true;
    });
    Future.delayed(const Duration(milliseconds: 300), () {
      if (mounted) setState(() => _showCorrectFlash = false);
    });
  }

  void _applyNeutral() {
    // Small time penalty for unhelpful swaps
    setState(() {
      _secondsRemaining = (_secondsRemaining - 2).clamp(0, 999);
      _penaltySeconds += 2;
    });
  }

  void _checkRoundComplete() {
    // Check if array is sorted
    bool sorted = true;
    for (int i = 0; i < _array.length - 1; i++) {
      if (_array[i] > _array[i + 1]) {
        sorted = false;
        break;
      }
    }

    if (sorted) {
      // Award time bonus
      final timeBonus = _secondsRemaining * 2;
      setState(() {
        _score += timeBonus;
      });

      Future.delayed(const Duration(milliseconds: 500), () {
        if (!mounted) return;
        if (_round >= _totalRounds) {
          _endGame();
        } else {
          setState(() => _round++);
          _generateRound();
        }
      });
    }
  }

  void _endGame() {
    _countdownTimer?.cancel();
    setState(() {
      _isRunning = false;
      _isGameOver = true;
    });
    GameResultRecorder.record(
      ref,
      GameResult(
        game: GameId.raceMode,
        won: true,
        score: _score,
        xpReward: _score ~/ 10,
        activityMinutes: 3,
        category: 'race-mode',
      ),
    );
  }

  void _exitGame() {
    context.pop();
  }

  void _restartGame() {
    _startGame();
  }

  // ── Build ───────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        backgroundColor: AppColors.card,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: AppColors.textPrimary),
          onPressed: _exitGame,
        ),
        title: const Text(
          'Race Mode',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
        actions: [
          if (_isRunning)
            Container(
              margin: const EdgeInsets.only(right: AppSpacing.lg),
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
              decoration: BoxDecoration(
                color: _secondsRemaining <= 10
                    ? AppColors.error100
                    : AppColors.success100,
                borderRadius: AppRadius.smBorder,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.timer,
                    size: 16,
                    color: _secondsRemaining <= 10
                        ? AppColors.error600
                        : AppColors.success600,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${(_secondsRemaining ~/ 60).toString().padLeft(1, '0')}:${(_secondsRemaining % 60).toString().padLeft(2, '0')}',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: _secondsRemaining <= 10
                          ? AppColors.error600
                          : AppColors.success600,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
      body: _isGameOver ? _buildGameOver() : _buildGameplay(),
    );
  }

  Widget _buildGameplay() {
    return SafeArea(
      child: Column(
        children: [
          // ── HUD ──
          _buildHUD(),

          // ── Instructions ──
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.sm,
            ),
            color: AppColors.sunken,
            child: Text(
              _firstSelectedIndex == null
                  ? 'Tap two elements to swap them'
                  : _secondSelectedIndex == null
                      ? 'Now tap the second element'
                      : 'Swapping...',
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
          ),

          // ── Array visualization ──
          Expanded(
            child: _buildArrayVisualization(),
          ),

          // ── Round progress ──
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            color: AppColors.card,
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Round $_round/$_totalRounds',
                        style: AppTypography.caption),
                    Text('Swaps: $_swapCount',
                        style: AppTypography.caption),
                    Text('Lives: $_lives',
                        style: AppTypography.caption.copyWith(
                          color: _lives <= 1
                              ? AppColors.error600
                              : AppColors.textSecondary,
                        )),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                ClipRRect(
                  borderRadius: AppRadius.fullBorder,
                  child: LinearProgressIndicator(
                    value: (_round - 1) / _totalRounds,
                    backgroundColor: AppColors.sunken,
                    valueColor: const AlwaysStoppedAnimation(AppColors.catSorting),
                    minHeight: 6,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHUD() {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.md,
      ),
      color: AppColors.card,
      child: Row(
        children: [
          // Score
          _RaceChip(
            icon: Icons.star,
            label: '$_score',
            color: AppColors.solarGold,
          ),
          const Spacer(),
          // Round
          Text(
            'Round $_round/$_totalRounds',
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
          const Spacer(),
          // Lives
          Row(
            children: List.generate(3, (i) {
              final isLost = i >= _lives;
              return Icon(
                isLost ? Icons.favorite_border : Icons.favorite,
                color: isLost ? AppColors.textMuted : AppColors.error600,
                size: 22,
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildArrayVisualization() {
    return Container(
      color: _showWrongFlash
          ? AppColors.error100.withValues(alpha: 0.3)
          : _showCorrectFlash
              ? AppColors.success100.withValues(alpha: 0.3)
              : AppColors.canvas,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: List.generate(_array.length, (index) {
              final value = _array[index];
              final isSorted = _isElementCorrect[index];
              final isFirst = _firstSelectedIndex == index;
              final isSecond = _secondSelectedIndex == index;
              final maxVal = _array.reduce((a, b) => a > b ? a : b);
              final height = maxVal > 0 ? (value / maxVal) * 200 : 20.0;

              Color barColor = isSorted
                  ? AppColors.success600
                  : AppColors.catSorting;

              if (isFirst || isSecond) {
                barColor = AppColors.primary500;
              }

              return GestureDetector(
                onTap: () => _handleElementTap(index),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      // Value label above bar
                      Text(
                        '$value',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: isFirst || isSecond
                              ? AppColors.primary500
                              : isSorted
                                  ? AppColors.success600
                                  : AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: 48,
                        height: height,
                        decoration: BoxDecoration(
                          color: barColor,
                          borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(8),
                          ),
                          border: isFirst || isSecond
                              ? Border.all(
                                  color: AppColors.primary300, width: 2)
                              : null,
                          boxShadow: (isFirst || isSecond)
                              ? [
                                  BoxShadow(
                                    color: AppColors.primary500.withValues(alpha: 0.4),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  ),
                                ]
                              : null,
                        ),
                      ),
                      const SizedBox(height: 6),
                      // Index label
                      Text(
                        '${index + 1}',
                        style: TextStyle(
                          fontSize: 11,
                          color: isFirst || isSecond
                              ? AppColors.primary500
                              : AppColors.textMuted,
                          fontWeight:
                              isFirst || isSecond ? FontWeight.w700 : null,
                        ),
                      ),
                      // Checkmark if correct
                      if (isSorted) ...[
                        const SizedBox(height: 2),
                        const Icon(
                          Icons.check_circle,
                          color: AppColors.success600,
                          size: 14,
                        ),
                      ],
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }

  Widget _buildGameOver() {
    return Container(
      color: AppColors.card,
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.timer_off_outlined,
                size: 80,
                color: AppColors.textMuted,
              ),
              const SizedBox(height: AppSpacing.lg),
              const Text('Time\'s Up!', style: AppTypography.h1),
              const SizedBox(height: AppSpacing.sm),
              Text(
                'You completed $_round rounds',
                style: AppTypography.body
                    .copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: AppSpacing.xl),

              // Score card
              Container(
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  color: AppColors.canvas,
                  borderRadius: AppRadius.lgBorder,
                ),
                child: Column(
                  children: [
                    _ResultRow(label: 'Final Score', value: '$_score'),
                    const Divider(height: AppSpacing.xl),
                    _ResultRow(label: 'Rounds Completed', value: '${_round - 1}'),
                    const SizedBox(height: AppSpacing.md),
                    _ResultRow(label: 'Total Swaps', value: '$_swapCount'),
                    const SizedBox(height: AppSpacing.md),
                    _ResultRow(
                      label: 'Time Penalties',
                      value: '${_penaltySeconds}s',
                    ),
                    const Divider(height: AppSpacing.xl),
                    _ResultRow(
                      label: 'XP Earned',
                      value: '+${(_score * 0.1).round()}',
                      valueColor: AppColors.solarGold,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.xl),

              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _exitGame,
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(0, 48),
                      ),
                      child: const Text('Exit'),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _restartGame,
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size(0, 48),
                      ),
                      child: const Text('Play Again'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Supporting widgets
// ─────────────────────────────────────────────────────────────────────────────

class _RaceChip extends StatelessWidget {
  const _RaceChip({
    required this.icon,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: AppRadius.smBorder,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: AppSpacing.xs),
          Text(
            label,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

class _ResultRow extends StatelessWidget {
  const _ResultRow({
    required this.label,
    required this.value,
    this.valueColor,
  });

  final String label;
  final String value;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: AppTypography.caption),
        Text(
          value,
          style: AppTypography.bodyBold.copyWith(
            color: valueColor,
          ),
        ),
      ],
    );
  }
}
