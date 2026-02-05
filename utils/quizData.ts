// Quiz Data for Algorithm Knowledge Checks

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  type: 'complexity' | 'logic' | 'use-case';
}

export interface AlgorithmQuiz {
  algorithmId: string;
  algorithmName: string;
  questions: QuizQuestion[];
}

// Sorting Algorithm Quizzes
export const sortingQuizzes: Record<string, AlgorithmQuiz> = {
  'bubble-sort': {
    algorithmId: 'bubble-sort',
    algorithmName: 'Bubble Sort',
    questions: [
      {
        id: 'bs-1',
        question: 'What is the average time complexity of Bubble Sort?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        correctAnswer: 2,
        explanation: 'Bubble Sort has O(n²) time complexity because it uses nested loops - one to iterate through the array and another to compare adjacent elements.',
        type: 'complexity',
      },
      {
        id: 'bs-2',
        question: 'After the first complete pass through an unsorted array, which element is guaranteed to be in its final position?',
        options: ['The smallest element', 'The largest element', 'The middle element', 'None of the above'],
        correctAnswer: 1,
        explanation: 'Bubble Sort "bubbles up" the largest unsorted element to its correct position at the end of the array after each complete pass.',
        type: 'logic',
      },
      {
        id: 'bs-3',
        question: 'What is the space complexity of Bubble Sort?',
        options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
        correctAnswer: 3,
        explanation: 'Bubble Sort is an in-place sorting algorithm that only uses a constant amount of extra space for swapping elements.',
        type: 'complexity',
      },
      {
        id: 'bs-4',
        question: 'When is Bubble Sort a good choice?',
        options: ['Large datasets', 'Nearly sorted arrays', 'Random data', 'Linked lists'],
        correctAnswer: 1,
        explanation: 'Bubble Sort performs well on nearly sorted arrays because it can detect early if no swaps are needed, achieving O(n) best-case time.',
        type: 'use-case',
      },
      {
        id: 'bs-5',
        question: 'If the array is [5, 2, 8, 1], what will it look like after ONE complete pass of Bubble Sort?',
        options: ['[1, 2, 5, 8]', '[2, 5, 1, 8]', '[2, 5, 8, 1]', '[5, 2, 1, 8]'],
        correctAnswer: 1,
        explanation: 'After one pass: 5>2 swap→[2,5,8,1], 5<8 no swap, 8>1 swap→[2,5,1,8]. The largest element (8) bubbles to the end.',
        type: 'logic',
      },
    ],
  },
  'selection-sort': {
    algorithmId: 'selection-sort',
    algorithmName: 'Selection Sort',
    questions: [
      {
        id: 'ss-1',
        question: 'What is the time complexity of Selection Sort in ALL cases (best, average, worst)?',
        options: ['O(n) for all', 'O(n²) for all', 'O(n log n) for all', 'It varies'],
        correctAnswer: 1,
        explanation: 'Selection Sort always performs O(n²) comparisons regardless of the initial order, as it must find the minimum element in the unsorted portion each time.',
        type: 'complexity',
      },
      {
        id: 'ss-2',
        question: 'How does Selection Sort differ from Bubble Sort?',
        options: ['It uses more memory', 'It swaps fewer times', 'It has better time complexity', 'It requires sorted input'],
        correctAnswer: 1,
        explanation: 'Selection Sort makes at most n-1 swaps (one per pass), while Bubble Sort may swap elements multiple times in a single pass.',
        type: 'logic',
      },
      {
        id: 'ss-3',
        question: 'After two iterations of Selection Sort on [64, 25, 12, 22, 11], what is the array state?',
        options: ['[11, 12, 64, 25, 22]', '[11, 12, 25, 22, 64]', '[11, 12, 22, 25, 64]', '[11, 25, 12, 22, 64]'],
        correctAnswer: 0,
        explanation: 'First iteration finds 11 (min) and swaps with 64→[11,25,12,22,64]. Second finds 12 and swaps with 25→[11,12,64,25,22].',
        type: 'logic',
      },
      {
        id: 'ss-4',
        question: 'When would you prefer Selection Sort over other O(n²) algorithms?',
        options: ['When memory writes are expensive', 'When the array is large', 'When stability is required', 'When the array is nearly sorted'],
        correctAnswer: 0,
        explanation: 'Selection Sort minimizes the number of swaps, making it preferable when writing to memory is costly (like with flash memory).',
        type: 'use-case',
      },
    ],
  },
  'insertion-sort': {
    algorithmId: 'insertion-sort',
    algorithmName: 'Insertion Sort',
    questions: [
      {
        id: 'is-1',
        question: 'What is the BEST case time complexity of Insertion Sort?',
        options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'],
        correctAnswer: 2,
        explanation: 'When the array is already sorted, Insertion Sort only makes n-1 comparisons with no shifts, achieving O(n) time.',
        type: 'complexity',
      },
      {
        id: 'is-2',
        question: 'Insertion Sort is most similar to how we sort:',
        options: ['Books on a shelf', 'Playing cards in hand', 'Files alphabetically', 'Numbers on a calculator'],
        correctAnswer: 1,
        explanation: 'Insertion Sort mimics how we sort playing cards - picking up one card at a time and inserting it into its correct position.',
        type: 'use-case',
      },
      {
        id: 'is-3',
        question: 'Is Insertion Sort a stable sorting algorithm?',
        options: ['Yes', 'No', 'Only for integers', 'Only for small arrays'],
        correctAnswer: 0,
        explanation: 'Insertion Sort is stable because equal elements maintain their relative order - we only shift elements that are strictly greater.',
        type: 'logic',
      },
      {
        id: 'is-4',
        question: 'For sorting an almost-sorted array with a few elements out of place, which is best?',
        options: ['Quick Sort', 'Merge Sort', 'Insertion Sort', 'Heap Sort'],
        correctAnswer: 2,
        explanation: 'Insertion Sort excels at nearly sorted data because elements are shifted minimally, approaching O(n) performance.',
        type: 'use-case',
      },
    ],
  },
  'merge-sort': {
    algorithmId: 'merge-sort',
    algorithmName: 'Merge Sort',
    questions: [
      {
        id: 'ms-1',
        question: 'What is the time complexity of Merge Sort in the WORST case?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        correctAnswer: 1,
        explanation: 'Merge Sort consistently achieves O(n log n) in all cases because it always divides the array in half (log n divisions) and merges in O(n) time.',
        type: 'complexity',
      },
      {
        id: 'ms-2',
        question: 'What is the space complexity of standard Merge Sort?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correctAnswer: 2,
        explanation: 'Merge Sort requires O(n) auxiliary space for the temporary arrays used during the merge operation.',
        type: 'complexity',
      },
      {
        id: 'ms-3',
        question: 'Merge Sort uses which algorithmic paradigm?',
        options: ['Greedy', 'Dynamic Programming', 'Divide and Conquer', 'Backtracking'],
        correctAnswer: 2,
        explanation: 'Merge Sort is a classic Divide and Conquer algorithm - it divides the problem into smaller subproblems, solves them, and combines the results.',
        type: 'logic',
      },
      {
        id: 'ms-4',
        question: 'When is Merge Sort preferred over Quick Sort?',
        options: ['When memory is limited', 'When stability is required', 'When data fits in cache', 'When the array is small'],
        correctAnswer: 1,
        explanation: 'Merge Sort is stable (preserves relative order of equal elements) and has guaranteed O(n log n) time, making it ideal when stability matters.',
        type: 'use-case',
      },
      {
        id: 'ms-5',
        question: 'During the merge step of [2, 5] and [1, 8], what is the first element placed in the result?',
        options: ['2', '5', '1', '8'],
        correctAnswer: 2,
        explanation: 'The merge compares the first elements of both arrays: 2 vs 1. Since 1 < 2, we place 1 first in the result.',
        type: 'logic',
      },
    ],
  },
  'quick-sort': {
    algorithmId: 'quick-sort',
    algorithmName: 'Quick Sort',
    questions: [
      {
        id: 'qs-1',
        question: 'What is the WORST case time complexity of Quick Sort?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        correctAnswer: 2,
        explanation: 'Quick Sort degrades to O(n²) when the pivot consistently divides the array unevenly, like choosing the smallest/largest element in a sorted array.',
        type: 'complexity',
      },
      {
        id: 'qs-2',
        question: 'What is the role of the "pivot" in Quick Sort?',
        options: ['To find the minimum element', 'To partition the array', 'To merge subarrays', 'To count inversions'],
        correctAnswer: 1,
        explanation: 'The pivot is used to partition the array into two parts: elements smaller than pivot go left, larger elements go right.',
        type: 'logic',
      },
      {
        id: 'qs-3',
        question: 'Why is Quick Sort often faster than Merge Sort in practice?',
        options: ['Better worst-case complexity', 'Better cache locality', 'Less comparisons', 'Uses less recursion'],
        correctAnswer: 1,
        explanation: 'Quick Sort sorts in-place with better cache performance since it accesses memory sequentially, while Merge Sort requires extra space and more memory accesses.',
        type: 'use-case',
      },
      {
        id: 'qs-4',
        question: 'What is the space complexity of Quick Sort (average case)?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctAnswer: 1,
        explanation: 'Quick Sort uses O(log n) space for the recursion stack in the average case when partitions are balanced.',
        type: 'complexity',
      },
      {
        id: 'qs-5',
        question: 'To avoid Quick Sort\'s worst case, what strategy is commonly used?',
        options: ['Always use first element as pivot', 'Use median-of-three pivot selection', 'Sort the array first', 'Use a fixed pivot value'],
        correctAnswer: 1,
        explanation: 'Median-of-three selects the pivot from the first, middle, and last elements, reducing the chance of poor partitions on sorted data.',
        type: 'logic',
      },
    ],
  },
};

