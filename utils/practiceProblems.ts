// Practice Problems Data - LeetCode/HackerRank Style Interview Problems

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface PracticeProblem {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  algorithmId: string;
  statement: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  hint: string;
  approach: string;
  solution: string;
  timeComplexity: string;
  spaceComplexity: string;
  tags: string[];
}

// Sorting Problems
export const sortingProblems: PracticeProblem[] = [
  {
    id: 'sp-1',
    title: 'Sort Colors (Dutch National Flag)',
    difficulty: 'Medium',
    category: 'sorting',
    algorithmId: 'quick-sort',
    statement: `Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue.

We will use the integers 0, 1, and 2 to represent red, white, and blue respectively.

You must solve this problem without using the library's sort function.`,
    examples: [
      {
        input: 'nums = [2, 0, 2, 1, 1, 0]',
        output: '[0, 0, 1, 1, 2, 2]',
        explanation: 'The array is sorted with all 0s first, then 1s, then 2s.',
      },
      {
        input: 'nums = [2, 0, 1]',
        output: '[0, 1, 2]',
      },
    ],
    constraints: [
      'n == nums.length',
      '1 <= n <= 300',
      'nums[i] is 0, 1, or 2',
    ],
    hint: 'Think about using three pointers. Can you partition the array into three sections in one pass?',
    approach: `Use the Dutch National Flag algorithm with three pointers:
- low: boundary for 0s (everything before low is 0)
- mid: current element being examined
- high: boundary for 2s (everything after high is 2)

Iterate while mid <= high:
1. If nums[mid] == 0: swap with low, increment both low and mid
2. If nums[mid] == 1: just increment mid
3. If nums[mid] == 2: swap with high, decrement high (don't increment mid)`,
    solution: `def sortColors(nums):
    low, mid, high = 0, 0, len(nums) - 1

    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:  # nums[mid] == 2
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1

    return nums`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    tags: ['Array', 'Two Pointers', 'Sorting'],
  },
  {
    id: 'sp-2',
    title: 'Merge Intervals',
    difficulty: 'Medium',
    category: 'sorting',
    algorithmId: 'merge-sort',
    statement: `Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
    examples: [
      {
        input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
        output: '[[1,6],[8,10],[15,18]]',
        explanation: 'Intervals [1,3] and [2,6] overlap, so merge them into [1,6].',
      },
      {
        input: 'intervals = [[1,4],[4,5]]',
        output: '[[1,5]]',
        explanation: 'Intervals [1,4] and [4,5] are considered overlapping.',
      },
    ],
    constraints: [
      '1 <= intervals.length <= 10^4',
      'intervals[i].length == 2',
      '0 <= starti <= endi <= 10^4',
    ],
    hint: 'If you sort the intervals by start time, overlapping intervals will be adjacent. Then you can merge them in one pass.',
    approach: `1. Sort intervals by start time
2. Initialize result with first interval
3. For each subsequent interval:
   - If it overlaps with last in result (start <= last.end), merge them
   - Otherwise, add it to result`,
    solution: `def merge(intervals):
    if not intervals:
        return []

    # Sort by start time
    intervals.sort(key=lambda x: x[0])

    merged = [intervals[0]]

    for i in range(1, len(intervals)):
        current = intervals[i]
        last = merged[-1]

        if current[0] <= last[1]:
            # Overlapping - merge
            last[1] = max(last[1], current[1])
        else:
            # Non-overlapping - add new interval
            merged.append(current)

    return merged`,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    tags: ['Array', 'Sorting'],
  },
  {
    id: 'sp-3',
    title: 'Kth Largest Element',
    difficulty: 'Medium',
    category: 'sorting',
    algorithmId: 'quick-sort',
    statement: `Given an integer array nums and an integer k, return the kth largest element in the array.

Note that it is the kth largest element in sorted order, not the kth distinct element.

Can you solve it without sorting?`,
    examples: [
      {
        input: 'nums = [3,2,1,5,6,4], k = 2',
        output: '5',
        explanation: 'The sorted array is [1,2,3,4,5,6], so the 2nd largest is 5.',
      },
      {
        input: 'nums = [3,2,3,1,2,4,5,5,6], k = 4',
        output: '4',
      },
    ],
    constraints: [
      '1 <= k <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
    ],
    hint: 'Use QuickSelect - a variation of QuickSort that only recurses into one partition.',
    approach: `QuickSelect Algorithm:
1. Choose a pivot and partition the array
2. If pivot index == n-k, we found the kth largest
3. If pivot index < n-k, search in right partition
4. If pivot index > n-k, search in left partition

This achieves O(n) average time by only exploring one partition.`,
    solution: `def findKthLargest(nums, k):
    def partition(left, right, pivot_idx):
        pivot = nums[pivot_idx]
        # Move pivot to end
        nums[pivot_idx], nums[right] = nums[right], nums[pivot_idx]
        store_idx = left

        for i in range(left, right):
            if nums[i] < pivot:
                nums[store_idx], nums[i] = nums[i], nums[store_idx]
                store_idx += 1

        nums[right], nums[store_idx] = nums[store_idx], nums[right]
        return store_idx

    def quickselect(left, right, k_smallest):
        if left == right:
            return nums[left]

        pivot_idx = (left + right) // 2
        pivot_idx = partition(left, right, pivot_idx)

        if k_smallest == pivot_idx:
            return nums[k_smallest]
        elif k_smallest < pivot_idx:
            return quickselect(left, pivot_idx - 1, k_smallest)
        else:
            return quickselect(pivot_idx + 1, right, k_smallest)

    return quickselect(0, len(nums) - 1, len(nums) - k)`,
    timeComplexity: 'O(n) average, O(n²) worst',
    spaceComplexity: 'O(1)',
    tags: ['Array', 'Divide and Conquer', 'QuickSelect'],
  },
];

// Searching Problems
export const searchingProblems: PracticeProblem[] = [
  {
    id: 'srp-1',
    title: 'Search in Rotated Sorted Array',
    difficulty: 'Medium',
    category: 'searching',
    algorithmId: 'binary-search',
    statement: `Given a sorted array that has been rotated at some pivot, search for a target value. Return the index if found, -1 otherwise.

The array was originally sorted in ascending order, then rotated between 1 and n times.

You must write an algorithm with O(log n) runtime complexity.`,
    examples: [
      {
        input: 'nums = [4,5,6,7,0,1,2], target = 0',
        output: '4',
        explanation: 'The array was rotated at index 3. Target 0 is at index 4.',
      },
      {
        input: 'nums = [4,5,6,7,0,1,2], target = 3',
        output: '-1',
        explanation: '3 is not in the array.',
      },
    ],
    constraints: [
      '1 <= nums.length <= 5000',
      '-10^4 <= nums[i] <= 10^4',
      'All values are unique',
      'nums is sorted and rotated',
    ],
    hint: 'In a rotated sorted array, one half is always sorted. Use binary search but check which half is sorted first.',
    approach: `Modified Binary Search:
1. Find mid element
2. Determine which half is sorted (compare with left/right)
3. Check if target is in the sorted half
4. If yes, search there; if no, search the other half`,
    solution: `def search(nums, target):
    left, right = 0, len(nums) - 1

    while left <= right:
        mid = (left + right) // 2

        if nums[mid] == target:
            return mid

        # Left half is sorted
        if nums[left] <= nums[mid]:
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        # Right half is sorted
        else:
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1

    return -1`,
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    tags: ['Array', 'Binary Search'],
  },
  {
    id: 'srp-2',
    title: 'Find First and Last Position',
    difficulty: 'Medium',
    category: 'searching',
    algorithmId: 'binary-search',
    statement: `Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value.

If target is not found in the array, return [-1, -1].

You must write an algorithm with O(log n) runtime complexity.`,
    examples: [
      {
        input: 'nums = [5,7,7,8,8,10], target = 8',
        output: '[3, 4]',
        explanation: '8 first appears at index 3 and last appears at index 4.',
      },
      {
        input: 'nums = [5,7,7,8,8,10], target = 6',
        output: '[-1, -1]',
      },
    ],
    constraints: [
      '0 <= nums.length <= 10^5',
      '-10^9 <= nums[i] <= 10^9',
      'nums is sorted in non-decreasing order',
    ],
    hint: 'Use two binary searches - one to find the leftmost occurrence and one for the rightmost.',
    approach: `Two Binary Searches:
1. First binary search: find leftmost target (when found, continue searching left)
2. Second binary search: find rightmost target (when found, continue searching right)`,
    solution: `def searchRange(nums, target):
    def findLeft():
        left, right = 0, len(nums) - 1
        result = -1
        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                result = mid
                right = mid - 1  # Continue left
            elif nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return result

    def findRight():
        left, right = 0, len(nums) - 1
        result = -1
        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                result = mid
                left = mid + 1  # Continue right
            elif nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return result

    return [findLeft(), findRight()]`,
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    tags: ['Array', 'Binary Search'],
  },
];

// Graph Problems
export const graphProblems: PracticeProblem[] = [
  {
    id: 'gp-1',
    title: 'Number of Islands',
    difficulty: 'Medium',
    category: 'graphs',
    algorithmId: 'bfs',
    statement: `Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are surrounded by water.`,
    examples: [
      {
        input: `grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]`,
        output: '1',
      },
      {
        input: `grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]`,
        output: '3',
      },
    ],
    constraints: [
      'm == grid.length',
      'n == grid[i].length',
      '1 <= m, n <= 300',
      'grid[i][j] is "0" or "1"',
    ],
    hint: 'Use BFS/DFS to explore each island. When you find a "1", explore all connected land and mark it as visited.',
    approach: `BFS Approach:
