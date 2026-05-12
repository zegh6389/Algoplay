import 'dart:math';
import '../models/sort_step.dart';

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

/// Time complexity descriptor for an algorithm.
class TimeComplexity {
  final String best;
  final String average;
  final String worst;
  const TimeComplexity({
    required this.best,
    required this.average,
    required this.worst,
  });
}

/// Metadata for a sorting algorithm.
class SortAlgorithm {
  final String name;
  final TimeComplexity timeComplexity;
  final String spaceComplexity;
  final List<String> pseudocode;
  final List<String> pythonCode;

  const SortAlgorithm({
    required this.name,
    required this.timeComplexity,
    required this.spaceComplexity,
    required this.pseudocode,
    required this.pythonCode,
  });
}

// ---------------------------------------------------------------------------
// Algorithm registry
// ---------------------------------------------------------------------------

const List<SortAlgorithm> sortAlgorithms = [
  bubbleSortMeta,
  selectionSortMeta,
  insertionSortMeta,
  mergeSortMeta,
  quickSortMeta,
  heapSortMeta,
];

const bubbleSortMeta = SortAlgorithm(
  name: 'Bubble Sort',
  timeComplexity: TimeComplexity(best: 'O(n)', average: 'O(n²)', worst: 'O(n²)'),
  spaceComplexity: 'O(1)',
  pseudocode: [
    'procedure bubbleSort(A: list)',
    '  n = length(A)',
    '  for i = 0 to n-1',
    '    for j = 0 to n-i-2',
    '      if A[j] > A[j+1]',
    '        swap(A[j], A[j+1])',
    '    end for',
    '  end for',
    'end procedure',
  ],
  pythonCode: [
    'def bubble_sort(arr):',
    '    n = len(arr)',
    '    for i in range(n):',
    '        for j in range(0, n - i - 1):',
    '            if arr[j] > arr[j + 1]:',
    '                arr[j], arr[j + 1] = arr[j + 1], arr[j]',
    '    return arr',
  ],
);

const selectionSortMeta = SortAlgorithm(
  name: 'Selection Sort',
  timeComplexity: TimeComplexity(best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)'),
  spaceComplexity: 'O(1)',
  pseudocode: [
    'procedure selectionSort(A: list)',
    '  n = length(A)',
    '  for i = 0 to n-1',
    '    minIdx = i',
    '    for j = i+1 to n-1',
    '      if A[j] < A[minIdx]',
    '        minIdx = j',
    '    swap(A[i], A[minIdx])',
    '  end for',
    'end procedure',
  ],
  pythonCode: [
    'def selection_sort(arr):',
    '    n = len(arr)',
    '    for i in range(n):',
    '        min_idx = i',
    '        for j in range(i + 1, n):',
    '            if arr[j] < arr[min_idx]:',
    '                min_idx = j',
    '        arr[i], arr[min_idx] = arr[min_idx], arr[i]',
    '    return arr',
  ],
);

const insertionSortMeta = SortAlgorithm(
  name: 'Insertion Sort',
  timeComplexity: TimeComplexity(best: 'O(n)', average: 'O(n²)', worst: 'O(n²)'),
  spaceComplexity: 'O(1)',
  pseudocode: [
    'procedure insertionSort(A: list)',
    '  n = length(A)',
    '  for i = 1 to n-1',
    '    key = A[i]',
    '    j = i - 1',
    '    while j >= 0 and A[j] > key',
    '      A[j+1] = A[j]',
    '      j = j - 1',
    '    A[j+1] = key',
    '  end for',
    'end procedure',
  ],
  pythonCode: [
    'def insertion_sort(arr):',
    '    for i in range(1, len(arr)):',
    '        key = arr[i]',
    '        j = i - 1',
    '        while j >= 0 and arr[j] > key:',
    '            arr[j + 1] = arr[j]',
    '            j -= 1',
    '        arr[j + 1] = key',
    '    return arr',
  ],
);

