import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';

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

/// Level configuration
class _LevelConfig {
  final int gridSize;
  final List<GridPos> walls;
  final GridPos start;
  final GridPos goal;
  final String question;
  final String correctAnswer;
  final List<String> options;
  final String hint;

  const _LevelConfig({
    required this.gridSize,
    required this.walls,
    required this.start,
    required this.goal,
    required this.question,
    required this.correctAnswer,
    required this.options,
    required this.hint,
  });
}

const _mockLevels = <_LevelConfig>[
  _LevelConfig(
    gridSize: 6,
    walls: [GridPos(1, 2), GridPos(2, 2), GridPos(3, 2), GridPos(3, 3)],
    start: GridPos(0, 0),
    goal: GridPos(5, 5),
    question: 'Which algorithm would find the SHORTEST path on this grid?',
    correctAnswer: 'BFS',
    options: ['DFS', 'BFS', 'Dijkstra', 'Linear Search'],
    hint: 'BFS explores uniformly in all directions — ideal for unweighted shortest path.',
  ),
  _LevelConfig(
    gridSize: 6,
    walls: [GridPos(0, 1), GridPos(1, 1), GridPos(2, 1), GridPos(3, 1), GridPos(4, 1)],
    start: GridPos(0, 0),
    goal: GridPos(5, 2),
    question: 'DFS might find a path, but is it the shortest?',
    correctAnswer: 'No',
    options: ['Yes', 'No', 'Depends on grid size', 'Only in trees'],
    hint: 'DFS dives deep along one branch before backtracking — it does not guarantee the shortest path.',
  ),
  _LevelConfig(
    gridSize: 7,
    walls: [GridPos(1, 1), GridPos(2, 3), GridPos(4, 2), GridPos(5, 4)],
    start: GridPos(0, 0),
    goal: GridPos(6, 6),
    question: 'If edges have different weights, which algorithm is appropriate?',
    correctAnswer: "Dijkstra's",
    options: ['BFS', 'DFS', "Dijkstra's", 'Binary Search'],
    hint: 'Dijkstra handles weighted edges with non-negative weights.',
  ),
];

// ═══════════════════════════════════════════════════════════════════════════════
/// GridEscapePage
// ═══════════════════════════════════════════════════════════════════════════════
class GridEscapePage extends ConsumerStatefulWidget {
  const GridEscapePage({super.key});

  @override
  ConsumerState<GridEscapePage> createState() => _GridEscapePageState();
}

class _GridEscapePageState extends ConsumerState<GridEscapePage> {
  int _currentLevel = 0;
  int _levelScore = 0;
  int _totalScore = 0;
  List<GridPos> _path = [];
  List<GridPos> _visited = [];
  GridPos? _playerPos;
  String? _selectedAnswer;
  bool? _answerCorrect;
  bool _levelComplete = false;
  bool _gameComplete = false;
  int _hintsUsed = 0;

  @override
  void initState() {
    super.initState();
    _loadLevel(0);
  }

  void _loadLevel(int index) {
    final level = _mockLevels[index];
    setState(() {
      _currentLevel = index;
      _levelScore = 100;
      _path = [];
      _visited = [];
      _playerPos = level.start;
      _selectedAnswer = null;
      _answerCorrect = null;
      _levelComplete = false;
    });
  }

  void _selectAnswer(String answer) {
    final level = _mockLevels[_currentLevel];
    final isCorrect = answer == level.correctAnswer;

    setState(() {
      _selectedAnswer = answer;
      _answerCorrect = isCorrect;
    });

    if (isCorrect) {
      _animateSolution();
    } else {
      setState(() {
        _levelScore = (_levelScore - 25).clamp(0, 100);
      });
    }
  }

  void _animateSolution() {
    final level = _mockLevels[_currentLevel];

    // Simulate BFS finding the path
    Future.delayed(const Duration(milliseconds: 300), () {
      if (!mounted) return;
      setState(() {
        _visited.add(level.start);
        _playerPos = level.start;
      });

      // Compute simple path
      _computeBFSPath(level).then((path) {
        if (!mounted) return;
        _animatePath(path);
      });
    });
  }