1. Iterate through each cell
2. When you find an unvisited '1', increment island count
3. Use BFS to visit all connected land cells
4. Mark visited cells to avoid counting twice`,
    solution: `from collections import deque

def numIslands(grid):
    if not grid:
        return 0

    rows, cols = len(grid), len(grid[0])
    islands = 0

    def bfs(r, c):
        queue = deque([(r, c)])
        grid[r][c] = '0'  # Mark visited

        while queue:
            row, col = queue.popleft()
            directions = [(1,0), (-1,0), (0,1), (0,-1)]

            for dr, dc in directions:
                nr, nc = row + dr, col + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == '1':
                    grid[nr][nc] = '0'
                    queue.append((nr, nc))

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                islands += 1
                bfs(r, c)

    return islands`,
    timeComplexity: 'O(m × n)',
    spaceComplexity: 'O(min(m, n))',
    tags: ['Graph', 'BFS', 'DFS', 'Matrix'],
  },
  {
    id: 'gp-2',
    title: 'Shortest Path in Binary Matrix',
    difficulty: 'Medium',
    category: 'graphs',
    algorithmId: 'bfs',
    statement: `Given an n x n binary matrix grid, return the length of the shortest clear path from top-left to bottom-right. If there is no clear path, return -1.

A clear path is a path from top-left to bottom-right such that:
- All visited cells are 0
- All adjacent cells are 8-directionally connected`,
    examples: [
      {
        input: 'grid = [[0,1],[1,0]]',
        output: '2',
      },
      {
        input: 'grid = [[0,0,0],[1,1,0],[1,1,0]]',
        output: '4',
      },
    ],
    constraints: [
      'n == grid.length == grid[i].length',
      '1 <= n <= 100',
      'grid[i][j] is 0 or 1',
    ],
    hint: 'BFS guarantees the shortest path in an unweighted graph. Use 8 directions for adjacent cells.',
    approach: `BFS with 8 directions:
