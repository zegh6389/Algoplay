import 'package:flutter_test/flutter_test.dart';
import 'package:algoplay/features/learn/data/algorithm_data.dart';

void main() {
  group('allAlgorithms', () {
    test('is not empty', () {
      expect(allAlgorithms, isNotEmpty);
    });

    test('has correct count (21)', () {
      expect(allAlgorithms.length, 21);
    });

    test('each category has at least 1 algorithm', () {
      for (final category in AlgorithmCategory.values) {
        final count = allAlgorithms.where((a) => a.category == category).length;
        expect(count, greaterThan(0), reason: '$category should have at least 1 algorithm');
      }
    });

    test('algorithm IDs are unique', () {
      final ids = allAlgorithms.map((a) => a.id).toList();
      final uniqueIds = ids.toSet();
      expect(uniqueIds.length, ids.length, reason: 'All algorithm IDs must be unique');
    });

    test('all AlgorithmInfo fields are non-empty', () {
      for (final algo in allAlgorithms) {
        expect(algo.id, isNotEmpty, reason: 'id should not be empty for ${algo.name}');
        expect(algo.name, isNotEmpty, reason: 'name should not be empty');
        expect(algo.timeComplexity, isNotEmpty, reason: 'timeComplexity should not be empty for ${algo.name}');
        expect(algo.spaceComplexity, isNotEmpty, reason: 'spaceComplexity should not be empty for ${algo.name}');
        expect(algo.description, isNotEmpty, reason: 'description should not be empty for ${algo.name}');
      }
    });
  });

  group('AlgorithmCategory', () {
    test('has 6 values', () {
      expect(AlgorithmCategory.values.length, 6);
    });

    test('values are sorting, searching, graphs, dp, greedy, trees', () {
      expect(AlgorithmCategory.values, [
        AlgorithmCategory.sorting,
        AlgorithmCategory.searching,
        AlgorithmCategory.graphs,
        AlgorithmCategory.dp,
        AlgorithmCategory.greedy,
        AlgorithmCategory.trees,
      ]);
    });

    test('each category has correct label and id', () {
      expect(AlgorithmCategory.sorting.label, 'Sorting');
      expect(AlgorithmCategory.sorting.id, 'sorting');
      expect(AlgorithmCategory.searching.label, 'Searching');
      expect(AlgorithmCategory.searching.id, 'searching');
      expect(AlgorithmCategory.graphs.label, 'Graphs');
      expect(AlgorithmCategory.graphs.id, 'graphs');
      expect(AlgorithmCategory.dp.label, 'Dynamic Programming');
      expect(AlgorithmCategory.dp.id, 'dp');
      expect(AlgorithmCategory.greedy.label, 'Greedy');
      expect(AlgorithmCategory.greedy.id, 'greedy');
      expect(AlgorithmCategory.trees.label, 'Trees');
      expect(AlgorithmCategory.trees.id, 'trees');
    });
  });

  group('AlgorithmDifficulty', () {
    test('has 3 values', () {
      expect(AlgorithmDifficulty.values.length, 3);
    });

    test('values are easy, medium, hard', () {
      expect(AlgorithmDifficulty.values, [
        AlgorithmDifficulty.easy,
        AlgorithmDifficulty.medium,
        AlgorithmDifficulty.hard,
      ]);
    });
  });

  group('category distribution', () {
    test('sorting has 6 algorithms', () {
      final count = allAlgorithms.where((a) => a.category == AlgorithmCategory.sorting).length;
      expect(count, 6);
    });

    test('searching has 2 algorithms', () {
      final count = allAlgorithms.where((a) => a.category == AlgorithmCategory.searching).length;
      expect(count, 2);
    });

    test('graphs has 4 algorithms', () {
      final count = allAlgorithms.where((a) => a.category == AlgorithmCategory.graphs).length;
      expect(count, 4);
    });

    test('dp has 3 algorithms', () {
      final count = allAlgorithms.where((a) => a.category == AlgorithmCategory.dp).length;
      expect(count, 3);
    });

    test('greedy has 2 algorithms', () {
      final count = allAlgorithms.where((a) => a.category == AlgorithmCategory.greedy).length;
      expect(count, 2);
    });

    test('trees has 4 algorithms', () {
      final count = allAlgorithms.where((a) => a.category == AlgorithmCategory.trees).length;
      expect(count, 4);
    });
  });
}
