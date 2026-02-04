// Searching Algorithms with step-by-step generation

export interface SearchStep {
  array: number[];
  target: number;
  currentIndex: number;
  searchRange: { left: number; right: number };
  comparing: number[];
  found: boolean;
  eliminated: number[]; // Indices that have been eliminated from search space
  operation: string;
  line: number;
}

export interface SearchAlgorithm {
  name: string;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  pseudocode: string[];
  pythonCode: string[];
  requiresSorted: boolean;
}

// Linear Search
export function* linearSearchGenerator(
  initialArray: number[],
  target: number
): Generator<SearchStep> {
  const array = [...initialArray];
  const n = array.length;
  const eliminated: number[] = [];

  yield {
    array: [...array],
    target,
    currentIndex: -1,
    searchRange: { left: 0, right: n - 1 },
    comparing: [],
    found: false,
    eliminated: [],
    operation: `Starting Linear Search for target: ${target}`,
    line: 0,
  };

  for (let i = 0; i < n; i++) {
    yield {
      array: [...array],
      target,
      currentIndex: i,
      searchRange: { left: 0, right: n - 1 },
      comparing: [i],
      found: false,
      eliminated: [...eliminated],
      operation: `Checking index ${i}: Is ${array[i]} equal to ${target}?`,
      line: 2,
    };

    if (array[i] === target) {
      yield {
        array: [...array],
        target,
        currentIndex: i,
        searchRange: { left: 0, right: n - 1 },
        comparing: [i],
        found: true,
        eliminated: [...eliminated],
        operation: `Found ${target} at index ${i}!`,
        line: 3,
      };
      return;
    }

    eliminated.push(i);
    yield {
      array: [...array],
      target,
      currentIndex: i,
      searchRange: { left: 0, right: n - 1 },
      comparing: [],
      found: false,
      eliminated: [...eliminated],
      operation: `${array[i]} ≠ ${target}, moving to next element`,
      line: 4,
    };
  }

  yield {
    array: [...array],
    target,
    currentIndex: -1,
    searchRange: { left: 0, right: n - 1 },
    comparing: [],
    found: false,
    eliminated: [...eliminated],
    operation: `Target ${target} not found in array`,
    line: 5,
  };
}

export const linearSearchInfo: SearchAlgorithm = {
  name: 'Linear Search',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(n)',
    worst: 'O(n)',
  },
  spaceComplexity: 'O(1)',
  requiresSorted: false,
  pseudocode: [
    'function linearSearch(array, target):',
    '  for i = 0 to n-1:',
    '    if array[i] == target:',
    '      return i',
    '    continue to next element',
    '  return -1 (not found)',
  ],
  pythonCode: [
    'def linear_search(arr, target):',
    '    for i in range(len(arr)):',
    '        if arr[i] == target:',
    '            return i',
    '    return -1',
  ],
};

// Binary Search
export function* binarySearchGenerator(
  initialArray: number[],
  target: number
): Generator<SearchStep> {
  // Binary Search requires sorted array
  const array = [...initialArray].sort((a, b) => a - b);
  const n = array.length;
  let left = 0;
  let right = n - 1;
  const eliminated: number[] = [];

  yield {
    array: [...array],
    target,
    currentIndex: -1,
    searchRange: { left, right },
    comparing: [],
    found: false,
    eliminated: [],
    operation: `Starting Binary Search for target: ${target} (array is sorted)`,
    line: 0,
  };

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    yield {
      array: [...array],
      target,
      currentIndex: mid,
      searchRange: { left, right },
      comparing: [mid],
      found: false,
      eliminated: [...eliminated],
      operation: `Checking middle index ${mid}: Is ${array[mid]} equal to ${target}?`,
      line: 3,
    };

    if (array[mid] === target) {
      yield {
        array: [...array],
        target,
        currentIndex: mid,
        searchRange: { left, right },
        comparing: [mid],
        found: true,
        eliminated: [...eliminated],
        operation: `Found ${target} at index ${mid}!`,
        line: 4,
      };
      return;
    }

    if (array[mid] < target) {
      // Eliminate left half
      for (let i = left; i <= mid; i++) {
        if (!eliminated.includes(i)) {
          eliminated.push(i);
        }
      }
      yield {
        array: [...array],
        target,
        currentIndex: mid,
        searchRange: { left: mid + 1, right },
        comparing: [],
        found: false,
        eliminated: [...eliminated],
        operation: `${array[mid]} < ${target}, eliminating left half. Search right: [${mid + 1}, ${right}]`,
        line: 6,
      };
      left = mid + 1;
    } else {
      // Eliminate right half
      for (let i = mid; i <= right; i++) {
        if (!eliminated.includes(i)) {
          eliminated.push(i);
        }
      }
      yield {
        array: [...array],
        target,
        currentIndex: mid,
        searchRange: { left, right: mid - 1 },
        comparing: [],
        found: false,
        eliminated: [...eliminated],
        operation: `${array[mid]} > ${target}, eliminating right half. Search left: [${left}, ${mid - 1}]`,
        line: 8,
      };
      right = mid - 1;
    }
  }

  yield {
    array: [...array],
    target,
    currentIndex: -1,
    searchRange: { left, right },
    comparing: [],
    found: false,
    eliminated: [...eliminated],
    operation: `Target ${target} not found in array`,
    line: 9,
  };
}

export const binarySearchInfo: SearchAlgorithm = {
  name: 'Binary Search',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)',
  },
  spaceComplexity: 'O(1)',
  requiresSorted: true,
  pseudocode: [
    'function binarySearch(array, target):',
    '  left = 0, right = n-1',
    '  while left <= right:',
    '    mid = (left + right) / 2',
    '    if array[mid] == target:',
    '      return mid',
    '    if array[mid] < target:',
    '      left = mid + 1',
    '    else:',
    '      right = mid - 1',
    '  return -1 (not found)',
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
};

export const searchingAlgorithms = {
  'linear-search': {
    generator: linearSearchGenerator,
    info: linearSearchInfo,
  },
  'binary-search': {
    generator: binarySearchGenerator,
    info: binarySearchInfo,
  },
};

export type SearchingAlgorithmKey = keyof typeof searchingAlgorithms;

export function generateRandomArrayForSearch(
  size: number,
  min: number = 1,
  max: number = 100
): { array: number[]; target: number } {
  const array = Array.from(
    { length: size },
    () => Math.floor(Math.random() * (max - min + 1)) + min
  );
  // Pick a random target from the array (70% chance) or random (30% chance)
  const target =
    Math.random() < 0.7
      ? array[Math.floor(Math.random() * array.length)]
      : Math.floor(Math.random() * (max - min + 1)) + min;
  return { array, target };
}