1. Start from (0,0) if it's 0
2. Use BFS with 8 directional movement
3. First time we reach (n-1, n-1) gives the shortest path
4. Track distance as we explore`,
    solution: `from collections import deque

def shortestPathBinaryMatrix(grid):
    n = len(grid)
    if grid[0][0] or grid[n-1][n-1]:
        return -1

    directions = [(-1,-1),(-1,0),(-1,1),(0,-1),
                  (0,1),(1,-1),(1,0),(1,1)]

    queue = deque([(0, 0, 1)])  # (row, col, distance)
    grid[0][0] = 1  # Mark visited

    while queue:
        r, c, dist = queue.popleft()

        if r == n-1 and c == n-1:
            return dist

        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 0:
                grid[nr][nc] = 1
                queue.append((nr, nc, dist + 1))

    return -1`,
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(n²)',
    tags: ['Graph', 'BFS', 'Matrix', 'Shortest Path'],
  },
  {
    id: 'gp-3',
    title: 'Network Delay Time',
    difficulty: 'Medium',
    category: 'graphs',
    algorithmId: 'dijkstra',
    statement: `You are given a network of n nodes, labeled from 1 to n. You are also given times, a list of travel times as directed edges times[i] = (ui, vi, wi), where ui is the source, vi is the target, and wi is the time it takes for a signal to travel.

