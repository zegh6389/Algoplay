/// Represents a single step in a searching algorithm visualization.
///
/// Each step captures the array state, current search position, range
/// being searched, and metadata about the operation being performed.
class SearchStep {
  /// The array being searched.
  final List<int> array;

  /// The target value being searched for.
  final int target;

  /// The index currently being examined.
  final int currentIndex;

  /// The current search range (for binary search).
  final ({int left, int right}) searchRange;

  /// Indices currently being compared against the target.
  final List<int> comparing;

  /// Whether the target has been found.
  final bool found;

  /// Indices that have been eliminated from consideration.
  final List<int> eliminated;

  /// Human-readable description of the current operation.
  final String operation;

  /// Line number in the pseudocode being executed.
  final int line;

  const SearchStep({
    required this.array,
    required this.target,
    this.currentIndex = -1,
    required this.searchRange,
    this.comparing = const [],
    this.found = false,
    this.eliminated = const [],
    required this.operation,
    required this.line,
  });

  SearchStep copyWith({
    List<int>? array,
    int? target,
    int? currentIndex,
    ({int left, int right})? searchRange,
    List<int>? comparing,
    bool? found,
    List<int>? eliminated,
    String? operation,
    int? line,
  }) {
    return SearchStep(
      array: array ?? this.array,
      target: target ?? this.target,
      currentIndex: currentIndex ?? this.currentIndex,
      searchRange: searchRange ?? this.searchRange,
      comparing: comparing ?? this.comparing,
      found: found ?? this.found,
      eliminated: eliminated ?? this.eliminated,
      operation: operation ?? this.operation,
      line: line ?? this.line,
    );
  }

  @override
  String toString() {
    return 'SearchStep(array: $array, target: $target, currentIndex: $currentIndex, '
        'searchRange: $searchRange, comparing: $comparing, found: $found, '
        'eliminated: $eliminated, operation: $operation, line: $line)';
  }
}