// Searching Algorithm Quizzes
export const searchingQuizzes: Record<string, AlgorithmQuiz> = {
  'linear-search': {
    algorithmId: 'linear-search',
    algorithmName: 'Linear Search',
    questions: [
      {
        id: 'ls-1',
        question: 'What is the time complexity of Linear Search?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correctAnswer: 2,
        explanation: 'Linear Search checks each element one by one, potentially examining all n elements in the worst case.',
        type: 'complexity',
      },
      {
        id: 'ls-2',
        question: 'Does Linear Search require the array to be sorted?',
        options: ['Yes', 'No', 'Only for numbers', 'Only in the worst case'],
        correctAnswer: 1,
        explanation: 'Linear Search works on any array, sorted or unsorted, because it examines every element sequentially.',
        type: 'logic',
      },
      {
        id: 'ls-3',
        question: 'When would you choose Linear Search over Binary Search?',
        options: ['Large sorted arrays', 'Small or unsorted arrays', 'Linked lists', 'Both B and C'],
        correctAnswer: 3,
        explanation: 'Linear Search is preferred for small arrays (where overhead matters), unsorted data, and linked lists (no random access for Binary Search).',
        type: 'use-case',
      },
      {
        id: 'ls-4',
        question: 'If an element is found at index 5 in a 100-element array, how many comparisons did Linear Search make?',
        options: ['5', '6', '50', '100'],
        correctAnswer: 1,
        explanation: 'Linear Search checks elements at indices 0, 1, 2, 3, 4, 5 - making 6 comparisons before finding the element.',
        type: 'logic',
      },
    ],
  },
  'binary-search': {
    algorithmId: 'binary-search',
    algorithmName: 'Binary Search',
    questions: [
      {
        id: 'bns-1',
        question: 'What is the time complexity of Binary Search?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctAnswer: 1,
        explanation: 'Binary Search halves the search space with each comparison, requiring at most log₂(n) comparisons.',
        type: 'complexity',
      },
      {
        id: 'bns-2',
        question: 'What is the prerequisite for using Binary Search?',
        options: ['Array must contain unique elements', 'Array must be sorted', 'Array must be of even length', 'Array must contain integers'],
        correctAnswer: 1,
        explanation: 'Binary Search requires a sorted array because it relies on comparing with the middle element to eliminate half the search space.',
        type: 'logic',
      },
      {
        id: 'bns-3',
        question: 'In a sorted array of 1024 elements, what is the maximum number of comparisons Binary Search needs?',
        options: ['10', '11', '512', '1024'],
        correctAnswer: 0,
        explanation: 'Binary Search needs at most ⌈log₂(1024)⌉ = 10 comparisons, since 2¹⁰ = 1024.',
        type: 'complexity',
      },
      {
        id: 'bns-4',
        question: 'Searching for 7 in [1, 3, 5, 7, 9, 11], what indices does Binary Search check?',
        options: ['0, 1, 2, 3', '2, 3', '5, 2, 3', '0, 5, 2, 3'],
        correctAnswer: 1,
        explanation: 'First check middle index 2 (value 5), 7>5 so go right. Then check index 4 (value 9), 7<9 go left. Check index 3 (value 7) - found!',
        type: 'logic',
      },
      {
        id: 'bns-5',
        question: 'Which data structure is Binary Search NOT efficient for?',
        options: ['Array', 'ArrayList', 'Linked List', 'Sorted Vector'],
        correctAnswer: 2,
        explanation: 'Linked Lists don\'t support efficient random access (O(n) to reach middle), making Binary Search ineffective despite O(log n) comparisons.',
        type: 'use-case',
      },
    ],
  },
};

