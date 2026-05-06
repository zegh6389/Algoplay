import 'package:flutter_test/flutter_test.dart';
import 'package:algoplay/features/grid_escape/data/level_generator.dart';

void main() {
  group('LevelGenerator', () {
    test('generate(1) returns an easy level', () {
      final level = LevelGenerator.generate(1, seed: 42);
      expect(level.levelNumber, 1);
      expect(level.gridRows, 5);
      expect(level.gridCols, 5);
      expect(level.walls.length, greaterThanOrEqualTo(3));
      expect(level.timeLimitSeconds, 45);
    });

    test('generate(10) is harder than generate(1)', () {
      final easy = LevelGenerator.generate(1, seed: 42);
      final hard = LevelGenerator.generate(10, seed: 42);

      // Hard level should have bigger or equal grid
      expect(hard.gridRows, greaterThanOrEqualTo(easy.gridRows));
      // Hard level should have more walls
      expect(hard.walls.length, greaterThanOrEqualTo(easy.walls.length));
      // Hard level should have shorter time limit
      expect(hard.timeLimitSeconds, lessThanOrEqualTo(easy.timeLimitSeconds));
    });

    test('start != end position', () {
      for (int i = 1; i <= 10; i++) {
        final level = LevelGenerator.generate(i, seed: 42);
        expect(level.startPos, isNot(equals(level.endPos)),
            reason: 'Level $i has same start and end position');
      }
    });

    test('generateAll(10) returns 10 levels', () {
      final levels = LevelGenerator.generateAll(10, seed: 42);
      expect(levels.length, 10);
      for (int i = 0; i < levels.length; i++) {
        expect(levels[i].levelNumber, i + 1);
      }
    });

    test('seed determinism', () {
      final run1 = LevelGenerator.generate(5, seed: 77);
      final run2 = LevelGenerator.generate(5, seed: 77);
      expect(run1.gridRows, run2.gridRows);
      expect(run1.gridCols, run2.gridCols);
      expect(run1.startPos, run2.startPos);
      expect(run1.endPos, run2.endPos);
      expect(run1.walls, run2.walls);
      expect(run1.question, run2.question);
    });

    test('all levels have valid question data', () {
      final levels = LevelGenerator.generateAll(10, seed: 42);
      for (final level in levels) {
        expect(level.question, isNotEmpty);
        expect(level.correctAnswer, isNotEmpty);
        expect(level.options, isNotEmpty);
        expect(level.hint, isNotEmpty);
        expect(level.options, contains(level.correctAnswer),
            reason: 'correctAnswer not in options for level ${level.levelNumber}');
      }
    });

    test('start and end positions are within grid bounds', () {
      for (int i = 1; i <= 10; i++) {
        final level = LevelGenerator.generate(i, seed: 42);
        final (sr, sc) = level.startTuple;
        final (er, ec) = level.endTuple;
        expect(sr, inInclusiveRange(0, level.gridRows - 1));
        expect(sc, inInclusiveRange(0, level.gridCols - 1));
        expect(er, inInclusiveRange(0, level.gridRows - 1));
        expect(ec, inInclusiveRange(0, level.gridCols - 1));
      }
    });

    test('walls do not overlap with start or end', () {
      for (int i = 1; i <= 10; i++) {
        final level = LevelGenerator.generate(i, seed: 42);
        expect(level.walls, isNot(contains(level.startPos)),
            reason: 'Level $i has wall on start');
        expect(level.walls, isNot(contains(level.endPos)),
            reason: 'Level $i has wall on end');
      }
    });

    test('LevelConfig gridSize getter returns max of rows and cols', () {
      final level = LevelGenerator.generate(1, seed: 42);
      expect(level.gridSize, equals(level.gridRows.clamp(level.gridCols, level.gridRows)));
    });
  });
}
