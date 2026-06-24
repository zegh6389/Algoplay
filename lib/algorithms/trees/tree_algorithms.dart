import 'dart:math';
import '../models/tree_models.dart';

// ---------------------------------------------------------------------------
// ID helpers
// ---------------------------------------------------------------------------

int _idCounter = 0;

String _makeId(int value, int depth) => '${value}_$depth';

// ---------------------------------------------------------------------------
// BST Insert
// ---------------------------------------------------------------------------

/// Inserts [value] into the BST rooted at [root].
/// Yields [TreeStep]s showing traversal and insertion.
Stream<TreeStep> bstInsert(TreeNode? root, int value) async* {
  if (root == null) {
    final node = TreeNode(
      id: _makeId(value, 0),
      value: value,
      isHighlighted: true,
      highlightType: HighlightType.inserting,
    );
    yield TreeStep(
      tree: node,
      operation: 'Insert $value as root',
      commentary: 'Tree was empty, $value becomes root.',
      visitedNodes: [node.id],
      line: 1,
      isComplete: true,
    );
    return;
  }

  // Work on a clone so we don't mutate the original.
  final tree = root.clone();
  final visited = <String>[];
  final path = <String>[];

  TreeNode? current = tree;
  TreeNode? parent;
  bool wentLeft = false;

  yield TreeStep(
    tree: tree.clone(),
    operation: 'Begin inserting $value',
    commentary: 'Starting BST insert for value $value.',
    visitedNodes: List.from(visited),
    pathNodes: List.from(path),
    line: 1,
  );

  while (current != null) {
    visited.add(current.id);
    path.add(current.id);

    yield TreeStep(
      tree: tree.clone(),
      operation: 'Compare $value with ${current.value}',
      commentary: value < current.value
          ? '$value < ${current.value}, go left.'
          : value > current.value
              ? '$value > ${current.value}, go right.'
              : '$value == ${current.value}, duplicate found.',
      visitedNodes: List.from(visited),
      pathNodes: List.from(path),
      line: 2,
    );

    if (value == current.value) {
      yield TreeStep(
        tree: tree.clone(),
        operation: 'Duplicate $value — no insertion',
        commentary: 'Value $value already exists in BST. No change.',
        visitedNodes: List.from(visited),
        pathNodes: List.from(path),
        line: 3,
        isComplete: true,
      );
      return;
    }

    parent = current;
    if (value < current.value) {
      wentLeft = true;
      current = current.left;
    } else {
      wentLeft = false;
      current = current.right;
    }
  }

  // Insert the new node
  final newNode = TreeNode(
    id: _makeId(value, parent!.depth + 1),
    value: value,
    depth: parent.depth + 1,
    isHighlighted: true,
    highlightType: HighlightType.inserting,
  );

  if (wentLeft) {
    parent.left = newNode;
  } else {
    parent.right = newNode;
  }

  visited.add(newNode.id);

  yield TreeStep(
    tree: tree.clone(),
    operation: 'Insert $value as ${wentLeft ? 'left' : 'right'} child of ${parent.value}',
    commentary: 'Placed $value at depth ${newNode.depth}.',
    visitedNodes: List.from(visited),
    pathNodes: List.from(path)..add(newNode.id),
    line: 4,
    isComplete: true,
  );
}

// ---------------------------------------------------------------------------
// BST Search
// ---------------------------------------------------------------------------

/// Searches for [value] in the BST rooted at [root].
Stream<TreeStep> bstSearch(TreeNode? root, int value) async* {
  if (root == null) {
    yield TreeStep(
      tree: null,
      operation: 'Value $value not found',
      commentary: 'Tree is empty.',
      line: 1,
      isComplete: true,
    );
    return;
  }

  final tree = root.clone();
  final visited = <String>[];
  final path = <String>[];
  TreeNode? current = tree;

  while (current != null) {
    visited.add(current.id);
    path.add(current.id);

    yield TreeStep(
      tree: tree.clone(),
      operation: 'Compare $value with ${current.value}',
      commentary: value < current.value
          ? '$value < ${current.value}, go left.'
          : value > current.value
              ? '$value > ${current.value}, go right.'
              : '$value == ${current.value}, found!',
      visitedNodes: List.from(visited),
      pathNodes: List.from(path),
      line: 2,
    );

    if (value == current.value) {
      yield TreeStep(
        tree: tree.clone(),
        operation: 'Value $value found',
        commentary: 'Successfully found $value in the BST.',
        visitedNodes: List.from(visited),
        pathNodes: List.from(path),
        line: 3,
        isComplete: true,
      );
      return;
    }

    if (value < current.value) {
      current = current.left;
    } else {
      current = current.right;
    }
  }

  yield TreeStep(
    tree: tree.clone(),
    operation: 'Value $value not found',
    commentary: 'Reached a null node; $value is not in the BST.',
    visitedNodes: List.from(visited),
    pathNodes: List.from(path),
    line: 4,
    isComplete: true,
  );
}

