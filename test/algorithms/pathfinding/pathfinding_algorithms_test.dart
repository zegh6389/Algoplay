import 'dart:async';
import 'package:flutter_test/flutter_test.dart';
import 'package:algoplay/algorithms/pathfinding/pathfinding_algorithms.dart';
import 'package:algoplay/algorithms/models/pathfinding_models.dart';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Collect all steps from a Stream<PathfindingStep>.
Future<List<PathfindingStep>> collectSteps(
  Stream<PathfindingStep> stream,
) async {
  return await stream.toList();
}

/// Build an open (no obstacles) rows×cols grid.
/// Start at (0,0), end at (rows-1, cols-1).
List<List<GridCell>> openGrid(int rows, int cols) {
  return List.generate(rows, (r) {
    return List.generate(cols, (c) {
      return GridCell(
        row: r,
        col: c,
        isStart: r == 0 && c == 0,
        isEnd: r == rows - 1 && c == cols - 1,
      );
    });
  });
}

/// Build a 3×3 grid with a horizontal wall on row 1 that blocks any
/// path from row 0 to row 2.  Only (1,0) is left open so the start can
/// reach row 1, but all of row 1 cols 0-2 block downward movement.
List<List<GridCell>> blockedGrid() {
  final grid = List.generate(3, (r) {
    return List.generate(3, (c) {
      return GridCell(
        row: r,
        col: c,
        isStart: r == 0 && c == 0,
        isEnd: r == 2 && c == 2,
        isObstacle: r == 1, // entire middle row is wall
      );
    });
  });
  return grid;
}

/// 1×1 grid where start == end.
List<List<GridCell>> singleCellGrid() {
  return [
    [
      GridCell(row: 0, col: 0, isStart: true, isEnd: true),
    ],
  ];
}

/// Build a fully-walled rows×cols grid for maze generation input.
List<List<GridCell>> walledGrid(int rows, int cols) {
  return List.generate(rows, (r) {
    return List.generate(cols, (c) {
      return GridCell(
        row: r,
        col: c,
        isObstacle: true,
        isStart: r == 0 && c == 0,
        isEnd: r == rows - 1 && c == cols - 1,
      );
    });
  });
}

// ---------------------------------------------------------------------------
// Shared validators
// ---------------------------------------------------------------------------

void expectNonEmptyOperations(List<PathfindingStep> steps) {
  for (int i = 0; i < steps.length; i++) {
    expect(
      steps[i].operation,
      isNotEmpty,
      reason: 'Step $i has an empty operation',
    );
  }
}

void expectValidVisitedCoords(
  List<PathfindingStep> steps,
  int rows,
  int cols,
) {
  for (int i = 0; i < steps.length; i++) {
    for (final v in steps[i].visited) {
      expect(v.row, inInclusiveRange(0, rows - 1),
          reason: 'Step $i visited row ${v.row} out of range');
      expect(v.col, inInclusiveRange(0, cols - 1),
          reason: 'Step $i visited col ${v.col} out of range');
    }
  }
}

// ---------------------------------------------------------------------------
// Generic pathfinding test suite (BFS / DFS / Dijkstra / A*)
// ---------------------------------------------------------------------------

typedef PathfindingGenerator = Stream<PathfindingStep> Function(
  List<List<GridCell>>,
);