// Graph Algorithm Quizzes
export const graphQuizzes: Record<string, AlgorithmQuiz> = {
  'bfs': {
    algorithmId: 'bfs',
    algorithmName: 'Breadth-First Search',
    questions: [
      {
        id: 'bfs-1',
        question: 'What data structure does BFS primarily use?',
        options: ['Stack', 'Queue', 'Heap', 'Tree'],
        correctAnswer: 1,
        explanation: 'BFS uses a queue (FIFO) to process nodes level by level, ensuring all nodes at distance k are visited before distance k+1.',
        type: 'logic',
      },
      {
        id: 'bfs-2',
        question: 'Does BFS guarantee the shortest path in an unweighted graph?',
        options: ['Yes', 'No', 'Only for trees', 'Only for directed graphs'],
        correctAnswer: 0,
        explanation: 'BFS explores nodes in order of distance from the start, guaranteeing the shortest path in unweighted graphs.',
        type: 'logic',
      },
      {
        id: 'bfs-3',
        question: 'What is the time complexity of BFS?',
        options: ['O(V)', 'O(E)', 'O(V + E)', 'O(V × E)'],
        correctAnswer: 2,
        explanation: 'BFS visits each vertex once (V) and examines each edge once (E), giving O(V + E) total time.',
        type: 'complexity',
      },
      {
        id: 'bfs-4',
        question: 'BFS is ideal for finding:',
        options: ['Minimum spanning tree', 'Shortest path in weighted graphs', 'Shortest path in unweighted graphs', 'Strongly connected components'],
        correctAnswer: 2,
        explanation: 'BFS is optimal for unweighted shortest paths because it explores nodes level-by-level from the source.',
        type: 'use-case',
      },
    ],
  },
  'dfs': {
    algorithmId: 'dfs',
    algorithmName: 'Depth-First Search',
    questions: [
      {
        id: 'dfs-1',
        question: 'What data structure does DFS primarily use?',
        options: ['Queue', 'Stack', 'Heap', 'Array'],
        correctAnswer: 1,
        explanation: 'DFS uses a stack (LIFO), either explicitly or through recursion, to explore as deep as possible before backtracking.',
        type: 'logic',
      },
      {
        id: 'dfs-2',
        question: 'Does DFS guarantee the shortest path?',
        options: ['Yes', 'No', 'Only in trees', 'Only in DAGs'],
        correctAnswer: 1,
        explanation: 'DFS may find a path that is not the shortest because it explores depth-first, not by distance from the source.',
        type: 'logic',
      },
      {
        id: 'dfs-3',
        question: 'DFS is commonly used for:',
        options: ['Shortest path problems', 'Cycle detection', 'Minimum spanning tree', 'Load balancing'],
        correctAnswer: 1,
        explanation: 'DFS is excellent for cycle detection, topological sorting, and finding strongly connected components.',
        type: 'use-case',
      },
      {
        id: 'dfs-4',
        question: 'What is the space complexity of DFS?',
        options: ['O(1)', 'O(log V)', 'O(V)', 'O(E)'],
        correctAnswer: 2,
        explanation: 'DFS stores vertices on the stack, which in the worst case (a long path) can be O(V).',
        type: 'complexity',
      },
    ],
  },
  'dijkstra': {
    algorithmId: 'dijkstra',
    algorithmName: "Dijkstra's Algorithm",
    questions: [
      {
        id: 'dij-1',
        question: 'What is the time complexity of Dijkstra with a binary heap?',
        options: ['O(V)', 'O(V log V)', 'O((V + E) log V)', 'O(V²)'],
        correctAnswer: 2,
        explanation: 'With a binary heap, extracting minimum takes O(log V) and we do this V times, plus E decrease-key operations.',
        type: 'complexity',
      },
      {
        id: 'dij-2',
        question: 'Does Dijkstra work with negative edge weights?',
        options: ['Yes', 'No', 'Only with cycles', 'Only without cycles'],
        correctAnswer: 1,
        explanation: 'Dijkstra cannot handle negative weights because it assumes once a node is processed, its shortest path is found - negative edges can violate this.',
        type: 'logic',
      },
      {
        id: 'dij-3',
        question: 'What is the main difference between Dijkstra and BFS?',
        options: ['Dijkstra uses a stack', 'Dijkstra handles weighted edges', 'BFS is faster', 'BFS uses more memory'],
        correctAnswer: 1,
        explanation: 'Dijkstra uses a priority queue to always process the node with the smallest cumulative distance, handling weighted edges correctly.',
        type: 'logic',
      },
      {
        id: 'dij-4',
        question: 'Dijkstra\'s algorithm is a type of:',
        options: ['Brute force', 'Greedy algorithm', 'Dynamic programming', 'Backtracking'],
        correctAnswer: 1,
        explanation: 'Dijkstra is greedy - it always selects the unvisited node with the smallest known distance, building the solution incrementally.',
        type: 'logic',
      },
    ],
  },
  'astar': {
    algorithmId: 'astar',
    algorithmName: 'A* Search',
    questions: [
      {
        id: 'ast-1',
        question: 'What makes A* different from Dijkstra?',
        options: ['A* is slower', 'A* uses a heuristic function', 'A* cannot find shortest paths', 'A* uses a stack'],
        correctAnswer: 1,
        explanation: 'A* adds a heuristic (estimated cost to goal) to guide the search toward the target, often exploring fewer nodes than Dijkstra.',
        type: 'logic',
      },
      {
        id: 'ast-2',
        question: 'For A* to guarantee the optimal path, the heuristic must be:',
        options: ['Overestimating', 'Admissible (never overestimate)', 'Exactly accurate', 'Random'],
        correctAnswer: 1,
        explanation: 'An admissible heuristic never overestimates the true cost, ensuring A* finds the optimal path.',
        type: 'logic',
      },
      {
        id: 'ast-3',
        question: 'In A*, f(n) = g(n) + h(n). What does g(n) represent?',
        options: ['Heuristic cost', 'Actual cost from start', 'Estimated total cost', 'Cost to goal'],
        correctAnswer: 1,
        explanation: 'g(n) is the actual cost from the start node to node n, while h(n) is the heuristic estimate to the goal.',
        type: 'logic',
      },
      {
        id: 'ast-4',
        question: 'The Manhattan distance heuristic is best for:',
        options: ['Any graph', 'Grid-based movement (4 directions)', 'Diagonal movement', 'Weighted graphs'],
        correctAnswer: 1,
        explanation: 'Manhattan distance (|x1-x2| + |y1-y2|) perfectly estimates cost when movement is restricted to 4 cardinal directions.',
        type: 'use-case',
      },
      {
        id: 'ast-5',
        question: 'If h(n) = 0 for all nodes, A* behaves like:',
        options: ['BFS', 'DFS', 'Dijkstra', 'Greedy Best-First'],
        correctAnswer: 2,
        explanation: 'With h(n) = 0, f(n) = g(n), so A* only considers actual cost, degenerating into Dijkstra\'s algorithm.',
        type: 'logic',
      },
    ],
  },
};

