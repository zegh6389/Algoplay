// Algorithm Reading Library Content
import { Colors } from './theme';

export interface ComplexityChart {
  best: string;
  average: string;
  worst: string;
}

export interface Lesson {
  id: string;
  category: string;
  title: string;
  shortDescription: string;
  icon: string;
  color: string;
  timeComplexity: ComplexityChart;
  spaceComplexity: string;
  content: {
    overview: string;
    howItWorks: string;
    pseudocode: string[];
    advantages: string[];
    disadvantages: string[];
    realWorldApplications: string[];
    keyInsights: string[];
  };
}

export const algorithmLessons: Lesson[] = [
  // SORTING ALGORITHMS
  {
    id: 'bubble-sort',
    category: 'sorting',
    title: 'Bubble Sort',
    shortDescription: 'The simplest comparison-based sorting algorithm',
    icon: 'swap-vertical',
    color: Colors.alertCoral,
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    content: {
      overview: `Bubble Sort is one of the simplest sorting algorithms to understand and implement. It repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.

The algorithm gets its name because smaller elements "bubble" to the top of the list, while larger elements "sink" to the bottom, similar to how air bubbles rise in water.`,
      howItWorks: `1. Start at the beginning of the array
2. Compare the first two elements
3. If the first element is greater than the second, swap them
4. Move to the next pair and repeat the comparison
5. Continue until you reach the end of the array
6. Repeat the entire process until no swaps are needed

After each pass, the largest unsorted element is guaranteed to be in its correct position at the end of the unsorted portion. This means each subsequent pass can ignore one more element from the end.`,
      pseudocode: [
        'function bubbleSort(array):',
        '  n = length(array)',
        '  for i = 0 to n-1:',
        '    swapped = false',
        '    for j = 0 to n-i-1:',
        '      if array[j] > array[j+1]:',
        '        swap(array[j], array[j+1])',
        '        swapped = true',
        '    if not swapped:',
        '      break  // Array is sorted',
        '  return array',
      ],
      advantages: [
        'Simple to understand and implement',
        'Requires no additional memory (in-place sorting)',
        'Stable sort (maintains relative order of equal elements)',
        'Can detect if the array is already sorted (O(n) best case)',
      ],
      disadvantages: [
        'Very slow for large datasets - O(n²) comparisons',
        'Inefficient compared to other sorting algorithms',
        'Not suitable for production use with large data',
        'Many unnecessary comparisons even when array is nearly sorted',
      ],
      realWorldApplications: [
        'Educational purposes to teach basic sorting concepts',
        'Sorting very small datasets (< 20 elements)',
        'Situations where code simplicity is more important than efficiency',
        'Detecting nearly-sorted data with minimal overhead',
      ],
      keyInsights: [
        'Each pass guarantees the largest unsorted element reaches its final position',
        'The optimization with "swapped" flag can reduce time to O(n) for sorted arrays',
        'Bubble Sort performs poorly on reverse-sorted arrays',
        'Total comparisons: n(n-1)/2 in the worst case',
      ],
    },
  },
  {
    id: 'quick-sort',
    category: 'sorting',
    title: 'Quick Sort',
    shortDescription: 'The king of practical sorting algorithms',
    icon: 'flash',
    color: Colors.logicGold,
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    spaceComplexity: 'O(log n)',
    content: {
      overview: `Quick Sort is one of the most efficient and widely-used sorting algorithms. Developed by Tony Hoare in 1959, it uses a divide-and-conquer strategy to sort elements by partitioning the array around a "pivot" element.

Despite having a worst-case time complexity of O(n²), Quick Sort is often faster in practice than other O(n log n) algorithms due to its excellent cache performance and low constant factors.`,
      howItWorks: `1. Choose a pivot element from the array
2. Partition the array: move all elements smaller than the pivot to its left, and all elements larger to its right
3. After partitioning, the pivot is in its final sorted position
4. Recursively apply the same process to the sub-arrays on the left and right of the pivot
5. Base case: arrays of size 0 or 1 are already sorted

The key operation is the partition step, which can be implemented in different ways (Lomuto, Hoare schemes). The choice of pivot significantly affects performance.`,
      pseudocode: [
        'function quickSort(array, low, high):',
        '  if low < high:',
        '    pivotIndex = partition(array, low, high)',
        '    quickSort(array, low, pivotIndex - 1)',
        '    quickSort(array, pivotIndex + 1, high)',
        '',
        'function partition(array, low, high):',
        '  pivot = array[high]',
        '  i = low - 1',
        '  for j = low to high - 1:',
        '    if array[j] <= pivot:',
        '      i = i + 1',
        '      swap(array[i], array[j])',
        '  swap(array[i + 1], array[high])',
        '  return i + 1',
      ],
      advantages: [
        'Excellent average-case performance O(n log n)',
        'In-place sorting (low memory overhead)',
        'Cache-friendly due to sequential memory access',
        'Fast constant factors make it practical',
        'Easy to parallelize',
      ],
      disadvantages: [
        'Worst case O(n²) on already sorted or reverse sorted arrays',
        'Not stable (may change relative order of equal elements)',
        'Recursive nature can cause stack overflow on very large arrays',
        'Performance depends heavily on pivot selection',
      ],
      realWorldApplications: [
        "Most programming languages' default sort (C++ std::sort, Java Arrays.sort for primitives)",
        'Database query optimization for sorting operations',
        'File system sorting and organization',
        'Graphics rendering for depth sorting',
        'Numerical computing and scientific applications',
      ],
      keyInsights: [
        'Random pivot selection avoids worst-case on sorted inputs',
        'Median-of-three pivot selection is a common optimization',
        'Tail recursion optimization reduces stack space',
        'Hybrid approaches (Introsort) switch to Heapsort when recursion is too deep',
        'Quick Sort is 2-3x faster than Merge Sort in practice despite same complexity',
      ],
    },
  },
  {
    id: 'merge-sort',
    category: 'sorting',
    title: 'Merge Sort',
    shortDescription: 'Guaranteed O(n log n) divide-and-conquer sorting',
    icon: 'git-merge',
    color: Colors.info,
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(n)',
    content: {
      overview: `Merge Sort is a stable, divide-and-conquer sorting algorithm invented by John von Neumann in 1945. It guarantees O(n log n) time complexity in all cases, making it predictable and reliable for critical applications.

The algorithm divides the input array into two halves, recursively sorts them, and then merges the sorted halves. The merge operation is the key step that combines two sorted arrays into one.`,
      howItWorks: `1. Divide: Split the array into two halves
2. Conquer: Recursively sort each half
3. Merge: Combine the two sorted halves into a single sorted array
4. Base case: An array of one element is already sorted

The merge step compares elements from both halves and places them in order. It uses a temporary array to hold the merged result before copying back.`,
      pseudocode: [
        'function mergeSort(array):',
        '  if length(array) <= 1:',
        '    return array',
        '  mid = length(array) / 2',
        '  left = mergeSort(array[0..mid])',
        '  right = mergeSort(array[mid..end])',
        '  return merge(left, right)',
        '',
        'function merge(left, right):',
        '  result = []',
        '  while left and right not empty:',
        '    if left[0] <= right[0]:',
        '      result.append(left.removeFirst())',
        '    else:',
        '      result.append(right.removeFirst())',
        '  append remaining elements',
        '  return result',
      ],
      advantages: [
        'Guaranteed O(n log n) time complexity in all cases',
        'Stable sort (preserves relative order of equal elements)',
        'Excellent for linked lists (can be done in-place)',
        'Parallelizes well for distributed systems',
        'Predictable performance regardless of input',
      ],
      disadvantages: [
        'Requires O(n) extra space for arrays',
        'Slower than Quick Sort in practice (higher constant factors)',
        'Not in-place for arrays',
        'Recursive calls add overhead',
      ],
      realWorldApplications: [
        'External sorting (sorting data larger than memory)',
        'Sorting linked lists',
        'Java Arrays.sort() for objects (stability required)',
        'Parallel and distributed sorting algorithms',
        'Inversion counting problems',
      ],
      keyInsights: [
        'Divides problem into exactly half each time → log n levels',
        'Each level does O(n) work → total O(n log n)',
        'Bottom-up (iterative) version avoids recursion overhead',
        'Natural merge sort is efficient on nearly-sorted data',
        'Timsort (Python, Java) combines Merge Sort with Insertion Sort',
      ],
    },
  },
  // TREE ALGORITHMS
  {
    id: 'binary-search-tree',
    category: 'trees',
    title: 'Binary Search Tree',
    shortDescription: 'Hierarchical structure for efficient search operations',
    icon: 'git-branch',
    color: Colors.actionTeal,
    timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    content: {
      overview: `A Binary Search Tree (BST) is a node-based binary tree data structure that maintains a sorted order. For each node, all elements in its left subtree are smaller, and all elements in its right subtree are larger.

BSTs provide efficient average-case search, insertion, and deletion operations. They form the foundation for more advanced self-balancing trees like AVL and Red-Black trees.`,
      howItWorks: `The BST Property:
- Left subtree contains only nodes with keys less than the node's key
- Right subtree contains only nodes with keys greater than the node's key
- Both left and right subtrees are also BSTs

Search: Start at root, go left if target < current, right if target > current
Insert: Follow search path until finding null, insert there
Delete: Three cases - leaf node, one child, two children

The height of the tree determines operation efficiency.`,
      pseudocode: [
        'function search(root, target):',
        '  if root is null or root.value == target:',
        '    return root',
        '  if target < root.value:',
        '    return search(root.left, target)',
        '  return search(root.right, target)',
        '',
        'function insert(root, value):',
        '  if root is null:',
        '    return new Node(value)',
        '  if value < root.value:',
        '    root.left = insert(root.left, value)',
        '  else:',
        '    root.right = insert(root.right, value)',
        '  return root',
      ],
      advantages: [
        'O(log n) average case for search, insert, delete',
        'Maintains sorted order for range queries',
        'In-order traversal gives sorted sequence',
        'Flexible structure for dynamic data',
        'Foundation for more advanced tree structures',
      ],
      disadvantages: [
        'Can degrade to O(n) if unbalanced (linked list)',
        'No guarantee of balance',
        'Complex deletion with two children',
        'Pointer overhead compared to arrays',
      ],
      realWorldApplications: [
        'Database indexing (B-trees are generalizations)',
        'File system directory structures',
        'Expression parsing and evaluation',
        'Autocomplete suggestions',
        'Priority scheduling systems',
      ],
      keyInsights: [
        'Height-balanced BSTs maintain O(log n) operations',
        'In-order traversal visits nodes in sorted order',
        'Pre-order traversal can serialize tree structure',
        'Worst case occurs with sorted input → becomes linked list',
        'Self-balancing variants: AVL, Red-Black, Splay trees',
      ],
    },
  },
  {
    id: 'heap-data-structure',
    category: 'trees',
    title: 'Heap & Priority Queue',
    shortDescription: 'Complete binary tree for priority-based operations',
    icon: 'layers',
    color: Colors.frontier,
    timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(n)',
    content: {
      overview: `A Heap is a specialized tree-based data structure that satisfies the heap property. In a Max-Heap, each parent node is greater than or equal to its children. In a Min-Heap, each parent is less than or equal to its children.

Heaps are complete binary trees, meaning all levels are fully filled except possibly the last level, which is filled from left to right. This property allows heaps to be efficiently stored in arrays.`,
      howItWorks: `Array Representation:
- Parent of node at index i: floor((i-1)/2)
- Left child of node at index i: 2i + 1
- Right child of node at index i: 2i + 2

Key Operations:
1. Insert: Add to end, "bubble up" to maintain heap property
2. Extract Max/Min: Remove root, move last element to root, "bubble down"
3. Build Heap: Start from last non-leaf, heapify each subtree

Heapify ensures the heap property by comparing parent with children and swapping if needed.`,
      pseudocode: [
        'function heapify(array, n, i):',
        '  largest = i',
        '  left = 2*i + 1',
        '  right = 2*i + 2',
        '  if left < n and array[left] > array[largest]:',
        '    largest = left',
        '  if right < n and array[right] > array[largest]:',
        '    largest = right',
        '  if largest != i:',
        '    swap(array[i], array[largest])',
        '    heapify(array, n, largest)',
        '',
        'function buildHeap(array):',
        '  n = length(array)',
        '  for i = n/2 - 1 down to 0:',
        '    heapify(array, n, i)',
      ],
      advantages: [
        'O(1) access to maximum (or minimum) element',
        'O(log n) insert and delete operations',
        'O(n) time to build heap from array',
        'Compact array representation',
        'Excellent for priority queue implementation',
      ],
      disadvantages: [
        'Not suitable for searching arbitrary elements',
        'Not stable (equal elements may be reordered)',
        'Cache performance not as good as Quick Sort',
        'More complex than simple linear structures',
      ],
      realWorldApplications: [
        "Priority queues (CPU scheduling, network packets)",
        'Heap Sort algorithm',
        "Dijkstra's and Prim's algorithms",
        'Finding k largest/smallest elements',
        'Median maintenance in streaming data',
        'Event-driven simulation systems',
      ],
      keyInsights: [
        'Building heap is O(n), not O(n log n) - a non-obvious result',
        'Complete binary tree property allows array storage',
        'Heap Sort is guaranteed O(n log n) with O(1) space',
        'Fibonacci Heaps improve some operations to O(1) amortized',
        'Binary Heaps are simpler but Fibonacci Heaps are theoretically better',
      ],
    },
  },
  // GRAPH ALGORITHMS
  {
    id: 'breadth-first-search',
    category: 'graphs',
    title: 'Breadth-First Search (BFS)',
    shortDescription: 'Level-by-level graph traversal using a queue',
    icon: 'git-network',
    color: Colors.info,
    timeComplexity: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
    spaceComplexity: 'O(V)',
    content: {
      overview: `Breadth-First Search (BFS) is a graph traversal algorithm that explores vertices level by level, starting from a source vertex. It visits all vertices at distance k from the source before visiting any vertex at distance k+1.

BFS uses a queue to manage the order of exploration, ensuring that closer vertices are always processed before farther ones. This property makes BFS ideal for finding shortest paths in unweighted graphs.`,
      howItWorks: `1. Start at the source vertex, add it to a queue
2. Dequeue a vertex and mark it as visited
3. Add all unvisited neighbors to the queue
4. Repeat steps 2-3 until the queue is empty

The queue ensures FIFO order: vertices discovered earlier are explored earlier. This creates a "wavefront" that expands outward from the source.`,
      pseudocode: [
        'function BFS(graph, source):',
        '  queue = new Queue()',
        '  visited = new Set()',
        '  queue.enqueue(source)',
        '  visited.add(source)',
        '',
        '  while queue is not empty:',
        '    vertex = queue.dequeue()',
        '    process(vertex)',
        '    for neighbor in graph.neighbors(vertex):',
        '      if neighbor not in visited:',
        '        visited.add(neighbor)',
        '        queue.enqueue(neighbor)',
      ],
      advantages: [
        'Finds shortest path in unweighted graphs',
        'Explores all vertices at current level before going deeper',
        'Complete: will find a solution if one exists',
        'Optimal for unweighted shortest path',
        'Easy to implement with a queue',
      ],
      disadvantages: [
        'High memory usage for wide graphs',
        'May be slower than DFS for deep graphs',
        'Not suitable for weighted graphs (use Dijkstra)',
        'Must store all frontier nodes',
      ],
      realWorldApplications: [
        'Finding shortest path in unweighted graphs',
        'Social network analysis (degrees of separation)',
        'Web crawlers',
        'GPS navigation (initial planning)',
        'Network broadcasting',
        'Finding connected components',
      ],
      keyInsights: [
        'BFS finds shortest path by number of edges',
        'Level-order tree traversal is BFS on trees',
        'Queue size can grow to O(V) in the worst case',
        'BFS tree has minimum depth among all spanning trees',
        'Can be modified to find all shortest paths',
      ],
    },
  },
  {
    id: 'depth-first-search',
    category: 'graphs',
    title: 'Depth-First Search (DFS)',
    shortDescription: 'Stack-based graph exploration to maximum depth',
    icon: 'arrow-down',
    color: Colors.alertCoral,
    timeComplexity: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
    spaceComplexity: 'O(V)',
    content: {
      overview: `Depth-First Search (DFS) is a graph traversal algorithm that explores as deep as possible along each branch before backtracking. It uses a stack (or recursion) to keep track of vertices to visit.

DFS is fundamental to many graph algorithms including topological sorting, cycle detection, and finding strongly connected components.`,
      howItWorks: `Recursive approach:
1. Visit the current vertex
2. Mark it as visited
3. Recursively visit each unvisited neighbor
4. Backtrack when all neighbors are visited

Iterative approach uses an explicit stack instead of recursion. The key difference from BFS is LIFO vs FIFO order of exploration.`,
      pseudocode: [
        'function DFS(graph, vertex, visited):',
        '  if vertex in visited:',
        '    return',
        '  visited.add(vertex)',
        '  process(vertex)',
        '  for neighbor in graph.neighbors(vertex):',
        '    DFS(graph, neighbor, visited)',
        '',
        '// Iterative version',
        'function DFS_iterative(graph, source):',
        '  stack = new Stack()',
        '  visited = new Set()',
        '  stack.push(source)',
        '  while stack is not empty:',
        '    vertex = stack.pop()',
        '    if vertex not in visited:',
        '      visited.add(vertex)',
        '      process(vertex)',
        '      for neighbor in graph.neighbors(vertex):',
        '        stack.push(neighbor)',
      ],
      advantages: [
        'Uses less memory than BFS for deep graphs',
        'Naturally fits recursive problems',
        'Good for maze solving and puzzle games',
        'Basis for many advanced algorithms',
        'Simple recursive implementation',
      ],
      disadvantages: [
        'May not find shortest path',
        'Can get stuck in deep branches',
        'May cause stack overflow on deep graphs',
        'Not optimal for shortest path problems',
      ],
      realWorldApplications: [
        'Topological sorting (dependency resolution)',
        'Cycle detection in graphs',
        'Maze generation and solving',
        'Finding strongly connected components',
        'Path finding in game AI',
        'Expression tree evaluation',
      ],
      keyInsights: [
        'DFS produces a spanning tree with specific properties',
        'Pre-order: process node before children',
        'Post-order: process node after children (useful for topological sort)',
        'Back edges indicate cycles in directed graphs',
        'Memory efficient: O(d) where d is maximum depth',
      ],
    },
  },
  {
    id: 'dijkstra-algorithm',
    category: 'graphs',
    title: "Dijkstra's Algorithm",
    shortDescription: 'Finding shortest paths in weighted graphs',
    icon: 'navigate',
    color: Colors.success,
    timeComplexity: { best: 'O((V+E) log V)', average: 'O((V+E) log V)', worst: 'O((V+E) log V)' },
    spaceComplexity: 'O(V)',
    content: {
      overview: `Dijkstra's Algorithm, invented by Edsger W. Dijkstra in 1956, finds the shortest paths from a source vertex to all other vertices in a weighted graph with non-negative edge weights.

It's a greedy algorithm that always selects the vertex with the smallest known distance from the source. This property guarantees optimality when all edge weights are non-negative.`,
      howItWorks: `1. Initialize distances: source = 0, all others = infinity
2. Add all vertices to a priority queue (min-heap)
3. Extract the vertex with minimum distance
4. For each neighbor, calculate distance through current vertex
5. If this distance is less than known distance, update it
6. Repeat until all vertices are processed

The key insight is that once a vertex is extracted from the priority queue, its shortest distance is finalized.`,
      pseudocode: [
        'function dijkstra(graph, source):',
        '  dist = {v: infinity for v in graph}',
        '  dist[source] = 0',
        '  pq = PriorityQueue()',
        '  pq.add(source, 0)',
        '',
        '  while pq is not empty:',
        '    u = pq.extractMin()',
        '    for (v, weight) in graph.neighbors(u):',
        '      if dist[u] + weight < dist[v]:',
        '        dist[v] = dist[u] + weight',
        '        pq.decreaseKey(v, dist[v])',
        '  return dist',
      ],
      advantages: [
        'Finds globally optimal shortest paths',
        'Efficient with priority queue: O((V+E) log V)',
        'Works for sparse and dense graphs',
        'Foundation for many routing algorithms',
        'Can reconstruct actual paths',
      ],
      disadvantages: [
        'Does not work with negative edge weights',
        'Must process all vertices reachable from source',
        'More complex than BFS',
        'Requires efficient priority queue implementation',
      ],
      realWorldApplications: [
        'GPS navigation and routing',
        'Network routing protocols (OSPF)',
        'Flight booking systems',
        'Robot path planning',
        'Social network distance computation',
        'Game AI pathfinding',
      ],
      keyInsights: [
        'Greedy choice is optimal because of non-negative weights',
        'With Fibonacci heap: O(V log V + E) time',
        'For negative weights, use Bellman-Ford',
        'A* is Dijkstra with heuristics for faster goal-directed search',
        'Can stop early if only need path to specific target',
      ],
    },
  },
];

export const lessonCategories = [
  { id: 'all', name: 'All', icon: 'apps' },
  { id: 'sorting', name: 'Sorting', icon: 'bar-chart', color: Colors.alertCoral },
  { id: 'trees', name: 'Trees', icon: 'git-branch', color: Colors.actionTeal },
  { id: 'graphs', name: 'Graphs', icon: 'git-network', color: Colors.info },
];

export const getLessonById = (id: string): Lesson | undefined => {
  return algorithmLessons.find(lesson => lesson.id === id);
};

export const getLessonsByCategory = (category: string): Lesson[] => {
  if (category === 'all') return algorithmLessons;
  return algorithmLessons.filter(lesson => lesson.category === category);
};
