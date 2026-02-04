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
