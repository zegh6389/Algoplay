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

  /// Indices currently being *placed* / written into their final slot — e.g. a
  /// merge-sort merge write or an insertion-sort shift. Distinct from a true
  /// two-element swap so the visualizer can render it differently.
  final List<int> placements;

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
    this.placements = const [],
    this.sorted = const [],
    this.pivot,
    required this.operation,
    required this.line,
  });

  SortStep copyWith({
    List<int>? array,
    List<int>? comparing,
    List<int>? swapping,
    List<int>? placements,
    List<int>? sorted,
    int? pivot,
    String? operation,
    int? line,
  }) {
    return SortStep(
      array: array ?? this.array,
      comparing: comparing ?? this.comparing,
      swapping: swapping ?? this.swapping,
      placements: placements ?? this.placements,
      sorted: sorted ?? this.sorted,
      pivot: pivot ?? this.pivot,
      operation: operation ?? this.operation,
      line: line ?? this.line,
    );
  }

  @override
  String toString() {
    return 'SortStep(array: $array, comparing: $comparing, swapping: $swapping, '
        'placements: $placements, sorted: $sorted, pivot: $pivot, '
        'operation: $operation, line: $line)';
  }
}
