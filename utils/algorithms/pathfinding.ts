// Pathfinding Algorithms for Grid Escape

export interface GridCell {
  row: number;
  col: number;
  isObstacle: boolean;
  isStart: boolean;
  isEnd: boolean;
  isVisited: boolean;
  isPath: boolean;
  isFrontier: boolean;
  gCost: number; // Distance from start
  hCost: number; // Heuristic (estimated distance to end)
  fCost: number; // g + h
  parent: GridCell | null;
}

export interface PathfindingStep {
  grid: GridCell[][];
  current: { row: number; col: number } | null;
  frontier: { row: number; col: number; fCost?: number }[];
  visited: { row: number; col: number }[];
  path: { row: number; col: number }[];
  operation: string;
  operationsCount: number;
  nodesVisited: number;
  pathLength: number;
  isComplete: boolean;
}

export interface PathfindingAlgorithm {
  name: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  optimal: boolean;
  weighted: boolean;
}

export const pathfindingAlgorithms: Record<string, PathfindingAlgorithm> = {
  bfs: {
    name: 'Breadth-First Search',
    description: 'Explores all neighbors at current depth before moving deeper. Guarantees shortest path in unweighted graphs.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    optimal: true,
    weighted: false,
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    description: 'Finds shortest path by always expanding the node with smallest known distance. Works with weighted edges.',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    optimal: true,
    weighted: true,
  },
  astar: {
    name: 'A* Search',
    description: 'Uses heuristics to guide search toward the goal. Combines best of Dijkstra and greedy search.',
    timeComplexity: 'O(E)',
    spaceComplexity: 'O(V)',
    optimal: true,
    weighted: true,
  },
  dfs: {
    name: 'Depth-First Search',
    description: 'Explores as far as possible along each branch before backtracking. Does not guarantee shortest path.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    optimal: false,
    weighted: false,
  },
};

export function createGrid(rows: number, cols: number, start: { row: number; col: number }, end: { row: number; col: number }, obstacles: { row: number; col: number }[] = []): GridCell[][] {
  const grid: GridCell[][] = [];

  for (let r = 0; r < rows; r++) {
    const row: GridCell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        isObstacle: obstacles.some(o => o.row === r && o.col === c),
        isStart: start.row === r && start.col === c,
        isEnd: end.row === r && end.col === c,
        isVisited: false,
        isPath: false,
        isFrontier: false,
        gCost: Infinity,
        hCost: 0,
        fCost: Infinity,
        parent: null,
      });
    }
    grid.push(row);
  }

  return grid;
}

function cloneGrid(grid: GridCell[][]): GridCell[][] {
  return grid.map(row => row.map(cell => ({ ...cell, parent: cell.parent })));
}

function getNeighbors(grid: GridCell[][], cell: GridCell): GridCell[] {
  const neighbors: GridCell[] = [];
  const { row, col } = cell;
  const rows = grid.length;
  const cols = grid[0].length;

  // Up, Down, Left, Right
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    // Uncomment for diagonal movement
    // [-1, -1], [-1, 1], [1, -1], [1, 1]
  ];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;

    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
      const neighbor = grid[newRow][newCol];
      if (!neighbor.isObstacle) {
        neighbors.push(neighbor);
      }
    }
  }

  return neighbors;
}

function manhattanDistance(a: { row: number; col: number }, b: { row: number; col: number }): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function reconstructPath(endCell: GridCell): { row: number; col: number }[] {
  const path: { row: number; col: number }[] = [];
  let current: GridCell | null = endCell;

  while (current) {
    path.unshift({ row: current.row, col: current.col });
    current = current.parent;
  }

  return path;
}

