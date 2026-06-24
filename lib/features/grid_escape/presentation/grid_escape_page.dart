import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/haptics.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/providers/app_providers.dart';
import '../../../shared/services/game_result_recorder.dart';
import '../data/level_generator.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Grid Escape Page — Grid-based pathfinding puzzle game.
///
/// The player navigates a grid from start to goal using algorithm knowledge.
/// Obstacles block certain paths, and the player must choose the correct
/// pathfinding algorithm to escape each level.
// ═══════════════════════════════════════════════════════════════════════════════

/// Grid cell type
enum CellType { empty, wall, start, goal, path, visited, current }

/// Grid position
class GridPos {
  final int row;
  final int col;
  const GridPos(this.row, this.col);

  @override
  bool operator ==(Object other) =>
      other is GridPos && row == other.row && col == other.col;
  @override
  int get hashCode => row.hashCode ^ col.hashCode;
}

/// Helper extensions to adapt LevelConfig to GridPos-based UI.
extension LevelConfigX on LevelConfig {
  GridPos get startGridPos {
    final (r, c) = startTuple;
    return GridPos(r, c);
  }

  GridPos get endGridPos {
    final (r, c) = endTuple;
    return GridPos(r, c);
  }

  List<GridPos> get wallPositions => walls.map((w) {
    final parts = w.split(',').map(int.parse).toList();
    return GridPos(parts[0], parts[1]);
  }).toList();
}

// ═══════════════════════════════════════════════════════════════════════════════
/// GridEscapePage
// ═══════════════════════════════════════════════════════════════════════════════
class GridEscapePage extends ConsumerStatefulWidget {
  const GridEscapePage({super.key});

  @override
  ConsumerState<GridEscapePage> createState() => _GridEscapePageState();
}

class _GridEscapePageState extends ConsumerState<GridEscapePage> {
  static const int _maxLives = 3;

  int _currentLevel = 0;
  int _levelScore = 0;
  int _totalScore = 0;
  int _lives = _maxLives;
  List<GridPos> _path = [];
  List<GridPos> _visited = [];
  GridPos? _playerPos;
  String? _selectedAnswer;
  bool? _answerCorrect;
  bool _levelComplete = false;
  bool _gameComplete = false;
  bool _gameOver = false;
  bool _hintShown = false;
  int _hintsUsed = 0;
  int _timeRemaining = 0;
  Timer? _timer;
  bool _recorded = false;
  late List<LevelConfig> _levels;
  late Set<GridPos> _wallSet;

