import 'dart:collection';
import '../models/pathfinding_models.dart';

// ---------------------------------------------------------------------------
// Grid helpers
// ---------------------------------------------------------------------------

/// Deep-copy a grid so mutations don't leak across steps.
List<List<GridCell>> _copyGrid(List<List<GridCell>> grid) {
  return grid.map((row) => row.map((cell) => cell).toList()).toList();
}

/// 4-directional neighbour offsets.
const List<({int dr, int dc})> _directions = [
  (dr: -1, dc: 0), // up
  (dr: 1, dc: 0), // down
  (dr: 0, dc: -1), // left
  (dr: 0, dc: 1), // right
];

/// Return valid 4-directional neighbours of (row, col) that are within bounds.
List<({int row, int col})> _neighbours(
  int row,
  int col,
  int rows,
  int cols,
) {
  final result = <({int row, int col})>[];
  for (final d in _directions) {
    final nr = row + d.dr;
    final nc = col + d.dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      result.add((row: nr, col: nc));
    }
  }
  return result;
}

/// Manhattan distance heuristic.
double _manhattan(int r1, int c1, int r2, int c2) {
  return ((r1 - r2).abs() + (c1 - c2).abs()).toDouble();
}

/// Find the start and end cells in the grid.
({int row, int col}) _findStart(List<List<GridCell>> grid) {
  for (final row in grid) {
    for (final cell in row) {
      if (cell.isStart) return (row: cell.row, col: cell.col);
    }
  }
  throw StateError('No start cell found in grid');
}

({int row, int col}) _findEnd(List<List<GridCell>> grid) {
  for (final row in grid) {
    for (final cell in row) {
      if (cell.isEnd) return (row: cell.row, col: cell.col);
    }
  }
  throw StateError('No end cell found in grid');
}

/// Reconstruct path from a came-from map.
List<({int row, int col})> _reconstructPath(
  Map<String, ({int row, int col})> cameFrom,
  ({int row, int col}) end,
) {
  final path = <({int row, int col})>[end];
  var current = end;
  while (cameFrom.containsKey('${current.row},${current.col}')) {
    current = cameFrom['${current.row},${current.col}']!;
    path.add(current);
  }
  return path.reversed.toList();
}

/// Mark path cells on the grid.
List<List<GridCell>> _markPath(
  List<List<GridCell>> grid,
  List<({int row, int col})> path,
) {
  final copy = _copyGrid(grid);
  for (final p in path) {
    copy[p.row][p.col] = copy[p.row][p.col].copyWith(
      isPath: true,
      isVisited: false,
      isFrontier: false,
    );
  }
  return copy;
}

// ---------------------------------------------------------------------------
// BFS — Breadth-First Search
// ---------------------------------------------------------------------------

/// Breadth-first search pathfinding algorithm generator.
/// Yields [PathfindingStep] for each visited cell.
Stream<PathfindingStep> bfs(List<List<GridCell>> grid) async* {
  final rows = grid.length;
  final cols = grid[0].length;
  final start = _findStart(grid);
  final end = _findEnd(grid);

  var workingGrid = _copyGrid(grid);
  final visited = <({int row, int col})>[];
  final visitedSet = <String>{};
  final cameFrom = <String, ({int row, int col})>{};
  final queue = Queue<({int row, int col})>();
  int opsCount = 0;

  queue.add(start);
  visitedSet.add('${start.row},${start.col}');

  // Handle start==end immediately
  if (start.row == end.row && start.col == end.col) {
    final path = [start];
    workingGrid = _markPath(workingGrid, path);
    yield PathfindingStep(
      grid: workingGrid,
      current: start,
      frontier: [],
      visited: [start],
      path: path,
      operation: 'Start is the end; path found immediately',
      operationsCount: ++opsCount,
      nodesVisited: 1,
      pathLength: 1,
      isComplete: true,
    );
    return;
  }

  while (queue.isNotEmpty) {
    final current = queue.removeFirst();
    visited.add(current);

    workingGrid[current.row][current.col] =
        workingGrid[current.row][current.col].copyWith(
      isVisited: true,
      isFrontier: false,
    );
    opsCount++;

    yield PathfindingStep(
      grid: _copyGrid(workingGrid),
      current: current,
      frontier: queue.toList(),
      visited: List.of(visited),
      path: [],
      operation: 'Visiting cell (${current.row}, ${current.col})',
      operationsCount: opsCount,
      nodesVisited: visited.length,
      pathLength: 0,
      isComplete: false,
    );

    if (current.row == end.row && current.col == end.col) {
      final path = _reconstructPath(cameFrom, end);
      workingGrid = _markPath(workingGrid, path);
      yield PathfindingStep(
        grid: workingGrid,
        current: current,
        frontier: queue.toList(),
        visited: List.of(visited),
        path: path,
        operation:
            'Path found! Length ${path.length}',
        operationsCount: opsCount,
        nodesVisited: visited.length,
        pathLength: path.length,
        isComplete: true,
      );
      return;
    }

    for (final n in _neighbours(current.row, current.col, rows, cols)) {
      final key = '${n.row},${n.col}';
      if (visitedSet.contains(key)) continue;
      if (workingGrid[n.row][n.col].isObstacle) continue;
      visitedSet.add(key);
      cameFrom[key] = current;
      queue.add(n);
      workingGrid[n.row][n.col] =
          workingGrid[n.row][n.col].copyWith(isFrontier: true);
    }
  }

  // No path found
  yield PathfindingStep(
    grid: workingGrid,
    current: null,
    frontier: [],
    visited: List.of(visited),
    path: [],
    operation: 'No path found',
    operationsCount: opsCount,
    nodesVisited: visited.length,
    pathLength: 0,
    isComplete: true,
  );
}