// BFS Algorithm
export function* bfsGenerator(grid: GridCell[][]): Generator<PathfindingStep> {
  const workingGrid = cloneGrid(grid);
  const rows = workingGrid.length;
  const cols = workingGrid[0].length;

  let start: GridCell | null = null;
  let end: GridCell | null = null;

  // Find start and end
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (workingGrid[r][c].isStart) start = workingGrid[r][c];
      if (workingGrid[r][c].isEnd) end = workingGrid[r][c];
    }
  }

  if (!start || !end) return;

  const queue: GridCell[] = [start];
  start.isVisited = true;
  start.gCost = 0;

  let operationsCount = 0;
  const visited: { row: number; col: number }[] = [];
  const frontier: { row: number; col: number }[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    operationsCount++;

    visited.push({ row: current.row, col: current.col });
    current.isVisited = true;
    current.isFrontier = false;

    yield {
      grid: cloneGrid(workingGrid),
      current: { row: current.row, col: current.col },
      frontier: queue.map(c => ({ row: c.row, col: c.col })),
      visited: [...visited],
      path: [],
      operation: `Exploring (${current.row}, ${current.col})`,
      operationsCount,
      nodesVisited: visited.length,
      pathLength: 0,
      isComplete: false,
    };

    if (current.isEnd) {
      const path = reconstructPath(current);
      for (const p of path) {
        workingGrid[p.row][p.col].isPath = true;
      }

      yield {
        grid: cloneGrid(workingGrid),
        current: null,
        frontier: [],
        visited: [...visited],
        path,
        operation: `Path found! Length: ${path.length}`,
        operationsCount,
        nodesVisited: visited.length,
        pathLength: path.length,
        isComplete: true,
      };
      return;
    }

    const neighbors = getNeighbors(workingGrid, current);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited && !queue.includes(neighbor)) {
        neighbor.parent = current;
        neighbor.gCost = current.gCost + 1;
        neighbor.isFrontier = true;
        queue.push(neighbor);
      }
    }
  }

  yield {
    grid: cloneGrid(workingGrid),
    current: null,
    frontier: [],
    visited: [...visited],
    path: [],
    operation: 'No path found!',
    operationsCount,
    nodesVisited: visited.length,
    pathLength: 0,
    isComplete: true,
  };
}

