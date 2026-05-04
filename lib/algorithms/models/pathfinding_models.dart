/// Represents a single cell in the pathfinding grid.
class GridCell {
  final int row;
  final int col;
  final bool isObstacle;
  final bool isStart;
  final bool isEnd;
  final bool isVisited;
  final bool isPath;
  final bool isFrontier;
  final double gCost; // Cost from start to this cell
  final double hCost; // Heuristic cost from this cell to end
  final double fCost; // gCost + hCost

  const GridCell({
    required this.row,
    required this.col,
    this.isObstacle = false,
    this.isStart = false,
    this.isEnd = false,
    this.isVisited = false,
    this.isPath = false,
    this.isFrontier = false,
    this.gCost = double.infinity,
    this.hCost = 0,
    this.fCost = double.infinity,
  });

  GridCell copyWith({
    int? row,
    int? col,
    bool? isObstacle,
    bool? isStart,
    bool? isEnd,
    bool? isVisited,
    bool? isPath,
    bool? isFrontier,
    double? gCost,
    double? hCost,
    double? fCost,
  }) {
    return GridCell(
      row: row ?? this.row,
      col: col ?? this.col,
      isObstacle: isObstacle ?? this.isObstacle,
      isStart: isStart ?? this.isStart,
      isEnd: isEnd ?? this.isEnd,
      isVisited: isVisited ?? this.isVisited,
      isPath: isPath ?? this.isPath,
      isFrontier: isFrontier ?? this.isFrontier,
      gCost: gCost ?? this.gCost,
      hCost: hCost ?? this.hCost,
      fCost: fCost ?? this.fCost,
    );
  }

  @override
  String toString() {
    return 'GridCell(row: $row, col: $col, obstacle: $isObstacle, start: $isStart, '
        'end: $isEnd, visited: $isVisited, path: $isPath, frontier: $isFrontier, '
        'g: $gCost, h: $hCost, f: $fCost)';
  }
}

/// Represents a single step in a pathfinding algorithm visualization.
class PathfindingStep {
  /// The complete grid state at this step.
  final List<List<GridCell>> grid;

  /// The current cell being examined.
  final ({int row, int col})? current;

  /// Cells currently in the frontier (to be explored).
  final List<({int row, int col})> frontier;

  /// Cells that have been visited.
  final List<({int row, int col})> visited;

  /// Cells that form the found path.
  final List<({int row, int col})> path;

  /// Human-readable description of the current operation.
  final String operation;

  /// Total number of operations performed so far.
  final int operationsCount;

  /// Number of nodes visited so far.
  final int nodesVisited;

  /// Length of the found path (0 if not yet found).
  final int pathLength;

  /// Whether the algorithm has completed (path found or determined impossible).
  final bool isComplete;

  const PathfindingStep({
    required this.grid,
    this.current,
    this.frontier = const [],
    this.visited = const [],
    this.path = const [],
    required this.operation,
    this.operationsCount = 0,
    this.nodesVisited = 0,
    this.pathLength = 0,
    this.isComplete = false,
  });

  PathfindingStep copyWith({
    List<List<GridCell>>? grid,
    ({int row, int col})? current,
    List<({int row, int col})>? frontier,
    List<({int row, int col})>? visited,
    List<({int row, int col})>? path,
    String? operation,
    int? operationsCount,
    int? nodesVisited,
    int? pathLength,
    bool? isComplete,
  }) {
    return PathfindingStep(
      grid: grid ?? this.grid,
      current: current ?? this.current,
      frontier: frontier ?? this.frontier,
      visited: visited ?? this.visited,
      path: path ?? this.path,
      operation: operation ?? this.operation,
      operationsCount: operationsCount ?? this.operationsCount,
      nodesVisited: nodesVisited ?? this.nodesVisited,
      pathLength: pathLength ?? this.pathLength,
      isComplete: isComplete ?? this.isComplete,
    );
  }

  @override
  String toString() {
    return 'PathfindingStep(current: $current, frontier: ${frontier.length}, '
        'visited: ${visited.length}, path: ${path.length}, operation: $operation, '
        'opsCount: $operationsCount, nodesVisited: $nodesVisited, '
        'pathLength: $pathLength, complete: $isComplete)';
  }
}
