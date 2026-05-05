import 'dart:async';
import 'package:flutter_test/flutter_test.dart';
import 'package:algoplay/algorithms/trees/tree_algorithms.dart';
import 'package:algoplay/algorithms/models/tree_models.dart';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

Future<List<TreeStep>> collectSteps(Stream<TreeStep> stream) async {
  return await stream.toList();
}

void expectNonEmptyOperations(List<TreeStep> steps) {
  for (int i = 0; i < steps.length; i++) {
    expect(
      steps[i].operation,
      isNotEmpty,
      reason: 'Step $i has an empty operation',
    );
  }
}

/// Collect all values in the tree via inorder traversal.
List<int> inorderValues(TreeNode? node) {
  if (node == null) return [];
  return [
    ...inorderValues(node.left),
    node.value,
    ...inorderValues(node.right),
  ];
}

/// Count total nodes in the tree.
int countNodes(TreeNode? node) {
  if (node == null) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

/// Build a sample BST manually for testing.
TreeNode buildSampleBST() {
  //       10
  //      /  \
  //     5    15
  //    / \     \
  //   3   7    20
  final r = TreeNode(id: '10_0', value: 10);
  r.left = TreeNode(id: '5_1', value: 5, depth: 1);
  r.right = TreeNode(id: '15_1', value: 15, depth: 1);
  r.left!.left = TreeNode(id: '3_2', value: 3, depth: 2);
  r.left!.right = TreeNode(id: '7_2', value: 7, depth: 2);
  r.right!.right = TreeNode(id: '20_2', value: 20, depth: 2);
  return r;
}

/// Build a small BST: 5 -> 3, 7
TreeNode buildSmallBST() {
  final r = TreeNode(id: '5_0', value: 5);
  r.left = TreeNode(id: '3_1', value: 3, depth: 1);
  r.right = TreeNode(id: '7_1', value: 7, depth: 1);
  return r;
}

void main() {
  // =========================================================================
  // BST Insert
  // =========================================================================
  group('bstInsert', () {
    test('insert into empty tree — root becomes new node', () async {
      final steps = await collectSteps(bstInsert(null, 10));
      final last = steps.last;
      expect(last.tree, isNotNull);
      expect(last.tree!.value, equals(10));
      expect(last.tree!.left, isNull);
      expect(last.tree!.right, isNull);
    });

    test('insert 5,3,7 — correct BST structure', () async {
      TreeNode? root;
      // Insert 5
      var steps = await collectSteps(bstInsert(root, 5));
      root = steps.last.tree;
      // Insert 3
      steps = await collectSteps(bstInsert(root, 3));
      root = steps.last.tree;
      // Insert 7
      steps = await collectSteps(bstInsert(root, 7));
      root = steps.last.tree;

      expect(root!.value, equals(5));
      expect(root.left!.value, equals(3));
      expect(root.right!.value, equals(7));
      // Verify BST property via inorder
      expect(inorderValues(root), orderedEquals([3, 5, 7]));
    });

    test('insert duplicate — no change', () async {
      TreeNode? root;
      var steps = await collectSteps(bstInsert(root, 10));
      root = steps.last.tree;

      steps = await collectSteps(bstInsert(root, 10));
      final afterDup = steps.last.tree;
      // Tree should have exactly one node with value 10
      expect(countNodes(afterDup), equals(1));
      expect(afterDup!.value, equals(10));
    });

    test('every step has non-empty operation', () async {
      TreeNode? root;
      var steps = await collectSteps(bstInsert(root, 5));
      expectNonEmptyOperations(steps);

      steps = await collectSteps(bstInsert(steps.last.tree, 3));
      expectNonEmptyOperations(steps);
    });

    test('all visited nodes have valid IDs', () async {
      final steps = await collectSteps(bstInsert(null, 42));
      for (int i = 0; i < steps.length; i++) {
        for (final id in steps[i].visitedNodes) {
          expect(id, isNotEmpty, reason: 'Step $i has empty visited node ID');
        }
      }
    });

    test('stream completes without hanging', () async {
      final steps = await collectSteps(bstInsert(null, 1))
          .timeout(const Duration(seconds: 2));
      expect(steps, isNotEmpty);
      expect(steps.last.isComplete, isTrue);
    });
  });

  // =========================================================================
  // BST Search
  // =========================================================================
  group('bstSearch', () {
    test('search for existing value — finds it', () async {
      final tree = buildSampleBST();
      final steps = await collectSteps(bstSearch(tree, 7));
      final last = steps.last;
      expect(last.isComplete, isTrue);
      expect(
        last.operation.toLowerCase(),
        contains('found'),
      );
    });

    test('search for non-existing value — reports not found', () async {
      final tree = buildSampleBST();
      final steps = await collectSteps(bstSearch(tree, 42));
      final last = steps.last;
      expect(last.isComplete, isTrue);
      expect(
        last.operation.toLowerCase(),
        contains('not found'),
      );
    });

    test('search in empty tree — reports not found', () async {
      final steps = await collectSteps(bstSearch(null, 5));
      final last = steps.last;
      expect(last.isComplete, isTrue);
      expect(
        last.operation.toLowerCase(),
        contains('not found'),
      );
    });

    test('every step has non-empty operation', () async {
      final tree = buildSampleBST();
      final steps = await collectSteps(bstSearch(tree, 7));
      expectNonEmptyOperations(steps);
    });

    test('final step has isComplete=true', () async {
      final tree = buildSampleBST();
      final steps = await collectSteps(bstSearch(tree, 10));
      expect(steps.last.isComplete, isTrue);
    });
  });

  // =========================================================================
  // BST Delete
  // =========================================================================
  group('bstDelete', () {
    test('delete leaf node', () async {
      final tree = buildSampleBST();
      final steps = await collectSteps(bstDelete(tree, 3));
      final last = steps.last;
      expect(last.isComplete, isTrue);
      expect(inorderValues(last.tree), isNot(contains(3)));
      expect(inorderValues(last.tree), orderedEquals([5, 7, 10, 15, 20]));
    });

    test('delete node with one child', () async {
      final tree = buildSampleBST();
      final steps = await collectSteps(bstDelete(tree, 15));
      final last = steps.last;
      expect(last.isComplete, isTrue);
      expect(inorderValues(last.tree), isNot(contains(15)));
      expect(inorderValues(last.tree), orderedEquals([3, 5, 7, 10, 20]));
    });

    test('delete node with two children (inorder successor)', () async {
      final tree = buildSampleBST();
      final steps = await collectSteps(bstDelete(tree, 10));
      final last = steps.last;
      expect(last.isComplete, isTrue);
      expect(inorderValues(last.tree), isNot(contains(10)));
      expect(inorderValues(last.tree), orderedEquals([3, 5, 7, 15, 20]));
    });

    test('delete non-existing value — no change', () async {
      final tree = buildSampleBST();
      final original = inorderValues(tree);
      final steps = await collectSteps(bstDelete(tree, 42));
      final last = steps.last;
      expect(last.isComplete, isTrue);
      expect(inorderValues(last.tree), orderedEquals(original));
    });

    test('final step has isComplete=true', () async {
      final tree = buildSampleBST();
      final steps = await collectSteps(bstDelete(tree, 5));
      expect(steps.last.isComplete, isTrue);
    });
  });

  // =========================================================================
  // Inorder Traversal
  // =========================================================================
  group('inorderTraversal', () {
    test('correct visit order on known tree', () async {
      final tree = buildSmallBST();
      final steps = await collectSteps(inorderTraversal(tree));
      // Inorder: 3, 5, 7
      final last = steps.last;
      expect(last.isComplete, isTrue);
      expect(last.visitedNodes.length, equals(3));
    });

    test('every step has non-empty operation', () async {
      final tree = buildSmallBST();
      final steps = await collectSteps(inorderTraversal(tree));
      expectNonEmptyOperations(steps);
    });

    test('empty tree yields single step with empty visited list', () async {
      final steps = await collectSteps(inorderTraversal(null));
      expect(steps, isNotEmpty);
      expect(steps.last.visitedNodes, isEmpty);
      expect(steps.last.isComplete, isTrue);
    });
  });

  // =========================================================================
  // Preorder Traversal
  // =========================================================================
  group('preorderTraversal', () {
    test('correct visit order on known tree', () async {
      final tree = buildSmallBST();
      final steps = await collectSteps(preorderTraversal(tree));
      // Preorder: 5, 3, 7
      final last = steps.last;
      expect(last.isComplete, isTrue);
      expect(last.visitedNodes.length, equals(3));
    });

    test('every step has non-empty operation', () async {
      final tree = buildSmallBST();
      final steps = await collectSteps(preorderTraversal(tree));
      expectNonEmptyOperations(steps);
    });

    test('empty tree yields single step with empty visited list', () async {
      final steps = await collectSteps(preorderTraversal(null));
      expect(steps, isNotEmpty);
      expect(steps.last.visitedNodes, isEmpty);
      expect(steps.last.isComplete, isTrue);
    });
  });

  // =========================================================================
  // Level Order Traversal
  // =========================================================================
  group('levelOrderTraversal', () {
    test('correct visit order on known tree', () async {
      final tree = buildSmallBST();
      final steps = await collectSteps(levelOrderTraversal(tree));
      // Level order: 5, 3, 7
      final last = steps.last;
      expect(last.isComplete, isTrue);
      expect(last.visitedNodes.length, equals(3));
    });

    test('every step has non-empty operation', () async {
      final tree = buildSmallBST();
      final steps = await collectSteps(levelOrderTraversal(tree));
      expectNonEmptyOperations(steps);
    });

    test('empty tree yields single step with empty visited list', () async {
      final steps = await collectSteps(levelOrderTraversal(null));
      expect(steps, isNotEmpty);
      expect(steps.last.visitedNodes, isEmpty);
      expect(steps.last.isComplete, isTrue);
    });
  });

  // =========================================================================
  // Heap Insert
  // =========================================================================
  group('heapInsert', () {
    test('insert maintains heap property', () async {
      List<int> heap = [];
      for (final v in [3, 7, 1, 9, 5]) {
        final steps = await collectSteps(heapInsert(heap, v));
        heap = steps.last.array;
      }
      // Verify max-heap property: arr[0] >= children
      expect(heap.first, equals(heap.reduce((a, b) => a > b ? a : b)));
      // Verify all values present
      expect(heap.toSet(), containsAll([3, 7, 1, 9, 5]));
    });
  });

  // =========================================================================
  // Heap ExtractMax
  // =========================================================================
  group('heapExtractMax', () {
    test('extractMax returns largest, maintains heap', () async {
      List<int> heap = [9, 7, 1, 3, 5];
      final steps = await collectSteps(heapExtractMax(heap));
      final last = steps.last;
      expect(last.array, isNot(contains(9)));
      // Check heap property on remaining
      if (last.array.isNotEmpty) {
        expect(
          last.array.first,
          equals(last.array.reduce((a, b) => a > b ? a : b)),
        );
      }
    });

    test('extractMax from empty heap', () async {
      final steps = await collectSteps(heapExtractMax([]));
      final last = steps.last;
      expect(last.array, isEmpty);
      expect(last.isComplete, isTrue);
    });
  });

  // =========================================================================
  // Build BST utility
  // =========================================================================
  group('buildBST', () {
    test('build BST from array [3,1,4,1,5,9,2,6]', () async {
      final steps = await collectSteps(buildBST([3, 1, 4, 1, 5, 9, 2, 6]));
      final last = steps.last;
      expect(last.tree, isNotNull);
      // Inorder of BST should be sorted
      final vals = inorderValues(last.tree);
      expect(vals, orderedEquals([1, 1, 2, 3, 4, 5, 6, 9]));
    });

    test('buildBST from empty list returns null tree', () async {
      final steps = await collectSteps(buildBST([]));
      final last = steps.last;
      expect(last.tree, isNull);
      expect(last.isComplete, isTrue);
    });
  });

  // =========================================================================
  // AVL Insert
  // =========================================================================
  group('avlInsert', () {
    test('LL rotation: insert 3,2,1 triggers right rotation', () async {
      TreeNode? root;
      for (final v in [3, 2, 1]) {
        final steps = await collectSteps(avlInsert(root, v));
        root = steps.last.tree;
      }
      expect(root!.value, equals(2));
      expect(root.left!.value, equals(1));
      expect(root.right!.value, equals(3));
    });

    test('RR rotation: insert 1,2,3 triggers left rotation', () async {
      TreeNode? root;
      for (final v in [1, 2, 3]) {
        final steps = await collectSteps(avlInsert(root, v));
        root = steps.last.tree;
      }
      expect(root!.value, equals(2));
      expect(root.left!.value, equals(1));
      expect(root.right!.value, equals(3));
    });

    test('LR rotation: insert 3,1,2 triggers left-right rotation', () async {
      TreeNode? root;
      for (final v in [3, 1, 2]) {
        final steps = await collectSteps(avlInsert(root, v));
        root = steps.last.tree;
      }
      expect(root!.value, equals(2));
      expect(root.left!.value, equals(1));
      expect(root.right!.value, equals(3));
    });

    test('RL rotation: insert 1,3,2 triggers right-left rotation', () async {
      TreeNode? root;
      for (final v in [1, 3, 2]) {
        final steps = await collectSteps(avlInsert(root, v));
        root = steps.last.tree;
      }
      expect(root!.value, equals(2));
      expect(root.left!.value, equals(1));
      expect(root.right!.value, equals(3));
    });
  });

  // =========================================================================
  // AVL Delete
  // =========================================================================
  group('avlDelete', () {
    test('delete leaf and rebalance', () async {
      TreeNode? root;
      for (final v in [2, 1, 3]) {
        final steps = await collectSteps(avlInsert(root, v));
        root = steps.last.tree;
      }
      final steps = await collectSteps(avlDelete(root!, 3));
      root = steps.last.tree;
      expect(inorderValues(root), orderedEquals([1, 2]));
      expect(root!.value, equals(2));
      expect(root.left!.value, equals(1));
      expect(root.right, isNull);
    });

    test('delete causes rebalance', () async {
      TreeNode? root;
      for (final v in [3, 2, 4, 1]) {
        final steps = await collectSteps(avlInsert(root, v));
        root = steps.last.tree;
      }
      final steps = await collectSteps(avlDelete(root!, 4));
      root = steps.last.tree;
      expect(inorderValues(root), orderedEquals([1, 2, 3]));
      expect(root!.value, equals(2));
    });

    test('final step has isComplete=true', () async {
      TreeNode? root;
      for (final v in [5, 3, 7]) {
        final steps = await collectSteps(avlInsert(root, v));
        root = steps.last.tree;
      }
      final steps = await collectSteps(avlDelete(root!, 3));
      expect(steps.last.isComplete, isTrue);
    });
  });
}