// Dijkstra's Algorithm
export function* dijkstraGenerator(grid: GridCell[][]): Generator<PathfindingStep> {
  const workingGrid = cloneGrid(grid);
  const rows = workingGrid.length;
  const cols = workingGrid[0].length;

  let start: GridCell | null = null;
  let end: GridCell | null = null;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (workingGrid[r][c].isStart) start = workingGrid[r][c];
      if (workingGrid[r][c].isEnd) end = workingGrid[r][c];
    }
  }

  if (!start || !end) return;

  const openSet: GridCell[] = [start];
  start.gCost = 0;

  let operationsCount = 0;
  const visited: { row: number; col: number }[] = [];

  while (openSet.length > 0) {
    // Get node with lowest gCost
    openSet.sort((a, b) => a.gCost - b.gCost);
    const current = openSet.shift()!;
    operationsCount++;

    if (current.isVisited) continue;
    current.isVisited = true;
    visited.push({ row: current.row, col: current.col });

    yield {
      grid: cloneGrid(workingGrid),
      current: { row: current.row, col: current.col },
      frontier: openSet.map(c => ({ row: c.row, col: c.col, fCost: c.gCost })),
      visited: [...visited],
      path: [],
      operation: `Visiting (${current.row}, ${current.col}) - Cost: ${current.gCost}`,
      operationsCount,
      nodesVisited: visited.length,
      pathLength: 0,
      isComplete: false,
    };

    if (current.isEnd) {
      const path = reconstructPath(current);
      for (const p of path) {
        workingGrid[p.row][p.col].isPath = true;
      }

      yield {
        grid: cloneGrid(workingGrid),
        current: null,
        frontier: [],
        visited: [...visited],
        path,
        operation: `Path found! Length: ${path.length}`,
        operationsCount,
        nodesVisited: visited.length,
        pathLength: path.length,
        isComplete: true,
      };
      return;
    }

    const neighbors = getNeighbors(workingGrid, current);
    for (const neighbor of neighbors) {
      if (neighbor.isVisited) continue;

      const tentativeG = current.gCost + 1;
      if (tentativeG < neighbor.gCost) {
        neighbor.parent = current;
        neighbor.gCost = tentativeG;
        neighbor.isFrontier = true;
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  yield {
    grid: cloneGrid(workingGrid),
    current: null,
    frontier: [],
    visited: [...visited],
    path: [],
    operation: 'No path found!',
    operationsCount,
    nodesVisited: visited.length,
    pathLength: 0,
    isComplete: true,
  };
}

// A* Algorithm
export function* astarGenerator(grid: GridCell[][]): Generator<PathfindingStep> {
  const workingGrid = cloneGrid(grid);
  const rows = workingGrid.length;
  const cols = workingGrid[0].length;

  let start: GridCell | null = null;
  let end: GridCell | null = null;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (workingGrid[r][c].isStart) start = workingGrid[r][c];
      if (workingGrid[r][c].isEnd) end = workingGrid[r][c];
    }
  }

  if (!start || !end) return;

  const openSet: GridCell[] = [start];
  start.gCost = 0;
  start.hCost = manhattanDistance(start, end);
  start.fCost = start.hCost;

  let operationsCount = 0;
  const visited: { row: number; col: number }[] = [];

  while (openSet.length > 0) {
    // Get node with lowest fCost
    openSet.sort((a, b) => a.fCost - b.fCost || a.hCost - b.hCost);
    const current = openSet.shift()!;
    operationsCount++;

    if (current.isVisited) continue;
    current.isVisited = true;
    visited.push({ row: current.row, col: current.col });

    yield {
      grid: cloneGrid(workingGrid),
      current: { row: current.row, col: current.col },
      frontier: openSet.map(c => ({ row: c.row, col: c.col, fCost: c.fCost })),
      visited: [...visited],
      path: [],
      operation: `Visiting (${current.row}, ${current.col}) - F: ${current.fCost.toFixed(0)}`,
      operationsCount,
      nodesVisited: visited.length,
      pathLength: 0,
      isComplete: false,
    };

    if (current.isEnd) {
      const path = reconstructPath(current);
      for (const p of path) {
        workingGrid[p.row][p.col].isPath = true;
      }

      yield {
        grid: cloneGrid(workingGrid),
        current: null,
        frontier: [],
        visited: [...visited],
        path,
        operation: `Path found! Length: ${path.length}`,
        operationsCount,
        nodesVisited: visited.length,
        pathLength: path.length,
        isComplete: true,
      };
      return;
    }

    const neighbors = getNeighbors(workingGrid, current);
    for (const neighbor of neighbors) {
      if (neighbor.isVisited) continue;

      const tentativeG = current.gCost + 1;
      if (tentativeG < neighbor.gCost) {
        neighbor.parent = current;
        neighbor.gCost = tentativeG;
        neighbor.hCost = manhattanDistance(neighbor, end);
        neighbor.fCost = neighbor.gCost + neighbor.hCost;
        neighbor.isFrontier = true;
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  yield {
    grid: cloneGrid(workingGrid),
    current: null,
    frontier: [],
    visited: [...visited],
    path: [],
    operation: 'No path found!',
    operationsCount,
    nodesVisited: visited.length,
    pathLength: 0,
    isComplete: true,
  };
}

// DFS Algorithm
export function* dfsGenerator(grid: GridCell[][]): Generator<PathfindingStep> {
  const workingGrid = cloneGrid(grid);
  const rows = workingGrid.length;
  const cols = workingGrid[0].length;

  let start: GridCell | null = null;
  let end: GridCell | null = null;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (workingGrid[r][c].isStart) start = workingGrid[r][c];
      if (workingGrid[r][c].isEnd) end = workingGrid[r][c];
    }
  }

  if (!start || !end) return;

  const stack: GridCell[] = [start];
  start.gCost = 0;

  let operationsCount = 0;
  const visited: { row: number; col: number }[] = [];

  while (stack.length > 0) {
    const current = stack.pop()!;
    operationsCount++;

    if (current.isVisited) continue;
    current.isVisited = true;
    visited.push({ row: current.row, col: current.col });

    yield {
      grid: cloneGrid(workingGrid),
      current: { row: current.row, col: current.col },
      frontier: stack.map(c => ({ row: c.row, col: c.col })),
      visited: [...visited],
      path: [],
      operation: `Exploring (${current.row}, ${current.col})`,
      operationsCount,
      nodesVisited: visited.length,
      pathLength: 0,
      isComplete: false,
    };

    if (current.isEnd) {
      const path = reconstructPath(current);
      for (const p of path) {
        workingGrid[p.row][p.col].isPath = true;
      }

      yield {
        grid: cloneGrid(workingGrid),
        current: null,
        frontier: [],
        visited: [...visited],
        path,
        operation: `Path found! Length: ${path.length}`,
        operationsCount,
        nodesVisited: visited.length,
        pathLength: path.length,
        isComplete: true,
      };
      return;
    }

    const neighbors = getNeighbors(workingGrid, current);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        neighbor.parent = current;
        neighbor.gCost = current.gCost + 1;
        neighbor.isFrontier = true;
        stack.push(neighbor);
      }
    }
  }

  yield {
    grid: cloneGrid(workingGrid),
    current: null,
    frontier: [],
    visited: [...visited],
    path: [],
    operation: 'No path found!',
    operationsCount,
    nodesVisited: visited.length,
    pathLength: 0,
    isComplete: true,
  };
}