// ---------------------------------------------------------------------------
// DFS — Depth-First Search
// ---------------------------------------------------------------------------

/// Depth-first search pathfinding algorithm generator.
/// Uses a LIFO stack (iterative, not recursive).
Stream<PathfindingStep> dfs(List<List<GridCell>> grid) async* {
  final rows = grid.length;
  final cols = grid[0].length;
  final start = _findStart(grid);
  final end = _findEnd(grid);

  var workingGrid = _copyGrid(grid);
  final visited = <({int row, int col})>[];
  final visitedSet = <String>{};
  final cameFrom = <String, ({int row, int col})>{};
  final stack = <({int row, int col})>[];
  int opsCount = 0;

  stack.add(start);
  visitedSet.add('${start.row},${start.col}');

  // Handle start==end immediately
  if (start.row == end.row && start.col == end.col) {
    final path = [start];
    workingGrid = _markPath(workingGrid, path);
    yield PathfindingStep(
      grid: workingGrid,
      current: start,
      frontier: [],
      visited: [start],
      path: path,
      operation: 'Start is the end; path found immediately',
      operationsCount: ++opsCount,
      nodesVisited: 1,
      pathLength: 1,
      isComplete: true,
    );
    return;
  }

  while (stack.isNotEmpty) {
    final current = stack.removeLast();
    visited.add(current);

    workingGrid[current.row][current.col] =
        workingGrid[current.row][current.col].copyWith(
      isVisited: true,
      isFrontier: false,
    );
    opsCount++;

    yield PathfindingStep(
      grid: _copyGrid(workingGrid),
      current: current,
      frontier: stack.toList(),
      visited: List.of(visited),
      path: [],
      operation: 'Visiting cell (${current.row}, ${current.col})',
      operationsCount: opsCount,
      nodesVisited: visited.length,
      pathLength: 0,
      isComplete: false,
    );

    if (current.row == end.row && current.col == end.col) {
      final path = _reconstructPath(cameFrom, end);
      workingGrid = _markPath(workingGrid, path);
      yield PathfindingStep(
        grid: workingGrid,
        current: current,
        frontier: stack.toList(),
        visited: List.of(visited),
        path: path,
        operation: 'Path found! Length ${path.length}',
        operationsCount: opsCount,
        nodesVisited: visited.length,
        pathLength: path.length,
        isComplete: true,
      );
      return;
    }

    // Add neighbours in reverse order so that the "natural" order
    // (up, down, left, right) is explored first.
    final nbrs = _neighbours(current.row, current.col, rows, cols);
    for (final n in nbrs.reversed) {
      final key = '${n.row},${n.col}';
      if (visitedSet.contains(key)) continue;
      if (workingGrid[n.row][n.col].isObstacle) continue;
      visitedSet.add(key);
      cameFrom[key] = current;
      stack.add(n);
      workingGrid[n.row][n.col] =
          workingGrid[n.row][n.col].copyWith(isFrontier: true);
    }
  }

  // No path found
  yield PathfindingStep(
    grid: workingGrid,
    current: null,
    frontier: [],
    visited: List.of(visited),
    path: [],
    operation: 'No path found',
    operationsCount: opsCount,
    nodesVisited: visited.length,
    pathLength: 0,
    isComplete: true,
  );
}