  @override
  void initState() {
    super.initState();
    _levels = LevelGenerator.generateAll(10, seed: Random().nextInt(100000));
    _loadLevel(0);
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _loadLevel(int index) {
    final level = _levels[index];
    _wallSet = level.wallPositions.toSet();
    _timer?.cancel();
    setState(() {
      _currentLevel = index;
      _levelScore = 100;
      _path = [];
      _visited = [];
      _playerPos = level.startGridPos;
      _selectedAnswer = null;
      _answerCorrect = null;
      _levelComplete = false;
      _hintShown = false;
      _timeRemaining = level.timeLimitSeconds;
    });
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted || _levelComplete || _gameComplete || _gameOver) return;
      setState(() => _timeRemaining--);
      if (_timeRemaining <= 0) {
        _timer?.cancel();
        _onTimeUp();
      }
    });
  }

  void _onTimeUp() {
    Haptics.error();
    setState(() {
      _lives--;
      // Reveal the correct answer (no wrong option selected) before advancing.
      _selectedAnswer = '';
      _answerCorrect = false;
    });
    if (_lives <= 0) {
      _endGame(won: false);
    } else {
      // Reveal the solution without awarding score, then advance.
      _animateSolution(awardScore: false);
    }
  }

  bool get _inputLocked =>
      _levelComplete ||
      _gameOver ||
      _gameComplete ||
      _timeRemaining <= 0 ||
      _answerCorrect == true;

  void _selectAnswer(String answer) {
    if (_inputLocked) return;
    final level = _levels[_currentLevel];
    final isCorrect = answer == level.correctAnswer;

    setState(() {
      _selectedAnswer = answer;
      _answerCorrect = isCorrect;
    });

    if (isCorrect) {
      Haptics.success();
      _timer?.cancel();
      _animateSolution(awardScore: true);
    } else {
      Haptics.error();
      setState(() {
        _levelScore = (_levelScore - 25).clamp(0, 100);
      });
    }
  }

  void _animateSolution({required bool awardScore}) {
    final level = _levels[_currentLevel];

    Future.delayed(const Duration(milliseconds: 300), () {
      if (!mounted) return;
      setState(() {
        _visited.add(level.startGridPos);
        _playerPos = level.startGridPos;
      });

      _computeBFSPath(level).then((path) {
        if (!mounted) return;
        _animatePath(path, awardScore: awardScore);
      });
    });
  }

  Future<List<GridPos>> _computeBFSPath(LevelConfig level) async {
    final start = level.startGridPos;
    final goal = level.endGridPos;

    final queue = <GridPos>[start];
    final visited = <GridPos>{start};
    final parent = <GridPos, GridPos>{};

    while (queue.isNotEmpty) {
      final current = queue.removeAt(0);
      if (current == goal) break;

      for (final dir in [
        GridPos(0, 1),
        GridPos(0, -1),
        GridPos(1, 0),
        GridPos(-1, 0),
      ]) {
        final next = GridPos(current.row + dir.row, current.col + dir.col);
        if (_isValid(next, level) && !visited.contains(next)) {
          visited.add(next);
          parent[next] = current;
          queue.add(next);
        }
      }
    }

    final path = <GridPos>[];
    var node = goal;
    while (parent.containsKey(node) || node == start) {
      path.add(node);
      if (node == start) break;
      node = parent[node]!;
    }
    return path.reversed.toList();
  }

  bool _isValid(GridPos pos, LevelConfig level) {
    if (pos.row < 0 || pos.row >= level.gridSize) return false;
    if (pos.col < 0 || pos.col >= level.gridSize) return false;
    if (_wallSet.contains(pos)) return false;
    return true;
  }

  void _animatePath(List<GridPos> path, {required bool awardScore}) async {
    for (int i = 0; i < path.length; i++) {
      if (!mounted) return;
      await Future.delayed(const Duration(milliseconds: 200));
      setState(() {
        _path = path.sublist(0, i + 1);
        _playerPos = path[i];
      });
    }

    if (mounted) {
      await Future.delayed(const Duration(milliseconds: 500));
      if (!mounted) return;
      setState(() {
        _levelComplete = true;
        if (awardScore) _totalScore += _levelScore;
      });
    }
  }

  void _useHint() {
    if (_inputLocked) return;
    Haptics.selection();
    setState(() {
      if (!_hintShown) {
        _hintsUsed++;
        _levelScore = (_levelScore - 10).clamp(0, 100);
      }
      _hintShown = true;
    });
  }

  void _nextLevel() {
    if (_currentLevel < _levels.length - 1) {
      _loadLevel(_currentLevel + 1);
    } else {
      _endGame(won: true);
    }
  }

  void _endGame({required bool won}) {
    _timer?.cancel();
    if (won) {
      Haptics.heavy();
    } else {
      Haptics.error();
    }
    setState(() {
      if (won) {
        _gameComplete = true;
      } else {
        _gameOver = true;
      }
    });
    _recordResult(won);
  }

  void _recordResult(bool won) {
    if (_recorded) return;
    _recorded = true;
    final xp = won ? 10 + (_totalScore ~/ 50) : (_totalScore ~/ 100);
    GameResultRecorder.record(
      ref,
      GameResult(
        game: GameId.gridEscape,
        won: won,
        score: _totalScore,
        xpReward: xp,
        activityMinutes: 3,
        category: 'grid-escape',
      ),
    );
  }

  void _restartGame() {
    _timer?.cancel();
    _levels = LevelGenerator.generateAll(10, seed: Random().nextInt(100000));
    _recorded = false;
    _loadLevel(0);
    setState(() {
      _totalScore = 0;
      _lives = _maxLives;
      _gameComplete = false;
      _gameOver = false;
      _hintsUsed = 0;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        backgroundColor: AppColors.card,
        title: const Text('Grid Escape'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
      ),
      body: SafeArea(
        top: false,
        child: _gameOver
            ? _buildGameOver()
            : _gameComplete
                ? _buildGameComplete()
                : _buildLevelPlay(),
      ),
      bottomNavigationBar: _levelComplete
          ? SafeArea(top: false, child: _buildNextLevelBar(context))
          : null,
    );
  }

  Widget _buildLevelPlay() {
    final level = _levels[_currentLevel];

    return Column(
      children: [
        // ── Level Info Bar ──
        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.md,
          ),
          decoration: const BoxDecoration(
            color: AppColors.card,
            border: Border(bottom: BorderSide(color: AppColors.sunken)),
          ),
          child: Row(
            children: [
              _LevelBadge(level: _currentLevel + 1),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Level ${_currentLevel + 1} of ${_levels.length}',
                      style: AppTypography.caption,
                    ),
                    Row(
                      children: [
                        Text(
                          '$_levelScore pts',
                          style: AppTypography.bodyBold.copyWith(
                            color: AppColors.solarGold,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        ...List.generate(_maxLives, (i) {
                          final alive = i < _lives;
                          return Padding(
                            padding: const EdgeInsets.only(right: 2),
                            child: Icon(
                              Icons.favorite,
                              size: 14,
                              color: alive
                                  ? AppColors.error600
                                  : AppColors.sunken,
                            ),
                          );
                        }),
                      ],
                    ),
                  ],
                ),
              ),
              // Timer pill
              _TimerPill(seconds: _timeRemaining),
              if (!_levelComplete && !_gameOver) ...[
                const SizedBox(width: AppSpacing.xs),
                TextButton.icon(
                  onPressed: _hintShown ? null : _useHint,
                  icon: const Icon(Icons.lightbulb_outline, size: 16),
                  label: Text(_hintShown ? 'Hint' : 'Hint -10'),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.primary500,
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.sm,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),

        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              children: [
                // ── Question ──
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: AppRadius.lgBorder,
                    boxShadow: AppShadows.sm,
                  ),
                  child: Column(
                    children: [
                      Text(
                        level.question,
                        style: AppTypography.h3,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: AppSpacing.lg),

                      // Options
                      Wrap(
                        spacing: AppSpacing.sm,
                        runSpacing: AppSpacing.sm,
                        children: level.options.map((option) {
                          final isSelected = _selectedAnswer == option;
                          final showCorrect =
                              _selectedAnswer != null &&
                              option == level.correctAnswer;
                          final showWrong = isSelected && !_answerCorrect!;

                          return GestureDetector(
                            onTap: _inputLocked
                                ? null
                                : () => _selectAnswer(option),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.lg,
                                vertical: AppSpacing.md,
                              ),
                              decoration: BoxDecoration(
                                color: showCorrect
                                    ? AppColors.success100
                                    : showWrong
                                    ? AppColors.error100
                                    : isSelected
                                    ? AppColors.primary50
                                    : AppColors.sunken,
                                borderRadius: AppRadius.mdBorder,
                                border: Border.all(
                                  color: showCorrect
                                      ? AppColors.success600
                                      : showWrong
                                      ? AppColors.error600
                                      : isSelected
                                      ? AppColors.primary500
                                      : Colors.transparent,
                                  width: 1.5,
                                ),
                              ),
                              child: Text(
                                option,
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: showCorrect
                                      ? AppColors.success600
                                      : showWrong
                                      ? AppColors.error600
                                      : AppColors.textPrimary,
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),

                      // Hint display — shown after a wrong guess or when the
                      // Hint button is pressed.
                      if (_hintShown ||
                          (_selectedAnswer != null && !_answerCorrect!)) ...[
                        const SizedBox(height: AppSpacing.md),
                        Container(
                          padding: const EdgeInsets.all(AppSpacing.md),
                          decoration: BoxDecoration(
                            color: AppColors.primary50,
                            borderRadius: AppRadius.mdBorder,
                          ),
                          child: Row(
                            children: [
                              const Icon(
                                Icons.lightbulb,
                                color: AppColors.primary500,
                                size: 18,
                              ),
                              const SizedBox(width: AppSpacing.sm),
                              Expanded(
                                child: Text(
                                  level.hint,
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.primary700,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),

                // ── Grid ──
                _buildGrid(level),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNextLevelBar(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.md,
        AppSpacing.lg,
        MediaQuery.of(context).padding.bottom + AppSpacing.lg,
      ),
      decoration: const BoxDecoration(
        color: AppColors.card,
        border: Border(top: BorderSide(color: AppColors.sunken)),
      ),
      child: FilledButton(
        onPressed: _nextLevel,
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.solarGold,
          minimumSize: const Size.fromHeight(52),
          shape: RoundedRectangleBorder(borderRadius: AppRadius.mdBorder),
        ),
        child: Text(
          _currentLevel < _levels.length - 1 ? 'Next Level' : 'See Results',
        ),
      ),
    );
  }

  Widget _buildGrid(LevelConfig level) {
    return AspectRatio(
      aspectRatio: 1,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: AppRadius.lgBorder,
          boxShadow: AppShadows.sm,
        ),
        padding: const EdgeInsets.all(AppSpacing.sm),
        child: GridView.builder(
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: level.gridSize,
            crossAxisSpacing: 4,
            mainAxisSpacing: 4,
          ),
          itemCount: level.gridSize * level.gridSize,
          itemBuilder: (context, index) {
            final row = index ~/ level.gridSize;
            final col = index % level.gridSize;
            final pos = GridPos(row, col);
            return _buildCell(pos, level);
          },
        ),
      ),
    );
  }

  Widget _buildCell(GridPos pos, LevelConfig level) {
    CellType type;

    if (pos == _playerPos && (_levelComplete || _path.isNotEmpty)) {
      type = CellType.current;
    } else if (_path.contains(pos)) {
      type = CellType.path;
    } else if (pos == level.startGridPos) {
      type = CellType.start;
    } else if (pos == level.endGridPos) {
      type = CellType.goal;
    } else if (_wallSet.contains(pos)) {
      type = CellType.wall;
    } else if (_visited.contains(pos)) {
      type = CellType.visited;
    } else {
      type = CellType.empty;
    }

    Color backgroundColor;
    Widget? child;

    switch (type) {
      case CellType.start:
        backgroundColor = AppColors.primary500;
        child = const Icon(Icons.play_arrow, color: Colors.white, size: 16);
        break;
      case CellType.goal:
        backgroundColor = AppColors.success600;
        child = const Icon(Icons.flag, color: Colors.white, size: 16);
        break;
      case CellType.path:
        backgroundColor = AppColors.solarLime.withValues(alpha: 0.5);
        child = null;
        break;
      case CellType.current:
        backgroundColor = AppColors.primary300;
        child = Container(
          width: 16,
          height: 16,
          decoration: const BoxDecoration(
            color: AppColors.primary700,
            shape: BoxShape.circle,
          ),
        );
        break;
      case CellType.wall:
        backgroundColor = AppColors.textMuted;
        break;
      case CellType.visited:
        backgroundColor = AppColors.primary100;
        break;
      case CellType.empty:
        backgroundColor = AppColors.sunken;
        break;
    }

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(
          color: (type == CellType.goal || type == CellType.start)
              ? Colors.white.withValues(alpha: 0.3)
              : Colors.transparent,
          width: 1,
        ),
      ),
      alignment: Alignment.center,
      child: child,
    );
  }

  Widget _buildGameComplete() {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        children: [
          const Spacer(),
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: AppColors.solarGold.withValues(alpha: 0.15),
              borderRadius: AppRadius.xlBorder,
            ),
            alignment: Alignment.center,
            child: const Icon(
              Icons.emoji_events,
              size: 48,
              color: AppColors.solarGold,
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          Text('Escape Complete!', style: AppTypography.h1),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'You escaped all ${_levels.length} grids',
            style: AppTypography.body.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.xxl),

          // Score card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.xl),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: AppRadius.lgBorder,
              boxShadow: AppShadows.sm,
            ),
            child: Column(
              children: [
                Text('Total Score', style: AppTypography.caption),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  '$_totalScore',
                  style: AppTypography.display.copyWith(
                    color: AppColors.solarGold,
                    fontSize: 56,
                  ),
                ),
                Text('points', style: AppTypography.overline),
                const SizedBox(height: AppSpacing.lg),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _StatChip(
                      label: 'Hints Used',
                      value: '$_hintsUsed',
                      icon: Icons.lightbulb_outline,
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    _StatChip(
                      label: 'Best',
                      value:
                          '${ref.watch(gameStateProvider).highScores.gridEscapeBestScore}',
                      icon: Icons.emoji_events,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Spacer(),

          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _restartGame,
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.primary500,
                minimumSize: const Size.fromHeight(52),
                shape: RoundedRectangleBorder(borderRadius: AppRadius.mdBorder),
              ),
              child: const Text('Play Again'),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => Navigator.of(context).maybePop(),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(48),
                shape: RoundedRectangleBorder(borderRadius: AppRadius.mdBorder),
              ),
              child: const Text('Back to Menu'),
            ),
          ),
          SizedBox(
            height: MediaQuery.of(context).padding.bottom + AppSpacing.lg,
          ),
        ],
      ),
    );
  }

  Widget _buildGameOver() {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        children: [
          const Spacer(),
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: AppColors.error600.withValues(alpha: 0.12),
              borderRadius: AppRadius.xlBorder,
            ),
            alignment: Alignment.center,
            child: const Icon(
              Icons.timer_off,
              size: 48,
              color: AppColors.error600,
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          Text('Out of Time!', style: AppTypography.h1),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'You ran out of lives on Level ${_currentLevel + 1}',
            style: AppTypography.body.copyWith(color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.xxl),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.xl),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: AppRadius.lgBorder,
              boxShadow: AppShadows.sm,
            ),
            child: Column(
              children: [
                Text('Score So Far', style: AppTypography.caption),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  '$_totalScore',
                  style: AppTypography.display.copyWith(
                    color: AppColors.solarGold,
                    fontSize: 48,
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _StatChip(
                      label: 'Best',
                      value:
                          '${ref.watch(gameStateProvider).highScores.gridEscapeBestScore}',
                      icon: Icons.emoji_events,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Spacer(),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _restartGame,
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.primary500,
                minimumSize: const Size.fromHeight(52),
                shape: RoundedRectangleBorder(borderRadius: AppRadius.mdBorder),
              ),
              child: const Text('Try Again'),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => Navigator.of(context).maybePop(),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(48),
                shape: RoundedRectangleBorder(borderRadius: AppRadius.mdBorder),
              ),
              child: const Text('Back to Menu'),
            ),
          ),
          SizedBox(
            height: MediaQuery.of(context).padding.bottom + AppSpacing.lg,
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Level badge widget
// ═══════════════════════════════════════════════════════════════════════════════
class _LevelBadge extends StatelessWidget {
  const _LevelBadge({required this.level});

  final int level;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: AppColors.solarGold.withValues(alpha: 0.15),
        borderRadius: AppRadius.mdBorder,
      ),
      alignment: Alignment.center,
      child: Text(
        '$level',
        style: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w900,
          color: AppColors.solarGold,
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Stat chip for game complete screen
// ═══════════════════════════════════════════════════════════════════════════════
class _StatChip extends StatelessWidget {
  const _StatChip({
    required this.label,
    required this.value,
    required this.icon,
  });

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: AppColors.sunken,
        borderRadius: AppRadius.mdBorder,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: AppColors.textMuted),
          const SizedBox(width: AppSpacing.sm),
          Text('$label: ', style: AppTypography.caption),
          Text(value, style: AppTypography.bodyBold),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Countdown timer pill — turns red and pulses when time is low.
// ═══════════════════════════════════════════════════════════════════════════════
class _TimerPill extends StatelessWidget {
  const _TimerPill({required this.seconds});

  final int seconds;

  @override
  Widget build(BuildContext context) {
    final isLow = seconds <= 5;
    final color = isLow ? AppColors.error600 : AppColors.textSecondary;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: isLow ? AppColors.error100 : AppColors.sunken,
        borderRadius: AppRadius.mdBorder,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.timer_outlined, size: 16, color: color),
          const SizedBox(width: AppSpacing.xs),
          Text(
            '${seconds}s',
            style: AppTypography.bodyBold.copyWith(color: color),
          ),
        ],
      ),
    );
  }
}