// ---------------------------------------------------------------------------
// BST Delete (internal helpers)
// ---------------------------------------------------------------------------

/// Finds the inorder successor of a node (leftmost in right subtree).
/// Returns (successor, successorParent).
(TreeNode, TreeNode?) _findInorderSuccessor(TreeNode node) {
  var parent = node as TreeNode?;
  var current = node.right!;
  while (current.left != null) {
    parent = current;
    current = current.left!;
  }
  return (current, parent);
}

/// Creates a replacement node for [original] with [newValue] but
/// preserving the subtree structure (minus the removed successor).
TreeNode _replaceNode(TreeNode original, int newValue, TreeNode? newLeft, TreeNode? newRight) {
  return TreeNode(
    id: original.id,
    value: newValue,
    left: newLeft,
    right: newRight,
    x: original.x,
    y: original.y,
    targetX: original.targetX,
    targetY: original.targetY,
    depth: original.depth,
    isHighlighted: original.isHighlighted,
    highlightType: original.highlightType,
  );
}

/// Deletes [value] from the BST rooted at [root].
Stream<TreeStep> bstDelete(TreeNode? root, int value) async* {
  if (root == null) {
    yield TreeStep(
      tree: null,
      operation: 'Delete $value — tree is empty',
      commentary: 'Nothing to delete.',
      line: 1,
      isComplete: true,
    );
    return;
  }

  final tree = root.clone();
  final visited = <String>[];

  yield TreeStep(
    tree: tree.clone(),
    operation: 'Begin deleting $value',
    commentary: 'Starting BST delete for value $value.',
    visitedNodes: List.from(visited),
    line: 1,
  );

  // Recursive delete helper — returns the new root of the subtree.
  TreeNode? _deleteNode(TreeNode? node, int val) {
    if (node == null) return null;

    visited.add(node.id);

    if (val < node.value) {
      node.left = _deleteNode(node.left, val);
      return node;
    } else if (val > node.value) {
      node.right = _deleteNode(node.right, val);
      return node;
    }

    // Found the node to delete.
    // Case 1: Leaf
    if (node.left == null && node.right == null) {
      return null;
    }

    // Case 2: One child
    if (node.left == null) return node.right;
    if (node.right == null) return node.left;

    // Case 3: Two children — find inorder successor, restructure
    var successor = node.right!;
    TreeNode? succParent;
    while (successor.left != null) {
      succParent = successor;
      successor = successor.left!;
    }
    visited.add(successor.id);

    // Remove successor from its position
    if (succParent != null) {
      succParent.left = successor.right;
    } else {
      // Successor is immediate right child
      node.right = successor.right;
    }

    // Replace current node with successor's value via restructuring
    return _replaceNode(node, successor.value, node.left, node.right);
  }

  final newTree = _deleteNode(tree, value);

  yield TreeStep(
    tree: newTree?.clone(),
    operation: 'Deleted $value from BST',
    commentary: 'BST delete complete.',
    visitedNodes: List.from(visited),
    line: 2,
    isComplete: true,
  );
}

// ---------------------------------------------------------------------------
// AVL Helpers
// ---------------------------------------------------------------------------

int _height(TreeNode? node) {
  if (node == null) return 0;
  return 1 + max(_height(node.left), _height(node.right));
}

int _balanceFactor(TreeNode node) {
  return _height(node.left) - _height(node.right);
}

TreeNode _copyNode(TreeNode src, {TreeNode? left, TreeNode? right}) {
  return TreeNode(
    id: src.id,
    value: src.value,
    left: left,
    right: right,
    x: src.x,
    y: src.y,
    targetX: src.targetX,
    targetY: src.targetY,
    depth: src.depth,
    isHighlighted: src.isHighlighted,
    highlightType: src.highlightType,
  );
}

