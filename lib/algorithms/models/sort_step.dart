/// Represents a single step in a sorting algorithm visualization.
///
/// Each step captures the complete state of the array and metadata about
/// what operation is being performed at that point in the algorithm.
class SortStep {
  /// Current state of the array.
  final List<int> array;

  /// Indices currently being compared.
  final List<int> comparing;

  /// Indices currently being swapped.
  final List<int> swapping;

  /// Indices that are in their final sorted position.
  final List<int> sorted;

  /// Index of the pivot element (used in quicksort).
  final int? pivot;

  /// Human-readable description of the current operation.
  final String operation;

  /// Line number in the pseudocode being executed.
  final int line;

  const SortStep({
    required this.array,
    this.comparing = const [],
    this.swapping = const [],
    this.sorted = const [],
    this.pivot,
    required this.operation,
    required this.line,
  });

  SortStep copyWith({
    List<int>? array,
    List<int>? comparing,
    List<int>? swapping,
    List<int>? sorted,
    int? pivot,
    String? operation,
    int? line,
  }) {
    return SortStep(
      array: array ?? this.array,
      comparing: comparing ?? this.comparing,
      swapping: swapping ?? this.swapping,
      sorted: sorted ?? this.sorted,
      pivot: pivot ?? this.pivot,
      operation: operation ?? this.operation,
      line: line ?? this.line,
    );
  }

  @override
  String toString() {
    return 'SortStep(array: $array, comparing: $comparing, swapping: $swapping, '
        'sorted: $sorted, pivot: $pivot, operation: $operation, line: $line)';
  }
}