export const pathfindingGenerators = {
  bfs: bfsGenerator,
  dijkstra: dijkstraGenerator,
  astar: astarGenerator,
  dfs: dfsGenerator,
};

export type PathfindingAlgorithmKey = keyof typeof pathfindingGenerators;

export function generateRandomObstacles(
  rows: number,
  cols: number,
  count: number,
  start: { row: number; col: number },
  end: { row: number; col: number }
): { row: number; col: number }[] {
  const obstacles: { row: number; col: number }[] = [];
  const occupied = new Set<string>();
  occupied.add(`${start.row},${start.col}`);
  occupied.add(`${end.row},${end.col}`);

  while (obstacles.length < count && obstacles.length < rows * cols - 2) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);
    const key = `${row},${col}`;

    if (!occupied.has(key)) {
      occupied.add(key);
      obstacles.push({ row, col });
    }
  }

  return obstacles;
}

// Maze Generation using Recursive Backtracking
export function generateMaze(
  rows: number,
  cols: number,
  start: { row: number; col: number },
  end: { row: number; col: number },
  density: 'light' | 'medium' | 'heavy' = 'medium'
): { row: number; col: number }[] {
  const obstacles: { row: number; col: number }[] = [];
  const visited = new Set<string>();

  // Create initial maze grid (all walls)
  const maze: boolean[][] = [];
  for (let r = 0; r < rows; r++) {
    maze[r] = [];
    for (let c = 0; c < cols; c++) {
      maze[r][c] = true; // true = wall
    }
  }

  // Carve passages using recursive backtracking
  const stack: { row: number; col: number }[] = [];
  const startCarve = { row: 1, col: 1 };
  stack.push(startCarve);
  maze[startCarve.row][startCarve.col] = false;
  visited.add(`${startCarve.row},${startCarve.col}`);

  const directions = [
    { dr: -2, dc: 0 },
    { dr: 2, dc: 0 },
    { dr: 0, dc: -2 },
    { dr: 0, dc: 2 },
  ];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];

    // Get unvisited neighbors
    const neighbors: { row: number; col: number; wallRow: number; wallCol: number }[] = [];
    for (const dir of directions) {
      const newRow = current.row + dir.dr;
      const newCol = current.col + dir.dc;
      const wallRow = current.row + dir.dr / 2;
      const wallCol = current.col + dir.dc / 2;

      if (newRow > 0 && newRow < rows - 1 && newCol > 0 && newCol < cols - 1) {
        if (!visited.has(`${newRow},${newCol}`)) {
          neighbors.push({ row: newRow, col: newCol, wallRow, wallCol });
        }
      }
    }

    if (neighbors.length > 0) {
      // Choose random neighbor
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      maze[next.wallRow][next.wallCol] = false;
      maze[next.row][next.col] = false;
      visited.add(`${next.row},${next.col}`);
      stack.push({ row: next.row, col: next.col });
    } else {
      stack.pop();
    }
  }

  // Clear start and end areas
  const clearRadius = 1;
  for (let dr = -clearRadius; dr <= clearRadius; dr++) {
    for (let dc = -clearRadius; dc <= clearRadius; dc++) {
      const sr = start.row + dr;
      const sc = start.col + dc;
      const er = end.row + dr;
      const ec = end.col + dc;
      if (sr >= 0 && sr < rows && sc >= 0 && sc < cols) maze[sr][sc] = false;
      if (er >= 0 && er < rows && ec >= 0 && ec < cols) maze[er][ec] = false;
    }
  }

  // Ensure path exists by clearing diagonal corridor if needed
  maze[start.row][start.col] = false;
  maze[end.row][end.col] = false;

  // Add some random openings based on density
  const openingChance = density === 'light' ? 0.5 : density === 'medium' ? 0.3 : 0.15;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (maze[r][c] && Math.random() < openingChance) {
        maze[r][c] = false;
      }
    }
  }

  // Convert to obstacles array
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (maze[r][c] && !(r === start.row && c === start.col) && !(r === end.row && c === end.col)) {
        obstacles.push({ row: r, col: c });
      }
    }
  }

  return obstacles;
}