const mergeSortMeta = SortAlgorithm(
  name: 'Merge Sort',
  timeComplexity: TimeComplexity(best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)'),
  spaceComplexity: 'O(n)',
  pseudocode: [
    'procedure mergeSort(A, left, right)',
    '  if left < right',
    '    mid = (left + right) / 2',
    '    mergeSort(A, left, mid)',
    '    mergeSort(A, mid+1, right)',
    '    merge(A, left, mid, right)',
    '  end if',
    'end procedure',
    '',
    'procedure merge(A, left, mid, right)',
    '  create temp arrays L, R',
    '  i = 0, j = 0, k = left',
    '  while i < len(L) and j < len(R)',
    '    if L[i] <= R[j]',
    '      A[k] = L[i]; i++',
    '    else',
    '      A[k] = R[j]; j++',
    '    k++',
    '  copy remaining elements',
    'end procedure',
  ],
  pythonCode: [
    'def merge_sort(arr):',
    '    if len(arr) > 1:',
    '        mid = len(arr) // 2',
    '        left = arr[:mid]',
    '        right = arr[mid:]',
    '        merge_sort(left)',
    '        merge_sort(right)',
    '        i = j = k = 0',
    '        while i < len(left) and j < len(right):',
    '            if left[i] <= right[j]:',
    '                arr[k] = left[i]; i += 1',
    '            else:',
    '                arr[k] = right[j]; j += 1',
    '            k += 1',
    '        while i < len(left):',
    '            arr[k] = left[i]; i += 1; k += 1',
    '        while j < len(right):',
    '            arr[k] = right[j]; j += 1; k += 1',
    '    return arr',
  ],
);

const quickSortMeta = SortAlgorithm(
  name: 'Quick Sort',
  timeComplexity: TimeComplexity(best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)'),
  spaceComplexity: 'O(log n)',
  pseudocode: [
    'procedure quickSort(A, low, high)',
    '  if low < high',
    '    pivotIdx = partition(A, low, high)',
    '    quickSort(A, low, pivotIdx - 1)',
    '    quickSort(A, pivotIdx + 1, high)',
    '  end if',
    'end procedure',
    '',
    'procedure partition(A, low, high)',
    '  pivot = A[high]',
    '  i = low - 1',
    '  for j = low to high-1',
    '    if A[j] < pivot',
    '      i++',
    '      swap(A[i], A[j])',
    '  swap(A[i+1], A[high])',
    '  return i+1',
    'end procedure',
  ],
  pythonCode: [
    'def quick_sort(arr, low=0, high=None):',
    '    if high is None:',
    '        high = len(arr) - 1',
    '    if low < high:',
    '        pi = partition(arr, low, high)',
    '        quick_sort(arr, low, pi - 1)',
    '        quick_sort(arr, pi + 1, high)',
    '',
    'def partition(arr, low, high):',
    '    pivot = arr[high]',
    '    i = low - 1',
    '    for j in range(low, high):',
    '        if arr[j] < pivot:',
    '            i += 1',
    '            arr[i], arr[j] = arr[j], arr[i]',
    '    arr[i + 1], arr[high] = arr[high], arr[i + 1]',
    '    return i + 1',
  ],
);

