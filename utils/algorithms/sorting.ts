// Sorting Algorithms with step-by-step generation

export interface SortStep {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  pivot?: number;
  operation: string;
  line: number; // Line number in pseudocode
}

export interface SortAlgorithm {
  name: string;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  pseudocode: string[];
  pythonCode: string[];
}

// Bubble Sort
export function* bubbleSortGenerator(initialArray: number[]): Generator<SortStep> {
  const array = [...initialArray];
  const n = array.length;
  const sorted: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      yield {
        array: [...array],
        comparing: [j, j + 1],
        swapping: [],
        sorted: [...sorted],
        operation: `Comparing ${array[j]} and ${array[j + 1]}`,
        line: 3,
      };

      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        yield {
          array: [...array],
          comparing: [],
          swapping: [j, j + 1],
          sorted: [...sorted],
          operation: `Swapping ${array[j + 1]} and ${array[j]}`,
          line: 4,
        };
      }
    }
    sorted.unshift(n - 1 - i);
  }
  sorted.unshift(0);

  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    operation: 'Array is sorted!',
    line: 7,
  };
}

export const bubbleSortInfo: SortAlgorithm = {
  name: 'Bubble Sort',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
  },
  spaceComplexity: 'O(1)',
  pseudocode: [
    'function bubbleSort(array):',
    '  for i = 0 to n-1:',
    '    for j = 0 to n-i-1:',
    '      if array[j] > array[j+1]:',
    '        swap(array[j], array[j+1])',
    '  return array',
  ],
  pythonCode: [
    'def bubble_sort(arr):',
    '    n = len(arr)',
    '    for i in range(n-1):',
    '        for j in range(n-i-1):',
    '            if arr[j] > arr[j+1]:',
    '                arr[j], arr[j+1] = arr[j+1], arr[j]',
    '    return arr',
  ],
};

// Quick Sort
export function* quickSortGenerator(
  initialArray: number[],
  low: number = 0,
  high: number = initialArray.length - 1,
  array: number[] = [...initialArray],
  sorted: number[] = []
): Generator<SortStep> {
  if (low < high) {
    // Partition
    const pivot = array[high];
    let i = low - 1;

    yield {
      array: [...array],
      comparing: [],
      swapping: [],
      sorted: [...sorted],
      pivot: high,
      operation: `Selecting pivot: ${pivot}`,
      line: 2,
    };

    for (let j = low; j < high; j++) {
      yield {
        array: [...array],
        comparing: [j, high],
        swapping: [],
        sorted: [...sorted],
        pivot: high,
        operation: `Comparing ${array[j]} with pivot ${pivot}`,
        line: 5,
      };

      if (array[j] <= pivot) {
        i++;
        if (i !== j) {
          [array[i], array[j]] = [array[j], array[i]];
          yield {
            array: [...array],
            comparing: [],
            swapping: [i, j],
            sorted: [...sorted],
            pivot: high,
            operation: `Swapping ${array[j]} and ${array[i]}`,
            line: 7,
          };
        }
      }
    }

    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    const pivotIndex = i + 1;
    sorted.push(pivotIndex);

    yield {
      array: [...array],
      comparing: [],
      swapping: [i + 1, high],
      sorted: [...sorted],
      pivot: pivotIndex,
      operation: `Pivot ${pivot} placed at position ${pivotIndex}`,
      line: 9,
    };

    yield* quickSortGenerator(initialArray, low, pivotIndex - 1, array, sorted);
    yield* quickSortGenerator(initialArray, pivotIndex + 1, high, array, sorted);
  } else if (low === high && !sorted.includes(low)) {
    sorted.push(low);
  }

  if (low === 0 && high === initialArray.length - 1) {
    yield {
      array: [...array],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: array.length }, (_, i) => i),
      operation: 'Array is sorted!',
      line: 12,
    };
  }
}