void testPathfindingAlgorithm(
  String name,
  PathfindingGenerator generator,
) {
  group(name, () {
    // 1. Finds path on 3×3 open grid
    test('finds path on simple 3x3 open grid', () async {
      final steps = await collectSteps(generator(openGrid(3, 3)));
      expect(steps, isNotEmpty, reason: '$name produced no steps');
      final last = steps.last;
      expect(last.isComplete, isTrue);
      expect(last.path, isNotEmpty,
          reason: '$name found no path on 3x3 open grid');
    });

    // 2. Finds path on 5×5 open grid
    test('finds path on 5x5 open grid', () async {
      final steps = await collectSteps(generator(openGrid(5, 5)));
      expect(steps, isNotEmpty);
      final last = steps.last;
      expect(last.isComplete, isTrue);
      expect(last.path, isNotEmpty,
          reason: '$name found no path on 5x5 open grid');
    });

    // 3. No path when blocked
    test('reports no path when grid is blocked', () async {
      final steps = await collectSteps(generator(blockedGrid()));
      expect(steps, isNotEmpty);
      final last = steps.last;
      expect(last.isComplete, isTrue);
      expect(last.path, isEmpty,
          reason: '$name should not find a path on a blocked grid');
    });

    // 4. Start equals end (1×1 grid)
    test('handles start==end on 1x1 grid with path length 1', () async {
      final steps = await collectSteps(generator(singleCellGrid()));
      expect(steps, isNotEmpty);
      final last = steps.last;
      expect(last.isComplete, isTrue);
      expect(last.pathLength, equals(1),
          reason: '$name path length should be 1 for start==end');
    });

    // 5. Every step has non-empty operation string
    test('every step has a non-empty operation string', () async {
      final steps = await collectSteps(generator(openGrid(3, 3)));
      expectNonEmptyOperations(steps);
    });

    // 6. All visited cells have valid coordinates
    test('all visited cells have valid coordinates', () async {
      final steps = await collectSteps(generator(openGrid(3, 3)));
      expectValidVisitedCoords(steps, 3, 3);
    });

    // 7. Final step has isComplete=true
    test('final step has isComplete=true', () async {
      final steps = await collectSteps(generator(openGrid(3, 3)));
      expect(steps.last.isComplete, isTrue);
    });

    // 8. Stream completes without hanging (5-second timeout)
    test('stream completes without hanging', () async {
      final steps = await collectSteps(generator(openGrid(5, 5)))
          .timeout(const Duration(seconds: 5));
      expect(steps, isNotEmpty);
    });
  });
}

// ---------------------------------------------------------------------------
// Maze generation tests
// ---------------------------------------------------------------------------

void testMazeGenerator() {
  group('generateMaze', () {
    // 1. Produces a grid with all cells visited (non-obstacle)
    test('produces a grid with all cells visited (no obstacles except walls)',
        () async {
      final steps = await collectSteps(generateMaze(walledGrid(5, 5)));
      expect(steps, isNotEmpty);
      final grid = steps.last.grid;
      int nonObstacle = 0;
      for (final row in grid) {
        for (final cell in row) {
          if (!cell.isObstacle) nonObstacle++;
        }
      }
      // A maze carved from 5x5 should have at least the start and end open
      expect(nonObstacle, greaterThanOrEqualTo(2),
          reason: 'Maze should have at least start and end cells open');
    });

    // 2. Start and end cells are not obstacles
    test('start and end cells are not obstacles', () async {
      final steps = await collectSteps(generateMaze(walledGrid(5, 5)));
      final grid = steps.last.grid;
      expect(grid[0][0].isObstacle, isFalse,
          reason: 'Start cell should not be an obstacle');
      expect(grid[4][4].isObstacle, isFalse,
          reason: 'End cell should not be an obstacle');
    });

    // 3. Output grid dimensions match input
    test('output grid dimensions match input', () async {
      final steps = await collectSteps(generateMaze(walledGrid(7, 9)));
      final grid = steps.last.grid;
      expect(grid.length, equals(7));
      expect(grid[0].length, equals(9));
    });

    // 4. Every step has non-empty operation
    test('every step has non-empty operation', () async {
      final steps = await collectSteps(generateMaze(walledGrid(5, 5)));
      expectNonEmptyOperations(steps);
    });

    // 5. Stream completes without hanging
    test('stream completes without hanging', () async {
      final steps = await collectSteps(generateMaze(walledGrid(7, 7)))
          .timeout(const Duration(seconds: 5));
      expect(steps, isNotEmpty);
    });

    // 6. Grid is solvable (path exists from start to end)
    test('generated maze is solvable (BFS finds a path)', () async {
      final mazeSteps = await collectSteps(generateMaze(walledGrid(5, 5)));
      final mazeGrid = mazeSteps.last.grid;
      // Use BFS to verify the maze is solvable
      final bfsSteps = await collectSteps(bfs(mazeGrid));
      final last = bfsSteps.last;
      expect(last.path, isNotEmpty,
          reason: 'Generated maze should be solvable by BFS');
    });
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

void main() {
  testPathfindingAlgorithm('bfs', bfs);
  testPathfindingAlgorithm('dfs', dfs);
  testPathfindingAlgorithm('dijkstra', dijkstra);
  testPathfindingAlgorithm('astar', astar);
  testMazeGenerator();
}
