// Tree Data Structures and Algorithms

export interface TreeNode {
  id: string;
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x: number; // Position for visualization
  y: number;
  targetX: number;
  targetY: number;
  depth: number;
  parent: TreeNode | null;
  isHighlighted: boolean;
  highlightType: 'none' | 'current' | 'comparing' | 'path' | 'visited' | 'inserting' | 'rotating';
  balanceFactor?: number; // For AVL
}

export interface TreeStep {
  tree: TreeNode | null;
  array: number[]; // For heap/BST array representation
  highlightedIndices: number[]; // Highlighted array indices
  currentNode: TreeNode | null;
  visitedNodes: string[];
  pathNodes: string[]; // For traversal visualization
  operation: string;
  commentary: string; // Human-readable explanation
  line: number;
  isComplete: boolean;
}

export interface TreeAlgorithm {
  name: string;
  category: 'tree' | 'heap';
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  description: string;
  pseudocode: string[];
  pythonCode: string[];
}

// Utility to generate unique IDs
let nodeIdCounter = 0;
export const generateNodeId = (): string => `node_${++nodeIdCounter}`;
export const resetNodeIdCounter = () => { nodeIdCounter = 0; };

// Create a tree node
export const createTreeNode = (
  value: number,
  depth: number = 0,
  parent: TreeNode | null = null
): TreeNode => ({
  id: generateNodeId(),
  value,
  left: null,
  right: null,
  x: 0,
  y: depth * 80,
  targetX: 0,
  targetY: depth * 80,
  depth,
  parent,
  isHighlighted: false,
  highlightType: 'none',
});

// Deep clone a tree
export const cloneTree = (node: TreeNode | null): TreeNode | null => {
  if (!node) return null;
  const newNode: TreeNode = {
    ...node,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
    parent: null, // Will be set after
  };
  if (newNode.left) newNode.left.parent = newNode;
  if (newNode.right) newNode.right.parent = newNode;
  return newNode;
};

// Calculate tree depth
const getTreeDepth = (node: TreeNode | null): number => {
  if (!node) return 0;
  return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));
};

// Count nodes at each level for width calculation
const getNodesPerLevel = (root: TreeNode | null): number[] => {
  if (!root) return [];
  const levels: number[] = [];
  const queue: { node: TreeNode; level: number }[] = [{ node: root, level: 0 }];

  while (queue.length > 0) {
    const { node, level } = queue.shift()!;
    levels[level] = (levels[level] || 0) + 1;
    if (node.left) queue.push({ node: node.left, level: level + 1 });
    if (node.right) queue.push({ node: node.right, level: level + 1 });
  }
  return levels;
};

// Calculate tree positions for visualization with dynamic spacing
export const calculateTreePositions = (
  root: TreeNode | null,
  canvasWidth: number,
  startY: number = 40
): void => {
  if (!root) return;

  const treeDepth = getTreeDepth(root);
  const nodeSize = 44; // NODE_SIZE constant
  const minHorizontalGap = 16; // Minimum gap between nodes
  const verticalGap = 75; // Gap between levels

  // Calculate the minimum width needed for the deepest level
  // Each leaf node needs at least nodeSize + minHorizontalGap
  const maxNodesAtDeepest = Math.pow(2, treeDepth - 1);
  const minWidthNeeded = maxNodesAtDeepest * (nodeSize + minHorizontalGap);

  // Use the larger of canvas width or minimum needed
  const effectiveWidth = Math.max(canvasWidth, minWidthNeeded);

  // Base spread calculation - ensures nodes don't overlap at any depth
  // The spread at depth d should be: effectiveWidth / 2^(d+1)
  const baseSpread = effectiveWidth / 2;

  const positionNode = (
    node: TreeNode | null,
    x: number,
    y: number,
    spread: number,
    depth: number
  ): void => {
    if (!node) return;

    node.targetX = x;
    node.targetY = y;
    node.depth = depth;

    // Dynamic spread calculation based on subtree depth
    // Nodes with deeper subtrees need more horizontal space
    const leftDepth = getTreeDepth(node.left);
    const rightDepth = getTreeDepth(node.right);

    // Calculate child spread - ensure minimum spacing
    const minChildSpread = (nodeSize + minHorizontalGap) * Math.pow(2, Math.max(leftDepth, rightDepth) - 1);
    const childSpread = Math.max(spread / 2, minChildSpread);

    if (node.left) {
      positionNode(node.left, x - childSpread, y + verticalGap, childSpread, depth + 1);
    }
    if (node.right) {
      positionNode(node.right, x + childSpread, y + verticalGap, childSpread, depth + 1);
    }
  };

  positionNode(root, effectiveWidth / 2, startY, baseSpread / 2, 0);

  // If tree is wider than canvas, normalize positions to fit
  if (effectiveWidth > canvasWidth) {
    const scaleFactor = canvasWidth / effectiveWidth;
    const centerOffset = canvasWidth / 2;

    const normalizeNode = (node: TreeNode | null): void => {
      if (!node) return;
      // Scale from center
      const relativeX = node.targetX - effectiveWidth / 2;
      node.targetX = centerOffset + relativeX * scaleFactor;
      normalizeNode(node.left);
      normalizeNode(node.right);
    };

    normalizeNode(root);
  }
};