TreeNode _rotateRight(TreeNode y) {
  final x = y.left!;
  final t2 = x.right;
  return _copyNode(x,
      left: x.left,
      right: _copyNode(y, left: t2, right: y.right));
}

TreeNode _rotateLeft(TreeNode x) {
  final y = x.right!;
  final t2 = y.left;
  return _copyNode(y,
      left: _copyNode(x, left: x.left, right: t2),
      right: y.right);
}

TreeNode _rebalance(TreeNode node) {
  final bf = _balanceFactor(node);

  // Left heavy
  if (bf > 1) {
    if (_balanceFactor(node.left!) < 0) {
      // LR case
      node = _copyNode(node,
          left: _rotateLeft(node.left!), right: node.right);
    }
    // LL case
    return _rotateRight(node);
  }

  // Right heavy
  if (bf < -1) {
    if (_balanceFactor(node.right!) > 0) {
      // RL case
      node = _copyNode(node,
          left: node.left, right: _rotateRight(node.right!));
    }
    // RR case
    return _rotateLeft(node);
  }

  return node;
}

// ---------------------------------------------------------------------------
// AVL Insert
// ---------------------------------------------------------------------------

/// Inserts [value] into the AVL tree rooted at [root] with auto-rebalancing.
Stream<TreeStep> avlInsert(TreeNode? root, int value) async* {
  if (root == null) {
    final node = TreeNode(
      id: _makeId(value, 0),
      value: value,
      isHighlighted: true,
      highlightType: HighlightType.inserting,
    );
    yield TreeStep(
      tree: node,
      operation: 'Insert $value as root',
      commentary: 'Empty tree, $value becomes root.',
      visitedNodes: [node.id],
      line: 1,
      isComplete: true,
    );
    return;
  }

  final tree = root.clone();
  final visited = <String>[];
  final path = <String>[];

  TreeNode _insert(TreeNode node, int val) {
    visited.add(node.id);
    path.add(node.id);

    if (val < node.value) {
      if (node.left == null) {
        node.left = TreeNode(
          id: _makeId(val, node.depth + 1),
          value: val,
          depth: node.depth + 1,
          isHighlighted: true,
          highlightType: HighlightType.inserting,
        );
      } else {
        node.left = _insert(node.left!, val);
      }
    } else if (val > node.value) {
      if (node.right == null) {
        node.right = TreeNode(
          id: _makeId(val, node.depth + 1),
          value: val,
          depth: node.depth + 1,
          isHighlighted: true,
          highlightType: HighlightType.inserting,
        );
      } else {
        node.right = _insert(node.right!, val);
      }
    }

    return _rebalance(node);
  }

  yield TreeStep(
    tree: tree.clone(),
    operation: 'Begin AVL insert $value',
    commentary: 'Inserting $value into AVL tree.',
    visitedNodes: List.from(visited),
    pathNodes: List.from(path),
    line: 1,
  );

  final newTree = _insert(tree, value);

  // Yield a step showing the visited traversal path
  yield TreeStep(
    tree: newTree.clone(),
    operation: 'Traversed to find insertion point',
    commentary: 'Visited ${visited.length} nodes to find where to insert $value.',
    visitedNodes: List.from(visited),
    pathNodes: List.from(path),
    line: 2,
  );

  yield TreeStep(
    tree: newTree.clone(),
    operation: 'Inserted $value, tree rebalanced',
    commentary: 'AVL tree rebalanced after insertion.',
    visitedNodes: List.from(visited),
    pathNodes: List.from(path),
    line: 3,
    isComplete: true,
  );
}

// ---------------------------------------------------------------------------
// AVL Delete
// ---------------------------------------------------------------------------