const heapSortMeta = SortAlgorithm(
  name: 'Heap Sort',
  timeComplexity: TimeComplexity(best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)'),
  spaceComplexity: 'O(1)',
  pseudocode: [
    'procedure heapSort(A)',
    '  n = length(A)',
    '  // Build max heap',
    '  for i = n/2 - 1 downto 0',
    '    heapify(A, n, i)',
    '  // Extract elements',
    '  for i = n-1 downto 1',
    '    swap(A[0], A[i])',
    '    heapify(A, i, 0)',
    'end procedure',
    '',
    'procedure heapify(A, n, i)',
    '  largest = i',
    '  left = 2*i + 1',
    '  right = 2*i + 2',
    '  if left < n and A[left] > A[largest]',
    '    largest = left',
    '  if right < n and A[right] > A[largest]',
    '    largest = right',
    '  if largest != i',
    '    swap(A[i], A[largest])',
    '    heapify(A, n, largest)',
    'end procedure',
  ],
  pythonCode: [
    'def heap_sort(arr):',
    '    n = len(arr)',
    '    for i in range(n // 2 - 1, -1, -1):',
    '        heapify(arr, n, i)',
    '    for i in range(n - 1, 0, -1):',
    '        arr[0], arr[i] = arr[i], arr[0]',
    '        heapify(arr, i, 0)',
    '    return arr',
    '',
    'def heapify(arr, n, i):',
    '    largest = i',
    '    l = 2 * i + 1',
    '    r = 2 * i + 2',
    '    if l < n and arr[l] > arr[largest]:',
    '        largest = l',
    '    if r < n and arr[r] > arr[largest]:',
    '        largest = r',
    '    if largest != i:',
    '        arr[i], arr[largest] = arr[largest], arr[i]',
    '        heapify(arr, n, largest)',
  ],
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

final _random = Random();

/// Generates a list of [size] random integers in the range [0, max].
List<int> generateRandomArray(int size, {int max = 100}) {
  return List.generate(size, (_) => _random.nextInt(max) + 1);
}

// ---------------------------------------------------------------------------
// Sorting algorithm generators
// ---------------------------------------------------------------------------

/// Bubble Sort — O(n²) average.
Stream<SortStep> bubbleSort(List<int> initialArray) async* {
  final arr = List<int>.from(initialArray);
  final n = arr.length;
  final sorted = <int>[];

  yield SortStep(
    array: List.from(arr),
    sorted: List.from(sorted),
    operation: 'Starting Bubble Sort',
    line: 1,
  );

  for (int i = 0; i < n - 1; i++) {
    bool swapped = false;

    yield SortStep(
      array: List.from(arr),
      sorted: List.from(sorted),
      operation: 'Pass ${i + 1}: scanning unsorted portion',
      line: 3,
    );

    for (int j = 0; j < n - i - 1; j++) {
      yield SortStep(
        array: List.from(arr),
        comparing: [j, j + 1],
        sorted: List.from(sorted),
        operation: 'Comparing arr[$j]=${arr[j]} and arr[${j + 1}]=${arr[j + 1]}',
        line: 5,
      );

      if (arr[j] > arr[j + 1]) {
        // Swap
        final temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swapped = true;

        yield SortStep(
          array: List.from(arr),
          swapping: [j, j + 1],
          sorted: List.from(sorted),
          operation: 'Swapped ${arr[j]} and ${arr[j + 1]}',
          line: 6,
        );
      }
    }

    sorted.insert(0, n - i - 1);

    if (!swapped) {
      // Array is sorted — mark all remaining as sorted
      sorted.clear();
      sorted.addAll(List.generate(n, (idx) => idx));
      yield SortStep(
        array: List.from(arr),
        sorted: List.from(sorted),
        operation: 'No swaps in this pass — array is sorted!',
        line: 3,
      );
      return;
    }
  }

  sorted.clear();
  sorted.addAll(List.generate(n, (idx) => idx));
  yield SortStep(
    array: List.from(arr),
    sorted: List.from(sorted),
    operation: 'Bubble Sort complete!',
    line: 8,
  );
}

/// Selection Sort — O(n²) always.
Stream<SortStep> selectionSort(List<int> initialArray) async* {
  final arr = List<int>.from(initialArray);
  final n = arr.length;
  final sorted = <int>[];

  yield SortStep(
    array: List.from(arr),
    sorted: List.from(sorted),
    operation: 'Starting Selection Sort',
    line: 1,
  );

  for (int i = 0; i < n - 1; i++) {
    int minIdx = i;

    yield SortStep(
      array: List.from(arr),
      comparing: [i],
      sorted: List.from(sorted),
      operation: 'Pass ${i + 1}: finding minimum from index $i',
      line: 4,
    );

    for (int j = i + 1; j < n; j++) {
      yield SortStep(
        array: List.from(arr),
        comparing: [minIdx, j],
        sorted: List.from(sorted),
        operation: 'Comparing arr[$minIdx]=${arr[minIdx]} with arr[$j]=${arr[j]}',
        line: 6,
      );

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        yield SortStep(
          array: List.from(arr),
          comparing: [minIdx],
          sorted: List.from(sorted),
          operation: 'New minimum found at index $minIdx: ${arr[minIdx]}',
          line: 7,
        );
      }
    }

    if (minIdx != i) {
      yield SortStep(
        array: List.from(arr),
        swapping: [i, minIdx],
        sorted: List.from(sorted),
        operation: 'Swapping arr[$i]=${arr[i]} with arr[$minIdx]=${arr[minIdx]}',
        line: 8,
      );

      final temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;

      yield SortStep(
        array: List.from(arr),
        swapping: [i, minIdx],
        sorted: List.from(sorted),
        operation: 'Swapped: arr[$i]=${arr[i]}, arr[$minIdx]=${arr[minIdx]}',
        line: 8,
      );
    }

    sorted.add(i);
  }

  sorted.add(n - 1);
  yield SortStep(
    array: List.from(arr),
    sorted: List.from(sorted),
    operation: 'Selection Sort complete!',
    line: 10,
  );
}

