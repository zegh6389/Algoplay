import 'package:flutter_test/flutter_test.dart';
import 'package:algoplay/algorithms/dp/dp_algorithms.dart';

Future<List<T>> _collect<T>(Stream<T> stream) async {
  final steps = <T>[];
  await for (final step in stream.timeout(const Duration(seconds: 5))) {
    steps.add(step);
  }
  return steps;
}

void main() {
  group('fibonacciDp', () {
    test('computes fib(6) without null-check crashes', () async {
      final steps = await _collect(fibonacciDp(6));
      expect(steps, isNotEmpty);
      expect(steps.last.result, equals(8));
      expect(steps.last.operation, contains('Complete'));
    });

    test('handles fib(0)', () async {
      final steps = await _collect(fibonacciDp(0));
      expect(steps.last.result, equals(0));
    });
  });
}