// Reset all highlights in a tree
export const resetHighlights = (node: TreeNode | null): void => {
  if (!node) return;
  node.isHighlighted = false;
  node.highlightType = 'none';
  resetHighlights(node.left);
  resetHighlights(node.right);
};

// BST Insert Generator
export function* bstInsertGenerator(
  values: number[]
): Generator<TreeStep> {
  resetNodeIdCounter();
  let root: TreeNode | null = null;
  const visitedNodes: string[] = [];

  for (let i = 0; i < values.length; i++) {
    const value = values[i];

    if (!root) {
      root = createTreeNode(value, 0);
      calculateTreePositions(root, 300);
      root.highlightType = 'inserting';

      yield {
        tree: cloneTree(root),
        array: values.slice(0, i + 1),
        highlightedIndices: [i],
        currentNode: root,
        visitedNodes: [...visitedNodes],
        pathNodes: [root.id],
        operation: 'insert',
        commentary: `Step ${i + 1}: Inserting ${value} as the root node since the tree is empty.`,
        line: 1,
        isComplete: false,
      };

      root.highlightType = 'none';
      continue;
    }

    let current = root;
    const pathNodes: string[] = [];

    while (true) {
      pathNodes.push(current.id);
      resetHighlights(root);
      current.highlightType = 'comparing';

      yield {
        tree: cloneTree(root),
        array: values.slice(0, i + 1),
        highlightedIndices: [i],
        currentNode: current,
        visitedNodes: [...visitedNodes],
        pathNodes: [...pathNodes],
        operation: 'compare',
        commentary: `Step ${i + 1}: Comparing ${value} with ${current.value}. ${value < current.value ? `${value} < ${current.value}, so we go LEFT.` : `${value} >= ${current.value}, so we go RIGHT.`}`,
        line: 3,
        isComplete: false,
      };

      if (value < current.value) {
        if (!current.left) {
          current.left = createTreeNode(value, current.depth + 1, current);
          calculateTreePositions(root, 300);
          resetHighlights(root);
          current.left.highlightType = 'inserting';

          yield {
            tree: cloneTree(root),
            array: values.slice(0, i + 1),
            highlightedIndices: [i],
            currentNode: current.left,
            visitedNodes: [...visitedNodes],
            pathNodes: [...pathNodes, current.left.id],
            operation: 'insert',
            commentary: `Step ${i + 1}: Found empty left spot! Inserting ${value} as left child of ${current.value}.`,
            line: 5,
            isComplete: false,
          };

          current.left.highlightType = 'none';
          break;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = createTreeNode(value, current.depth + 1, current);
          calculateTreePositions(root, 300);
          resetHighlights(root);
          current.right.highlightType = 'inserting';

          yield {
            tree: cloneTree(root),
            array: values.slice(0, i + 1),
            highlightedIndices: [i],
            currentNode: current.right,
            visitedNodes: [...visitedNodes],
            pathNodes: [...pathNodes, current.right.id],
            operation: 'insert',
            commentary: `Step ${i + 1}: Found empty right spot! Inserting ${value} as right child of ${current.value}.`,
            line: 7,
            isComplete: false,
          };

          current.right.highlightType = 'none';
          break;
        }
        current = current.right;
      }
    }
  }

  resetHighlights(root);
  yield {
    tree: cloneTree(root),
    array: values,
    highlightedIndices: [],
    currentNode: null,
    visitedNodes,
    pathNodes: [],
    operation: 'complete',
    commentary: `BST construction complete! All ${values.length} values have been inserted. The tree maintains the BST property: left children are smaller, right children are larger.`,
    line: 9,
    isComplete: true,
  };
}

