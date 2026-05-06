import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../algorithms/sorting/sorting_algorithms.dart';
import '../../../../shared/providers/app_providers.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// The Sorter — sorting-algorithm challenge game.
///
/// The player is shown an unsorted array and must correctly identify
/// the next swap or comparison step from 4 multiple-choice options.
/// Score increases with each correct answer; lives deplete on mistakes.
/// ═══════════════════════════════════════════════════════════════════════════════

class TheSorterPage extends ConsumerStatefulWidget {
  const TheSorterPage({super.key});

  @override
  ConsumerState<TheSorterPage> createState() => _TheSorterPageState();
}

class _TheSorterPageState extends ConsumerState<TheSorterPage> {
  // ── Game state ──────────────────────────────────────────────────────────
  late List<int> _array;
  int _score = 0;
  int _lives = 3;
  int _round = 1;
  int _totalRounds = 10;
  bool _isGameOver = false;
  bool _isRoundActive = true;
  bool _isPaused = false;

  // Current step being evaluated
  List<int> _comparingIndices = [];
  List<int> _swappingIndices = [];
  String _currentHint = '';
  int _correctAnswerIndex = -1;
  List<_SortChoice> _choices = [];

  // Animation state
  bool _showCorrectFeedback = false;
  bool _showWrongFeedback = false;

  // Speed settings
  double _gameSpeed = 1.0;
  Timer? _gameTimer;

  // Sort algorithm to use for this round
  String _currentAlgorithm = 'bubble-sort';

  static const _algorithms = [
    'bubble-sort',
    'selection-sort',
    'insertion-sort',
  ];

  @override
  void initState() {
    super.initState();
    _startNewRound();
  }

  @override
  void dispose() {
    _gameTimer?.cancel();
    super.dispose();
  }

  // ── Round management ────────────────────────────────────────────────────

  void _startNewRound() {
    _gameTimer?.cancel();
    setState(() {
      _isRoundActive = true;
      _showCorrectFeedback = false;
      _showWrongFeedback = false;
      _comparingIndices = [];
      _swappingIndices = [];
    });

    // Pick a random sort algorithm
    _currentAlgorithm = _algorithms[Random().nextInt(_algorithms.length)];

    // Generate a new random array (small enough to keep the game playable)
    _array = generateRandomArray(6, max: 50);

    // Generate the 4 choices for this round
    _generateChoices();

    // Auto-advance if no user interaction after a timeout
    _gameTimer = Timer(Duration(milliseconds: (8000 / _gameSpeed).round()), () {
      if (mounted && _isRoundActive && !_isPaused) {
        _handleTimeout();
      }
    });
  }

  void _handleTimeout() {
    if (!_isRoundActive) return;
    setState(() {
      _lives--;
      _showWrongFeedback = true;
    });
    _recordGameResult(false);
    Future.delayed(const Duration(milliseconds: 800), () {
      if (mounted) _checkGameOver();
    });
  }

  void _checkGameOver() {
    if (_lives <= 0) {
      setState(() => _isGameOver = true);
    } else if (_round >= _totalRounds) {
      setState(() => _isGameOver = true);
    } else {
      setState(() => _round++);
      _startNewRound();
    }
  }

  // ── Choice generation ───────────────────────────────────────────────────

  void _generateChoices() {
    // We'll generate choices by simulating a few steps of the current algorithm
    // and then producing wrong-but-plausible alternatives
    final arr = List<int>.from(_array);
    final choices = <_SortChoice>[];

    // Find the next correct operation based on the algorithm
    _SortChoice correctChoice;
    String hintText;

    switch (_currentAlgorithm) {
      case 'bubble-sort':
        final result = _bubbleSortNextStep(arr);
        correctChoice = result.$1;
        hintText = result.$2;
        break;
      case 'selection-sort':
        final result = _selectionSortNextStep(arr);
        correctChoice = result.$1;
        hintText = result.$2;
        break;
      case 'insertion-sort':
      default:
        final result = _insertionSortNextStep(arr);
        correctChoice = result.$1;
        hintText = result.$2;
        break;
    }

    _currentHint = hintText;
    _correctAnswerIndex = 0; // we'll place correct choice here
    choices.add(correctChoice);

    // Generate 3 wrong choices (plausible swaps or comparisons)
    final wrongChoices = _generateWrongChoices(arr, correctChoice);
    choices.addAll(wrongChoices);

    // Shuffle so correct answer isn't always first
    choices.shuffle(Random());
    _correctAnswerIndex = choices.indexWhere((c) => c.isCorrect);

    _choices = choices;
  }