Return the minimum time for all n nodes to receive the signal sent from node k. Return -1 if not all nodes can receive the signal.`,
    examples: [
      {
        input: 'times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2',
        output: '2',
        explanation: 'Signal goes 2->1 (1), 2->3 (1), 3->4 (2). Max time is 2.',
      },
      {
        input: 'times = [[1,2,1]], n = 2, k = 2',
        output: '-1',
        explanation: 'Node 1 cannot receive signal from node 2.',
      },
    ],
    constraints: [
      '1 <= k <= n <= 100',
      '1 <= times.length <= 6000',
      '1 <= ui, vi <= n',
      '0 <= wi <= 100',
    ],
    hint: 'This is a shortest path problem. Use Dijkstra to find shortest times to all nodes, then return the maximum.',
    approach: `Dijkstra's Algorithm:
1. Build adjacency list from edges
2. Run Dijkstra from source k
3. Find shortest time to each node
4. Return max time (or -1 if any node unreachable)`,
    solution: `import heapq
from collections import defaultdict

def networkDelayTime(times, n, k):
    # Build graph
    graph = defaultdict(list)
    for u, v, w in times:
        graph[u].append((v, w))

    # Dijkstra
    dist = {k: 0}
    heap = [(0, k)]

    while heap:
        d, node = heapq.heappop(heap)

        if d > dist.get(node, float('inf')):
            continue

        for neighbor, weight in graph[node]:
            new_dist = d + weight
            if new_dist < dist.get(neighbor, float('inf')):
                dist[neighbor] = new_dist
                heapq.heappush(heap, (new_dist, neighbor))

    if len(dist) != n:
        return -1

    return max(dist.values())`,
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V + E)',
    tags: ['Graph', 'Dijkstra', 'Shortest Path', 'Heap'],
  },
];

// All problems combined
export const allProblems: PracticeProblem[] = [
  ...sortingProblems,
  ...searchingProblems,
  ...graphProblems,
];

// Get problems by algorithm
export function getProblemsByAlgorithm(algorithmId: string): PracticeProblem[] {
  return allProblems.filter(p => p.algorithmId === algorithmId);
}

// Get problems by category
export function getProblemsByCategory(category: string): PracticeProblem[] {
  return allProblems.filter(p => p.category === category);
}

// Get difficulty color
export function getDifficultyColor(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'Easy':
      return '#22C55E'; // Green
    case 'Medium':
      return '#FBBF24'; // Gold
    case 'Hard':
      return '#FB7185'; // Coral
    default:
      return '#94A3B8';
  }
}