/// Insertion Sort — O(n) best, O(n²) worst.
Stream<SortStep> insertionSort(List<int> initialArray) async* {
  final arr = List<int>.from(initialArray);
  final n = arr.length;
  final sorted = <int>[0]; // First element is trivially sorted

  yield SortStep(
    array: List.from(arr),
    sorted: List.from(sorted),
    operation: 'Starting Insertion Sort — first element is already sorted',
    line: 1,
  );

  for (int i = 1; i < n; i++) {
    final key = arr[i];
    int j = i - 1;

    yield SortStep(
      array: List.from(arr),
      comparing: [i],
      sorted: List.from(sorted),
      operation: 'Picking element arr[$i] = $key to insert',
      line: 3,
    );

    while (j >= 0 && arr[j] > key) {
      yield SortStep(
        array: List.from(arr),
        comparing: [j, j + 1],
        sorted: List.from(sorted),
        operation: 'Shifting arr[$j]=${arr[j]} to the right (>$key)',
        line: 6,
      );

      arr[j + 1] = arr[j];
      j--;

      yield SortStep(
        array: List.from(arr),
        swapping: [j + 1, j + 2],
        sorted: List.from(sorted),
        operation: 'Shifted element right',
        line: 7,
      );
    }

    arr[j + 1] = key;
    sorted.add(i);

    yield SortStep(
      array: List.from(arr),
      sorted: List.from(sorted),
      comparing: [j + 1],
      operation: 'Inserted $key at position ${j + 1}',
      line: 9,
    );
  }

  sorted.clear();
  sorted.addAll(List.generate(n, (idx) => idx));
  yield SortStep(
    array: List.from(arr),
    sorted: List.from(sorted),
    operation: 'Insertion Sort complete!',
    line: 10,
  );
}

/// Merge Sort — O(n log n) always.
Stream<SortStep> mergeSort(List<int> initialArray) async* {
  final arr = List<int>.from(initialArray);
  final n = arr.length;

  yield SortStep(
    array: List.from(arr),
    operation: 'Starting Merge Sort',
    line: 1,
  );

  yield* _mergeSortHelper(arr, 0, n - 1);

  yield SortStep(
    array: List.from(arr),
    sorted: List.generate(n, (i) => i),
    operation: 'Merge Sort complete!',
    line: 9,
  );
}