  Future<List<GridPos>> _computeBFSPath(_LevelConfig level) async {
    // Simple BFS simulation
    final queue = <GridPos>[level.start];
    final visited = <GridPos>{level.start};
    final parent = <GridPos, GridPos>{};

    while (queue.isNotEmpty) {
      final current = queue.removeAt(0);
      if (current == level.goal) break;

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

    // Reconstruct path
    final path = <GridPos>[];
    var node = level.goal;
    while (parent.containsKey(node) || node == level.start) {
      path.add(node);
      if (node == level.start) break;
      node = parent[node]!;
    }
    return path.reversed.toList();
  }

  bool _isValid(GridPos pos, _LevelConfig level) {
    if (pos.row < 0 || pos.row >= level.gridSize) return false;
    if (pos.col < 0 || pos.col >= level.gridSize) return false;
    if (level.walls.contains(pos)) return false;
    return true;
  }

  void _animatePath(List<GridPos> path) async {
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
      if (mounted) {
        setState(() {
          _levelComplete = true;
          _totalScore += _levelScore;
        });
      }
    }
  }

  void _useHint() {
    setState(() {
      _hintsUsed++;
      _levelScore = (_levelScore - 10).clamp(0, 100);
    });
  }

  void _nextLevel() {
    if (_currentLevel < _mockLevels.length - 1) {
      _loadLevel(_currentLevel + 1);
    } else {
      setState(() => _gameComplete = true);
    }
  }

  void _restartGame() {
    _loadLevel(0);
    setState(() {
      _totalScore = 0;
      _gameComplete = false;
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
      body: _gameComplete ? _buildGameComplete() : _buildLevelPlay(),
      bottomNavigationBar: _levelComplete ? _buildNextLevelBar(context) : null,
    );
  }

  Widget _buildLevelPlay() {
    final level = _mockLevels[_currentLevel];

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
                      'Level ${_currentLevel + 1} of ${_mockLevels.length}',
                      style: AppTypography.caption,
                    ),
                    Text(
                      '$_levelScore pts available',
                      style: AppTypography.bodyBold.copyWith(
                        color: AppColors.solarGold,
                      ),
                    ),
                  ],
                ),
              ),
              if (!_levelComplete)
                TextButton.icon(
                  onPressed: _useHint,
                  icon: const Icon(Icons.lightbulb_outline, size: 16),
                  label: const Text('Hint -10'),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.primary500,
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
                  ),
                ),
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
                              _selectedAnswer != null && option == level.correctAnswer;
                          final showWrong = isSelected && !_answerCorrect!;

                          return GestureDetector(
                            onTap: _levelComplete ? null : () => _selectAnswer(option),
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

                      // Hint display
                      if (_selectedAnswer != null && !_answerCorrect!) ...[
                        const SizedBox(height: AppSpacing.md),
                        Container(
                          padding: const EdgeInsets.all(AppSpacing.md),
                          decoration: BoxDecoration(
                            color: AppColors.primary50,
                            borderRadius: AppRadius.mdBorder,
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.lightbulb,
                                  color: AppColors.primary500, size: 18),
                              const SizedBox(width: AppSpacing.sm),
                              Expanded(
                                child: Text(level.hint,
                                    style: AppTypography.caption
                                        .copyWith(color: AppColors.primary700)),
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
          shape: RoundedRectangleBorder(
            borderRadius: AppRadius.mdBorder,
          ),
        ),
        child: Text(
          _currentLevel < _mockLevels.length - 1
              ? 'Next Level'
              : 'See Results',
        ),
      ),
    );
  }

  Widget _buildGrid(_LevelConfig level) {
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

  Widget _buildCell(GridPos pos, _LevelConfig level) {
    CellType type;

    if (pos == _playerPos && (_levelComplete || _path.isNotEmpty)) {
      type = CellType.current;
    } else if (_path.contains(pos)) {
      type = CellType.path;
    } else if (pos == level.start) {
      type = CellType.start;
    } else if (pos == level.goal) {
      type = CellType.goal;
    } else if (level.walls.contains(pos)) {
      type = CellType.wall;
    } else if (_visited.contains(pos)) {
      type = CellType.visited;
    } else {
      type = CellType.empty;
    }

    Color backgroundColor;
    Color borderColor;
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
          color: borderColor = (type == CellType.goal || type == CellType.start)
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
            'You escaped all ${_mockLevels.length} grids',
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
                shape: RoundedRectangleBorder(
                  borderRadius: AppRadius.mdBorder,
                ),
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
                shape: RoundedRectangleBorder(
                  borderRadius: AppRadius.mdBorder,
                ),
              ),
              child: const Text('Back to Menu'),
            ),
          ),
          SizedBox(height: MediaQuery.of(context).padding.bottom + AppSpacing.lg),
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
