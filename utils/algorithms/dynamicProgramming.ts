// Dynamic Programming Algorithms with step-by-step visualization

export interface DPStep {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  memo: Record<string | number, number>;
  currentIndex: number;
  operation: string;
  line: number;
  callStack?: number[];
  result?: number;
}

export interface DPAlgorithm {
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

// Fibonacci Generator - Step by Step Visualization
export function* fibonacciGenerator(n: number): Generator<DPStep> {
  const memo: Record<number, number> = {};
  const computed: number[] = [];
  let stepCount = 0;

  // Initialize visualization
  yield {
    array: computed,
    comparing: [],
    swapping: [],
    sorted: [],
    memo: { ...memo },
    currentIndex: n,
    operation: `Starting Fibonacci calculation for F(${n})`,
    line: 0,
    callStack: [n],
  };

  // Iterative bottom-up approach for visualization
  for (let i = 0; i <= n; i++) {
    stepCount++;

    if (i === 0) {
      memo[0] = 0;
      computed.push(0);

      yield {
        array: [...computed],
        comparing: [0],
        swapping: [],
        sorted: [],
        memo: { ...memo },
        currentIndex: 0,
        operation: `Base case: F(0) = 0`,
        line: 1,
        callStack: [i],
      };
    } else if (i === 1) {
      memo[1] = 1;
      computed.push(1);

      yield {
        array: [...computed],
        comparing: [1],
        swapping: [],
        sorted: [],
        memo: { ...memo },
        currentIndex: 1,
        operation: `Base case: F(1) = 1`,
        line: 2,
        callStack: [i],
      };
    } else {
      // Show the lookup/computation step
      yield {
        array: [...computed],
        comparing: [i - 1, i - 2],
        swapping: [],
        sorted: [],
        memo: { ...memo },
        currentIndex: i,
        operation: `Computing F(${i}) = F(${i - 1}) + F(${i - 2}) = ${memo[i - 1]} + ${memo[i - 2]}`,
        line: 4,
        callStack: [i],
      };

      memo[i] = memo[i - 1] + memo[i - 2];
      computed.push(memo[i]);

      yield {
        array: [...computed],
        comparing: [],
        swapping: [i],
        sorted: Array.from({ length: i + 1 }, (_, idx) => idx),
        memo: { ...memo },
        currentIndex: i,
        operation: `F(${i}) = ${memo[i]} (stored in memo table)`,
        line: 5,
        callStack: [i],
        result: memo[i],
      };
    }
  }

  // Final result
  yield {
    array: [...computed],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n + 1 }, (_, idx) => idx),
    memo: { ...memo },
    currentIndex: n,
    operation: `Fibonacci sequence complete! F(${n}) = ${memo[n]}`,
    line: 7,
    callStack: [],
    result: memo[n],
  };
}

export const fibonacciInfo: DPAlgorithm = {
  name: 'Fibonacci (DP)',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
  },
  spaceComplexity: 'O(n)',
  pseudocode: [
    'function fibonacci(n):',
    '  if n == 0: return 0',
    '  if n == 1: return 1',
    '  memo = array of size n+1',
    '  memo[0] = 0, memo[1] = 1',
    '  for i = 2 to n:',
    '    memo[i] = memo[i-1] + memo[i-2]',
    '  return memo[n]',
  ],
  pythonCode: [
    'def fibonacci(n):',
    '    if n == 0: return 0',
    '    if n == 1: return 1',
    '    memo = [0] * (n + 1)',
    '    memo[0], memo[1] = 0, 1',
    '    for i in range(2, n + 1):',
    '        memo[i] = memo[i-1] + memo[i-2]',
    '    return memo[n]',
  ],
};