  // Bubble sort step simulation: find first adjacent pair out of order
  (_SortChoice, String) _bubbleSortNextStep(List<int> arr) {
    for (int i = 0; i < arr.length - 1; i++) {
      if (arr[i] > arr[i + 1]) {
        final swapped = List<int>.from(arr);
        final temp = swapped[i];
        swapped[i] = swapped[i + 1];
        swapped[i + 1] = temp;

        return (
          _SortChoice(
            description: 'Swap positions ${i + 1} and ${i + 2}',
            previewArray: swapped,
            isCorrect: true,
          ),
          'Find the first adjacent pair that is out of order and swap them.',
        );
      }
    }
    // Already sorted — return a no-op or last element move
    return (
      _SortChoice(
        description: 'No swap needed — array is sorted!',
        previewArray: List<int>.from(arr),
        isCorrect: true,
      ),
      'The array is already sorted — no swap needed.',
    );
  }

  // Selection sort step simulation: find min in remaining unsorted portion
  (_SortChoice, String) _selectionSortNextStep(List<int> arr) {
    // Assume first element is the "start" of unsorted portion for simplicity
    int minIdx = 0;
    for (int j = 1; j < arr.length; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx != 0) {
      final swapped = List<int>.from(arr);
      final temp = swapped[0];
      swapped[0] = swapped[minIdx];
      swapped[minIdx] = temp;
      return (
        _SortChoice(
          description: 'Move ${arr[minIdx]} to position 1',
          previewArray: swapped,
          isCorrect: true,
        ),
        'Select the minimum element and move it to the front.',
      );
    }
    return (
      _SortChoice(
        description: 'Position 1 already has minimum',
        previewArray: List<int>.from(arr),
        isCorrect: true,
      ),
      'The first position already has the minimum value.',
    );
  }

  // Insertion sort step simulation
  (_SortChoice, String) _insertionSortNextStep(List<int> arr) {
    // Simulate picking the second element and comparing with previous
    if (arr[0] > arr[1]) {
      final swapped = List<int>.from(arr);
      final temp = swapped[0];
      swapped[0] = swapped[1];
      swapped[1] = temp;
      return (
        _SortChoice(
          description: 'Insert arr[1]=${arr[1]} before arr[0]=${arr[0]}',
          previewArray: swapped,
          isCorrect: true,
        ),
        'Insert the second element into its correct position relative to the first element.',
      );
    }
    return (
      _SortChoice(
        description: 'arr[1]=${arr[1]} is already in order',
        previewArray: List<int>.from(arr),
        isCorrect: true,
      ),
      'The second element is already greater than the first — no insertion needed.',
    );
  }

  List<_SortChoice> _generateWrongChoices(List<int> arr, _SortChoice correct) {
    final random = Random();
    final wrong = <_SortChoice>[];

    // Generate wrong choices by randomly swapping different indices
    for (int attempt = 0; attempt < 10 && wrong.length < 3; attempt++) {
      final i = random.nextInt(arr.length);
      final j = random.nextInt(arr.length);
      if (i == j) continue;

      final wrongArr = List<int>.from(arr);
      final temp = wrongArr[i];
      wrongArr[i] = wrongArr[j];
      wrongArr[j] = temp;

      // Make sure this isn't identical to the correct choice
      if (!_arraysEqual(wrongArr, correct.previewArray)) {
        wrong.add(_SortChoice(
          description: 'Swap positions ${i + 1} and ${j + 1}',
          previewArray: wrongArr,
          isCorrect: false,
        ));
      }
    }

    // Fill with fallback if needed
    while (wrong.length < 3) {
      wrong.add(_SortChoice(
        description: 'Compare all elements',
        previewArray: List<int>.from(arr),
        isCorrect: false,
      ));
    }

    return wrong;
  }

  bool _arraysEqual(List<int> a, List<int> b) {
    if (a.length != b.length) return false;
    for (int i = 0; i < a.length; i++) {
      if (a[i] != b[i]) return false;
    }
    return true;
  }

  // ── User interaction ───────────────────────────────────────────────────