// ---------------------------------------------------------------------------
// Dijkstra
// ---------------------------------------------------------------------------

/// Dijkstra's algorithm pathfinding generator.
/// Uses a simple priority queue (min-heap via a sorted list for simplicity).
Stream<PathfindingStep> dijkstra(List<List<GridCell>> grid) async* {
  final rows = grid.length;
  final cols = grid[0].length;
  final start = _findStart(grid);
  final end = _findEnd(grid);

  var workingGrid = _copyGrid(grid);
  final visited = <({int row, int col})>[];
  final visitedSet = <String>{};
  final cameFrom = <String, ({int row, int col})>{};
  final gScore = <String, double>{};
  int opsCount = 0;

  // Priority queue as a list sorted by gCost. Simple but correct.
  final openSet = <({int row, int col})>[];

  String key(int r, int c) => '$r,$c';

  gScore[key(start.row, start.col)] = 0;
  openSet.add(start);

  void sortOpenSet() {
    openSet.sort((a, b) {
      final ga = gScore[key(a.row, a.col)] ?? double.infinity;
      final gb = gScore[key(b.row, b.col)] ?? double.infinity;
      return ga.compareTo(gb);
    });
  }

  // Handle start==end
  if (start.row == end.row && start.col == end.col) {
    final path = [start];
    workingGrid = _markPath(workingGrid, path);
    yield PathfindingStep(
      grid: workingGrid,
      current: start,
      frontier: [],
      visited: [start],
      path: path,
      operation: 'Start is the end; path found immediately',
      operationsCount: ++opsCount,
      nodesVisited: 1,
      pathLength: 1,
      isComplete: true,
    );
    return;
  }

  while (openSet.isNotEmpty) {
    sortOpenSet();
    final current = openSet.removeAt(0);
    final ck = key(current.row, current.col);

    if (visitedSet.contains(ck)) continue;
    visitedSet.add(ck);
    visited.add(current);

    workingGrid[current.row][current.col] =
        workingGrid[current.row][current.col].copyWith(
      isVisited: true,
      isFrontier: false,
      gCost: gScore[ck] ?? 0,
    );
    opsCount++;

    yield PathfindingStep(
      grid: _copyGrid(workingGrid),
      current: current,
      frontier: openSet.toList(),
      visited: List.of(visited),
      path: [],
      operation:
          'Visiting cell (${current.row}, ${current.col}), gCost: ${gScore[ck]?.toStringAsFixed(1)}',
      operationsCount: opsCount,
      nodesVisited: visited.length,
      pathLength: 0,
      isComplete: false,
    );

    if (current.row == end.row && current.col == end.col) {
      final path = _reconstructPath(cameFrom, end);
      workingGrid = _markPath(workingGrid, path);
      yield PathfindingStep(
        grid: workingGrid,
        current: current,
        frontier: openSet.toList(),
        visited: List.of(visited),
        path: path,
        operation: 'Path found! Length ${path.length}',
        operationsCount: opsCount,
        nodesVisited: visited.length,
        pathLength: path.length,
        isComplete: true,
      );
      return;
    }

    for (final n in _neighbours(current.row, current.col, rows, cols)) {
      final nk = key(n.row, n.col);
      if (visitedSet.contains(nk)) continue;
      if (workingGrid[n.row][n.col].isObstacle) continue;

      final tentativeG = (gScore[ck] ?? 0) + 1;
      if (tentativeG < (gScore[nk] ?? double.infinity)) {
        gScore[nk] = tentativeG;
        cameFrom[nk] = current;
        workingGrid[n.row][n.col] =
            workingGrid[n.row][n.col].copyWith(
          isFrontier: true,
          gCost: tentativeG,
        );
        if (!openSet.any((e) => e.row == n.row && e.col == n.col)) {
          openSet.add(n);
        }
      }
    }
  }

  // No path found
  yield PathfindingStep(
    grid: workingGrid,
    current: null,
    frontier: [],
    visited: List.of(visited),
    path: [],
    operation: 'No path found',
    operationsCount: opsCount,
    nodesVisited: visited.length,
    pathLength: 0,
    isComplete: true,
  );
}