Stream<SortStep> _mergeSortHelper(List<int> arr, int left, int right) async* {
  if (left < right) {
    final mid = (left + right) ~/ 2;

    yield SortStep(
      array: List.from(arr),
      comparing: [left, mid, right],
      operation: 'Dividing: [$left..$mid] and [${mid + 1}..$right]',
      line: 3,
    );

    yield* _mergeSortHelper(arr, left, mid);
    yield* _mergeSortHelper(arr, mid + 1, right);
    yield* _merge(arr, left, mid, right);
  }
}

Stream<SortStep> _merge(List<int> arr, int left, int mid, int right) async* {
  final leftArr = arr.sublist(left, mid + 1);
  final rightArr = arr.sublist(mid + 1, right + 1);

  yield SortStep(
    array: List.from(arr),
    comparing: List.generate(right - left + 1, (i) => left + i),
    operation: 'Merging subarrays [$left..$mid] and [${mid + 1}..$right]',
    line: 11,
  );

  int i = 0, j = 0, k = left;

  while (i < leftArr.length && j < rightArr.length) {
    yield SortStep(
      array: List.from(arr),
      comparing: [k, left + i, mid + 1 + j],
      operation: 'Comparing ${leftArr[i]} (pos ${left + i}) and ${rightArr[j]} (pos ${mid + 1 + j})',
      line: 14,
    );

    if (leftArr[i] <= rightArr[j]) {
      arr[k] = leftArr[i];
      i++;
    } else {
      arr[k] = rightArr[j];
      j++;
    }

    yield SortStep(
      array: List.from(arr),
      swapping: [k],
      operation: 'Placed ${arr[k]} at position $k',
      line: 18,
    );
    k++;
  }

  while (i < leftArr.length) {
    arr[k] = leftArr[i];
    yield SortStep(
      array: List.from(arr),
      swapping: [k],
      operation: 'Copying remaining left element ${arr[k]} to position $k',
      line: 20,
    );
    i++;
    k++;
  }

  while (j < rightArr.length) {
    arr[k] = rightArr[j];
    yield SortStep(
      array: List.from(arr),
      swapping: [k],
      operation: 'Copying remaining right element ${arr[k]} to position $k',
      line: 20,
    );
    j++;
    k++;
  }
}

/// Quick Sort — O(n log n) average, O(n²) worst.
Stream<SortStep> quickSort(List<int> initialArray) async* {
  final arr = List<int>.from(initialArray);
  final n = arr.length;

  yield SortStep(
    array: List.from(arr),
    operation: 'Starting Quick Sort',
    line: 1,
  );

  yield* _quickSortHelper(arr, 0, n - 1);

  yield SortStep(
    array: List.from(arr),
    sorted: List.generate(n, (i) => i),
    operation: 'Quick Sort complete!',
    line: 6,
  );
}

Stream<SortStep> _quickSortHelper(List<int> arr, int low, int high) async* {
  if (low < high) {
    yield SortStep(
      array: List.from(arr),
      comparing: [low, high],
      operation: 'QuickSort on subarray [$low..$high]',
      line: 2,
    );

    // Partition
    final pivot = arr[high];
    int i = low - 1;

    yield SortStep(
      array: List.from(arr),
      pivot: high,
      operation: 'Pivot selected: arr[$high] = $pivot',
      line: 10,
    );

    for (int j = low; j < high; j++) {
      yield SortStep(
        array: List.from(arr),
        comparing: [j],
        pivot: high,
        operation: 'Comparing arr[$j]=${arr[j]} with pivot $pivot',
        line: 13,
      );

      if (arr[j] < pivot) {
        i++;
        if (i != j) {
          yield SortStep(
            array: List.from(arr),
            swapping: [i, j],
            pivot: high,
            operation: 'Swapping arr[$i]=${arr[i]} and arr[$j]=${arr[j]}',
            line: 15,
          );

          final temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;
        }
      }
    }

    // Place pivot in correct position
    final pivotIdx = i + 1;
    if (pivotIdx != high) {
      yield SortStep(
        array: List.from(arr),
        swapping: [pivotIdx, high],
        pivot: high,
        operation: 'Placing pivot: swapping arr[$pivotIdx] and arr[$high]',
        line: 16,
      );

      final temp = arr[pivotIdx];
      arr[pivotIdx] = arr[high];
      arr[high] = temp;
    }

    yield SortStep(
      array: List.from(arr),
      pivot: pivotIdx,
      sorted: [pivotIdx],
      operation: 'Pivot $pivot is now at its correct position $pivotIdx',
      line: 16,
    );

    yield* _quickSortHelper(arr, low, pivotIdx - 1);
    yield* _quickSortHelper(arr, pivotIdx + 1, high);
  }
}