// BST Search Generator
export function* bstSearchGenerator(
  root: TreeNode | null,
  target: number
): Generator<TreeStep> {
  const pathNodes: string[] = [];
  let current = root;
  let stepCount = 0;

  while (current) {
    stepCount++;
    pathNodes.push(current.id);

    const clonedTree = cloneTree(root);
    resetHighlights(clonedTree);

    // Find and highlight current node in cloned tree
    const findAndHighlight = (node: TreeNode | null, targetId: string): TreeNode | null => {
      if (!node) return null;
      if (node.id === targetId) {
        node.highlightType = 'current';
        return node;
      }
      return findAndHighlight(node.left, targetId) || findAndHighlight(node.right, targetId);
    };

    findAndHighlight(clonedTree, current.id);

    if (current.value === target) {
      yield {
        tree: clonedTree,
        array: [],
        highlightedIndices: [],
        currentNode: current,
        visitedNodes: pathNodes,
        pathNodes,
        operation: 'found',
        commentary: `Step ${stepCount}: Found ${target}! The search took ${stepCount} comparison(s).`,
        line: 2,
        isComplete: true,
      };
      return;
    }

    yield {
      tree: clonedTree,
      array: [],
      highlightedIndices: [],
      currentNode: current,
      visitedNodes: pathNodes.slice(0, -1),
      pathNodes,
      operation: 'compare',
      commentary: `Step ${stepCount}: Comparing ${target} with ${current.value}. ${target < current.value ? `${target} < ${current.value}, so we search LEFT subtree.` : `${target} > ${current.value}, so we search RIGHT subtree.`}`,
      line: 3,
      isComplete: false,
    };

    if (target < current.value) {
      current = current.left;
    } else {
      current = current.right;
    }
  }

  yield {
    tree: cloneTree(root),
    array: [],
    highlightedIndices: [],
    currentNode: null,
    visitedNodes: pathNodes,
    pathNodes,
    operation: 'not_found',
    commentary: `Step ${stepCount + 1}: Reached null node. ${target} is NOT in the tree. Search complete.`,
    line: 5,
    isComplete: true,
  };
}

// DFS Traversal Generators
export function* inorderTraversalGenerator(
  root: TreeNode | null,
  originalRoot?: TreeNode | null
): Generator<TreeStep> {
  const allNodes: number[] = [];
  const visitedNodes: string[] = [];
  const pathNodes: string[] = [];
  let stepCount = 0;
  const treeRoot = originalRoot || root;

  function* traverse(node: TreeNode | null): Generator<TreeStep> {
    if (!node) return;

    // Visit left
    stepCount++;
    pathNodes.push(node.id);

    const clonedTree1 = cloneTree(treeRoot);
    const findAndHighlight1 = (n: TreeNode | null, targetId: string): void => {
      if (!n) return;
      if (n.id === targetId) n.highlightType = 'current';
      if (visitedNodes.includes(n.id)) n.highlightType = 'visited';
      findAndHighlight1(n.left, targetId);
      findAndHighlight1(n.right, targetId);
    };
    findAndHighlight1(clonedTree1, node.id);

    yield {
      tree: clonedTree1,
      array: [...allNodes],
      highlightedIndices: [],
      currentNode: node,
      visitedNodes: [...visitedNodes],
      pathNodes: [...pathNodes],
      operation: 'visit_left',
      commentary: `Step ${stepCount}: At node ${node.value}, going to LEFT subtree first (In-order: Left, Root, Right).`,
      line: 2,
      isComplete: false,
    };

    yield* traverse(node.left);

    // Process current node
    stepCount++;
    allNodes.push(node.value);
    visitedNodes.push(node.id);

    const clonedTree2 = cloneTree(treeRoot);
    const findAndHighlight2 = (n: TreeNode | null, targetId: string): void => {
      if (!n) return;
      if (n.id === targetId) n.highlightType = 'path';
      else if (visitedNodes.includes(n.id)) n.highlightType = 'visited';
      findAndHighlight2(n.left, targetId);
      findAndHighlight2(n.right, targetId);
    };
    findAndHighlight2(clonedTree2, node.id);

    yield {
      tree: clonedTree2,
      array: [...allNodes],
      highlightedIndices: [allNodes.length - 1],
      currentNode: node,
      visitedNodes: [...visitedNodes],
      pathNodes: [...pathNodes],
      operation: 'process',
      commentary: `Step ${stepCount}: Processing node ${node.value}. In-order sequence so far: [${allNodes.join(', ')}]`,
      line: 3,
      isComplete: false,
    };

    // Visit right
    yield* traverse(node.right);

    pathNodes.pop();
  }

  yield* traverse(root);

  const finalTree = cloneTree(treeRoot);
  resetHighlights(finalTree);

  yield {
    tree: finalTree,
    array: allNodes,
    highlightedIndices: [],
    currentNode: null,
    visitedNodes,
    pathNodes: [],
    operation: 'complete',
    commentary: `In-order traversal complete! Final sequence: [${allNodes.join(', ')}]. For a BST, this produces a sorted order.`,
    line: 5,
    isComplete: true,
  };
}

