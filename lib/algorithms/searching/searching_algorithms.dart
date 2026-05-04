import '../models/search_step.dart';

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

/// Metadata for a searching algorithm.
class SearchAlgorithm {
  final String name;
  final String timeComplexity;
  final String spaceComplexity;
  final String description;
  final List<String> pseudocode;
  final List<String> pythonCode;

  const SearchAlgorithm({
    required this.name,
    required this.timeComplexity,
    required this.spaceComplexity,
    required this.description,
    required this.pseudocode,
    required this.pythonCode,
  });
}

// ---------------------------------------------------------------------------
// Algorithm registry
// ---------------------------------------------------------------------------

const List<SearchAlgorithm> searchAlgorithms = [
  linearSearchMeta,
  binarySearchMeta,
];

const linearSearchMeta = SearchAlgorithm(
  name: 'Linear Search',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)',
  description: 'Sequentially checks each element of the list until a match is found or the whole list has been searched.',
  pseudocode: [
    'procedure linearSearch(A: list, target: int)',
    '  for i = 0 to length(A) - 1',
    '    if A[i] == target',
    '      return i',
    '  return -1',
    'end procedure',
  ],
  pythonCode: [
    'def linear_search(arr, target):',
    '    for i in range(len(arr)):',
    '        if arr[i] == target:',
    '            return i',
    '    return -1',
  ],
);

const binarySearchMeta = SearchAlgorithm(
  name: 'Binary Search',
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(1)',
  description: 'Searches a sorted array by repeatedly dividing the search interval in half.',
  pseudocode: [
    'procedure binarySearch(A: sorted list, target: int)',
    '  left = 0',
    '  right = length(A) - 1',
    '  while left <= right',
    '    mid = (left + right) / 2',
    '    if A[mid] == target',
    '      return mid',
    '    else if A[mid] < target',
    '      left = mid + 1',
    '    else',
    '      right = mid - 1',
    '  return -1',
    'end procedure',
  ],
  pythonCode: [
    'def binary_search(arr, target):',
    '    left, right = 0, len(arr) - 1',
    '    while left <= right:',
    '        mid = (left + right) // 2',
    '        if arr[mid] == target:',
    '            return mid',
    '        elif arr[mid] < target:',
    '            left = mid + 1',
    '        else:',
    '            right = mid - 1',
    '    return -1',
  ],
);

// ---------------------------------------------------------------------------
// Searching algorithm generators
// ---------------------------------------------------------------------------

/// Linear Search — O(n).
///
/// Requires a [sortedArray] (presented as-is) and a [target].
Stream<SearchStep> linearSearch(List<int> array, int target) async* {
  final eliminated = <int>[];

  yield SearchStep(
    array: List.from(array),
    target: target,
    searchRange: (left: 0, right: array.length - 1),
    operation: 'Starting Linear Search for target = $target',
    line: 1,
  );

  for (int i = 0; i < array.length; i++) {
    yield SearchStep(
      array: List.from(array),
      target: target,
      currentIndex: i,
      searchRange: (left: 0, right: array.length - 1),
      comparing: [i],
      eliminated: List.from(eliminated),
      operation: 'Checking index $i: arr[$i] = ${array[i]}',
      line: 2,
    );

    if (array[i] == target) {
      yield SearchStep(
        array: List.from(array),
        target: target,
        currentIndex: i,
        searchRange: (left: 0, right: array.length - 1),
        comparing: [i],
        found: true,
        eliminated: List.from(eliminated),
        operation: 'Found target $target at index $i!',
        line: 4,
      );
      return;
    }

    eliminated.add(i);

    yield SearchStep(
      array: List.from(array),
      target: target,
      currentIndex: i,
      searchRange: (left: 0, right: array.length - 1),
      comparing: [],
      eliminated: List.from(eliminated),
      operation: '${array[i]} ≠ $target — eliminating index $i',
      line: 2,
    );
  }

  yield SearchStep(
    array: List.from(array),
    target: target,
    currentIndex: -1,
    searchRange: (left: 0, right: array.length - 1),
    found: false,
    eliminated: List.from(eliminated),
    operation: 'Target $target not found in array',
    line: 5,
  );
}

/// Binary Search — O(log n).
///
/// Requires a **sorted** [sortedArray] and a [target].
Stream<SearchStep> binarySearch(List<int> sortedArray, int target) async* {
  int left = 0;
  int right = sortedArray.length - 1;
  final eliminated = <int>[];

  yield SearchStep(
    array: List.from(sortedArray),
    target: target,
    searchRange: (left: left, right: right),
    operation: 'Starting Binary Search for target = $target in sorted array',
    line: 1,
  );

  while (left <= right) {
    final mid = (left + right) ~/ 2;

    yield SearchStep(
      array: List.from(sortedArray),
      target: target,
      currentIndex: mid,
      searchRange: (left: left, right: right),
      comparing: [mid],
      eliminated: List.from(eliminated),
      operation: 'Searching range [$left..$right], mid = $mid, arr[$mid] = ${sortedArray[mid]}',
      line: 4,
    );

    if (sortedArray[mid] == target) {
      yield SearchStep(
        array: List.from(sortedArray),
        target: target,
        currentIndex: mid,
        searchRange: (left: left, right: right),
        comparing: [mid],
        found: true,
        eliminated: List.from(eliminated),
        operation: 'Found target $target at index $mid!',
        line: 6,
      );
      return;
    } else if (sortedArray[mid] < target) {
      // Eliminate left half
      for (int i = left; i <= mid; i++) {
        eliminated.add(i);
      }

      left = mid + 1;

      yield SearchStep(
        array: List.from(sortedArray),
        target: target,
        currentIndex: mid,
        searchRange: (left: left, right: right),
        comparing: [],
        eliminated: List.from(eliminated),
        operation: '${sortedArray[mid]} < $target → searching right half [$left..$right]',
        line: 8,
      );
    } else {
      // Eliminate right half
      for (int i = mid; i <= right; i++) {
        eliminated.add(i);
      }

      right = mid - 1;

      yield SearchStep(
        array: List.from(sortedArray),
        target: target,
        currentIndex: mid,
        searchRange: (left: left, right: right),
        comparing: [],
        eliminated: List.from(eliminated),
        operation: '${sortedArray[mid]} > $target → searching left half [$left..$right]',
        line: 10,
      );
    }
  }

  yield SearchStep(
    array: List.from(sortedArray),
    target: target,
    currentIndex: -1,
    searchRange: (left: left, right: right),
    found: false,
    eliminated: List.from(eliminated),
    operation: 'Target $target not found in array (search range exhausted)',
    line: 11,
  );
}
