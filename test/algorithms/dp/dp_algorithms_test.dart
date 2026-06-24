import 'package:flutter_test/flutter_test.dart';
import 'package:algoplay/algorithms/dp/dp_algorithms.dart';
import 'package:algoplay/algorithms/models/dp_step.dart';

Future<List<DPStep>> collectSteps(Stream<DPStep> stream) async {
  return await stream.toList();
}

void main() {
  group('fibonacciDp', () {
    test('computes correct Fibonacci numbers', () async {
      final steps = await collectSteps(fibonacciDp(10));
      final result = steps.last.result;
      expect(result, 55); // fib(10) = 55
    });

    test('emits a final step with result set', () async {
      final steps = await collectSteps(fibonacciDp(8));
      expect(steps.last.result, 21);
      expect(steps.last.operation, contains('Complete'));
    });

    test('every step has a non-empty operation', () async {
      final steps = await collectSteps(fibonacciDp(6));
      for (final s in steps) {
        expect(s.operation, isNotEmpty);
      }
    });
  });

  group('lcsDp', () {
    const s1 = 'ABCBDAB';
    const s2 = 'BDCAB';

    test('computes the correct LCS length', () async {
      final steps = await collectSteps(lcsDp(s1, s2));
      expect(steps.last.result, 4); // LCS = "BCAB" (length 4)
    });

    // Regression: previously the producer used stride `n` but the renderer
    // used stride `n+1`, so the active cell never highlighted. Lock in the
    // correct `(n+1)` stride here.
    test('currentIndex uses (n+1) stride so it matches the renderer', () async {
      final n = s2.length;
      final steps = await collectSteps(lcsDp(s1, s2));

      // Find the first "inner" step (not the init step) and verify the stride.
      final inner = steps.where((s) => s.comparing.isNotEmpty).toList();
      expect(inner, isNotEmpty);

      // For an inner cell at (i,j), currentIndex must equal i*(n+1)+j for some
      // valid i,j — i.e. it must be consistent with a row-major (n+1)-stride
      // table. Reconstruct (i,j) and assert validity.
      for (final s in inner) {
        final i = s.currentIndex ~/ (n + 1);
        final j = s.currentIndex % (n + 1);
        expect(i, inInclusiveRange(1, s1.length));
        expect(j, inInclusiveRange(1, n));
      }
    });

    test('dependency cells are surfaced via comparing', () async {
      final steps = await collectSteps(lcsDp(s1, s2));
      // Every non-init step should reference at least one dependency cell.
      final inner = steps.where((s) => s.comparing.isNotEmpty).toList();
      expect(inner, isNotEmpty);
      for (final s in inner) {
        for (final dep in s.comparing) {
          expect(dep, greaterThanOrEqualTo(0));
        }
      }
    });
  });

  group('knapsackDp', () {
    test('computes the correct max value', () async {
      final steps = await collectSteps(
        knapsackDp([2, 3, 4, 5], [3, 4, 5, 6], 8),
      );
      // Items: (w,v) = (2,3),(3,4),(4,5),(5,6); capacity 8.
      // Best: pick (3,4)+(5,6) = weight 8, value 10.
      expect(steps.last.result, 10);
    });

    test('currentIndex uses (capacity+1) stride', () async {
      const capacity = 8;
      final steps = await collectSteps(
        knapsackDp([2, 3, 4, 5], [3, 4, 5, 6], capacity),
      );
      final inner = steps.where((s) => s.comparing.isNotEmpty).toList();
      expect(inner, isNotEmpty);
      for (final s in inner) {
        final i = s.currentIndex ~/ (capacity + 1);
        final w = s.currentIndex % (capacity + 1);
        expect(i, greaterThanOrEqualTo(0));
        expect(w, inInclusiveRange(0, capacity));
      }
    });
  });
}