  void _selectChoice(int index) {
    if (!_isRoundActive || _isPaused) return;
    _gameTimer?.cancel();

    final choice = _choices[index];
    setState(() => _isRoundActive = false);

    if (choice.isCorrect) {
      setState(() {
        _array = choice.previewArray;
        _swappingIndices = [];
        _showCorrectFeedback = true;
        _score += (10 * _gameSpeed).round();
      });
      _recordGameResult(true);

      Future.delayed(const Duration(milliseconds: 700), () {
        if (mounted) _checkGameOver();
      });
    } else {
      setState(() {
        _showWrongFeedback = true;
        _lives--;
      });
      _recordGameResult(false);

      Future.delayed(const Duration(milliseconds: 700), () {
        if (mounted) _checkGameOver();
      });
    }
  }

  void _recordGameResult(bool won) {
    // Update user progress
    if (won) {
      ref.read(userProgressProvider.notifier).addXP(5);
    }
    // Update game state high score
    ref.read(gameStateProvider.notifier).updateSorterBest(_score);
  }

  void _pauseGame() {
    setState(() => _isPaused = true);
    _gameTimer?.cancel();
  }

  void _resumeGame() {
    setState(() => _isPaused = false);
    if (_isRoundActive) {
      _gameTimer = Timer(Duration(milliseconds: (8000 / _gameSpeed).round()), () {
        if (mounted && _isRoundActive && !_isPaused) {
          _handleTimeout();
        }
      });
    }
  }

  void _restartGame() {
    setState(() {
      _score = 0;
      _lives = 3;
      _round = 1;
      _isGameOver = false;
      _isPaused = false;
    });
    _startNewRound();
  }