// All quizzes combined
export const allQuizzes: Record<string, AlgorithmQuiz> = {
  ...sortingQuizzes,
  ...searchingQuizzes,
  ...graphQuizzes,
};

// Get quiz for an algorithm
export function getQuizForAlgorithm(algorithmId: string): AlgorithmQuiz | null {
  return allQuizzes[algorithmId] || null;
}

// Get random questions from a quiz
export function getRandomQuestions(quiz: AlgorithmQuiz, count: number = 4): QuizQuestion[] {
  const shuffled = [...quiz.questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Calculate XP based on quiz performance
export function calculateQuizXP(correctAnswers: number, totalQuestions: number): number {
  const baseXP = 25;
  const bonusPerCorrect = 10;
  const perfectBonus = 25;

  let xp = baseXP + (correctAnswers * bonusPerCorrect);

  // Perfect score bonus
  if (correctAnswers === totalQuestions) {
    xp += perfectBonus;
  }

  return xp;
}

// Mastery levels based on quiz scores
export type MasteryLevel = 'none' | 'bronze' | 'silver' | 'gold';

export function getMasteryLevel(quizScores: number[]): MasteryLevel {
  if (quizScores.length === 0) return 'none';

  const avgScore = quizScores.reduce((a, b) => a + b, 0) / quizScores.length;

  if (avgScore >= 90) return 'gold';
  if (avgScore >= 70) return 'silver';
  if (avgScore >= 50) return 'bronze';
  return 'none';
}

export function getMasteryColor(level: MasteryLevel): string {
  switch (level) {
    case 'gold': return '#FBBF24'; // Logic Gold
    case 'silver': return '#94A3B8'; // Silver gray
    case 'bronze': return '#CD7F32'; // Bronze
    default: return '#475569'; // Gray
  }
}

export function getMasteryIcon(level: MasteryLevel): string {
  switch (level) {
    case 'gold': return 'trophy';
    case 'silver': return 'medal';
    case 'bronze': return 'ribbon';
    default: return 'ellipse-outline';
  }
}
