import 'dart:math';

/// Configuration for a single grid escape level.
class LevelConfig {
  final int gridRows;
  final int gridCols;
  final Set<String> walls; // "row,col" format
  final String startPos; // "row,col"
  final String endPos; // "row,col"
  final int timeLimitSeconds;
  final int levelNumber;
  final String question;
  final String correctAnswer;
  final List<String> options;
  final String hint;

  const LevelConfig({
    required this.gridRows,
    required this.gridCols,
    required this.walls,
    required this.startPos,
    required this.endPos,
    required this.timeLimitSeconds,
    required this.levelNumber,
    required this.question,
    required this.correctAnswer,
    required this.options,
    required this.hint,
  });

  /// Parse startPos into (row, col).
  (int, int) get startTuple {
    final parts = startPos.split(',').map(int.parse).toList();
    return (parts[0], parts[1]);
  }

  /// Parse endPos into (row, col).
  (int, int) get endTuple {
    final parts = endPos.split(',').map(int.parse).toList();
    return (parts[0], parts[1]);
  }

  /// Grid size (max of rows, cols) for compatibility with square grid UI.
  int get gridSize => max(gridRows, gridCols);
}

/// Questions pool for grid escape levels (pathfinding themed).
const _levelQuestions = <Map<String, dynamic>>[
  {
    'question': 'Which algorithm would find the SHORTEST path on this grid?',
    'correctAnswer': 'BFS',
    'options': ['DFS', 'BFS', 'Dijkstra', 'Linear Search'],
    'hint': 'BFS explores uniformly in all directions — ideal for unweighted shortest path.',
  },
  {
    'question': 'DFS might find a path, but is it guaranteed to be the shortest?',
    'correctAnswer': 'No',
    'options': ['Yes', 'No', 'Depends on grid size', 'Only in trees'],
    'hint': 'DFS dives deep along one branch before backtracking — no shortest-path guarantee.',
  },
  {
    'question': 'If edges have different weights, which algorithm is appropriate?',
    'correctAnswer': "Dijkstra's",
    'options': ['BFS', 'DFS', "Dijkstra's", 'Binary Search'],
    'hint': 'Dijkstra handles weighted edges with non-negative weights.',
  },
  {
    'question': 'What is the time complexity of BFS on a grid with V cells?',
    'correctAnswer': 'O(V)',
    'options': ['O(V²)', 'O(V)', 'O(V log V)', 'O(E)'],
    'hint': 'Each cell is visited at most once.',
  },
  {
    'question': 'A* search uses what additional information compared to Dijkstra?',
    'correctAnswer': 'Heuristic function',
    'options': ['Priority queue', 'Heuristic function', 'Visited set', 'Recursion'],
    'hint': 'It estimates the remaining cost to guide the search.',
  },
  {
    'question': 'In a grid, what are the 4 cardinal directions for movement?',
    'correctAnswer': 'Up, Down, Left, Right',
    'options': ['Diagonals only', 'Up, Down, Left, Right', 'All 8 directions', 'Only Right and Down'],
    'hint': 'Also called von Neumann neighborhood (4-connectivity).',
  },
  {
    'question': 'What happens if there is NO path from start to goal?',
    'correctAnswer': 'BFS/DFS will exhaust all reachable cells',
    'options': [
      'Infinite loop',
      'BFS/DFS will exhaust all reachable cells',
      'Returns a random path',
      'Crashes the program',
    ],
    'hint': 'The visited set ensures termination.',
  },
  {
    'question': 'Which data structure does Dijkstra use to pick the next node?',
    'correctAnswer': 'Min-heap (priority queue)',
    'options': ['Stack', 'Queue', 'Min-heap (priority queue)', 'Hash map'],
    'hint': 'Always picks the node with smallest tentative distance.',
  },
  {
    'question': 'Can BFS be used on a weighted graph to find shortest paths?',
    'correctAnswer': 'Only if all weights are equal',
    'options': [
      'Yes, always',
      'Only if all weights are equal',
      'No, never',
      'Only for DAGs',
    ],
    'hint': 'BFS treats each edge as cost 1.',
  },
  {
    'question': 'What is the Manhattan distance between (0,0) and (3,4)?',
    'correctAnswer': '7',
    'options': ['5', '7', '12', '3'],
    'hint': '|x₁-x₂| + |y₁-y₂| = 3 + 4.',
  },
];