/// Deletes [value] from the AVL tree rooted at [root] with auto-rebalancing.
Stream<TreeStep> avlDelete(TreeNode root, int value) async* {
  final tree = root.clone();
  final visited = <String>[];

  yield TreeStep(
    tree: tree.clone(),
    operation: 'Begin AVL delete $value',
    commentary: 'Deleting $value from AVL tree.',
    visitedNodes: List.from(visited),
    line: 1,
  );

  TreeNode? _delete(TreeNode? node, int val) {
    if (node == null) return null;

    visited.add(node.id);

    if (val < node.value) {
      node.left = _delete(node.left, val);
    } else if (val > node.value) {
      node.right = _delete(node.right, val);
    } else {
      // Found the node
      if (node.left == null) return node.right;
      if (node.right == null) return node.left;

      // Two children: find inorder successor
      var successor = node.right!;
      while (successor.left != null) {
        successor = successor.left!;
      }
      // Restructure: replace current with successor value, delete successor
      final rightSubtree = _delete(node.right, successor.value);
      return _replaceNode(node, successor.value, node.left, rightSubtree);
    }

    return _rebalance(node);
  }

  final newTree = _delete(tree, value);

  yield TreeStep(
    tree: newTree?.clone(),
    operation: 'Deleted $value, tree rebalanced',
    commentary: 'AVL tree rebalanced after deletion.',
    visitedNodes: List.from(visited),
    line: 2,
    isComplete: true,
  );
}

// ---------------------------------------------------------------------------
// Heap Insert
// ---------------------------------------------------------------------------

/// Inserts [value] into a max-heap (array representation).
Stream<TreeStep> heapInsert(List<int> heap, int value) async* {
  final arr = List<int>.from(heap);

  yield TreeStep(
    tree: null,
    array: List.from(arr),
    operation: 'Begin heap insert $value',
    commentary: 'Adding $value to heap.',
    line: 1,
  );

  arr.add(value);
  int i = arr.length - 1;

  yield TreeStep(
    tree: null,
    array: List.from(arr),
    highlightedIndices: [i],
    operation: 'Added $value at index $i',
    commentary: 'Appended $value to end of heap.',
    line: 2,
  );

  // Bubble up
  while (i > 0) {
    final parent = (i - 1) ~/ 2;

    yield TreeStep(
      tree: null,
      array: List.from(arr),
      highlightedIndices: [i, parent],
      operation: 'Compare arr[$i]=${arr[i]} with parent arr[$parent]=${arr[parent]}',
      commentary: arr[i] > arr[parent]
          ? '${arr[i]} > ${arr[parent]}, swap.'
          : '${arr[i]} <= ${arr[parent]}, done bubbling.',
      line: 3,
    );

    if (arr[i] <= arr[parent]) break;

    final temp = arr[i];
    arr[i] = arr[parent];
    arr[parent] = temp;
    i = parent;

    yield TreeStep(
      tree: null,
      array: List.from(arr),
      highlightedIndices: [i],
      operation: 'Swapped up to index $i',
      commentary: 'Heap property restored at this level.',
      line: 4,
    );
  }

  yield TreeStep(
    tree: null,
    array: List.from(arr),
    operation: 'Heap insert $value complete',
    commentary: 'Max-heap property maintained.',
    line: 5,
    isComplete: true,
  );
}

// ---------------------------------------------------------------------------
// Heap ExtractMax
// ---------------------------------------------------------------------------

/// Extracts the maximum from a max-heap (array representation).
Stream<TreeStep> heapExtractMax(List<int> heap) async* {
  final arr = List<int>.from(heap);

  if (arr.isEmpty) {
    yield TreeStep(
      tree: null,
      array: [],
      operation: 'Heap is empty — nothing to extract',
      commentary: 'Cannot extract from empty heap.',
      line: 1,
      isComplete: true,
    );
    return;
  }

  yield TreeStep(
    tree: null,
    array: List.from(arr),
    highlightedIndices: [0],
    operation: 'Extract max ${arr.first}',
    commentary: 'Maximum element is at index 0.',
    line: 1,
  );

  final maxVal = arr.first;
  arr[0] = arr.last;
  arr.removeLast();

  yield TreeStep(
    tree: null,
    array: List.from(arr),
    operation: 'Moved last element to root',
    commentary: 'Moved ${arr.isNotEmpty ? arr.first : "nothing"} to root.',
    line: 2,
  );

  // Heapify down
  int i = 0;
  final n = arr.length;

  while (true) {
    int largest = i;
    final left = 2 * i + 1;
    final right = 2 * i + 2;

    if (left < n && arr[left] > arr[largest]) {
      largest = left;
    }
    if (right < n && arr[right] > arr[largest]) {
      largest = right;
    }

    if (largest == i) break;

    yield TreeStep(
      tree: null,
      array: List.from(arr),
      highlightedIndices: [i, largest],
      operation: 'Swap arr[$i]=${arr[i]} with arr[$largest]=${arr[largest]}',
      commentary: 'Heapifying down.',
      line: 3,
    );

    final temp = arr[i];
    arr[i] = arr[largest];
    arr[largest] = temp;
    i = largest;
  }

  yield TreeStep(
    tree: null,
    array: List.from(arr),
    operation: 'Extracted max $maxVal, heap restored',
    commentary: 'Max-heap property restored after extraction.',
    line: 4,
    isComplete: true,
  );
}

