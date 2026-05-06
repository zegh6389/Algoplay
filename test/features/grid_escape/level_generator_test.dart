import 'package:flutter_test/flutter_test.dart';
import 'package:algoplay/features/grid_escape/data/level_generator.dart';

void main() {
  group('LevelConfig', () {
    test('creates with all required fields', () {
      final walls = <String>{'1,2', '2,2'};
      final config = LevelConfig(
        gridRows: 5,
        gridCols: 5,
        walls: walls,
        startPos: '0,0',
        endPos: '4,4',
        timeLimitSeconds: 45,
        levelNumber: 1,
        question: 'Which algorithm?',
        correctAnswer: 'BFS',
        options: ['BFS', 'DFS', 'Dijkstra', 'Linear'],
        hint: 'Use BFS',
      );
      expect(config.gridRows, 5);
      expect(config.gridCols, 5);
      expect(config.walls.length, 2);
      expect(config.startPos, '0,0');
      expect(config.endPos, '4,4');
      expect(config.levelNumber, 1);
    });
  });

  group('LevelGenerator', () {
    test('generate(1) returns a valid easy level', () {
      final level = LevelGenerator.generate(1, seed: 42);
      expect(level.levelNumber, 1);
      expect(level.gridRows, 5);
      expect(level.gridCols, 5);
      expect(level.timeLimitSeconds, greaterThanOrEqualTo(40));
      expect(level.question, isNotEmpty);
      expect(level.correctAnswer, isNotEmpty);
      expect(level.options.length, 4);
      expect(level.options, contains(level.correctAnswer));
    });

    test('generate(10) returns a harder level than level 1', () {
      final easy = LevelGenerator.generate(1, seed: 42);
      final hard = LevelGenerator.generate(10, seed: 42);
      // Grid size should be larger
      expect(hard.gridRows, greaterThanOrEqualTo(easy.gridRows));
      // Time limit should be tighter
      expect(hard.timeLimitSeconds, lessThanOrEqualTo(easy.timeLimitSeconds));
      // Walls should be more
      expect(hard.walls.length, greaterThanOrEqualTo(easy.walls.length));
    });

    test('grid dimensions increase with level', () {
      final l1 = LevelGenerator.generate(1, seed: 42);
      final l5 = LevelGenerator.generate(5, seed: 42);
      final l10 = LevelGenerator.generate(10, seed: 42);
      expect(l5.gridRows, greaterThanOrEqualTo(l1.gridRows));
      expect(l10.gridRows, greaterThanOrEqualTo(l5.gridRows));
    });

    test('start != end position', () {
      for (int i = 1; i <= 10; i++) {
        final level = LevelGenerator.generate(i, seed: 42);
        expect(level.startPos, isNot(equals(level.endPos)));
      }
    });

    test('generateAll(10) returns 10 levels', () {
      final levels = LevelGenerator.generateAll(10, seed: 42);
      expect(levels.length, 10);
      for (int i = 0; i < 10; i++) {
        expect(levels[i].levelNumber, i + 1);
      }
    });

    test('seed determinism - same seed produces same levels', () {
      final set1 = LevelGenerator.generateAll(5, seed: 77);
      final set2 = LevelGenerator.generateAll(5, seed: 77);
      for (int i = 0; i < 5; i++) {
        expect(set1[i].gridRows, set2[i].gridRows);
        expect(set1[i].gridCols, set2[i].gridCols);
        expect(set1[i].walls, set2[i].walls);
        expect(set1[i].startPos, set2[i].startPos);
        expect(set1[i].endPos, set2[i].endPos);
      }
    });

    test('path exists from start to end (BFS validation)', () {
      for (int level = 1; level <= 10; level++) {
        final config = LevelGenerator.generate(level, seed: 42);
        // Parse start/end positions
        final startParts = config.startPos.split(',').map(int.parse).toList();
        final endParts = config.endPos.split(',').map(int.parse).toList();

        bool pathExists = _bfsPathExists(
          startParts[0],
          startParts[1],
          endParts[0],
          endParts[1],
          config.gridRows,
          config.gridCols,
          config.walls,
        );
        expect(pathExists, isTrue, reason: 'No path exists for level $level');
      }
    });

    test('each level has question, answer, options, and hint', () {
      final levels = LevelGenerator.generateAll(10, seed: 42);
      for (final level in levels) {
        expect(level.question, isNotEmpty);
        expect(level.correctAnswer, isNotEmpty);
        expect(level.options.length, 4);
        expect(level.options, contains(level.correctAnswer));
        expect(level.hint, isNotEmpty);
      }
    });
  });
}

/// Helper: BFS check if path exists from (sr,sc) to (er,ec) on the grid.
bool _bfsPathExists(
  int sr,
  int sc,
  int er,
  int ec,
  int rows,
  int cols,
  Set<String> walls,
) {
  final visited = <String>{};
  final queue = <List<int>>[[sr, sc]];
  visited.add('$sr,$sc');

  while (queue.isNotEmpty) {
    final curr = queue.removeAt(0);
    final r = curr[0], c = curr[1];
    if (r == er && c == ec) return true;

    for (final dir in [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]) {
      final nr = r + dir[0];
      final nc = c + dir[1];
      final key = '$nr,$nc';
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
          !walls.contains(key) && !visited.contains(key)) {
        visited.add(key);
        queue.add([nr, nc]);
      }
    }
  }
  return false;
}