export function* preorderTraversalGenerator(
  root: TreeNode | null,
  originalRoot?: TreeNode | null
): Generator<TreeStep> {
  const allNodes: number[] = [];
  const visitedNodes: string[] = [];
  const pathNodes: string[] = [];
  let stepCount = 0;
  const treeRoot = originalRoot || root;

  function* traverse(node: TreeNode | null): Generator<TreeStep> {
    if (!node) return;

    stepCount++;
    pathNodes.push(node.id);
    allNodes.push(node.value);
    visitedNodes.push(node.id);

    const clonedTree = cloneTree(treeRoot);
    const highlight = (n: TreeNode | null, targetId: string): void => {
      if (!n) return;
      if (n.id === targetId) n.highlightType = 'path';
      else if (visitedNodes.includes(n.id)) n.highlightType = 'visited';
      highlight(n.left, targetId);
      highlight(n.right, targetId);
    };
    highlight(clonedTree, node.id);

    yield {
      tree: clonedTree,
      array: [...allNodes],
      highlightedIndices: [allNodes.length - 1],
      currentNode: node,
      visitedNodes: [...visitedNodes],
      pathNodes: [...pathNodes],
      operation: 'process',
      commentary: `Step ${stepCount}: Processing node ${node.value} FIRST (Pre-order: Root, Left, Right). Sequence: [${allNodes.join(', ')}]`,
      line: 2,
      isComplete: false,
    };

    yield* traverse(node.left);
    yield* traverse(node.right);

    pathNodes.pop();
  }

  yield* traverse(root);

  const finalTree = cloneTree(treeRoot);
  resetHighlights(finalTree);

  yield {
    tree: finalTree,
    array: allNodes,
    highlightedIndices: [],
    currentNode: null,
    visitedNodes,
    pathNodes: [],
    operation: 'complete',
    commentary: `Pre-order traversal complete! Final sequence: [${allNodes.join(', ')}]. This order is useful for copying/serializing trees.`,
    line: 4,
    isComplete: true,
  };
}

export function* postorderTraversalGenerator(
  root: TreeNode | null,
  originalRoot?: TreeNode | null
): Generator<TreeStep> {
  const allNodes: number[] = [];
  const visitedNodes: string[] = [];
  const pathNodes: string[] = [];
  let stepCount = 0;
  const treeRoot = originalRoot || root;

  function* traverse(node: TreeNode | null): Generator<TreeStep> {
    if (!node) return;

    stepCount++;
    pathNodes.push(node.id);

    const clonedTree1 = cloneTree(treeRoot);
    const highlight1 = (n: TreeNode | null, targetId: string): void => {
      if (!n) return;
      if (n.id === targetId) n.highlightType = 'current';
      if (visitedNodes.includes(n.id)) n.highlightType = 'visited';
      highlight1(n.left, targetId);
      highlight1(n.right, targetId);
    };
    highlight1(clonedTree1, node.id);

    yield {
      tree: clonedTree1,
      array: [...allNodes],
      highlightedIndices: [],
      currentNode: node,
      visitedNodes: [...visitedNodes],
      pathNodes: [...pathNodes],
      operation: 'visit',
      commentary: `Step ${stepCount}: At node ${node.value}, visiting children FIRST (Post-order: Left, Right, Root).`,
      line: 2,
      isComplete: false,
    };

    yield* traverse(node.left);
    yield* traverse(node.right);

    stepCount++;
    allNodes.push(node.value);
    visitedNodes.push(node.id);

    const clonedTree2 = cloneTree(treeRoot);
    const highlight2 = (n: TreeNode | null, targetId: string): void => {
      if (!n) return;
      if (n.id === targetId) n.highlightType = 'path';
      else if (visitedNodes.includes(n.id)) n.highlightType = 'visited';
      highlight2(n.left, targetId);
      highlight2(n.right, targetId);
    };
    highlight2(clonedTree2, node.id);

    yield {
      tree: clonedTree2,
      array: [...allNodes],
      highlightedIndices: [allNodes.length - 1],
      currentNode: node,
      visitedNodes: [...visitedNodes],
      pathNodes: [...pathNodes],
      operation: 'process',
      commentary: `Step ${stepCount}: Children processed, now processing ${node.value}. Sequence: [${allNodes.join(', ')}]`,
      line: 4,
      isComplete: false,
    };

    pathNodes.pop();
  }

  yield* traverse(root);

  const finalTree = cloneTree(treeRoot);
  resetHighlights(finalTree);

  yield {
    tree: finalTree,
    array: allNodes,
    highlightedIndices: [],
    currentNode: null,
    visitedNodes,
    pathNodes: [],
    operation: 'complete',
    commentary: `Post-order traversal complete! Final sequence: [${allNodes.join(', ')}]. This order is useful for deleting trees.`,
    line: 5,
    isComplete: true,
  };
}

