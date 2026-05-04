/// Represents a single step in a dynamic programming algorithm visualization.
///
/// Used for visualizing DP algorithms like Fibonacci, Knapsack, LCS, etc.
class DPStep {
  /// Current state of the array/table.
  final List<int> array;

  /// Indices currently being compared.
  final List<int> comparing;

  /// Indices currently being swapped.
  final List<int> swapping;

  /// Indices that are in their final position.
  final List<int> sorted;

  /// Memoization table storing computed results.
  final Map<dynamic, int> memo;

  /// The current index being processed.
  final int currentIndex;

  /// Human-readable description of the current operation.
  final String operation;

  /// Line number in the pseudocode being executed.
  final int line;

  /// The current call stack (for recursive DP like Fibonacci).
  final List<int>? callStack;

  /// The computed result (set when algorithm completes).
  final int? result;

  const DPStep({
    required this.array,
    this.comparing = const [],
    this.swapping = const [],
    this.sorted = const [],
    this.memo = const {},
    this.currentIndex = -1,
    required this.operation,
    required this.line,
    this.callStack,
    this.result,
  });

  DPStep copyWith({
    List<int>? array,
    List<int>? comparing,
    List<int>? swapping,
    List<int>? sorted,
    Map<dynamic, int>? memo,
    int? currentIndex,
    String? operation,
    int? line,
    List<int>? callStack,
    int? result,
  }) {
    return DPStep(
      array: array ?? this.array,
      comparing: comparing ?? this.comparing,
      swapping: swapping ?? this.swapping,
      sorted: sorted ?? this.sorted,
      memo: memo ?? this.memo,
      currentIndex: currentIndex ?? this.currentIndex,
      operation: operation ?? this.operation,
      line: line ?? this.line,
      callStack: callStack ?? this.callStack,
      result: result ?? this.result,
    );
  }

  @override
  String toString() {
    return 'DPStep(array: $array, currentIndex: $currentIndex, memo: $memo, '
        'operation: $operation, line: $line, callStack: $callStack, result: $result)';
  }
}