// ---------------------------------------------------------------------------
// A* (A-Star)
// ---------------------------------------------------------------------------

/// A* pathfinding algorithm generator.
/// Uses Manhattan distance as the heuristic.
Stream<PathfindingStep> astar(List<List<GridCell>> grid) async* {
  final rows = grid.length;
  final cols = grid[0].length;
  final start = _findStart(grid);
  final end = _findEnd(grid);

  var workingGrid = _copyGrid(grid);
  final visited = <({int row, int col})>[];
  final visitedSet = <String>{};
  final cameFrom = <String, ({int row, int col})>{};
  final gScore = <String, double>{};
  final fScore = <String, double>{};
  int opsCount = 0;

  final openSet = <({int row, int col})>[];

  String key(int r, int c) => '$r,$c';

  final startKey = key(start.row, start.col);
  gScore[startKey] = 0;
  fScore[startKey] = _manhattan(start.row, start.col, end.row, end.col);
  openSet.add(start);

  void sortOpenSet() {
    openSet.sort((a, b) {
      final fa = fScore[key(a.row, a.col)] ?? double.infinity;
      final fb = fScore[key(b.row, b.col)] ?? double.infinity;
      return fa.compareTo(fb);
    });
  }

  // Handle start==end
  if (start.row == end.row && start.col == end.col) {
    final path = [start];
    workingGrid = _markPath(workingGrid, path);
    yield PathfindingStep(
      grid: workingGrid,
      current: start,
      frontier: [],
      visited: [start],
      path: path,
      operation: 'Start is the end; path found immediately',
      operationsCount: ++opsCount,
      nodesVisited: 1,
      pathLength: 1,
      isComplete: true,
    );
    return;
  }

  while (openSet.isNotEmpty) {
    sortOpenSet();
    final current = openSet.removeAt(0);
    final ck = key(current.row, current.col);

    if (visitedSet.contains(ck)) continue;
    visitedSet.add(ck);
    visited.add(current);

    final h = _manhattan(current.row, current.col, end.row, end.col);
    workingGrid[current.row][current.col] =
        workingGrid[current.row][current.col].copyWith(
      isVisited: true,
      isFrontier: false,
      gCost: gScore[ck] ?? 0,
      hCost: h,
      fCost: (gScore[ck] ?? 0) + h,
    );
    opsCount++;

    yield PathfindingStep(
      grid: _copyGrid(workingGrid),
      current: current,
      frontier: openSet.toList(),
      visited: List.of(visited),
      path: [],
      operation:
          'Visiting cell (${current.row}, ${current.col}), fCost: ${((gScore[ck] ?? 0) + h).toStringAsFixed(1)}',
      operationsCount: opsCount,
      nodesVisited: visited.length,
      pathLength: 0,
      isComplete: false,
    );

    if (current.row == end.row && current.col == end.col) {
      final path = _reconstructPath(cameFrom, end);
      workingGrid = _markPath(workingGrid, path);
      yield PathfindingStep(
        grid: workingGrid,
        current: current,
        frontier: openSet.toList(),
        visited: List.of(visited),
        path: path,
        operation: 'Path found! Length ${path.length}',
        operationsCount: opsCount,
        nodesVisited: visited.length,
        pathLength: path.length,
        isComplete: true,
      );
      return;
    }

    for (final n in _neighbours(current.row, current.col, rows, cols)) {
      final nk = key(n.row, n.col);
      if (visitedSet.contains(nk)) continue;
      if (workingGrid[n.row][n.col].isObstacle) continue;

      final tentativeG = (gScore[ck] ?? 0) + 1;
      if (tentativeG < (gScore[nk] ?? double.infinity)) {
        gScore[nk] = tentativeG;
        final hN = _manhattan(n.row, n.col, end.row, end.col);
        fScore[nk] = tentativeG + hN;
        cameFrom[nk] = current;
        workingGrid[n.row][n.col] =
            workingGrid[n.row][n.col].copyWith(
          isFrontier: true,
          gCost: tentativeG,
          hCost: hN,
          fCost: tentativeG + hN,
        );
        if (!openSet.any((e) => e.row == n.row && e.col == n.col)) {
          openSet.add(n);
        }
      }
    }
  }

  // No path found
  yield PathfindingStep(
    grid: workingGrid,
    current: null,
    frontier: [],
    visited: List.of(visited),
    path: [],
    operation: 'No path found',
    operationsCount: opsCount,
    nodesVisited: visited.length,
    pathLength: 0,
    isComplete: true,
  );
}

