import 'package:flutter_test/flutter_test.dart';
import 'package:algoplay/algorithms/code/code_implementations.dart';
import 'package:algoplay/features/learn/data/algorithm_data.dart';

void main() {
  group('AlgorithmCodeImplementations', () {
    /// All algorithm IDs from algorithm_data.dart — the source of truth.
    final algorithmIds = allAlgorithms.map((a) => a.id).toSet();

    test('total count covers all 21 algorithms', () {
      expect(algorithmCodeImplementations.length, greaterThanOrEqualTo(21));
    });

    test('no duplicate algorithm IDs in the map', () {
      final ids = algorithmCodeImplementations.keys.toList();
      final uniqueIds = ids.toSet();
      expect(ids.length, equals(uniqueIds.length),
          reason: 'Duplicate IDs found in algorithmCodeImplementations');
    });

    test('every algorithm ID from algorithm_data.dart has a code implementation', () {
      for (final id in algorithmIds) {
        expect(
          algorithmCodeImplementations.containsKey(id),
          isTrue,
          reason: 'Missing code implementation for algorithm ID: $id',
        );
      }
    });

    test('no extra algorithm IDs beyond algorithm_data.dart', () {
      for (final id in algorithmCodeImplementations.keys) {
        expect(
          algorithmIds.contains(id),
          isTrue,
          reason: 'Extra code implementation for unknown algorithm ID: $id',
        );
      }
    });

    test('each implementation has non-empty python, java, and cpp strings', () {
      for (final entry in algorithmCodeImplementations.entries) {
        final code = entry.value;
        expect(code.python.isNotEmpty, isTrue,
            reason: 'Empty python for ${entry.key}');
        expect(code.java.isNotEmpty, isTrue,
            reason: 'Empty java for ${entry.key}');
        expect(code.cpp.isNotEmpty, isTrue,
            reason: 'Empty cpp for ${entry.key}');
      }
    });

    test('Python code contains valid function/class definition', () {
      for (final entry in algorithmCodeImplementations.entries) {
        final py = entry.value.python;
        expect(py.contains('def ') || py.contains('class '), isTrue,
            reason:
                'Python code for ${entry.key} missing "def " or "class ": $py');
      }
    });

    test('Java code contains valid method signature', () {
      for (final entry in algorithmCodeImplementations.entries) {
        final java = entry.value.java;
        expect(
          java.contains('public ') ||
              java.contains('private ') ||
              java.contains('static '),
          isTrue,
          reason:
              'Java code for ${entry.key} missing "public ", "private ", or "static ": $java',
        );
      }
    });

    test('C++ code contains valid function signature', () {
      for (final entry in algorithmCodeImplementations.entries) {
        final cpp = entry.value.cpp;
        expect(
          cpp.contains('void ') ||
              cpp.contains('int ') ||
              cpp.contains('bool '),
          isTrue,
          reason:
              'C++ code for ${entry.key} missing "void ", "int ", or "bool ": $cpp',
        );
      }
    });

    test('Python function name relates to algorithm ID', () {
      for (final entry in algorithmCodeImplementations.entries) {
        final id = entry.key;
        final py = entry.value.python;

        // Convert algorithm ID to expected snake_case function name part
        // e.g. 'bubble-sort' -> 'bubble', 'a-star' -> 'a_star', 'bst-operations' -> 'bst'
        final namePart = id.replaceAll('-', '_').split('_').first;

        expect(py.contains(namePart), isTrue,
            reason:
                'Python code for "$id" should contain "$namePart" in its function name: $py');
      }
    });
  });
}