// BFS Level-Order Traversal
export function* bfsTraversalGenerator(
  root: TreeNode | null
): Generator<TreeStep> {
  if (!root) {
    yield {
      tree: null,
      array: [],
      highlightedIndices: [],
      currentNode: null,
      visitedNodes: [],
      pathNodes: [],
      operation: 'complete',
      commentary: 'Empty tree - nothing to traverse.',
      line: 0,
      isComplete: true,
    };
    return;
  }

  const allNodes: number[] = [];
  const visitedNodes: string[] = [];
  const queue: TreeNode[] = [root];
  let stepCount = 0;

  while (queue.length > 0) {
    const node = queue.shift()!;
    stepCount++;

    allNodes.push(node.value);
    visitedNodes.push(node.id);

    const clonedTree = cloneTree(root);
    const highlight = (n: TreeNode | null, currentId: string, queueIds: string[]): void => {
      if (!n) return;
      if (n.id === currentId) n.highlightType = 'path';
      else if (visitedNodes.includes(n.id)) n.highlightType = 'visited';
      else if (queueIds.includes(n.id)) n.highlightType = 'comparing';
      highlight(n.left, currentId, queueIds);
      highlight(n.right, currentId, queueIds);
    };
    highlight(clonedTree, node.id, queue.map(n => n.id));

    yield {
      tree: clonedTree,
      array: [...allNodes],
      highlightedIndices: [allNodes.length - 1],
      currentNode: node,
      visitedNodes: [...visitedNodes],
      pathNodes: queue.map(n => n.id),
      operation: 'process',
      commentary: `Step ${stepCount}: Dequeue and process ${node.value}. Level-order visits all nodes at depth ${node.depth} before going deeper. Queue: [${queue.map(n => n.value).join(', ')}]`,
      line: 3,
      isComplete: false,
    };

    if (node.left) {
      queue.push(node.left);
    }
    if (node.right) {
      queue.push(node.right);
    }
  }

  const finalTree = cloneTree(root);
  resetHighlights(finalTree);

  yield {
    tree: finalTree,
    array: allNodes,
    highlightedIndices: [],
    currentNode: null,
    visitedNodes,
    pathNodes: [],
    operation: 'complete',
    commentary: `BFS traversal complete! Level-order sequence: [${allNodes.join(', ')}]. Nodes are visited level by level from top to bottom.`,
    line: 5,
    isComplete: true,
  };
}

// Heap Operations
export interface HeapStep extends TreeStep {
  heapArray: number[];
  swappingIndices: number[];
}

// Convert array index to tree position
export const arrayIndexToTreePosition = (index: number, depth: number): { level: number; position: number } => {
  const level = Math.floor(Math.log2(index + 1));
  const levelStart = Math.pow(2, level) - 1;
  const position = index - levelStart;
  return { level, position };
};

