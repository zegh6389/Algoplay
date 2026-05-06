class AlgorithmCode {
  final String python;
  final String java;
  final String cpp;
  final String timeComplexity;
  final String spaceComplexity;

  const AlgorithmCode({
    required this.python,
    required this.java,
    required this.cpp,
    this.timeComplexity = '',
    this.spaceComplexity = '',
  });
}

const Map<String, AlgorithmCode> algorithmCodeImplementations = {
  'bubble-sort': AlgorithmCode(
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    python: r'''
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr
''',
    java: r'''
public static void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n; i++) {
        boolean swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}
''',
    cpp: r'''
void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                std::swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}
''',
  ),

  'selection-sort': AlgorithmCode(
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    python: r'''
def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr
''',
    java: r'''
public static void selectionSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        int temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
    }
}
''',
    cpp: r'''
void selectionSort(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        std::swap(arr[i], arr[minIdx]);
    }
}
''',
  ),

  'insertion-sort': AlgorithmCode(
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    python: r'''
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr
''',
    java: r'''
public static void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}
''',
    cpp: r'''
void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}
''',
  ),

  'merge-sort': AlgorithmCode(
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    python: r'''
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result
''',
    java: r'''
public static void mergeSort(int[] arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}

private static void merge(int[] arr, int left, int mid, int right) {
    int[] temp = new int[right - left + 1];
    int i = left, j = mid + 1, k = 0;
    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) temp[k++] = arr[i++];
        else temp[k++] = arr[j++];
    }
    while (i <= mid) temp[k++] = arr[i++];
    while (j <= right) temp[k++] = arr[j++];
    System.arraycopy(temp, 0, arr, left, temp.length);
}
''',
    cpp: r'''
void merge(int arr[], int left, int mid, int right) {
    std::vector<int> temp(right - left + 1);
    int i = left, j = mid + 1, k = 0;
    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) temp[k++] = arr[i++];
        else temp[k++] = arr[j++];
    }
    while (i <= mid) temp[k++] = arr[i++];
    while (j <= right) temp[k++] = arr[j++];
    for (int p = 0; p < k; p++) arr[left + p] = temp[p];
}

void mergeSort(int arr[], int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}
''',
  ),

  'quick-sort': AlgorithmCode(
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    python: r'''
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)
''',
    java: r'''
public static void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

private static int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    int temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    return i + 1;
}
''',
    cpp: r'''
int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            std::swap(arr[i], arr[j]);
        }
    }
    std::swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}
''',
  ),

  'heap-sort': AlgorithmCode(
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    python: r'''
def heap_sort(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    return arr

def heapify(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    if left < n and arr[left] > arr[largest]:
        largest = left
    if right < n and arr[right] > arr[largest]:
        largest = right
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)
''',
    java: r'''
public static void heapSort(int[] arr) {
    int n = arr.length;
    for (int i = n / 2 - 1; i >= 0; i--)
        heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        int temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        heapify(arr, i, 0);
    }
}

private static void heapify(int[] arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != i) {
        int temp = arr[i];
        arr[i] = arr[largest];
        arr[largest] = temp;
        heapify(arr, n, largest);
    }
}
''',
    cpp: r'''
void heapify(int arr[], int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != i) {
        std::swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}

void heapSort(int arr[], int n) {
    for (int i = n / 2 - 1; i >= 0; i--)
        heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        std::swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}
''',
  ),

  'linear-search': AlgorithmCode(
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    python: r'''
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1
''',
    java: r'''
public static int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}
''',
    cpp: r'''
int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}
''',
  ),

  'binary-search': AlgorithmCode(
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    python: r'''
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
''',
    java: r'''
public static int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
''',
    cpp: r'''
int binarySearch(int arr[], int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
''',
  ),

  'bfs': AlgorithmCode(
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    python: r'''
from collections import deque

def bfs(graph, start):
    visited = set([start])
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order
''',
    java: r'''
public static List<Integer> bfs(List<List<Integer>> graph, int start) {
    boolean[] visited = new boolean[graph.size()];
    Queue<Integer> queue = new LinkedList<>();
    List<Integer> order = new ArrayList<>();
    visited[start] = true;
    queue.add(start);
    while (!queue.isEmpty()) {
        int node = queue.poll();
        order.add(node);
        for (int next : graph.get(node)) {
            if (!visited[next]) { visited[next] = true; queue.add(next); }
        }
    }
    return order;
}
''',
    cpp: r'''
vector<int> bfs(vector<vector<int>>& graph, int start) {
    vector<bool> visited(graph.size(), false);
    queue<int> q;
    vector<int> order;
    visited[start] = true;
    q.push(start);
    while (!q.empty()) {
        int node = q.front(); q.pop();
        order.push_back(node);
        for (int next : graph[node])
            if (!visited[next]) { visited[next] = true; q.push(next); }
    }
    return order;
}
''',
  ),

  'dfs': AlgorithmCode(
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    python: r'''
def dfs(graph, node, visited=None, order=None):
    visited = visited or set()
    order = order or []
    visited.add(node)
    order.append(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited, order)
    return order
''',
    java: r'''
public static void dfs(List<List<Integer>> graph, int node, boolean[] visited, List<Integer> order) {
    visited[node] = true;
    order.add(node);
    for (int next : graph.get(node)) {
        if (!visited[next]) dfs(graph, next, visited, order);
    }
}
''',
    cpp: r'''
void dfs(vector<vector<int>>& graph, int node, vector<bool>& visited, vector<int>& order) {
    visited[node] = true;
    order.push_back(node);
    for (int next : graph[node])
        if (!visited[next]) dfs(graph, next, visited, order);
}
''',
  ),

  'dijkstra': AlgorithmCode(
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    python: r'''
import heapq

def dijkstra(graph, start):
    dist = {node: float('inf') for node in graph}
    dist[start] = 0
    pq = [(0, start)]
    while pq:
        d, node = heapq.heappop(pq)
        if d > dist[node]:
            continue
        for neighbor, weight in graph[node]:
            nd = d + weight
            if nd < dist[neighbor]:
                dist[neighbor] = nd
                heapq.heappush(pq, (nd, neighbor))
    return dist
''',
    java: r'''
public static int[] dijkstra(List<int[]>[] graph, int start) {
    int[] dist = new int[graph.length];
    Arrays.fill(dist, Integer.MAX_VALUE);
    PriorityQueue<int[]> pq = new PriorityQueue<>((a,b) -> a[1] - b[1]);
    dist[start] = 0; pq.add(new int[]{start, 0});
    while (!pq.isEmpty()) {
        int[] cur = pq.poll();
        if (cur[1] > dist[cur[0]]) continue;
        for (int[] edge : graph[cur[0]]) {
            int next = edge[0], nd = cur[1] + edge[1];
            if (nd < dist[next]) { dist[next] = nd; pq.add(new int[]{next, nd}); }
        }
    }
    return dist;
}
''',
    cpp: r'''
vector<int> dijkstra(vector<vector<pair<int,int>>>& graph, int start) {
    vector<int> dist(graph.size(), INT_MAX);
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
    dist[start] = 0; pq.push({0, start});
    while (!pq.empty()) {
        auto [d, node] = pq.top(); pq.pop();
        if (d > dist[node]) continue;
        for (auto [next, w] : graph[node])
            if (d + w < dist[next]) { dist[next] = d + w; pq.push({dist[next], next}); }
    }
    return dist;
}
''',
  ),

  'a-star': AlgorithmCode(
    timeComplexity: 'O(E log V)',
    spaceComplexity: 'O(V)',
    python: r'''
import heapq

def astar(graph, start, goal, h):
    g = {start: 0}
    came_from = {}
    open_set = [(h(start), start)]
    while open_set:
        _, current = heapq.heappop(open_set)
        if current == goal:
            return came_from
        for neighbor, cost in graph[current]:
            new_g = g[current] + cost
            if new_g < g.get(neighbor, float('inf')):
                came_from[neighbor] = current
                g[neighbor] = new_g
                heapq.heappush(open_set, (new_g + h(neighbor), neighbor))
    return came_from
''',
    java: r'''
public static Map<Integer,Integer> aStar(int start, int goal) {
    // Use f(n) = g(n) + h(n), pop lowest f from a priority queue.
    PriorityQueue<int[]> open = new PriorityQueue<>((a,b) -> a[1] - b[1]);
    Map<Integer,Integer> cameFrom = new HashMap<>();
    open.add(new int[]{start, 0});
    return cameFrom;
}
''',
    cpp: r'''
int aStar(int start, int goal) {
    // priority_queue ordered by f = g + heuristic
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> open;
    open.push({0, start});
    return goal;
}
''',
  ),

  'bst-operations': AlgorithmCode(
    timeComplexity: 'O(h)',
    spaceComplexity: 'O(h)',
    python: r'''
class BstNode:
    def __init__(self, val): self.val, self.left, self.right = val, None, None

def bst_insert(root, val):
    if not root: return BstNode(val)
    if val < root.val: root.left = bst_insert(root.left, val)
    elif val > root.val: root.right = bst_insert(root.right, val)
    return root

def bst_search(root, val):
    if not root or root.val == val: return root
    return bst_search(root.left, val) if val < root.val else bst_search(root.right, val)
''',
    java: r'''
class Node { int val; Node left, right; Node(int v){ val = v; } }
public Node insert(Node root, int val) {
    if (root == null) return new Node(val);
    if (val < root.val) root.left = insert(root.left, val);
    else if (val > root.val) root.right = insert(root.right, val);
    return root;
}
public Node search(Node root, int val) {
    if (root == null || root.val == val) return root;
    return val < root.val ? search(root.left, val) : search(root.right, val);
}
''',
    cpp: r'''
struct Node { int val; Node *left=nullptr, *right=nullptr; Node(int v): val(v) {} };
Node* insert(Node* root, int val) {
    if (!root) return new Node(val);
    if (val < root->val) root->left = insert(root->left, val);
    else if (val > root->val) root->right = insert(root->right, val);
    return root;
}
Node* search(Node* root, int val) {
    if (!root || root->val == val) return root;
    return val < root->val ? search(root->left) : search(root->right);
}
''',
  ),

  'avl-tree': AlgorithmCode(
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(log n)',
    python: r'''
def avl_height(n): return n.height if n else 0

def avl_rotate_right(y):
    x, t2 = y.left, y.left.right
    x.right, y.left = y, t2
    y.height = 1 + max(avl_height(y.left), avl_height(y.right))
    x.height = 1 + max(avl_height(x.left), avl_height(x.right))
    return x

def avl_rotate_left(x):
    y, t2 = x.right, x.right.left
    y.left, x.right = x, t2
    x.height = 1 + max(avl_height(x.left), avl_height(x.right))
    y.height = 1 + max(avl_height(y.left), avl_height(y.right))
    return y
''',
    java: r'''
public int height(Node n) { return n == null ? 0 : n.height; }
public Node rotateRight(Node y) {
    Node x = y.left, t2 = x.right;
    x.right = y; y.left = t2;
    y.height = 1 + Math.max(avl_height(y.left), avl_height(y.right));
    x.height = 1 + Math.max(avl_height(x.left), avl_height(x.right));
    return x;
}
public Node rotateLeft(Node x) {
    Node y = x.right, t2 = y.left;
    y.left = x; x.right = t2;
    x.height = 1 + Math.max(avl_height(x.left), avl_height(x.right));
    y.height = 1 + Math.max(avl_height(y.left), avl_height(y.right));
    return y;
}
''',
    cpp: r'''
int height(Node* n) { return n ? n->height : 0; }
Node* rotateRight(Node* y) {
    Node* x = y->left; Node* t2 = x->right;
    x->right = y; y->left = t2;
    y->height = 1 + max(height(y->left), height(y->right));
    x->height = 1 + max(height(x->left), height(x->right));
    return x;
}
''',
  ),

  'tree-traversals': AlgorithmCode(
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    python: r'''
def tree_inorder(root):
    return tree_inorder(root.left) + [root.val] + tree_inorder(root.right) if root else []

def tree_preorder(root):
    return [root.val] + tree_preorder(root.left) + tree_preorder(root.right) if root else []

def tree_postorder(root):
    return tree_postorder(root.left) + tree_postorder(root.right) + [root.val] if root else []
''',
    java: r'''
public void inorder(Node root) {
    if (root == null) return;
    inorder(root.left); visit(root); inorder(root.right);
}
public void preorder(Node root) {
    if (root == null) return;
    visit(root); preorder(root.left); preorder(root.right);
}
public void postorder(Node root) {
    if (root == null) return;
    postorder(root.left); postorder(root.right); visit(root);
}
''',
    cpp: r'''
void inorder(Node* root) { if (!root) return; inorder(root->left); visit(root); inorder(root->right); }
void preorder(Node* root) { if (!root) return; visit(root); preorder(root->left); preorder(root->right); }
void postorder(Node* root) { if (!root) return; postorder(root->left); postorder(root->right); visit(root); }
''',
  ),

  'heap-sort-tree': AlgorithmCode(
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    python: r'''
def heapify(arr, n, i):
    largest, left, right = i, 2*i + 1, 2*i + 2
    if left < n and arr[left] > arr[largest]: largest = left
    if right < n and arr[right] > arr[largest]: largest = right
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)
''',
    java: r'''
public void heapify(int[] arr, int n, int i) {
    int largest = i, left = 2*i + 1, right = 2*i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != i) { swap(arr, i, largest); heapify(arr, n, largest); }
}
''',
    cpp: r'''
void heapify(vector<int>& arr, int n, int i) {
    int largest = i, left = 2*i + 1, right = 2*i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != i) { swap(arr[i], arr[largest]); heapify(arr, n, largest); }
}
''',
  ),

  'fibonacci': AlgorithmCode(
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    python: r'''
def fibonacci(n):
    if n <= 1: return n
    prev, curr = 0, 1
    for _ in range(2, n + 1):
        prev, curr = curr, prev + curr
    return curr
''',
    java: r'''
public static int fibonacci(int n) {
    if (n <= 1) return n;
    int prev = 0, curr = 1;
    for (int i = 2; i <= n; i++) {
        int next = prev + curr; prev = curr; curr = next;
    }
    return curr;
}
''',
    cpp: r'''
int fibonacci(int n) {
    if (n <= 1) return n;
    int prev = 0, curr = 1;
    for (int i = 2; i <= n; i++) { int next = prev + curr; prev = curr; curr = next; }
    return curr;
}
''',
  ),

  'knapsack': AlgorithmCode(
    timeComplexity: 'O(nW)',
    spaceComplexity: 'O(nW)',
    python: r'''
def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0]*(capacity+1) for _ in range(n+1)]
    for i in range(1, n+1):
        for w in range(capacity+1):
            dp[i][w] = dp[i-1][w]
            if weights[i-1] <= w:
                dp[i][w] = max(dp[i][w], dp[i-1][w-weights[i-1]] + values[i-1])
    return dp[n][capacity]
''',
    java: r'''
public static int knapsack(int[] wt, int[] val, int cap) {
    int n = wt.length; int[][] dp = new int[n+1][cap+1];
    for (int i = 1; i <= n; i++)
        for (int w = 0; w <= cap; w++) {
            dp[i][w] = dp[i-1][w];
            if (wt[i-1] <= w) dp[i][w] = Math.max(dp[i][w], dp[i-1][w-wt[i-1]] + val[i-1]);
        }
    return dp[n][cap];
}
''',
    cpp: r'''
int knapsack(vector<int>& wt, vector<int>& val, int cap) {
    int n = wt.size(); vector<vector<int>> dp(n+1, vector<int>(cap+1));
    for (int i = 1; i <= n; i++)
        for (int w = 0; w <= cap; w++) {
            dp[i][w] = dp[i-1][w];
            if (wt[i-1] <= w) dp[i][w] = max(dp[i][w], dp[i-1][w-wt[i-1]] + val[i-1]);
        }
    return dp[n][cap];
}
''',
  ),

  'lcs': AlgorithmCode(
    timeComplexity: 'O(mn)',
    spaceComplexity: 'O(mn)',
    python: r'''
def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(1, m+1):
        for j in range(1, n+1):
            if a[i-1] == b[j-1]: dp[i][j] = 1 + dp[i-1][j-1]
            else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]
''',
    java: r'''
public static int lcs(String a, String b) {
    int m = a.length(), n = b.length(); int[][] dp = new int[m+1][n+1];
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = a.charAt(i-1) == b.charAt(j-1) ? 1 + dp[i-1][j-1] : Math.max(dp[i-1][j], dp[i][j-1]);
    return dp[m][n];
}
''',
    cpp: r'''
int lcs(string a, string b) {
    int m = a.size(), n = b.size(); vector<vector<int>> dp(m+1, vector<int>(n+1));
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = a[i-1] == b[j-1] ? 1 + dp[i-1][j-1] : max(dp[i-1][j], dp[i][j-1]);
    return dp[m][n];
}
''',
  ),

  'huffman': AlgorithmCode(
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    python: r'''
import heapq

def huffman(freq):
    heap = [[w, [ch, '']] for ch, w in freq.items()]
    heapq.heapify(heap)
    while len(heap) > 1:
        lo, hi = heapq.heappop(heap), heapq.heappop(heap)
        for p in lo[1:]: p[1] = '0' + p[1]
        for p in hi[1:]: p[1] = '1' + p[1]
        heapq.heappush(heap, [lo[0] + hi[0]] + lo[1:] + hi[1:])
    return dict(heap[0][1:])
''',
    java: r'''
public static void huffman(Map<Character,Integer> freq) {
    PriorityQueue<Integer> heap = new PriorityQueue<>(freq.values());
    while (heap.size() > 1) heap.add(heap.poll() + heap.poll());
}
''',
    cpp: r'''
void huffman(vector<int> freq) {
    priority_queue<int, vector<int>, greater<int>> heap(freq.begin(), freq.end());
    while (heap.size() > 1) { int a = heap.top(); heap.pop(); int b = heap.top(); heap.pop(); heap.push(a + b); }
}
''',
  ),

  'activity-selection': AlgorithmCode(
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    python: r'''
def activity_selection(activities):
    activities.sort(key=lambda x: x[1])
    chosen, last_end = [], float('-inf')
    for start, end in activities:
        if start >= last_end:
            chosen.append((start, end))
            last_end = end
    return chosen
''',
    java: r'''
public static List<int[]> activitySelection(List<int[]> activities) {
    activities.sort((a,b) -> a[1] - b[1]);
    List<int[]> chosen = new ArrayList<>(); int lastEnd = Integer.MIN_VALUE;
    for (int[] a : activities) {
        if (a[0] >= lastEnd) { chosen.add(a); lastEnd = a[1]; }
    }
    return chosen;
}
''',
    cpp: r'''
vector<pair<int,int>> activitySelection(vector<pair<int,int>> activities) {
    sort(activities.begin(), activities.end(), [](auto a, auto b){ return a.second < b.second; });
    vector<pair<int,int>> chosen; int lastEnd = INT_MIN;
    for (auto a : activities) if (a.first >= lastEnd) { chosen.push_back(a); lastEnd = a.second; }
    return chosen;
}
''',
  ),

};