export const quickSortInfo: SortAlgorithm = {
  name: 'Quick Sort',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n²)',
  },
  spaceComplexity: 'O(log n)',
  pseudocode: [
    'function quickSort(array, low, high):',
    '  if low < high:',
    '    pivot = partition(array, low, high)',
    '    quickSort(array, low, pivot-1)',
    '    quickSort(array, pivot+1, high)',
    '',
    'function partition(array, low, high):',
    '  pivot = array[high]',
    '  i = low - 1',
    '  for j = low to high-1:',
    '    if array[j] <= pivot:',
    '      i++; swap(array[i], array[j])',
    '  swap(array[i+1], array[high])',
    '  return i + 1',
  ],
  pythonCode: [
    'def quick_sort(arr, low, high):',
    '    if low < high:',
    '        pivot = partition(arr, low, high)',
    '        quick_sort(arr, low, pivot-1)',
    '        quick_sort(arr, pivot+1, high)',
    '',
    'def partition(arr, low, high):',
    '    pivot = arr[high]',
    '    i = low - 1',
    '    for j in range(low, high):',
    '        if arr[j] <= pivot:',
    '            i += 1',
    '            arr[i], arr[j] = arr[j], arr[i]',
    '    arr[i+1], arr[high] = arr[high], arr[i+1]',
    '    return i + 1',
  ],
};

// Merge Sort
export function* mergeSortGenerator(
  initialArray: number[],
  left: number = 0,
  right: number = initialArray.length - 1,
  array: number[] = [...initialArray],
  sorted: number[] = []
): Generator<SortStep> {
  if (left < right) {
    const mid = Math.floor((left + right) / 2);

    yield {
      array: [...array],
      comparing: [left, mid, right],
      swapping: [],
      sorted: [...sorted],
      operation: `Dividing array from index ${left} to ${right}`,
      line: 2,
    };

    yield* mergeSortGenerator(initialArray, left, mid, array, sorted);
    yield* mergeSortGenerator(initialArray, mid + 1, right, array, sorted);

    // Merge
    const leftArr = array.slice(left, mid + 1);
    const rightArr = array.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
      yield {
        array: [...array],
        comparing: [left + i, mid + 1 + j],
        swapping: [],
        sorted: [...sorted],
        operation: `Merging: comparing ${leftArr[i]} and ${rightArr[j]}`,
        line: 6,
      };

      if (leftArr[i] <= rightArr[j]) {
        array[k] = leftArr[i];
        i++;
      } else {
        array[k] = rightArr[j];
        j++;
      }

      yield {
        array: [...array],
        comparing: [],
        swapping: [k],
        sorted: [...sorted],
        operation: `Placed ${array[k]} at position ${k}`,
        line: 8,
      };
      k++;
    }

    while (i < leftArr.length) {
      array[k] = leftArr[i];
      i++;
      k++;
    }

    while (j < rightArr.length) {
      array[k] = rightArr[j];
      j++;
      k++;
    }
  }

  if (left === 0 && right === initialArray.length - 1) {
    yield {
      array: [...array],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: array.length }, (_, i) => i),
      operation: 'Array is sorted!',
      line: 12,
    };
  }
}

export const mergeSortInfo: SortAlgorithm = {
  name: 'Merge Sort',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
  },
  spaceComplexity: 'O(n)',
  pseudocode: [
    'function mergeSort(array, left, right):',
    '  if left < right:',
    '    mid = (left + right) / 2',
    '    mergeSort(array, left, mid)',
    '    mergeSort(array, mid+1, right)',
    '    merge(array, left, mid, right)',
    '',
    'function merge(array, left, mid, right):',
    '  create temp arrays L and R',
    '  while elements in both arrays:',
    '    compare and merge smaller element',
    '  copy remaining elements',
  ],
  pythonCode: [
    'def merge_sort(arr, left, right):',
    '    if left < right:',
    '        mid = (left + right) // 2',
    '        merge_sort(arr, left, mid)',
    '        merge_sort(arr, mid+1, right)',
    '        merge(arr, left, mid, right)',
    '',
    'def merge(arr, l, m, r):',
    '    L = arr[l:m+1]',
    '    R = arr[m+1:r+1]',
    '    i = j = 0; k = l',
    '    while i < len(L) and j < len(R):',
    '        if L[i] <= R[j]:',
    '            arr[k] = L[i]; i += 1',
    '        else:',
    '            arr[k] = R[j]; j += 1',
    '        k += 1',
  ],
};

