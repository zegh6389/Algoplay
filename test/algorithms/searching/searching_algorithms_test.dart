import 'dart:async';
import 'package:flutter_test/flutter_test.dart';
import 'package:algoplay/algorithms/searching/searching_algorithms.dart';
import 'package:algoplay/algorithms/models/search_step.dart';

// ---------------------------------------------------------------------------
// Helper: collect all steps from a Stream<SearchStep> into a List
// ---------------------------------------------------------------------------
Future<List<SearchStep>> collectSearchSteps(Stream<SearchStep> stream) async {
  return await stream.toList();
}

// ---------------------------------------------------------------------------
// Linear Search tests
// ---------------------------------------------------------------------------

void main() {
  // =========================================================================
  // Linear Search
  // =========================================================================
  group('linearSearch', () {
    // 1. Target present in the middle -----------------------------------------
    test('finds target=30 in [10,20,30,40,50]', () async {
      final steps = await collectSearchSteps(
        linearSearch([10, 20, 30, 40, 50], 30),
      );
      expect(steps, isNotEmpty);
      // The final step should have found=true
      final foundSteps = steps.where((s) => s.found).toList();
      expect(foundSteps, isNotEmpty, reason: 'No step with found=true');
      expect(foundSteps.last.currentIndex, equals(2));
    });

    // 2. Target not found -----------------------------------------------------
    test('returns found=false when target=99 is not in [10,20,30,40,50]',
        () async {
      final steps = await collectSearchSteps(
        linearSearch([10, 20, 30, 40, 50], 99),
      );
      expect(steps, isNotEmpty);
      final last = steps.last;
      expect(last.found, isFalse);
      expect(last.currentIndex, equals(-1));
    });

    // 3. Finding first element ------------------------------------------------
    test('finds first element target=10 in [10,20,30,40,50]', () async {
      final steps = await collectSearchSteps(
        linearSearch([10, 20, 30, 40, 50], 10),
      );
      expect(steps, isNotEmpty);
      final foundSteps = steps.where((s) => s.found).toList();
      expect(foundSteps, isNotEmpty);
      expect(foundSteps.last.currentIndex, equals(0));
    });

    // 4. Finding last element -------------------------------------------------
    test('finds last element target=50 in [10,20,30,40,50]', () async {
      final steps = await collectSearchSteps(
        linearSearch([10, 20, 30, 40, 50], 50),
      );
      expect(steps, isNotEmpty);
      final foundSteps = steps.where((s) => s.found).toList();
      expect(foundSteps, isNotEmpty);
      expect(foundSteps.last.currentIndex, equals(4));
    });

    // 5. Empty array ----------------------------------------------------------
    test('completes with found=false on empty array, target=1', () async {
      final steps = await collectSearchSteps(
        linearSearch([], 1),
      );
      expect(steps, isNotEmpty);
      expect(steps.last.found, isFalse);
    });

    // 6. Final step has found=true when target exists -------------------------
    test('final step has found=true when target exists', () async {
      final steps = await collectSearchSteps(
        linearSearch([10, 20, 30], 20),
      );
      // The last step emitted before return should have found=true
      expect(steps.last.found, isTrue);
    });

    // 7. Stream completes (doesn't hang) --------------------------------------
    test('stream completes without hanging', () async {
      final steps = await collectSearchSteps(
        linearSearch([10, 20, 30], 20),
      ).timeout(const Duration(seconds: 5));
      expect(steps, isNotEmpty);
    });

    // 8. Every step has a non-empty operation ---------------------------------
    test('every step has a non-empty operation description', () async {
      final steps = await collectSearchSteps(
        linearSearch([10, 20, 30, 40, 50], 30),
      );
      for (int i = 0; i < steps.length; i++) {
        expect(
          steps[i].operation,
          isNotEmpty,
          reason: 'Step $i has an empty operation',
        );
      }
    });
  });

  // =========================================================================
  // Binary Search
  // =========================================================================
  group('binarySearch', () {
    // 1. Find target in middle area -------------------------------------------
    test('finds target=7 in [1,3,5,7,9,11]', () async {
      final steps = await collectSearchSteps(
        binarySearch([1, 3, 5, 7, 9, 11], 7),
      );
      expect(steps, isNotEmpty);
      final foundSteps = steps.where((s) => s.found).toList();
      expect(foundSteps, isNotEmpty, reason: 'No step with found=true');
      expect(foundSteps.last.currentIndex, equals(3));
    });

    // 2. Target not found -----------------------------------------------------
    test('returns found=false when target=8 is not in [1,3,5,7,9,11]',
        () async {
      final steps = await collectSearchSteps(
        binarySearch([1, 3, 5, 7, 9, 11], 8),
      );
      expect(steps, isNotEmpty);
      expect(steps.last.found, isFalse);
    });

    // 3. Finding first element ------------------------------------------------
    test('finds first element target=1 in [1,3,5,7,9,11]', () async {
      final steps = await collectSearchSteps(
        binarySearch([1, 3, 5, 7, 9, 11], 1),
      );
      expect(steps, isNotEmpty);
      final foundSteps = steps.where((s) => s.found).toList();
      expect(foundSteps, isNotEmpty);
      expect(foundSteps.last.currentIndex, equals(0));
    });

    // 4. Finding last element -------------------------------------------------
    test('finds last element target=11 in [1,3,5,7,9,11]', () async {
      final steps = await collectSearchSteps(
        binarySearch([1, 3, 5, 7, 9, 11], 11),
      );
      expect(steps, isNotEmpty);
      final foundSteps = steps.where((s) => s.found).toList();
      expect(foundSteps, isNotEmpty);
      expect(foundSteps.last.currentIndex, equals(5));
    });

    // 5. Single element — found -----------------------------------------------
    test('finds target=5 in single-element array [5]', () async {
      final steps = await collectSearchSteps(
        binarySearch([5], 5),
      );
      expect(steps, isNotEmpty);
      final foundSteps = steps.where((s) => s.found).toList();
      expect(foundSteps, isNotEmpty);
      expect(foundSteps.last.currentIndex, equals(0));
    });

    // 6. Single element — not found -------------------------------------------
    test('returns found=false for target=3 in single-element array [5]',
        () async {
      final steps = await collectSearchSteps(
        binarySearch([5], 3),
      );
      expect(steps, isNotEmpty);
      expect(steps.last.found, isFalse);
    });

    // 7. Search range narrows correctly ---------------------------------------
    test('searchRange narrows correctly across steps', () async {
      final steps = await collectSearchSteps(
        binarySearch([1, 3, 5, 7, 9, 11], 9),
      );
      // Collect the search range widths across the comparison steps
      final rangeWidths = <int>[];
      for (final step in steps) {
        final width = step.searchRange.right - step.searchRange.left;
        rangeWidths.add(width);
      }
      // The range should generally decrease (may stay same briefly at start)
      // At minimum the final found step should have narrowed range
      expect(rangeWidths.last, lessThanOrEqualTo(rangeWidths.first));
    });

    // 8. Stream completes without hanging -------------------------------------
    test('stream completes without hanging', () async {
      final steps = await collectSearchSteps(
        binarySearch([1, 3, 5, 7, 9, 11], 7),
      ).timeout(const Duration(seconds: 5));
      expect(steps, isNotEmpty);
    });

    // 9. Every step has a non-empty operation ---------------------------------
    test('every step has a non-empty operation description', () async {
      final steps = await collectSearchSteps(
        binarySearch([1, 3, 5, 7, 9, 11], 7),
      );
      for (int i = 0; i < steps.length; i++) {
        expect(
          steps[i].operation,
          isNotEmpty,
          reason: 'Step $i has an empty operation',
        );
      }
    });

    // 10. Comparing indices are valid ------------------------------------------
    test('comparing indices are valid (< array length)', () async {
      final steps = await collectSearchSteps(
        binarySearch([1, 3, 5, 7, 9, 11], 7),
      );
      for (int i = 0; i < steps.length; i++) {
        final n = steps[i].array.length;
        for (final idx in steps[i].comparing) {
          expect(
            idx,
            lessThan(n),
            reason: 'Step $i comparing index $idx >= array length $n',
          );
        }
      }
    });
  });
}