// Build tree from array (for heap visualization)
export const buildTreeFromArray = (arr: number[]): TreeNode | null => {
  if (arr.length === 0) return null;

  resetNodeIdCounter();
  const nodes: (TreeNode | null)[] = arr.map((val, i) => {
    const { level } = arrayIndexToTreePosition(i, 0);
    return createTreeNode(val, level);
  });

  // Connect parent-child relationships
  for (let i = 0; i < nodes.length; i++) {
    const leftIndex = 2 * i + 1;
    const rightIndex = 2 * i + 2;

    if (leftIndex < nodes.length && nodes[i] && nodes[leftIndex]) {
      nodes[i]!.left = nodes[leftIndex];
      nodes[leftIndex]!.parent = nodes[i];
    }
    if (rightIndex < nodes.length && nodes[i] && nodes[rightIndex]) {
      nodes[i]!.right = nodes[rightIndex];
      nodes[rightIndex]!.parent = nodes[i];
    }
  }

  return nodes[0];
};

// Max-Heapify Generator
export function* maxHeapifyGenerator(
  arr: number[],
  n: number,
  i: number,
  root: TreeNode | null
): Generator<HeapStep> {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  const clonedTree1 = cloneTree(root);

  yield {
    tree: clonedTree1,
    array: [...arr],
    highlightedIndices: [i],
    currentNode: null,
    visitedNodes: [],
    pathNodes: [],
    operation: 'heapify_start',
    commentary: `Heapifying at index ${i} (value ${arr[i]}). Checking if it's larger than its children.`,
    line: 1,
    isComplete: false,
    heapArray: [...arr],
    swappingIndices: [],
  };

  if (left < n && arr[left] > arr[largest]) {
    largest = left;
  }

  if (right < n && arr[right] > arr[largest]) {
    largest = right;
  }

  if (largest !== i) {
    yield {
      tree: cloneTree(root),
      array: [...arr],
      highlightedIndices: [i, largest],
      currentNode: null,
      visitedNodes: [],
      pathNodes: [],
      operation: 'swap',
      commentary: `${arr[largest]} > ${arr[i]}, so we swap them to maintain max-heap property.`,
      line: 4,
      isComplete: false,
      heapArray: [...arr],
      swappingIndices: [i, largest],
    };

    [arr[i], arr[largest]] = [arr[largest], arr[i]];

    // Rebuild tree with new values
    const newTree = buildTreeFromArray(arr);
    calculateTreePositions(newTree, 300);

    yield {
      tree: newTree,
      array: [...arr],
      highlightedIndices: [i, largest],
      currentNode: null,
      visitedNodes: [],
      pathNodes: [],
      operation: 'swapped',
      commentary: `Swapped! Array is now [${arr.join(', ')}]. Recursively heapifying at index ${largest}.`,
      line: 5,
      isComplete: false,
      heapArray: [...arr],
      swappingIndices: [],
    };

    yield* maxHeapifyGenerator(arr, n, largest, newTree);
  }
}

// Build Max Heap Generator
export function* buildMaxHeapGenerator(
  initialArray: number[]
): Generator<HeapStep> {
  const arr = [...initialArray];
  const n = arr.length;

  let root = buildTreeFromArray(arr);
  calculateTreePositions(root, 300);

  yield {
    tree: cloneTree(root),
    array: [...arr],
    highlightedIndices: [],
    currentNode: null,
    visitedNodes: [],
    pathNodes: [],
    operation: 'start',
    commentary: `Building Max Heap from array [${arr.join(', ')}]. Starting heapify from the last non-leaf node.`,
    line: 0,
    isComplete: false,
    heapArray: [...arr],
    swappingIndices: [],
  };

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* maxHeapifyGenerator(arr, n, i, root);
    root = buildTreeFromArray(arr);
    calculateTreePositions(root, 300);
  }

  yield {
    tree: cloneTree(root),
    array: [...arr],
    highlightedIndices: [],
    currentNode: null,
    visitedNodes: [],
    pathNodes: [],
    operation: 'complete',
    commentary: `Max Heap built successfully! Array: [${arr.join(', ')}]. The root (${arr[0]}) is the maximum element.`,
    line: 6,
    isComplete: true,
    heapArray: [...arr],
    swappingIndices: [],
  };
}