// Selection Sort
export function* selectionSortGenerator(initialArray: number[]): Generator<SortStep> {
  const array = [...initialArray];
  const n = array.length;
  const sorted: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    yield {
      array: [...array],
      comparing: [i],
      swapping: [],
      sorted: [...sorted],
      operation: `Starting from index ${i}, finding minimum`,
      line: 2,
    };

    for (let j = i + 1; j < n; j++) {
      yield {
        array: [...array],
        comparing: [minIdx, j],
        swapping: [],
        sorted: [...sorted],
        operation: `Comparing ${array[minIdx]} with ${array[j]}`,
        line: 4,
      };

      if (array[j] < array[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
      yield {
        array: [...array],
        comparing: [],
        swapping: [i, minIdx],
        sorted: [...sorted],
        operation: `Swapping ${array[minIdx]} with ${array[i]}`,
        line: 6,
      };
    }
    sorted.push(i);
  }
  sorted.push(n - 1);

  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    operation: 'Array is sorted!',
    line: 8,
  };
}

export const selectionSortInfo: SortAlgorithm = {
  name: 'Selection Sort',
  timeComplexity: {
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
  },
  spaceComplexity: 'O(1)',
  pseudocode: [
    'function selectionSort(array):',
    '  for i = 0 to n-1:',
    '    minIdx = i',
    '    for j = i+1 to n:',
    '      if array[j] < array[minIdx]:',
    '        minIdx = j',
    '    swap(array[i], array[minIdx])',
    '  return array',
  ],
  pythonCode: [
    'def selection_sort(arr):',
    '    n = len(arr)',
    '    for i in range(n-1):',
    '        min_idx = i',
    '        for j in range(i+1, n):',
    '            if arr[j] < arr[min_idx]:',
    '                min_idx = j',
    '        arr[i], arr[min_idx] = arr[min_idx], arr[i]',
    '    return arr',
  ],
};

// Insertion Sort
export function* insertionSortGenerator(initialArray: number[]): Generator<SortStep> {
  const array = [...initialArray];
  const n = array.length;
  const sorted: number[] = [0];

  for (let i = 1; i < n; i++) {
    const key = array[i];
    let j = i - 1;

    yield {
      array: [...array],
      comparing: [i],
      swapping: [],
      sorted: [...sorted],
      operation: `Inserting ${key} into sorted portion`,
      line: 3,
    };

    while (j >= 0 && array[j] > key) {
      yield {
        array: [...array],
        comparing: [j, j + 1],
        swapping: [],
        sorted: [...sorted],
        operation: `Comparing ${array[j]} with ${key}`,
        line: 5,
      };

      array[j + 1] = array[j];
      yield {
        array: [...array],
        comparing: [],
        swapping: [j, j + 1],
        sorted: [...sorted],
        operation: `Moving ${array[j]} to the right`,
        line: 6,
      };
      j--;
    }

    array[j + 1] = key;
    sorted.push(i);

    yield {
      array: [...array],
      comparing: [],
      swapping: [j + 1],
      sorted: [...sorted],
      operation: `Inserted ${key} at position ${j + 1}`,
      line: 7,
    };
  }

  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    operation: 'Array is sorted!',
    line: 9,
  };
}

export const insertionSortInfo: SortAlgorithm = {
  name: 'Insertion Sort',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
  },
  spaceComplexity: 'O(1)',
  pseudocode: [
    'function insertionSort(array):',
    '  for i = 1 to n:',
    '    key = array[i]',
    '    j = i - 1',
    '    while j >= 0 and array[j] > key:',
    '      array[j+1] = array[j]',
    '      j = j - 1',
    '    array[j+1] = key',
    '  return array',
  ],
  pythonCode: [
    'def insertion_sort(arr):',
    '    for i in range(1, len(arr)):',
    '        key = arr[i]',
    '        j = i - 1',
    '        while j >= 0 and arr[j] > key:',
    '            arr[j+1] = arr[j]',
    '            j -= 1',
    '        arr[j+1] = key',
    '    return arr',
  ],
};

export const sortingAlgorithms = {
  'bubble-sort': {
    generator: bubbleSortGenerator,
    info: bubbleSortInfo,
  },
  'quick-sort': {
    generator: quickSortGenerator,
    info: quickSortInfo,
  },
  'merge-sort': {
    generator: mergeSortGenerator,
    info: mergeSortInfo,
  },
  'selection-sort': {
    generator: selectionSortGenerator,
    info: selectionSortInfo,
  },
  'insertion-sort': {
    generator: insertionSortGenerator,
    info: insertionSortInfo,
  },
};

export type SortingAlgorithmKey = keyof typeof sortingAlgorithms;

export function generateRandomArray(size: number, min: number = 5, max: number = 100): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}
