import 'dart:async';
import 'package:flutter_test/flutter_test.dart';
import 'package:algoplay/algorithms/sorting/sorting_algorithms.dart';
import 'package:algoplay/algorithms/models/sort_step.dart';

// ---------------------------------------------------------------------------
// Helper: collect all steps from a Stream<SortStep> into a List
// ---------------------------------------------------------------------------
Future<List<SortStep>> collectSteps(Stream<SortStep> stream) async {
  return await stream.toList();
}

// ---------------------------------------------------------------------------
// Shared validators
// ---------------------------------------------------------------------------

/// Every step must have a non-empty operation description.
void expectNonEmptyOperations(List<SortStep> steps) {
  for (int i = 0; i < steps.length; i++) {
    expect(
      steps[i].operation,
      isNotEmpty,
      reason: 'Step $i has an empty operation',
    );
  }
}

/// Every comparing / swapping index must be < array.length.
void expectValidIndices(List<SortStep> steps) {
  for (int i = 0; i < steps.length; i++) {
    final n = steps[i].array.length;
    for (final idx in steps[i].comparing) {
      expect(
        idx,
        lessThan(n),
        reason: 'Step $i comparing index $idx >= array length $n',
      );
    }
    for (final idx in steps[i].swapping) {
      expect(
        idx,
        lessThan(n),
        reason: 'Step $i swapping index $idx >= array length $n',
      );
    }
  }
}

/// Verify the final step's array equals the expected sorted list.
void expectFinalArraySorted(
  List<SortStep> steps,
  List<int> expected, {
  String? algorithm,
}) {
  expect(steps, isNotEmpty, reason: '${algorithm ?? "Algorithm"} produced no steps');
  final last = steps.last;
  expect(
    last.array,
    orderedEquals(expected),
    reason: '${algorithm ?? "Algorithm"} final array was ${last.array}, expected $expected',
  );
}

// ---------------------------------------------------------------------------
// Generic test suite builder — reused for every sorting algorithm
// ---------------------------------------------------------------------------

typedef SortGenerator = Stream<SortStep> Function(List<int>);

void testSortAlgorithm(
  String name,
  SortGenerator generator,
) {
  group(name, () {
    // 1. Reversed array -------------------------------------------------------
    test('sorts reversed array [5,4,3,2,1] to [1,2,3,4,5]', () async {
      final steps = await collectSteps(generator([5, 4, 3, 2, 1]));
      expectFinalArraySorted(steps, [1, 2, 3, 4, 5], algorithm: name);
    });

    // 2. Already sorted -------------------------------------------------------
    test('completes with already sorted array [1,2,3,4,5]', () async {
      final steps = await collectSteps(generator([1, 2, 3, 4, 5]));
      expectFinalArraySorted(steps, [1, 2, 3, 4, 5], algorithm: name);
    });

    // 3. Single element -------------------------------------------------------
    test('completes with single element [1]', () async {
      final steps = await collectSteps(generator([1]));
      expectFinalArraySorted(steps, [1], algorithm: name);
    });

    // 4. Duplicates -----------------------------------------------------------
    test('sorts array with duplicates [3,1,2,1,3] to [1,1,2,3,3]', () async {
      final steps = await collectSteps(generator([3, 1, 2, 1, 3]));
      expectFinalArraySorted(steps, [1, 1, 2, 3, 3], algorithm: name);
    });

    // 5. Non-empty operation on every step ------------------------------------
    test('every step has a non-empty operation description', () async {
      final steps = await collectSteps(generator([5, 4, 3, 2, 1]));
      expectNonEmptyOperations(steps);
    });

    // 6. Valid comparing / swapping indices -----------------------------------
    test('comparing and swapping indices are valid (< array length)', () async {
      final steps = await collectSteps(generator([5, 4, 3, 2, 1]));
      expectValidIndices(steps);
    });

    // 7. Stream completes (doesn't hang) — already proven by toList() --------
    test('stream completes without hanging', () async {
      // toList() will hang forever if the stream never closes
      final steps = await collectSteps(generator([3, 1, 2]))
          .timeout(const Duration(seconds: 5));
      expect(steps, isNotEmpty);
    });

    // 8. Step count is reasonable ---------------------------------------------
    test('step count is reasonable for 5-element array', () async {
      final steps = await collectSteps(generator([5, 4, 3, 2, 1]));
      // At least one step (start) + some work steps + a completion step.
      // Upper bound guard: sorting 5 elements should not take > 500 steps.
      expect(steps.length, greaterThanOrEqualTo(1));
      expect(steps.length, lessThanOrEqualTo(500));
    });
  });
}

// ---------------------------------------------------------------------------
// Main — register tests for all six algorithms
// ---------------------------------------------------------------------------

void main() {
  testSortAlgorithm('bubbleSort', bubbleSort);
  testSortAlgorithm('selectionSort', selectionSort);
  testSortAlgorithm('insertionSort', insertionSort);
  testSortAlgorithm('mergeSort', mergeSort);
  testSortAlgorithm('quickSort', quickSort);
  testSortAlgorithm('heapSort', heapSort);
}