// Climbing Stairs Generator
export function* climbingStairsGenerator(n: number): Generator<DPStep> {
  const memo: Record<number, number> = {};
  const computed: number[] = [];

  yield {
    array: computed,
    comparing: [],
    swapping: [],
    sorted: [],
    memo: { ...memo },
    currentIndex: n,
    operation: `Finding ways to climb ${n} stairs (1 or 2 steps at a time)`,
    line: 0,
    callStack: [n],
  };

  for (let i = 0; i <= n; i++) {
    if (i === 0) {
      memo[0] = 1;
      computed.push(1);

      yield {
        array: [...computed],
        comparing: [0],
        swapping: [],
        sorted: [],
        memo: { ...memo },
        currentIndex: 0,
        operation: `Base case: 1 way to stay at ground (do nothing)`,
        line: 1,
      };
    } else if (i === 1) {
      memo[1] = 1;
      computed.push(1);

      yield {
        array: [...computed],
        comparing: [1],
        swapping: [],
        sorted: [],
        memo: { ...memo },
        currentIndex: 1,
        operation: `Base case: 1 way to reach stair 1 (one step)`,
        line: 2,
      };
    } else {
      yield {
        array: [...computed],
        comparing: [i - 1, i - 2],
        swapping: [],
        sorted: [],
        memo: { ...memo },
        currentIndex: i,
        operation: `Ways to stair ${i} = ways(${i - 1}) + ways(${i - 2}) = ${memo[i - 1]} + ${memo[i - 2]}`,
        line: 4,
      };

      memo[i] = memo[i - 1] + memo[i - 2];
      computed.push(memo[i]);

      yield {
        array: [...computed],
        comparing: [],
        swapping: [i],
        sorted: Array.from({ length: i + 1 }, (_, idx) => idx),
        memo: { ...memo },
        currentIndex: i,
        operation: `${memo[i]} ways to reach stair ${i}`,
        line: 5,
        result: memo[i],
      };
    }
  }

  yield {
    array: [...computed],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n + 1 }, (_, idx) => idx),
    memo: { ...memo },
    currentIndex: n,
    operation: `Complete! ${memo[n]} ways to climb ${n} stairs`,
    line: 7,
    result: memo[n],
  };
}

export const climbingStairsInfo: DPAlgorithm = {
  name: 'Climbing Stairs',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
  },
  spaceComplexity: 'O(n)',
  pseudocode: [
    'function climbStairs(n):',
    '  if n <= 1: return 1',
    '  dp = array of size n+1',
    '  dp[0] = 1, dp[1] = 1',
    '  for i = 2 to n:',
    '    dp[i] = dp[i-1] + dp[i-2]',
    '  return dp[n]',
  ],
  pythonCode: [
    'def climb_stairs(n):',
    '    if n <= 1: return 1',
    '    dp = [0] * (n + 1)',
    '    dp[0] = dp[1] = 1',
    '    for i in range(2, n + 1):',
    '        dp[i] = dp[i-1] + dp[i-2]',
    '    return dp[n]',
  ],
};