// Heap Sort Generator
export function* heapSortGenerator(
  initialArray: number[]
): Generator<HeapStep> {
  const arr = [...initialArray];
  const n = arr.length;

  // Build max heap
  yield* buildMaxHeapGenerator(arr);

  // Extract elements one by one
  for (let i = n - 1; i > 0; i--) {
    let root = buildTreeFromArray(arr);
    calculateTreePositions(root, 300);

    yield {
      tree: cloneTree(root),
      array: [...arr],
      highlightedIndices: [0, i],
      currentNode: null,
      visitedNodes: [],
      pathNodes: [],
      operation: 'extract_max',
      commentary: `Extracting max (${arr[0]}) and moving to position ${i}. Swapping with ${arr[i]}.`,
      line: 8,
      isComplete: false,
      heapArray: [...arr],
      swappingIndices: [0, i],
    };

    [arr[0], arr[i]] = [arr[i], arr[0]];

    root = buildTreeFromArray(arr);
    calculateTreePositions(root, 300);

    yield {
      tree: cloneTree(root),
      array: [...arr],
      highlightedIndices: Array.from({ length: n - i }, (_, idx) => n - 1 - idx),
      currentNode: null,
      visitedNodes: [],
      pathNodes: [],
      operation: 'heapify_root',
      commentary: `Array after swap: [${arr.join(', ')}]. Last ${n - i} element(s) are sorted. Heapifying root.`,
      line: 9,
      isComplete: false,
      heapArray: [...arr],
      swappingIndices: [],
    };

    yield* maxHeapifyGenerator(arr, i, 0, root);
  }

  const finalRoot = buildTreeFromArray(arr);
  calculateTreePositions(finalRoot, 300);

  yield {
    tree: cloneTree(finalRoot),
    array: [...arr],
    highlightedIndices: Array.from({ length: n }, (_, i) => i),
    currentNode: null,
    visitedNodes: [],
    pathNodes: [],
    operation: 'complete',
    commentary: `Heap Sort complete! Sorted array: [${arr.join(', ')}]`,
    line: 11,
    isComplete: true,
    heapArray: [...arr],
    swappingIndices: [],
  };
}