/// Procedurally generates grid escape levels with progressive difficulty.
class LevelGenerator {
  /// Generate a single level by number (1-indexed).
  ///
  /// Difficulty progression:
  /// - Grid: 5×5 at level 1 → 8×8 at level 10
  /// - Walls: 3 at level 1 → 16+ at level 10
  /// - Time: 45s at level 1 → 30s at level 10
  static LevelConfig generate(int level, {int? seed}) {
    final rng = Random(seed ?? level * 1000);

    // Grid size: 5 → 8 over 10 levels
    final size = (5 + ((level - 1) * 3.0 / 9.0).floor()).clamp(5, 8);
    final rows = size;
    final cols = size;

    // Wall count: 3 → 16 over 10 levels
    final wallCount = (3 + ((level - 1) * 13.0 / 9.0).floor()).clamp(3, 20);

    // Time limit: 45 → 30 over 10 levels
    final timeLimit = (45 - ((level - 1) * 15.0 / 9.0).floor()).clamp(30, 45);

    // Pick start and end positions (corners or edges)
    String startPos;
    String endPos;
    if (level <= 3) {
      startPos = '0,0';
      endPos = '${size - 1},${size - 1}';
    } else if (level <= 6) {
      // Start from a random edge, end at opposite corner
      final startRow = rng.nextBool() ? 0 : size - 1;
      final startCol = rng.nextInt(size);
      startPos = '$startRow,$startCol';
      final endRow = startRow == 0 ? size - 1 : 0;
      final endCol = size - 1 - startCol;
      endPos = '$endRow,$endCol';
    } else {
      // Random start/end on different edges
      final edges = _edgePositions(size);
      edges.shuffle(rng);
      startPos = edges[0];
      endPos = edges.length > 1 ? edges[edges.length - 1] : '${size - 1},${size - 1}';
      // Ensure start != end
      if (startPos == endPos) {
        endPos = edges[1];
      }
    }

    // Generate walls ensuring path exists
    final walls = _generateWalls(
      rows: rows,
      cols: cols,
      wallCount: wallCount,
      startPos: startPos,
      endPos: endPos,
      rng: rng,
    );

    // Pick a question for this level
    final qIndex = (level - 1) % _levelQuestions.length;
    final q = _levelQuestions[qIndex];
    final shuffledOptions = List<String>.from(q['options'] as List<String>);
    shuffledOptions.shuffle(rng);

    return LevelConfig(
      gridRows: rows,
      gridCols: cols,
      walls: walls,
      startPos: startPos,
      endPos: endPos,
      timeLimitSeconds: timeLimit,
      levelNumber: level,
      question: q['question'] as String,
      correctAnswer: q['correctAnswer'] as String,
      options: shuffledOptions,
      hint: q['hint'] as String,
    );
  }

  /// Generate [count] levels with consistent seeding.
  static List<LevelConfig> generateAll(int count, {int? seed}) {
    return List.generate(count, (i) => generate(i + 1, seed: seed));
  }

  /// Generate walls that don't block the path from start to end.
  static Set<String> _generateWalls({
    required int rows,
    required int cols,
    required int wallCount,
    required String startPos,
    required String endPos,
    required Random rng,
  }) {
    final walls = <String>{};
    final reserved = <String>{startPos, endPos};

    // Also reserve neighbors of start/end so path isn't trivially blocked
    final startParts = startPos.split(',').map(int.parse).toList();
    final endParts = endPos.split(',').map(int.parse).toList();
    for (final dir in [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      final sn = '${startParts[0] + dir[0]},${startParts[1] + dir[1]}';
      final en = '${endParts[0] + dir[0]},${endParts[1] + dir[1]}';
      if (startParts[0] + dir[0] >= 0 && startParts[0] + dir[0] < rows &&
          startParts[1] + dir[1] >= 0 && startParts[1] + dir[1] < cols) {
        reserved.add(sn);
      }
      if (endParts[0] + dir[0] >= 0 && endParts[0] + dir[0] < rows &&
          endParts[1] + dir[1] >= 0 && endParts[1] + dir[1] < cols) {
        reserved.add(en);
      }
    }

    // Build candidate wall positions
    final candidates = <String>[];
    for (int r = 0; r < rows; r++) {
      for (int c = 0; c < cols; c++) {
        final key = '$r,$c';
        if (!reserved.contains(key)) {
          candidates.add(key);
        }
      }
    }
    candidates.shuffle(rng);

    for (final candidate in candidates) {
      if (walls.length >= wallCount) break;

      // Try adding this wall
      final testWalls = {...walls, candidate};

      // Check if path still exists
      if (_pathExists(
        startParts[0], startParts[1],
        endParts[0], endParts[1],
        rows, cols, testWalls,
      )) {
        walls.add(candidate);
      }
    }

    return walls;
  }

  /// BFS check: does a path exist from (sr,sc) to (er,ec)?
  static bool _pathExists(
    int sr, int sc, int er, int ec, int rows, int cols, Set<String> walls,
  ) {
    final visited = <String>{};
    final queue = <List<int>>[[sr, sc]];
    visited.add('$sr,$sc');

    while (queue.isNotEmpty) {
      final curr = queue.removeAt(0);
      final r = curr[0], c = curr[1];
      if (r == er && c == ec) return true;

      for (final dir in [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        final nr = r + dir[0];
        final nc = c + dir[1];
        final key = '$nr,$nc';
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
            !walls.contains(key) && !visited.contains(key)) {
          visited.add(key);
          queue.add([nr, nc]);
        }
      }
    }
    return false;
  }

  /// Returns all edge positions for a grid of given size.
  static List<String> _edgePositions(int size) {
    final positions = <String>[];
    for (int i = 0; i < size; i++) {
      positions.add('0,$i'); // top row
      positions.add('${size - 1},$i'); // bottom row
      if (i > 0 && i < size - 1) {
        positions.add('$i,0'); // left col (exclude corners already added)
        positions.add('$i,${size - 1}'); // right col
      }
    }
    return positions;
  }
}