// Pre-defined level configurations
export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  recommendedAlgorithm: PathfindingAlgorithmKey;
  obstacles: { row: number; col: number }[];
  gridSize: number;
  xpReward: number;
}

export const levels: LevelConfig[] = [
  {
    id: 1,
    name: 'First Steps',
    description: 'A simple maze to learn the basics. BFS works great here.',
    difficulty: 'easy',
    recommendedAlgorithm: 'bfs',
    gridSize: 10,
    xpReward: 20,
    obstacles: [
      { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 },
      { row: 4, col: 7 }, { row: 4, col: 8 }, { row: 4, col: 9 },
      { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 },
      { row: 7, col: 4 },
    ],
  },
  {
    id: 2,
    name: 'The Corridor',
    description: 'A long winding path. Watch how different algorithms explore!',
    difficulty: 'easy',
    recommendedAlgorithm: 'astar',
    gridSize: 10,
    xpReward: 25,
    obstacles: [
      { row: 0, col: 2 }, { row: 1, col: 2 }, { row: 2, col: 2 }, { row: 3, col: 2 }, { row: 4, col: 2 },
      { row: 5, col: 2 }, { row: 6, col: 2 }, { row: 8, col: 2 },
      { row: 8, col: 3 }, { row: 8, col: 4 }, { row: 8, col: 5 }, { row: 8, col: 6 }, { row: 8, col: 7 },
      { row: 1, col: 4 }, { row: 2, col: 4 }, { row: 3, col: 4 }, { row: 4, col: 4 }, { row: 5, col: 4 }, { row: 6, col: 4 },
      { row: 1, col: 6 }, { row: 2, col: 6 }, { row: 3, col: 6 }, { row: 4, col: 6 }, { row: 5, col: 6 }, { row: 6, col: 6 },
    ],
  },
  {
    id: 3,
    name: 'Weighted Choice',
    description: 'Multiple paths available. A* uses heuristics to choose wisely.',
    difficulty: 'medium',
    recommendedAlgorithm: 'astar',
    gridSize: 10,
    xpReward: 35,
    obstacles: [
      { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 },
      { row: 4, col: 3 }, { row: 5, col: 3 },
      { row: 6, col: 5 }, { row: 6, col: 6 }, { row: 6, col: 7 },
      { row: 7, col: 7 }, { row: 8, col: 7 },
      { row: 1, col: 7 }, { row: 1, col: 8 },
      { row: 2, col: 1 }, { row: 3, col: 1 },
      { row: 5, col: 8 }, { row: 5, col: 9 },
    ],
  },
  {
    id: 4,
    name: 'The Spiral',
    description: 'A spiral maze. Watch how BFS explores layer by layer.',
    difficulty: 'medium',
    recommendedAlgorithm: 'bfs',
    gridSize: 10,
    xpReward: 40,
    obstacles: [
      // Outer wall with gap
      { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 1, col: 4 }, { row: 1, col: 5 }, { row: 1, col: 6 }, { row: 1, col: 7 }, { row: 1, col: 8 },
      { row: 2, col: 8 }, { row: 3, col: 8 }, { row: 4, col: 8 }, { row: 5, col: 8 }, { row: 6, col: 8 }, { row: 7, col: 8 },
      { row: 7, col: 2 }, { row: 7, col: 3 }, { row: 7, col: 4 }, { row: 7, col: 5 }, { row: 7, col: 6 }, { row: 7, col: 7 },
      { row: 3, col: 2 }, { row: 4, col: 2 }, { row: 5, col: 2 }, { row: 6, col: 2 },
      // Inner wall
      { row: 3, col: 4 }, { row: 3, col: 5 }, { row: 3, col: 6 },
      { row: 4, col: 6 }, { row: 5, col: 6 },
      { row: 5, col: 4 }, { row: 5, col: 5 },
    ],
  },
  {
    id: 5,
    name: 'Dead Ends',
    description: 'Many dead ends to trap inefficient algorithms. Dijkstra shines here.',
    difficulty: 'medium',
    recommendedAlgorithm: 'dijkstra',
    gridSize: 10,
    xpReward: 45,
    obstacles: [
      { row: 0, col: 3 }, { row: 1, col: 3 }, { row: 2, col: 3 },
      { row: 2, col: 5 }, { row: 3, col: 5 }, { row: 4, col: 5 }, { row: 5, col: 5 },
      { row: 5, col: 3 }, { row: 6, col: 3 }, { row: 7, col: 3 },
      { row: 4, col: 7 }, { row: 5, col: 7 }, { row: 6, col: 7 }, { row: 7, col: 7 }, { row: 8, col: 7 },
      { row: 2, col: 7 }, { row: 2, col: 8 }, { row: 2, col: 9 },
      { row: 8, col: 1 }, { row: 8, col: 2 }, { row: 8, col: 3 },
      { row: 4, col: 1 },
      { row: 6, col: 9 },
    ],
  },
  {
    id: 6,
    name: 'The Gauntlet',
    description: 'A challenging maze with narrow passages. Only the best algorithms prevail.',
    difficulty: 'hard',
    recommendedAlgorithm: 'astar',
    gridSize: 10,
    xpReward: 60,
    obstacles: [
      // Dense obstacles
      { row: 1, col: 1 }, { row: 1, col: 3 }, { row: 1, col: 5 }, { row: 1, col: 7 },
      { row: 2, col: 2 }, { row: 2, col: 4 }, { row: 2, col: 6 }, { row: 2, col: 8 },
      { row: 3, col: 1 }, { row: 3, col: 3 }, { row: 3, col: 5 }, { row: 3, col: 7 },
      { row: 4, col: 0 }, { row: 4, col: 2 }, { row: 4, col: 4 }, { row: 4, col: 6 }, { row: 4, col: 8 },
      { row: 5, col: 1 }, { row: 5, col: 3 }, { row: 5, col: 5 }, { row: 5, col: 7 }, { row: 5, col: 9 },
      { row: 6, col: 2 }, { row: 6, col: 4 }, { row: 6, col: 6 }, { row: 6, col: 8 },
      { row: 7, col: 1 }, { row: 7, col: 3 }, { row: 7, col: 5 }, { row: 7, col: 7 },
      { row: 8, col: 2 }, { row: 8, col: 4 }, { row: 8, col: 6 },
    ],
  },
  {
    id: 7,
    name: 'Open Field',
    description: 'Few obstacles but spread out. Compare how A* vs BFS differ in open spaces.',
    difficulty: 'easy',
    recommendedAlgorithm: 'astar',
    gridSize: 10,
    xpReward: 25,
    obstacles: [
      { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 5, col: 4 }, { row: 5, col: 5 },
      { row: 2, col: 7 },
      { row: 7, col: 2 },
    ],
  },
  {
    id: 8,
    name: 'The Labyrinth',
    description: 'A complex labyrinth. Test your understanding of all algorithms!',
    difficulty: 'hard',
    recommendedAlgorithm: 'astar',
    gridSize: 10,
    xpReward: 75,
    obstacles: [
      { row: 0, col: 2 }, { row: 1, col: 2 }, { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 },
      { row: 4, col: 0 }, { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 4, col: 6 },
      { row: 2, col: 6 }, { row: 3, col: 6 }, { row: 5, col: 6 }, { row: 6, col: 6 },
      { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 7, col: 4 }, { row: 8, col: 4 },
      { row: 0, col: 8 }, { row: 1, col: 8 }, { row: 2, col: 8 }, { row: 3, col: 8 },
      { row: 6, col: 8 }, { row: 7, col: 8 }, { row: 8, col: 6 }, { row: 8, col: 7 },
      { row: 1, col: 4 }, { row: 1, col: 5 },
      { row: 8, col: 1 }, { row: 8, col: 2 },
    ],
  },
];
