/// Highlight type for tree node visualization.
enum HighlightType {
  none,
  current,
  comparing,
  path,
  visited,
  inserting,
  rotating,
}

/// Represents a node in a binary tree.
class TreeNode {
  final String id;
  final int value;
  TreeNode? left;
  TreeNode? right;

  /// Current x position for rendering.
  double x;

  /// Current y position for rendering.
  double y;

  /// Target x position for animation.
  double targetX;

  /// Target y position for animation.
  double targetY;

  /// Depth of this node in the tree.
  final int depth;

  /// Whether this node is highlighted.
  bool isHighlighted;

  /// The type of highlight applied to this node.
  HighlightType highlightType;

  TreeNode({
    required this.id,
    required this.value,
    this.left,
    this.right,
    this.x = 0,
    this.y = 0,
    this.targetX = 0,
    this.targetY = 0,
    this.depth = 0,
    this.isHighlighted = false,
    this.highlightType = HighlightType.none,
  });

  /// Creates a deep copy of this node and its children.
  TreeNode clone() {
    return TreeNode(
      id: id,
      value: value,
      left: left?.clone(),
      right: right?.clone(),
      x: x,
      y: y,
      targetX: targetX,
      targetY: targetY,
      depth: depth,
      isHighlighted: isHighlighted,
      highlightType: highlightType,
    );
  }

  @override
  String toString() {
    return 'TreeNode(id: $id, value: $value, depth: $depth, '
        'highlighted: $isHighlighted, type: $highlightType)';
  }
}

/// Represents a single step in a tree algorithm visualization.
class TreeStep {
  /// The root of the tree (cloned state at this step).
  final TreeNode? tree;

  /// The array representation of the tree.
  final List<int> array;

  /// Indices in the array that are highlighted.
  final List<int> highlightedIndices;

  /// IDs of nodes that have been visited.
  final List<String> visitedNodes;

  /// IDs of nodes along the current path.
  final List<String> pathNodes;

  /// Human-readable description of the current operation.
  final String operation;

  /// Additional commentary for educational purposes.
  final String commentary;

  /// Line number in the pseudocode being executed.
  final int line;

  /// Whether the algorithm has completed.
  final bool isComplete;

  const TreeStep({
    this.tree,
    this.array = const [],
    this.highlightedIndices = const [],
    this.visitedNodes = const [],
    this.pathNodes = const [],
    required this.operation,
    this.commentary = '',
    required this.line,
    this.isComplete = false,
  });

  TreeStep copyWith({
    TreeNode? tree,
    List<int>? array,
    List<int>? highlightedIndices,
    List<String>? visitedNodes,
    List<String>? pathNodes,
    String? operation,
    String? commentary,
    int? line,
    bool? isComplete,
  }) {
    return TreeStep(
      tree: tree ?? this.tree,
      array: array ?? this.array,
      highlightedIndices: highlightedIndices ?? this.highlightedIndices,
      visitedNodes: visitedNodes ?? this.visitedNodes,
      pathNodes: pathNodes ?? this.pathNodes,
      operation: operation ?? this.operation,
      commentary: commentary ?? this.commentary,
      line: line ?? this.line,
      isComplete: isComplete ?? this.isComplete,
    );
  }

  @override
  String toString() {
    return 'TreeStep(operation: $operation, commentary: $commentary, '
        'visited: $visitedNodes, path: $pathNodes, line: $line, '
        'complete: $isComplete)';
  }
}