// ---------------------------------------------------------------------------
// Maze Generation — Recursive Backtracker
// ---------------------------------------------------------------------------

/// Generate a maze using the recursive backtracker algorithm.
/// Input grid should have all cells marked as obstacles.
/// The algorithm carves passages through the grid.
Stream<PathfindingStep> generateMaze(
  List<List<GridCell>> grid,
) async* {
  final rows = grid.length;
  final cols = grid[0].length;
  var workingGrid = _copyGrid(grid);
  int opsCount = 0;

  final visited = <String>{};
  final stack = <({int row, int col})>[];

  // Start carving from (0,0)
  final start = (row: 0, col: 0);
  visited.add('${start.row},${start.col}');
  stack.add(start);

  // Carve the start cell
  workingGrid[start.row][start.col] =
      workingGrid[start.row][start.col].copyWith(
    isObstacle: false,
    isVisited: true,
  );

  yield PathfindingStep(
    grid: _copyGrid(workingGrid),
    current: start,
    frontier: [],
    visited: [start],
    path: [],
    operation: 'Starting maze generation at (0, 0)',
    operationsCount: ++opsCount,
    nodesVisited: 1,
    pathLength: 0,
    isComplete: false,
  );

  // For maze generation with wall carving, we use steps of 2 cells.
  // But since the grid can be any size, we'll use the simpler approach:
  // treat every cell as a potential passage and carve neighbours directly.
  // This works for arbitrarily-sized grids.

  while (stack.isNotEmpty) {
    final current = stack.last;

    // Get unvisited neighbours (2 steps away for proper maze walls,
    // but fallback to 1 step for small grids)
    final unvisited = <({int row, int col})>[];
    for (final d in _directions) {
      final nr = current.row + d.dr;
      final nc = current.col + d.dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (!visited.contains('$nr,$nc')) {
          unvisited.add((row: nr, col: nc));
        }
      }
    }

    if (unvisited.isNotEmpty) {
      // Pick a random unvisited neighbour
      final next = unvisited[DateTime.now().microsecondsSinceEpoch %
          unvisited.length];

      visited.add('${next.row},${next.col}');

      // Carve the cell
      workingGrid[next.row][next.col] =
          workingGrid[next.row][next.col].copyWith(
        isObstacle: false,
        isVisited: true,
      );
      stack.add(next);

      yield PathfindingStep(
        grid: _copyGrid(workingGrid),
        current: next,
        frontier: [],
        visited: visited
            .map((k) {
              final parts = k.split(',');
              return (row: int.parse(parts[0]), col: int.parse(parts[1]));
            })
            .toList(),
        path: [],
        operation: 'Carving passage to (${next.row}, ${next.col})',
        operationsCount: ++opsCount,
        nodesVisited: visited.length,
        pathLength: 0,
        isComplete: false,
      );
    } else {
      // Backtrack
      stack.removeLast();

      if (stack.isNotEmpty) {
        yield PathfindingStep(
          grid: _copyGrid(workingGrid),
          current: stack.last,
          frontier: [],
          visited: visited
              .map((k) {
                final parts = k.split(',');
                return (
                  row: int.parse(parts[0]),
                  col: int.parse(parts[1])
                );
              })
              .toList(),
          path: [],
          operation:
              'Backtracking to (${stack.last.row}, ${stack.last.col})',
          operationsCount: ++opsCount,
          nodesVisited: visited.length,
          pathLength: 0,
          isComplete: false,
        );
      }
    }
  }

  // Ensure end cell is carved open
  workingGrid[rows - 1][cols - 1] =
      workingGrid[rows - 1][cols - 1].copyWith(
    isObstacle: false,
  );

  // Final step: mark complete
  yield PathfindingStep(
    grid: workingGrid,
    current: null,
    frontier: [],
    visited: visited
        .map((k) {
          final parts = k.split(',');
          return (row: int.parse(parts[0]), col: int.parse(parts[1]));
        })
        .toList(),
    path: [],
    operation: 'Maze generation complete',
    operationsCount: opsCount,
    nodesVisited: visited.length,
    pathLength: 0,
    isComplete: true,
  );
}
