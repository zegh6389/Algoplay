import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/haptics.dart';
import '../../../core/theme/app_theme.dart';
import '../../../algorithms/models/tree_models.dart';
import '../widgets/step_stat_chip.dart';

/// ═══════════════════════════════════════════════════════════════════════════════
/// Tree Visualizer Page
///
/// Step-by-step visualization of Tree algorithms:
/// BST Operations, AVL Trees, Tree Traversals, and more.
/// ═══════════════════════════════════════════════════════════════════════════════

class TreeVisualizerPage extends ConsumerStatefulWidget {
  const TreeVisualizerPage({super.key});

  @override
  ConsumerState<TreeVisualizerPage> createState() => _TreeVisualizerPageState();
}

class _TreeVisualizerPageState extends ConsumerState<TreeVisualizerPage>
    with WidgetsBindingObserver {
  // Available tree algorithms
  static const _treeAlgorithms = [
    (id: 'bst-operations', name: 'BST Operations', description: 'Insert, search, delete in a Binary Search Tree'),
    (id: 'tree-traversals', name: 'Tree Traversals', description: 'In-order, pre-order, post-order, level-order'),
    (id: 'avl-tree', name: 'AVL Tree', description: 'Self-balancing BST with rotations'),
  ];

  // State
  String _selectedAlgorithmId = 'bst-operations';
  List<TreeStep> _steps = [];
  int _currentStepIndex = 0;
  bool _isPlaying = false;
  double _speed = 1.0;
  Timer? _playTimer;

  // Tree state
  TreeNode? _root;
  List<int> _arrayRepr = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initializeTree();
    _loadAlgorithm();
  }

  void _initializeTree() {
    // Build a sample BST: 50, 30, 70, 20, 40, 60, 80
    _root = TreeNode(id: '50', value: 50, depth: 0);
    _root!.left = TreeNode(id: '30', value: 30, depth: 1);
    _root!.right = TreeNode(id: '70', value: 70, depth: 1);
    _root!.left!.left = TreeNode(id: '20', value: 20, depth: 2);
    _root!.left!.right = TreeNode(id: '40', value: 40, depth: 2);
    _root!.right!.left = TreeNode(id: '60', value: 60, depth: 2);
    _root!.right!.right = TreeNode(id: '80', value: 80, depth: 2);

    _arrayRepr = [50, 30, 70, 20, 40, 60, 80];
    _assignPositions(_root!, 0, 400, 40);
  }

  void _assignPositions(TreeNode? node, double left, double right, double top) {
    if (node == null) return;
    node.x = (left + right) / 2;
    node.y = top;
    if (node.left != null) {
      _assignPositions(node.left!, left, node.x, top + 70);
    }
    if (node.right != null) {
      _assignPositions(node.right!, node.x, right, top + 70);
    }
  }

  void _loadAlgorithm() {
    _playTimer?.cancel();
    setState(() {
      _steps = [];
      _currentStepIndex = 0;
      _isPlaying = false;
    });
    _collectSteps();
  }

  Future<void> _collectSteps() async {
    List<TreeStep> collected;

    switch (_selectedAlgorithmId) {
      case 'bst-operations':
        collected = _simulateBstOperations();
        break;
      case 'tree-traversals':
        collected = _simulateTreeTraversals();
        break;
      case 'avl-tree':
        collected = _simulateAvlTree();
        break;
      default:
        collected = _simulateBstOperations();
    }

    if (mounted) {
      setState(() {
        _steps = collected;
      });
    }
  }

  List<TreeStep> _simulateBstOperations() {
    final steps = <TreeStep>[];

    // Step 1: Show initial tree
    steps.add(TreeStep(
      tree: _cloneTree(_root),
      array: _arrayRepr,
      highlightedIndices: [],
      visitedNodes: [],
      pathNodes: [],
      operation: 'Initial BST state — balanced binary search tree',
      commentary: 'Each node\'s left child is smaller, right child is larger',
      line: 0,
    ));

    // Step 2: Search for 40
    steps.add(TreeStep(
      tree: _cloneTree(_root),
      array: _arrayRepr,
      highlightedIndices: [],
      visitedNodes: ['50'],
      pathNodes: ['50'],
      operation: 'Search for value: 40',
      commentary: 'Start at root (50). 40 < 50, go left.',
      line: 1,
    ));
    steps.add(TreeStep(
      tree: _cloneTree(_root),
      array: _arrayRepr,
      highlightedIndices: [],
      visitedNodes: ['50', '30'],
      pathNodes: ['50', '30'],
      operation: 'At node 30. 40 > 30, go right.',
      commentary: 'Continuing the search down the tree',
      line: 1,
    ));
    steps.add(TreeStep(
      tree: _cloneTree(_root),
      array: _arrayRepr,
      highlightedIndices: [3], // index of 40
      visitedNodes: ['50', '30', '40'],
      pathNodes: ['50', '30', '40'],
      operation: 'Found 40! ✓',
      commentary: 'Search complete — found the target value',
      line: 2,
      isComplete: true,
    ));

    // Step 3: Insert 35
    steps.add(TreeStep(
      tree: _cloneTree(_root),
      array: _arrayRepr,
      highlightedIndices: [],
      visitedNodes: [],
      pathNodes: [],
      operation: 'Insert value: 35',
      commentary: 'Find the correct position for 35',
      line: 3,
    ));
    steps.add(TreeStep(
      tree: _cloneTree(_root),
      array: _arrayRepr,
      highlightedIndices: [],
      visitedNodes: ['50'],
      pathNodes: ['50'],
      operation: 'At 50: 35 < 50, go left',
      commentary: 'Following the left path',
      line: 3,
    ));
    steps.add(TreeStep(
      tree: _cloneTree(_root),
      array: _arrayRepr,
      highlightedIndices: [],
      visitedNodes: ['50', '30'],
      pathNodes: ['50', '30'],
      operation: 'At 30: 35 > 30, go right',
      commentary: 'Following the right path from 30',
      line: 3,
    ));
    // Build new tree with 35 inserted
    final newRoot = _buildTreeWithInsert(_root!, 35);
    _assignPositions(newRoot!, 0, 400, 40);
    final newArray = _inorderList(newRoot);
    steps.add(TreeStep(
      tree: newRoot,
      array: newArray,
      highlightedIndices: [newArray.indexOf(35)],
      visitedNodes: ['50', '30', '35'],
      pathNodes: ['50', '30', '35'],
      operation: 'Insert 35 at correct position!',
      commentary: 'New node added as right child of 20',
      line: 4,
      isComplete: true,
    ));

    return steps;
  }

  List<TreeStep> _simulateTreeTraversals() {
    final steps = <TreeStep>[];

    steps.add(TreeStep(
      tree: _cloneTree(_root),
      array: _arrayRepr,
      highlightedIndices: [],
      visitedNodes: [],
      pathNodes: [],
      operation: 'Tree Traversals Demo',
      commentary: 'Watch all four traversal types on this BST',
      line: 0,
    ));

    // In-order: Left, Root, Right (sorted order)
    final inorder = <int>[];
    void inorderFn(TreeNode? node) {
      if (node == null) return;
      inorderFn(node.left);
      inorder.add(node.value);
      inorderFn(node.right);
    }
    inorderFn(_root);

    steps.add(TreeStep(
      tree: _cloneTree(_root),
      array: _arrayRepr,
      highlightedIndices: [],
      visitedNodes: [],
      pathNodes: [],
      operation: 'In-order: Left → Root → Right',
      commentary: 'Result: ${inorder.join(" → ")} (sorted order!)',
      line: 1,
    ));
    steps.add(TreeStep(
      tree: _cloneTree(_root),
      array: _arrayRepr,
      highlightedIndices: [0],
      visitedNodes: ['20'],
      pathNodes: ['50', '30', '20'],
      operation: 'Visit 20 (leftmost)',
      commentary: 'First, go all the way left',
      line: 1,
    ));
    steps.add(TreeStep(
      tree: _cloneTree(_root),
      array: _arrayRepr,
      highlightedIndices: [0, 1],
      visitedNodes: ['20', '30'],
      pathNodes: ['50', '30', '20'],
      operation: 'Visit 30, then 40',
      commentary: 'Left subtree complete, visit root then right',
      line: 1,
    ));
    steps.add(TreeStep(
      tree: _cloneTree(_root),
      array: _arrayRepr,
      highlightedIndices: [0, 1, 2],
      visitedNodes: ['20', '30', '50'],
      pathNodes: ['50'],
      operation: 'Visit 50 (root)',
      commentary: 'Now visiting the root',
      line: 1,
    ));
    steps.add(TreeStep(
      tree: _cloneTree(_root),
      array: _arrayRepr,
      highlightedIndices: [0, 1, 2, 3, 4],
      visitedNodes: ['20', '30', '50', '60'],
      pathNodes: ['50', '70', '60'],
      operation: 'Visit 60, 70, 80',
      commentary: 'Right subtree complete',
      line: 1,
      isComplete: true,
    ));

    // Pre-order: Root, Left, Right
    final preorder = <int>[];
    void preorderFn(TreeNode? node) {
      if (node == null) return;
      preorder.add(node.value);
      preorderFn(node.left);
      preorderFn(node.right);
    }
    preorderFn(_root);
    steps.add(TreeStep(
      tree: _cloneTree(_root),
      array: _arrayRepr,
      highlightedIndices: [],
      visitedNodes: [],
      pathNodes: [],
      operation: 'Pre-order: Root → Left → Right',
      commentary: 'Result: ${preorder.join(" → ")}',
      line: 2,
      isComplete: true,
    ));

    // Post-order: Left, Right, Root
    final postorder = <int>[];
    void postorderFn(TreeNode? node) {
      if (node == null) return;
      postorderFn(node.left);
      postorderFn(node.right);
      postorder.add(node.value);
    }
    postorderFn(_root);
    steps.add(TreeStep(
      tree: _cloneTree(_root),
      array: _arrayRepr,
      highlightedIndices: [],
      visitedNodes: [],
      pathNodes: [],
      operation: 'Post-order: Left → Right → Root',
      commentary: 'Result: ${postorder.join(" → ")}',
      line: 3,
      isComplete: true,
    ));

    return steps;
  }

  List<TreeStep> _simulateAvlTree() {
    final steps = <TreeStep>[];

    // Start with empty tree
    TreeNode? avlRoot;

    steps.add(TreeStep(
      tree: avlRoot,
      array: [],
      highlightedIndices: [],
      visitedNodes: [],
      pathNodes: [],
      operation: 'AVL Tree — Self-Balancing BST',
      commentary: 'Height balance factor = |height(left) - height(right)| must be ≤ 1',
      line: 0,
    ));

    // Insert 10
    avlRoot = _avInsert(avlRoot, 10);
    _assignPositions(avlRoot, 0, 400, 40);
    steps.add(TreeStep(
      tree: avlRoot,
      array: _inorderList(avlRoot),
      highlightedIndices: [0],
      visitedNodes: ['10'],
      pathNodes: ['10'],
      operation: 'Insert 10 — first node',
      commentary: 'Single node, balanced (height = 1)',
      line: 1,
    ));

    // Insert 20
    avlRoot = _avInsert(avlRoot, 20);
    _assignPositions(avlRoot, 0, 400, 40);
    steps.add(TreeStep(
      tree: avlRoot,
      array: _inorderList(avlRoot),
      highlightedIndices: [1],
      visitedNodes: ['10', '20'],
      pathNodes: ['10', '20'],
      operation: 'Insert 20 — right child',
      commentary: 'Still balanced (height = 2)',
      line: 1,
    ));

    // Insert 30 — causes imbalance, needs left rotation
    avlRoot = _avInsert(avlRoot, 30);
    _assignPositions(avlRoot, 0, 400, 40);
    steps.add(TreeStep(
      tree: avlRoot,
      array: _inorderList(avlRoot),
      highlightedIndices: [1],
      visitedNodes: ['20'],
      pathNodes: ['10', '20', '30'],
      operation: 'Insert 30 — LEFT ROTATION needed!',
      commentary: 'Height balance = 2 (unbalanced). Rotate 10 left around 20.',
      line: 2,
      isComplete: true,
    ));

    // Insert 5
    avlRoot = _avInsert(avlRoot, 5);
    _assignPositions(avlRoot, 0, 400, 40);
    steps.add(TreeStep(
      tree: avlRoot,
      array: _inorderList(avlRoot),
      highlightedIndices: [0],
      visitedNodes: ['20', '10', '5'],
      pathNodes: ['20', '10'],
      operation: 'Insert 5 — left child of 10',
      commentary: 'Still balanced. AVL property maintained.',
      line: 1,
      isComplete: true,
    ));

    return steps;
  }

  // ── AVL helper functions ─────────────────────────────────────────────────

  int _avHeight(TreeNode? node) {
    if (node == null) return 0;
    return 1 + max(_avHeight(node.left), _avHeight(node.right));
  }

  TreeNode? _avInsert(TreeNode? node, int value) {
    if (node == null) {
      return TreeNode(id: '$value', value: value, depth: 0);
    }

    if (value < node.value) {
      node.left = _avInsert(node.left, value);
    } else if (value > node.value) {
      node.right = _avInsert(node.right, value);
    } else {
      return node; // No duplicates
    }

    // Balance the node
    final balance = _avHeight(node.left!) - _avHeight(node.right!);

    // Left Left
    if (balance > 1 && value < (node.left?.value ?? 0)) {
      return _rotateRight(node);
    }

    // Right Right
    if (balance < -1 && value > (node.right?.value ?? 0)) {
      return _rotateLeft(node);
    }

    // Left Right
    if (balance > 1 && value > (node.left?.value ?? 0)) {
      node.left = _rotateLeft(node.left!);
      return _rotateRight(node);
    }

    // Right Left
    if (balance < -1 && value < (node.right?.value ?? 0)) {
      node.right = _rotateRight(node.right!);
      return _rotateLeft(node);
    }

    return node;
  }

  TreeNode _rotateRight(TreeNode y) {
    final x = y.left!;
    final t2 = x.right;
    x.right = y;
    y.left = t2;
    return x;
  }

  TreeNode _rotateLeft(TreeNode x) {
    final y = x.right!;
    final t2 = y.left;
    y.left = x;
    x.right = t2;
    return y;
  }

  // ── BST helper functions ──────────────────────────────────────────────────

  TreeNode? _cloneTree(TreeNode? node) {
    if (node == null) return null;
    return node.clone();
  }

  TreeNode? _buildTreeWithInsert(TreeNode root, int value) {
    final newRoot = _cloneTree(root);
    _insertIntoBst(newRoot!, value);
    return newRoot;
  }

  void _insertIntoBst(TreeNode node, int value) {
    if (value < node.value) {
      if (node.left == null) {
        node.left = TreeNode(id: '$value', value: value, depth: node.depth + 1);
      } else {
        _insertIntoBst(node.left!, value);
      }
    } else {
      if (node.right == null) {
        node.right = TreeNode(id: '$value', value: value, depth: node.depth + 1);
      } else {
        _insertIntoBst(node.right!, value);
      }
    }
  }

  List<int> _inorderList(TreeNode? node) {
    final result = <int>[];
    void inorder(TreeNode? n) {
      if (n == null) return;
      inorder(n.left);
      result.add(n.value);
      inorder(n.right);
    }
    inorder(node);
    return result;
  }

  // ── Playback controls ────────────────────────────────────────────────────

  void _togglePlay() {
    if (_steps.isEmpty) return;
    Haptics.selection();
    setState(() => _isPlaying = !_isPlaying);
    if (_isPlaying) {
      _startPlayTimer();
    } else {
      _playTimer?.cancel();
    }
  }

  void _startPlayTimer() {
    _playTimer?.cancel();
    final intervalMs = (800 / _speed).round();
    _playTimer = Timer.periodic(Duration(milliseconds: intervalMs), (_) {
      if (!mounted) {
        _playTimer?.cancel();
        return;
      }
      if (_currentStepIndex < _steps.length - 1) {
        setState(() => _currentStepIndex++);
      } else {
        _playTimer?.cancel();
        Haptics.success();
        setState(() => _isPlaying = false);
      }
    });
  }

  void _stepForward() {
    if (_currentStepIndex < _steps.length - 1) {
      Haptics.light();
      setState(() => _currentStepIndex++);
    }
  }

  void _stepBack() {
    if (_currentStepIndex > 0) {
      Haptics.light();
      setState(() => _currentStepIndex--);
    }
  }

  void _reset() {
    Haptics.selection();
    _playTimer?.cancel();
    setState(() {
      _isPlaying = false;
      _currentStepIndex = 0;
      _initializeTree();
    });
    _collectSteps();
  }

  void _cycleSpeed() {
    _playTimer?.cancel();
    setState(() {
      if (_speed == 1.0) {
        _speed = 2.0;
      } else if (_speed == 2.0) {
        _speed = 4.0;
      } else {
        _speed = 1.0;
      }
    });
    if (_isPlaying) _startPlayTimer();
  }

  void _pauseForLifecycle() {
    _playTimer?.cancel();
    if (mounted && _isPlaying) {
      setState(() => _isPlaying = false);
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.inactive ||
        state == AppLifecycleState.paused ||
        state == AppLifecycleState.hidden ||
        state == AppLifecycleState.detached) {
      _pauseForLifecycle();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _playTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currentStep = _steps.isNotEmpty ? _steps[_currentStepIndex] : null;

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        backgroundColor: AppColors.card,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Tree Visualizer',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.textSecondary),
            onPressed: () {
              _initializeTree();
              _loadAlgorithm();
            },
          ),
          IconButton(
            icon: const Icon(Icons.info_outline, color: AppColors.textSecondary),
            onPressed: () => _showInfoSheet(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // ── Algorithm Selector ──
          Container(
            color: AppColors.card,
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.md,
            ),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _treeAlgorithms.map((algo) {
                  final isSelected = algo.id == _selectedAlgorithmId;
                  return Padding(
                    padding: const EdgeInsets.only(right: AppSpacing.sm),
                    child: GestureDetector(
                      onTap: () {
                        setState(() => _selectedAlgorithmId = algo.id);
                        _initializeTree();
                        _loadAlgorithm();
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.sm,
                        ),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.catTrees.withValues(alpha: 0.15)
                              : AppColors.sunken,
                          borderRadius: AppRadius.smBorder,
                          border: Border.all(
                            color: isSelected
                                ? AppColors.catTrees
                                : Colors.transparent,
                            width: 1.5,
                          ),
                        ),
                        child: Text(
                          algo.name,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight:
                                isSelected ? FontWeight.w600 : FontWeight.w500,
                            color: isSelected
                                ? AppColors.catTrees
                                : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          const Divider(height: 1, color: AppColors.sunken),

          // ── Visualization Area ──
          Expanded(
            child: Container(
              color: AppColors.card,
              padding: const EdgeInsets.all(AppSpacing.md),
              child: _steps.isEmpty
                  ? const Center(child: CircularProgressIndicator())
                  : Column(
                      children: [
                        // ── Tree Canvas ──
                        Expanded(
                          flex: 3,
                          child: _buildTreeCanvas(currentStep),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        // ── Array Representation ──
                        _buildArrayRepresentation(currentStep),
                      ],
                    ),
            ),
          ),

          // ── Step Info Bar ──
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.md,
            ),
            decoration: const BoxDecoration(color: AppColors.sunken),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  currentStep?.operation ?? 'Ready',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
                if (currentStep?.commentary.isNotEmpty ?? false) ...[
                  const SizedBox(height: 2),
                  Text(
                    currentStep!.commentary,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textMuted,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      'Step ${_steps.isEmpty ? 0 : _currentStepIndex + 1} / ${_steps.length}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textMuted,
                      ),
                    ),
                    const Spacer(),
                    if (currentStep != null)
                      StepStatChip(
                        label: 'visited',
                        value: currentStep.visitedNodes.length,
                        color: AppColors.catTrees,
                      ),
                  ],
                ),
                // ── Scrubber ──
                if (_steps.length > 1) ...[
                  const SizedBox(height: 4),
                  SliderTheme(
                    data: SliderThemeData(
                      trackHeight: 3,
                      thumbShape:
                          const RoundSliderThumbShape(enabledThumbRadius: 6),
                      overlayShape:
                          const RoundSliderOverlayShape(overlayRadius: 12),
                      activeTrackColor: AppColors.catTrees,
                      inactiveTrackColor: AppColors.sunken,
                      thumbColor: AppColors.catTrees,
                    ),
                    child: Slider(
                      value: _currentStepIndex.toDouble(),
                      min: 0,
                      max: (_steps.length - 1).toDouble(),
                      divisions: _steps.length - 1,
                      onChanged: (v) => setState(() {
                        _currentStepIndex = v.round();
                        _isPlaying = false;
                        _playTimer?.cancel();
                      }),
                    ),
                  ),
                ],
              ],
            ),
          ),

          // ── Controls Bar ──
          Container(
            decoration: const BoxDecoration(
              color: AppColors.card,
              border: Border(
                top: BorderSide(color: AppColors.sunken, width: 1),
              ),
            ),
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.md,
            ),
            child: SafeArea(
              top: false,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _TreeGhostButton(icon: Icons.replay, onTap: _reset),
                  _TreeGhostButton(icon: Icons.skip_previous, onTap: _stepBack),
                  SizedBox(
                    width: 56,
                    height: 56,
                    child: FloatingActionButton(
                      onPressed: _togglePlay,
                      backgroundColor: AppColors.catTrees,
                      child: Icon(
                        _isPlaying ? Icons.pause : Icons.play_arrow,
                        color: AppColors.textInverse,
                        size: 28,
                      ),
                    ),
                  ),
                  _TreeGhostButton(icon: Icons.skip_next, onTap: _stepForward),
                  _TreeGhostButton(
                    icon: Icons.speed,
                    label: '${_speed.toInt()}x',
                    onTap: _cycleSpeed,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTreeCanvas(TreeStep? step) {
    if (step == null || step.tree == null) {
      return Center(
        child: Text(
          'Empty tree',
          style: AppTypography.caption,
        ),
      );
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        return CustomPaint(
          size: Size(constraints.maxWidth, constraints.maxHeight),
          painter: _TreePainter(
            root: step.tree!,
            visitedNodes: step.visitedNodes,
            pathNodes: step.pathNodes,
            color: AppColors.catTrees,
          ),
          child: Stack(
            children: _buildNodeWidgets(step),
          ),
        );
      },
    );
  }

  List<Widget> _buildNodeWidgets(TreeStep step) {
    if (step.tree == null) return [];

    final nodes = <Widget>[];
    void collectNodes(TreeNode? node) {
      if (node == null) return;
      final isVisited = step.visitedNodes.contains(node.id);
      final isInPath = step.pathNodes.contains(node.id);
      // The "current" node is the head of the path — the one being visited now.
      final isCurrent =
          isInPath && step.pathNodes.isNotEmpty && step.pathNodes.last == node.id;

      Color bgColor;
      Color textColor;
      if (step.isComplete && isVisited) {
        bgColor = AppColors.success600;
        textColor = AppColors.textInverse;
      } else if (isCurrent) {
        bgColor = AppColors.secondary500;
        textColor = AppColors.textInverse;
      } else if (isVisited && isInPath) {
        bgColor = AppColors.catTrees;
        textColor = AppColors.textInverse;
      } else if (isVisited) {
        bgColor = AppColors.catTrees.withValues(alpha: 0.3);
        textColor = AppColors.textPrimary;
      } else {
        bgColor = AppColors.sunken;
        textColor = AppColors.textPrimary;
      }

      nodes.add(
        Positioned(
          left: node.x - 18,
          top: node.y - 18,
          child: Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: AppRadius.fullBorder,
              border: Border.all(
                color: isCurrent
                    ? AppColors.solarGold
                    : (isVisited && isInPath)
                        ? AppColors.catTrees
                        : Colors.transparent,
                width: 2,
              ),
              boxShadow: isVisited ? AppShadows.sm : null,
            ),
            alignment: Alignment.center,
            child: Text(
              '${node.value}',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: textColor,
              ),
            ),
          ),
        ),
      );
      collectNodes(node.left);
      collectNodes(node.right);
    }

    collectNodes(step.tree);
    return nodes;
  }

  Widget _buildArrayRepresentation(TreeStep? step) {
    final array = step?.array ?? [];
    final highlighted = step?.highlightedIndices ?? [];

    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Array / Level-order',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: AppColors.textMuted,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Expanded(
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: array.length,
              separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.xs),
              itemBuilder: (context, i) {
                final isHighlighted = highlighted.contains(i);
                return Container(
                  width: 40,
                  height: 32,
                  decoration: BoxDecoration(
                    color: isHighlighted
                        ? AppColors.catTrees
                        : AppColors.sunken,
                    borderRadius: AppRadius.smBorder,
                    border: Border.all(
                      color: isHighlighted
                          ? AppColors.catTrees
                          : Colors.transparent,
                      width: 1.5,
                    ),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    '${array[i]}',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: isHighlighted
                          ? AppColors.textInverse
                          : AppColors.textPrimary,
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showInfoSheet(BuildContext context) {
    final algo = _treeAlgorithms.firstWhere((a) => a.id == _selectedAlgorithmId);

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.lg)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: AppSpacing.lg),
                  decoration: BoxDecoration(
                    color: AppColors.sunken,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              Text(algo.name, style: AppTypography.h2),
              const SizedBox(height: AppSpacing.sm),
              Text(algo.description, style: AppTypography.caption),
              const SizedBox(height: AppSpacing.lg),
              _treeInfoRow('Time (Search)', 'O(log n) avg'),
              const SizedBox(height: AppSpacing.sm),
              _treeInfoRow('Time (Worst)', 'O(n)'),
              const SizedBox(height: AppSpacing.sm),
              _treeInfoRow('Space', 'O(h)'),
              const SizedBox(height: AppSpacing.xl),
            ],
          ),
        );
      },
    );
  }

  Widget _treeInfoRow(String label, String value) {
    return Row(
      children: [
        SizedBox(
          width: 140,
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            ),
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}

/// Tree custom painter for drawing edges
class _TreePainter extends CustomPainter {
  final TreeNode root;
  final List<String> visitedNodes;
  final List<String> pathNodes;
  final Color color;

  _TreePainter({
    required this.root,
    required this.visitedNodes,
    required this.pathNodes,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color.withValues(alpha: 0.4)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    void drawEdges(TreeNode? node) {
      if (node == null) return;

      if (node.left != null) {
        final isActive = pathNodes.contains(node.id) &&
            pathNodes.contains(node.left!.id);
        paint.color = isActive
            ? color
            : color.withValues(alpha: 0.3);
        canvas.drawLine(
          Offset(node.x, node.y),
          Offset(node.left!.x, node.left!.y),
          paint,
        );
        drawEdges(node.left!);
      }

      if (node.right != null) {
        final isActive = pathNodes.contains(node.id) &&
            pathNodes.contains(node.right!.id);
        paint.color = isActive
            ? color
            : color.withValues(alpha: 0.3);
        canvas.drawLine(
          Offset(node.x, node.y),
          Offset(node.right!.x, node.right!.y),
          paint,
        );
        drawEdges(node.right!);
      }
    }

    drawEdges(root);
  }

  @override
  bool shouldRepaint(covariant _TreePainter oldDelegate) {
    return oldDelegate.root != root ||
        oldDelegate.visitedNodes != visitedNodes ||
        oldDelegate.pathNodes != pathNodes;
  }
}

/// Ghost button for tree visualizer controls
class _TreeGhostButton extends StatelessWidget {
  final IconData icon;
  final String? label;
  final VoidCallback onTap;

  const _TreeGhostButton({required this.icon, this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: AppColors.textSecondary, size: 24),
          if (label != null)
            Padding(
              padding: const EdgeInsets.only(top: 2),
              child: Text(
                label!,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textSecondary,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