/// Heap Sort — O(n log n) always.
Stream<SortStep> heapSort(List<int> initialArray) async* {
  final arr = List<int>.from(initialArray);
  final n = arr.length;
  final sorted = <int>[];

  yield SortStep(
    array: List.from(arr),
    operation: 'Starting Heap Sort — building max heap',
    line: 1,
  );

  // Build max heap
  for (int i = (n ~/ 2) - 1; i >= 0; i--) {
    yield* _heapify(arr, n, i, sorted);
  }

  yield SortStep(
    array: List.from(arr),
    operation: 'Max heap built. Now extracting elements.',
    line: 6,
  );

  // Extract elements from heap one by one
  for (int i = n - 1; i > 0; i--) {
    yield SortStep(
      array: List.from(arr),
      swapping: [0, i],
      sorted: List.from(sorted),
      operation: 'Swapping root arr[0]=${arr[0]} with arr[$i]=${arr[i]}',
      line: 7,
    );

    final temp = arr[0];
    arr[0] = arr[i];
    arr[i] = temp;

    sorted.insert(0, i);

    yield SortStep(
      array: List.from(arr),
      sorted: List.from(sorted),
      operation: 'Extracted ${arr[i]} to sorted position',
      line: 8,
    );

    yield* _heapify(arr, i, 0, sorted);
  }

  sorted.insert(0, 0);
  yield SortStep(
    array: List.from(arr),
    sorted: List.generate(n, (i) => i),
    operation: 'Heap Sort complete!',
    line: 10,
  );
}

Stream<SortStep> _heapify(List<int> arr, int n, int i, List<int> sorted) async* {
  int largest = i;
  final left = 2 * i + 1;
  final right = 2 * i + 2;

  if (left < n) {
    yield SortStep(
      array: List.from(arr),
      comparing: [largest, left],
      sorted: List.from(sorted),
      operation: 'Comparing arr[$largest]=${arr[largest]} with left child arr[$left]=${arr[left]}',
      line: 19,
    );

    if (arr[left] > arr[largest]) {
      largest = left;
    }
  }

  if (right < n) {
    yield SortStep(
      array: List.from(arr),
      comparing: [largest, right],
      sorted: List.from(sorted),
      operation: 'Comparing arr[$largest]=${arr[largest]} with right child arr[$right]=${arr[right]}',
      line: 21,
    );

    if (arr[right] > arr[largest]) {
      largest = right;
    }
  }

  if (largest != i) {
    yield SortStep(
      array: List.from(arr),
      swapping: [i, largest],
      sorted: List.from(sorted),
      operation: 'Swapping arr[$i]=${arr[i]} with arr[$largest]=${arr[largest]}',
      line: 24,
    );

    final temp = arr[i];
    arr[i] = arr[largest];
    arr[largest] = temp;

    yield SortStep(
      array: List.from(arr),
      swapping: [i, largest],
      sorted: List.from(sorted),
      operation: 'Heapify: swapped, checking subtree',
      line: 25,
    );

    yield* _heapify(arr, n, largest, sorted);
  }
}