// ---------------------------------------------------------------------------
// Inorder Traversal
// ---------------------------------------------------------------------------

/// Inorder traversal: left, root, right.
Stream<TreeStep> inorderTraversal(TreeNode? root) async* {
  if (root == null) {
    yield TreeStep(
      tree: null,
      visitedNodes: [],
      operation: 'Inorder traversal — empty tree',
      commentary: 'Tree is empty, nothing to traverse.',
      line: 1,
      isComplete: true,
    );
    return;
  }

  final tree = root.clone();
  final visitedIds = <String>[];

  yield TreeStep(
    tree: tree.clone(),
    visitedNodes: [],
    operation: 'Begin inorder traversal',
    commentary: 'Inorder: left, root, right.',
    line: 1,
  );

  // Stack-based inorder traversal
  final stack = <TreeNode>[];
  TreeNode? current = tree;

  while (current != null || stack.isNotEmpty) {
    while (current != null) {
      stack.add(current);
      current = current.left;
    }
    current = stack.removeLast();
    visitedIds.add(current.id);

    yield TreeStep(
      tree: tree.clone(),
      visitedNodes: List.from(visitedIds),
      operation: 'Visit node ${current.value}',
      commentary: 'Inorder visit: ${current.value}',
      line: 2,
    );

    current = current.right;
  }

  yield TreeStep(
    tree: tree.clone(),
    visitedNodes: List.from(visitedIds),
    operation: 'Inorder traversal complete',
    commentary: 'Visited ${visitedIds.length} nodes.',
    line: 3,
    isComplete: true,
  );
}

// ---------------------------------------------------------------------------
// Preorder Traversal
// ---------------------------------------------------------------------------

/// Preorder traversal: root, left, right.
Stream<TreeStep> preorderTraversal(TreeNode? root) async* {
  if (root == null) {
    yield TreeStep(
      tree: null,
      visitedNodes: [],
      operation: 'Preorder traversal — empty tree',
      commentary: 'Tree is empty, nothing to traverse.',
      line: 1,
      isComplete: true,
    );
    return;
  }

  final tree = root.clone();
  final visitedIds = <String>[];
  final stack = <TreeNode>[tree];

  yield TreeStep(
    tree: tree.clone(),
    visitedNodes: [],
    operation: 'Begin preorder traversal',
    commentary: 'Preorder: root, left, right.',
    line: 1,
  );

  while (stack.isNotEmpty) {
    final node = stack.removeLast();
    visitedIds.add(node.id);

    yield TreeStep(
      tree: tree.clone(),
      visitedNodes: List.from(visitedIds),
      operation: 'Visit node ${node.value}',
      commentary: 'Preorder visit: ${node.value}',
      line: 2,
    );

    // Push right first so left is processed first
    if (node.right != null) stack.add(node.right!);
    if (node.left != null) stack.add(node.left!);
  }

  yield TreeStep(
    tree: tree.clone(),
    visitedNodes: List.from(visitedIds),
    operation: 'Preorder traversal complete',
    commentary: 'Visited ${visitedIds.length} nodes.',
    line: 3,
    isComplete: true,
  );
}

// ---------------------------------------------------------------------------
// Postorder Traversal
// ---------------------------------------------------------------------------

/// Postorder traversal: left, right, root.
Stream<TreeStep> postorderTraversal(TreeNode? root) async* {
  if (root == null) {
    yield TreeStep(
      tree: null,
      visitedNodes: [],
      operation: 'Postorder traversal — empty tree',
      commentary: 'Tree is empty, nothing to traverse.',
      line: 1,
      isComplete: true,
    );
    return;
  }

  final tree = root.clone();
  final visitedIds = <String>[];

  yield TreeStep(
    tree: tree.clone(),
    visitedNodes: [],
    operation: 'Begin postorder traversal',
    commentary: 'Postorder: left, right, root.',
    line: 1,
  );

  yield* _postorderVisit(tree, tree, visitedIds);

  yield TreeStep(
    tree: tree.clone(),
    visitedNodes: List.from(visitedIds),
    operation: 'Postorder traversal complete',
    commentary: 'Visited ${visitedIds.length} nodes.',
    line: 3,
    isComplete: true,
  );
}