// Algorithm Info
export const treeAlgorithms: Record<string, TreeAlgorithm> = {
  'bst-insert': {
    name: 'BST Insert',
    category: 'tree',
    timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    description: 'Insert values into a Binary Search Tree maintaining the BST property',
    pseudocode: [
      'function insert(root, value):',
      '  if root is null:',
      '    return new Node(value)',
      '  if value < root.value:',
      '    root.left = insert(root.left, value)',
      '  else:',
      '    root.right = insert(root.right, value)',
      '  return root',
    ],
    pythonCode: [
      'def insert(root, value):',
      '    if root is None:',
      '        return TreeNode(value)',
      '    if value < root.value:',
      '        root.left = insert(root.left, value)',
      '    else:',
      '        root.right = insert(root.right, value)',
      '    return root',
    ],
  },
  'bst-search': {
    name: 'BST Search',
    category: 'tree',
    timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(n)' },
    spaceComplexity: 'O(1)',
    description: 'Search for a value in a Binary Search Tree',
    pseudocode: [
      'function search(root, target):',
      '  if root is null or root.value == target:',
      '    return root',
      '  if target < root.value:',
      '    return search(root.left, target)',
      '  return search(root.right, target)',
    ],
    pythonCode: [
      'def search(root, target):',
      '    if root is None or root.value == target:',
      '        return root',
      '    if target < root.value:',
      '        return search(root.left, target)',
      '    return search(root.right, target)',
    ],
  },
  'inorder': {
    name: 'In-order Traversal',
    category: 'tree',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(h)',
    description: 'Visit left subtree, then root, then right subtree. Produces sorted order for BST.',
    pseudocode: [
      'function inorder(node):',
      '  if node is null: return',
      '  inorder(node.left)',
      '  visit(node)',
      '  inorder(node.right)',
    ],
    pythonCode: [
      'def inorder(node):',
      '    if node is None:',
      '        return',
      '    inorder(node.left)',
      '    print(node.value)',
      '    inorder(node.right)',
    ],
  },
  'preorder': {
    name: 'Pre-order Traversal',
    category: 'tree',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(h)',
    description: 'Visit root first, then left subtree, then right subtree. Useful for copying trees.',
    pseudocode: [
      'function preorder(node):',
      '  if node is null: return',
      '  visit(node)',
      '  preorder(node.left)',
      '  preorder(node.right)',
    ],
    pythonCode: [
      'def preorder(node):',
      '    if node is None:',
      '        return',
      '    print(node.value)',
      '    preorder(node.left)',
      '    preorder(node.right)',
    ],
  },
  'postorder': {
    name: 'Post-order Traversal',
    category: 'tree',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(h)',
    description: 'Visit left subtree, right subtree, then root. Useful for deleting trees.',
    pseudocode: [
      'function postorder(node):',
      '  if node is null: return',
      '  postorder(node.left)',
      '  postorder(node.right)',
      '  visit(node)',
    ],
    pythonCode: [
      'def postorder(node):',
      '    if node is None:',
      '        return',
      '    postorder(node.left)',
      '    postorder(node.right)',
      '    print(node.value)',
    ],
  },
  'bfs': {
    name: 'Level-order (BFS)',
    category: 'tree',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(w)',
    description: 'Visit nodes level by level using a queue. w = maximum width of tree.',
    pseudocode: [
      'function levelOrder(root):',
      '  queue = [root]',
      '  while queue is not empty:',
      '    node = queue.dequeue()',
      '    visit(node)',
      '    if node.left: queue.enqueue(node.left)',
      '    if node.right: queue.enqueue(node.right)',
    ],
    pythonCode: [
      'from collections import deque',
      'def level_order(root):',
      '    queue = deque([root])',
      '    while queue:',
      '        node = queue.popleft()',
      '        print(node.value)',
      '        if node.left: queue.append(node.left)',
      '        if node.right: queue.append(node.right)',
    ],
  },
  'heap-sort': {
    name: 'Heap Sort',
    category: 'heap',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(1)',
    description: 'Build a max heap, then repeatedly extract the maximum to sort.',
    pseudocode: [
      'function heapSort(arr):',
      '  buildMaxHeap(arr)',
      '  for i = n-1 down to 1:',
      '    swap(arr[0], arr[i])',
      '    heapify(arr, i, 0)',
      '',
      'function heapify(arr, n, i):',
      '  largest = i',
      '  if left < n and arr[left] > arr[largest]:',
      '    largest = left',
      '  if right < n and arr[right] > arr[largest]:',
      '    largest = right',
      '  if largest != i:',
      '    swap and heapify(arr, n, largest)',
    ],
    pythonCode: [
      'def heap_sort(arr):',
      '    n = len(arr)',
      '    for i in range(n//2-1, -1, -1):',
      '        heapify(arr, n, i)',
      '    for i in range(n-1, 0, -1):',
      '        arr[0], arr[i] = arr[i], arr[0]',
      '        heapify(arr, i, 0)',
      '',
      'def heapify(arr, n, i):',
      '    largest = i',
      '    l, r = 2*i+1, 2*i+2',
      '    if l < n and arr[l] > arr[largest]:',
      '        largest = l',
      '    if r < n and arr[r] > arr[largest]:',
      '        largest = r',
      '    if largest != i:',
      '        arr[i], arr[largest] = arr[largest], arr[i]',
      '        heapify(arr, n, largest)',
    ],
  },
  'build-heap': {
    name: 'Build Max Heap',
    category: 'heap',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(1)',
    description: 'Build a max heap from an unsorted array in linear time.',
    pseudocode: [
      'function buildMaxHeap(arr):',
      '  n = length(arr)',
      '  for i = n/2 - 1 down to 0:',
      '    heapify(arr, n, i)',
    ],
    pythonCode: [
      'def build_max_heap(arr):',
      '    n = len(arr)',
      '    for i in range(n//2-1, -1, -1):',
      '        heapify(arr, n, i)',
    ],
  },
};

// Tree algorithm generators
export const treeAlgorithmGenerators = {
  'bst-insert': bstInsertGenerator,
  'inorder': inorderTraversalGenerator,
  'preorder': preorderTraversalGenerator,
  'postorder': postorderTraversalGenerator,
  'bfs': bfsTraversalGenerator,
  'heap-sort': heapSortGenerator,
  'build-heap': buildMaxHeapGenerator,
};

export type TreeAlgorithmKey = keyof typeof treeAlgorithmGenerators;

// Helper to generate sample tree data
export const generateSampleTreeData = (size: number): number[] => {
  const arr: number[] = [];
  const used = new Set<number>();

  while (arr.length < size) {
    const num = Math.floor(Math.random() * 99) + 1;
    if (!used.has(num)) {
      used.add(num);
      arr.push(num);
    }
  }

  return arr;
};