  void _exitGame() {
    context.pop();
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
          'The Sorter',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
        actions: [
          // Pause / Resume
          IconButton(
            icon: Icon(_isPaused ? Icons.play_arrow : Icons.pause,
                color: AppColors.textPrimary),
            onPressed: _isPaused ? _resumeGame : _pauseGame,
          ),
          // Speed control
          TextButton(
            onPressed: _cycleSpeed,
            child: Text(
              '${_gameSpeed}x',
              style: const TextStyle(
                color: AppColors.primary500,
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
      body: _isGameOver ? _buildGameOver() : _isPaused ? _buildPaused() : _buildGameplay(),
    );
  }

  Widget _buildGameplay() {
    return SafeArea(
      child: Column(
        children: [
          // ── HUD ──
          _buildHUD(),

          // ── Array visualization ──
          Expanded(
            flex: 3,
            child: _buildArrayVisualization(),
          ),

          // ── Hint text ──
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.sm,
            ),
            color: AppColors.primary50,
            child: Text(
              _currentHint,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.primary700,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
          ),

          // ── Choices ──
          Expanded(
            flex: 4,
            child: _buildChoices(),
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
          _HUDChip(
            icon: Icons.star,
            label: '$_score',
            color: AppColors.solarGold,
          ),
          const SizedBox(width: AppSpacing.md),

          // Round
          _HUDChip(
            icon: Icons.loop,
            label: 'Round $_round/$_totalRounds',
            color: AppColors.primary500,
          ),
          const SizedBox(width: AppSpacing.md),

          // Lives (hearts)
          Expanded(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: List.generate(3, (i) {
                final isLost = i >= _lives;
                return Padding(
                  padding: const EdgeInsets.only(left: 4),
                  child: Icon(
                    isLost ? Icons.favorite_border : Icons.favorite,
                    color: isLost ? AppColors.textMuted : AppColors.error600,
                    size: 22,
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildArrayVisualization() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text('Sort this array:', style: AppTypography.h3),
          const SizedBox(height: AppSpacing.lg),

          // Array bars
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: List.generate(_array.length, (index) {
              final maxVal = _array.reduce((a, b) => a > b ? a : b);
              final height = maxVal > 0 ? (_array[index] / maxVal) * 160 : 10.0;
              final isComparing = _comparingIndices.contains(index);
              final isSwapping = _swappingIndices.contains(index);
              final isCorrect = _showCorrectFeedback;

              Color barColor = AppColors.catSorting;
              if (_showWrongFeedback) {
                barColor = AppColors.error600;
              } else if (isCorrect) {
                barColor = AppColors.success600;
              } else if (isSwapping) {
                barColor = AppColors.solarAmber;
              } else if (isComparing) {
                barColor = AppColors.primary500;
              }

              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  width: 36,
                  height: height,
                  decoration: BoxDecoration(
                    color: barColor,
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(6),
                    ),
                  ),
                  alignment: Alignment.bottomCenter,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Text(
                      '${_array[index]}',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildChoices() {
    return Container(
      color: AppColors.card,
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'What should happen next?',
            style: AppTypography.h3,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.lg),

          Expanded(
            child: GridView.count(
              crossAxisCount: 2,
              mainAxisSpacing: AppSpacing.md,
              crossAxisSpacing: AppSpacing.md,
              childAspectRatio: 1.6,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              children: List.generate(_choices.length, (index) {
                final choice = _choices[index];
                final isSelected = index == _correctAnswerIndex;

                Color borderColor = AppColors.sunken;
                Color bgColor = AppColors.canvas;

                if (_showCorrectFeedback && isSelected) {
                  borderColor = AppColors.success600;
                  bgColor = AppColors.success100;
                } else if (_showWrongFeedback && isSelected) {
                  borderColor = AppColors.error600;
                  bgColor = AppColors.error100;
                }

                return GestureDetector(
                  onTap: _isRoundActive ? () => _selectChoice(index) : null,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    decoration: BoxDecoration(
                      color: bgColor,
                      borderRadius: AppRadius.mdBorder,
                      border: Border.all(color: borderColor, width: 2),
                    ),
                    padding: const EdgeInsets.all(AppSpacing.md),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Mini preview array
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: choice.previewArray.take(4).map((v) {
                            return Container(
                              margin: const EdgeInsets.symmetric(horizontal: 1),
                              width: 20,
                              height: v / 3,
                              decoration: BoxDecoration(
                                color: AppColors.catSorting.withValues(alpha: 0.7),
                                borderRadius: BorderRadius.circular(2),
                              ),
                            );
                          }).toList(),
                        ),
                        if (choice.previewArray.length > 4)
                          Text('...', style: AppTypography.caption),
                        const SizedBox(height: AppSpacing.sm),
                        Text(
                          choice.description,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
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
    );
  }

  Widget _buildPaused() {
    return Container(
      color: AppColors.card,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.pause_circle_outline,
                size: 80, color: AppColors.textMuted),
            const SizedBox(height: AppSpacing.lg),
            const Text('Game Paused', style: AppTypography.h1),
            const SizedBox(height: AppSpacing.xl),
            ElevatedButton(
              onPressed: _resumeGame,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary500,
                minimumSize: const Size(200, 48),
              ),
              child: const Text('Resume'),
            ),
            const SizedBox(height: AppSpacing.md),
            TextButton(
              onPressed: _restartGame,
              child: const Text('Restart'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGameOver() {
    final isWin = _lives > 0 && _round >= _totalRounds;
    final highScore = ref.watch(gameStateProvider).highScores.sorterBest;

    return Container(
      color: AppColors.card,
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                isWin ? Icons.emoji_events : Icons.sentiment_dissatisfied,
                size: 80,
                color: isWin ? AppColors.solarGold : AppColors.textMuted,
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                isWin ? 'Great job!' : 'Game Over',
                style: AppTypography.h1,
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                isWin
                    ? 'You sorted all $_totalRounds rounds!'
                    : 'You ran out of lives.',
                style: AppTypography.body.copyWith(color: AppColors.textSecondary),
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
                    _ScoreRow(label: 'Score', value: '$_score'),
                    const SizedBox(height: AppSpacing.md),
                    _ScoreRow(label: 'Best Score', value: '$highScore'),
                    const SizedBox(height: AppSpacing.md),
                    _ScoreRow(label: 'Rounds Won', value: '${_round - (_lives <= 0 ? 1 : 0)}/$_totalRounds'),
                    const SizedBox(height: AppSpacing.md),
                    _ScoreRow(label: 'XP Earned', value: '+${(_score * 0.5).round()}'),
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

  void _cycleSpeed() {
    setState(() {
      if (_gameSpeed == 0.5) {
        _gameSpeed = 1.0;
      } else if (_gameSpeed == 1.0) {
        _gameSpeed = 2.0;
      } else {
        _gameSpeed = 0.5;
      }
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Supporting types & widgets
// ─────────────────────────────────────────────────────────────────────────────

class _SortChoice {
  final String description;
  final List<int> previewArray;
  final bool isCorrect;

  const _SortChoice({
    required this.description,
    required this.previewArray,
    required this.isCorrect,
  });
}

class _HUDChip extends StatelessWidget {
  const _HUDChip({
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
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

class _ScoreRow extends StatelessWidget {
  const _ScoreRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: AppTypography.caption),
        Text(value, style: AppTypography.bodyBold),
      ],
    );
  }
}