// Maximum Subarray (Kadane's Algorithm)
export function* maxSubarrayGenerator(initialArray: number[]): Generator<DPStep> {
  const array = [...initialArray];
  const n = array.length;
  let maxSoFar = array[0];
  let maxEndingHere = array[0];
  let start = 0;
  let end = 0;
  let tempStart = 0;

  yield {
    array: [...array],
    comparing: [0],
    swapping: [],
    sorted: [],
    memo: { maxSoFar, maxEndingHere },
    currentIndex: 0,
    operation: `Initialize: maxSoFar = ${maxSoFar}, maxEndingHere = ${maxEndingHere}`,
    line: 1,
  };

  for (let i = 1; i < n; i++) {
    yield {
      array: [...array],
      comparing: [i],
      swapping: [],
      sorted: [],
      memo: { maxSoFar, maxEndingHere },
      currentIndex: i,
      operation: `Checking element ${array[i]}: extend current subarray or start new?`,
      line: 3,
    };

    if (array[i] > maxEndingHere + array[i]) {
      maxEndingHere = array[i];
      tempStart = i;

      yield {
        array: [...array],
        comparing: [],
        swapping: [i],
        sorted: [],
        memo: { maxSoFar, maxEndingHere },
        currentIndex: i,
        operation: `Starting new subarray at index ${i} (${array[i]} > ${maxEndingHere - array[i]} + ${array[i]})`,
        line: 4,
      };
    } else {
      maxEndingHere = maxEndingHere + array[i];

      yield {
        array: [...array],
        comparing: [],
        swapping: Array.from({ length: i - tempStart + 1 }, (_, j) => tempStart + j),
        sorted: [],
        memo: { maxSoFar, maxEndingHere },
        currentIndex: i,
        operation: `Extended subarray: sum = ${maxEndingHere}`,
        line: 5,
      };
    }

    if (maxEndingHere > maxSoFar) {
      maxSoFar = maxEndingHere;
      start = tempStart;
      end = i;

      yield {
        array: [...array],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: end - start + 1 }, (_, j) => start + j),
        memo: { maxSoFar, maxEndingHere },
        currentIndex: i,
        operation: `New maximum found: ${maxSoFar} (indices ${start} to ${end})`,
        line: 6,
        result: maxSoFar,
      };
    }
  }

  yield {
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: end - start + 1 }, (_, j) => start + j),
    memo: { maxSoFar, maxEndingHere, start, end },
    currentIndex: -1,
    operation: `Maximum subarray sum: ${maxSoFar} (from index ${start} to ${end})`,
    line: 8,
    result: maxSoFar,
  };
}

export const maxSubarrayInfo: DPAlgorithm = {
  name: 'Maximum Subarray (Kadane)',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
  },
  spaceComplexity: 'O(1)',
  pseudocode: [
    'function maxSubarray(arr):',
    '  maxSoFar = maxEndingHere = arr[0]',
    '  for i = 1 to n-1:',
    '    maxEndingHere = max(arr[i], maxEndingHere + arr[i])',
    '    maxSoFar = max(maxSoFar, maxEndingHere)',
    '  return maxSoFar',
  ],
  pythonCode: [
    'def max_subarray(arr):',
    '    max_so_far = max_ending_here = arr[0]',
    '    for i in range(1, len(arr)):',
    '        max_ending_here = max(arr[i], max_ending_here + arr[i])',
    '        max_so_far = max(max_so_far, max_ending_here)',
    '    return max_so_far',
  ],
};

// Algorithm generator type
type NumberInputGenerator = (n: number) => Generator<DPStep>;
type ArrayInputGenerator = (arr: number[]) => Generator<DPStep>;

export interface DPAlgorithmConfig {
  generator: NumberInputGenerator | ArrayInputGenerator;
  info: DPAlgorithm;
  inputType: 'number' | 'array';
}

// Export all DP algorithms
export const dpAlgorithms: Record<string, DPAlgorithmConfig> = {
  'fibonacci': {
    generator: fibonacciGenerator,
    info: fibonacciInfo,
    inputType: 'number',
  },
  'climbing-stairs': {
    generator: climbingStairsGenerator,
    info: climbingStairsInfo,
    inputType: 'number',
  },
  'max-subarray': {
    generator: maxSubarrayGenerator,
    info: maxSubarrayInfo,
    inputType: 'array',
  },
};

export type DPAlgorithmKey = keyof typeof dpAlgorithms;

// Helper to run the generator with the correct input type
export function runDPGenerator(
  algorithmId: string,
  numberInput: number,
  arrayInput: number[]
): Generator<DPStep> | null {
  const algo = dpAlgorithms[algorithmId];
  if (!algo) return null;

  if (algo.inputType === 'number') {
    return (algo.generator as NumberInputGenerator)(numberInput);
  } else {
    return (algo.generator as ArrayInputGenerator)(arrayInput);
  }
}