Stream<TreeStep> _postorderVisit(
  TreeNode node,
  TreeNode tree,
  List<String> visitedIds,
) async* {
  if (node.left != null) {
    yield* _postorderVisit(node.left!, tree, visitedIds);
  }
  if (node.right != null) {
    yield* _postorderVisit(node.right!, tree, visitedIds);
  }
  visitedIds.add(node.id);
  yield TreeStep(
    tree: tree.clone(),
    visitedNodes: List.from(visitedIds),
    operation: 'Visit node ${node.value}',
    commentary: 'Postorder visit: ${node.value}',
    line: 2,
  );
}

// ---------------------------------------------------------------------------
// Level Order Traversal
// ---------------------------------------------------------------------------

/// Level-order (BFS) traversal.
Stream<TreeStep> levelOrderTraversal(TreeNode? root) async* {
  if (root == null) {
    yield TreeStep(
      tree: null,
      visitedNodes: [],
      operation: 'Level-order traversal — empty tree',
      commentary: 'Tree is empty, nothing to traverse.',
      line: 1,
      isComplete: true,
    );
    return;
  }

  final tree = root.clone();
  final visitedIds = <String>[];
  final queue = <TreeNode>[tree];

  yield TreeStep(
    tree: tree.clone(),
    visitedNodes: [],
    operation: 'Begin level-order traversal',
    commentary: 'Level order: visit nodes level by level.',
    line: 1,
  );

  while (queue.isNotEmpty) {
    final node = queue.removeAt(0);
    visitedIds.add(node.id);

    yield TreeStep(
      tree: tree.clone(),
      visitedNodes: List.from(visitedIds),
      operation: 'Visit node ${node.value}',
      commentary: 'Level-order visit: ${node.value}',
      line: 2,
    );

    if (node.left != null) queue.add(node.left!);
    if (node.right != null) queue.add(node.right!);
  }

  yield TreeStep(
    tree: tree.clone(),
    visitedNodes: List.from(visitedIds),
    operation: 'Level-order traversal complete',
    commentary: 'Visited ${visitedIds.length} nodes.',
    line: 3,
    isComplete: true,
  );
}

// ---------------------------------------------------------------------------
// Build BST utility
// ---------------------------------------------------------------------------

/// Builds a BST from a list of values by inserting each value.
/// Unlike [bstInsert], this function preserves duplicate values by
/// inserting them into the right subtree of equal-valued nodes.
Stream<TreeStep> buildBST(List<int> values) async* {
  TreeNode? root;

  if (values.isEmpty) {
    yield TreeStep(
      tree: null,
      operation: 'Build BST — empty input',
      commentary: 'No values to insert.',
      line: 1,
      isComplete: true,
    );
    return;
  }

  TreeNode _insertDup(TreeNode node, int val, int depth) {
    if (val < node.value) {
      if (node.left == null) {
        node.left = TreeNode(
          id: _makeId(val, depth + 1),
          value: val,
          depth: depth + 1,
        );
      } else {
        _insertDup(node.left!, val, depth + 1);
      }
    } else {
      // val >= node.value: go right (preserves duplicates)
      if (node.right == null) {
        node.right = TreeNode(
          id: _makeId(val, depth + 1),
          value: val,
          depth: depth + 1,
        );
      } else {
        _insertDup(node.right!, val, depth + 1);
      }
    }
    return node;
  }

  for (int i = 0; i < values.length; i++) {
    final v = values[i];
    if (root == null) {
      root = TreeNode(id: _makeId(v, 0), value: v);
    } else {
      root = _insertDup(root!, v, 0);
    }
    yield TreeStep(
      tree: root?.clone(),
      operation: 'Insert $v into BST',
      commentary: 'Building BST: inserting $v.',
      visitedNodes: [],
      line: i + 1,
      isComplete: i == values.length - 1,
    );
  }
}
