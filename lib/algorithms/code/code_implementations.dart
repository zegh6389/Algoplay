/// Multi-language educational code snippets for every algorithm in the catalog.
///
/// These snippets are intentionally compact: they are meant for the in-app
/// cheatsheet / code hub, not as a full production standard-library replacement.
class AlgorithmCode {
  final String python;
  final String java;
  final String cpp;

  const AlgorithmCode({
    required this.python,
    required this.java,
    required this.cpp,
  });
}

const Map<String, AlgorithmCode> algorithmCodeImplementations = {
  'bubble-sort': AlgorithmCode(
    python: '''def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr''',
    java: '''public static void bubbleSort(int[] arr) {
    for (int i = 0; i < arr.length; i++)
        for (int j = 0; j < arr.length - i - 1; j++)
            if (arr[j] > arr[j + 1]) {
                int t = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = t;
            }
}''',
    cpp: '''void bubbleSort(vector<int>& arr) {
    for (int i = 0; i < arr.size(); i++)
        for (int j = 0; j + 1 < arr.size() - i; j++)
            if (arr[j] > arr[j + 1]) swap(arr[j], arr[j + 1]);
}''',
  ),
  'selection-sort': AlgorithmCode(
    python: '''def selection_sort(arr):
    for i in range(len(arr)):
        min_i = i
        for j in range(i + 1, len(arr)):
            if arr[j] < arr[min_i]: min_i = j
        arr[i], arr[min_i] = arr[min_i], arr[i]
    return arr''',
    java: '''public static void selectionSort(int[] arr) {
    for (int i = 0; i < arr.length; i++) {
        int min = i;
        for (int j = i + 1; j < arr.length; j++) if (arr[j] < arr[min]) min = j;
        int t = arr[i]; arr[i] = arr[min]; arr[min] = t;
    }
}''',
    cpp: '''void selectionSort(vector<int>& arr) {
    for (int i = 0; i < arr.size(); i++) {
        int mn = i;
        for (int j = i + 1; j < arr.size(); j++) if (arr[j] < arr[mn]) mn = j;
        swap(arr[i], arr[mn]);
    }
}''',
  ),
  'insertion-sort': AlgorithmCode(
    python: '''def insertion_sort(arr):
    for i in range(1, len(arr)):
        key, j = arr[i], i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]; j -= 1
        arr[j + 1] = key
    return arr''',
    java: '''public static void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int key = arr[i], j = i - 1;
        while (j >= 0 && arr[j] > key) { arr[j + 1] = arr[j]; j--; }
        arr[j + 1] = key;
    }
}''',
    cpp: '''void insertionSort(vector<int>& arr) {
    for (int i = 1; i < arr.size(); i++) {
        int key = arr[i], j = i - 1;
        while (j >= 0 && arr[j] > key) arr[j + 1] = arr[j--];
        arr[j + 1] = key;
    }
}''',
  ),
  'merge-sort': AlgorithmCode(
    python: '''def merge_sort(arr):
    if len(arr) <= 1: return arr
    mid = len(arr) // 2
    left, right = merge_sort(arr[:mid]), merge_sort(arr[mid:])
    out = []
    while left and right: out.append((left if left[0] <= right[0] else right).pop(0))
    return out + left + right''',
    java: '''public static int[] mergeSort(int[] arr) {
    if (arr.length <= 1) return arr;
    int mid = arr.length / 2;
    int[] left = mergeSort(Arrays.copyOfRange(arr, 0, mid));
    int[] right = mergeSort(Arrays.copyOfRange(arr, mid, arr.length));
    return merge(left, right);
}''',
    cpp: '''void mergeSort(vector<int>& a, int l, int r) {
    if (r - l <= 1) return;
    int m = (l + r) / 2;
    mergeSort(a, l, m); mergeSort(a, m, r);
    inplace_merge(a.begin() + l, a.begin() + m, a.begin() + r);
}''',
  ),
  'quick-sort': AlgorithmCode(
    python: '''def quick_sort(arr):
    if len(arr) <= 1: return arr
    pivot = arr[-1]
    left = [x for x in arr[:-1] if x <= pivot]
    right = [x for x in arr[:-1] if x > pivot]
    return quick_sort(left) + [pivot] + quick_sort(right)''',
    java: '''public static void quickSort(int[] a, int lo, int hi) {
    if (lo >= hi) return;
    int p = partition(a, lo, hi);
    quickSort(a, lo, p - 1);
    quickSort(a, p + 1, hi);
}''',
    cpp: '''void quickSort(vector<int>& a, int lo, int hi) {
    if (lo >= hi) return;
    int p = partition(a, lo, hi);
    quickSort(a, lo, p - 1);
    quickSort(a, p + 1, hi);
}''',
  ),
  'heap-sort': AlgorithmCode(
    python: '''def heap_sort(arr):
    import heapq
    heapq.heapify(arr)
    return [heapq.heappop(arr) for _ in range(len(arr))]''',
    java: '''public static void heapSort(int[] arr) {
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    for (int x : arr) heap.add(x);
    for (int i = 0; i < arr.length; i++) arr[i] = heap.poll();
}''',
    cpp: '''void heapSort(vector<int>& arr) {
    make_heap(arr.begin(), arr.end());
    sort_heap(arr.begin(), arr.end());
}''',
  ),
  'linear-search': AlgorithmCode(
    python: '''def linear_search(arr, target):
    for i, value in enumerate(arr):
        if value == target: return i
    return -1''',
    java: '''public static int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) if (arr[i] == target) return i;
    return -1;
}''',
    cpp: '''int linearSearch(vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) if (arr[i] == target) return i;
    return -1;
}''',
  ),
  'binary-search': AlgorithmCode(
    python: '''def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target: return mid
        if arr[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1''',
    java: '''public static int binarySearch(int[] arr, int target) {
    int lo = 0, hi = arr.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) lo = mid + 1; else hi = mid - 1;
    }
    return -1;
}''',
    cpp: '''int binarySearch(vector<int>& arr, int target) {
    int lo = 0, hi = arr.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) lo = mid + 1; else hi = mid - 1;
    }
    return -1;
}''',
  ),
  'bfs': AlgorithmCode(
    python: '''def bfs(graph, start):
    seen, queue, order = {start}, [start], []
    while queue:
        node = queue.pop(0); order.append(node)
        for nxt in graph[node]:
            if nxt not in seen:
                seen.add(nxt); queue.append(nxt)
    return order''',
    java: '''public static List<Integer> bfs(List<List<Integer>> graph, int start) {
    Queue<Integer> q = new LinkedList<>(); boolean[] seen = new boolean[graph.size()];
    List<Integer> order = new ArrayList<>(); q.add(start); seen[start] = true;
    while (!q.isEmpty()) { int u = q.poll(); order.add(u); for (int v : graph.get(u)) if (!seen[v]) { seen[v] = true; q.add(v); } }
    return order;
}''',
    cpp: '''void bfs(vector<vector<int>>& g, int s) {
    queue<int> q; vector<int> seen(g.size()); q.push(s); seen[s] = 1;
    while (!q.empty()) { int u = q.front(); q.pop(); for (int v : g[u]) if (!seen[v]) seen[v] = 1, q.push(v); }
}''',
  ),
  'dfs': AlgorithmCode(
    python: '''def dfs(graph, start):
    seen, order = set(), []
    def visit(node):
        seen.add(node); order.append(node)
        for nxt in graph[node]:
            if nxt not in seen: visit(nxt)
    visit(start)
    return order''',
    java: '''public static void dfs(List<List<Integer>> graph, int u, boolean[] seen) {
    seen[u] = true;
    for (int v : graph.get(u)) if (!seen[v]) dfs(graph, v, seen);
}''',
    cpp: '''void dfs(vector<vector<int>>& g, int u, vector<int>& seen) {
    seen[u] = 1;
    for (int v : g[u]) if (!seen[v]) dfs(g, v, seen);
}''',
  ),
  'dijkstra': AlgorithmCode(
    python: '''def dijkstra(graph, source):
    import heapq
    dist, pq = {source: 0}, [(0, source)]
    while pq:
        d, u = heapq.heappop(pq)
        if d != dist[u]: continue
        for v, w in graph[u]:
            if v not in dist or d + w < dist[v]:
                dist[v] = d + w; heapq.heappush(pq, (dist[v], v))
    return dist''',
    java: '''public static int[] dijkstra(List<List<int[]>> g, int source) {
    int[] dist = new int[g.size()]; Arrays.fill(dist, Integer.MAX_VALUE); dist[source] = 0;
    PriorityQueue<int[]> pq = new PriorityQueue<>((a,b) -> a[0] - b[0]); pq.add(new int[]{0, source});
    while (!pq.isEmpty()) { int[] cur = pq.poll(); for (int[] e : g.get(cur[1])) if (cur[0] + e[1] < dist[e[0]]) { dist[e[0]] = cur[0] + e[1]; pq.add(new int[]{dist[e[0]], e[0]}); } }
    return dist;
}''',
    cpp: '''void dijkstra(vector<vector<pair<int,int>>>& g, int s) {
    vector<int> dist(g.size(), INT_MAX); dist[s] = 0;
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq; pq.push({0, s});
    while (!pq.empty()) { auto [d,u] = pq.top(); pq.pop(); for (auto [v,w] : g[u]) if (d + w < dist[v]) dist[v] = d + w, pq.push({dist[v], v}); }
}''',
  ),
  'a-star': AlgorithmCode(
    python: '''def a_star(start, goal, neighbors, h):
    import heapq
    open_set, g = [(h(start), start)], {start: 0}
    while open_set:
        _, cur = heapq.heappop(open_set)
        if cur == goal: return g[cur]
        for nxt, cost in neighbors(cur):
            nd = g[cur] + cost
            if nxt not in g or nd < g[nxt]:
                g[nxt] = nd; heapq.heappush(open_set, (nd + h(nxt), nxt))
    return None''',
    java: '''public static int aStar(int start, int goal) {
    PriorityQueue<int[]> open = new PriorityQueue<>((a,b) -> a[0] - b[0]);
    open.add(new int[]{0, start});
    while (!open.isEmpty()) { int node = open.poll()[1]; if (node == goal) return 1; }
    return -1;
}''',
    cpp: '''int aStar(int start, int goal) {
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> open;
    open.push({0, start});
    while (!open.empty()) { int node = open.top().second; open.pop(); if (node == goal) return 1; }
    return -1;
}''',
  ),
  'fibonacci': AlgorithmCode(
    python: '''def fibonacci(n):
    if n <= 1: return n
    a, b = 0, 1
    for _ in range(2, n + 1): a, b = b, a + b
    return b''',
    java: '''public static int fibonacci(int n) {
    if (n <= 1) return n;
    int a = 0, b = 1;
    for (int i = 2; i <= n; i++) { int c = a + b; a = b; b = c; }
    return b;
}''',
    cpp: '''int fibonacci(int n) {
    if (n <= 1) return n;
    int a = 0, b = 1;
    for (int i = 2; i <= n; i++) { int c = a + b; a = b; b = c; }
    return b;
}''',
  ),
  'knapsack': AlgorithmCode(
    python: '''def knapsack(weights, values, capacity):
    dp = [0] * (capacity + 1)
    for w, v in zip(weights, values):
        for c in range(capacity, w - 1, -1):
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[capacity]''',
    java: '''public static int knapsack(int[] w, int[] val, int cap) {
    int[] dp = new int[cap + 1];
    for (int i = 0; i < w.length; i++) for (int c = cap; c >= w[i]; c--) dp[c] = Math.max(dp[c], dp[c - w[i]] + val[i]);
    return dp[cap];
}''',
    cpp: '''int knapsack(vector<int>& w, vector<int>& val, int cap) {
    vector<int> dp(cap + 1);
    for (int i = 0; i < w.size(); i++) for (int c = cap; c >= w[i]; c--) dp[c] = max(dp[c], dp[c - w[i]] + val[i]);
    return dp[cap];
}''',
  ),
  'lcs': AlgorithmCode(
    python: '''def lcs(a, b):
    dp = [[0]*(len(b)+1) for _ in range(len(a)+1)]
    for i in range(1, len(a)+1):
        for j in range(1, len(b)+1):
            dp[i][j] = dp[i-1][j-1] + 1 if a[i-1] == b[j-1] else max(dp[i-1][j], dp[i][j-1])
    return dp[-1][-1]''',
    java: '''public static int lcs(String a, String b) {
    int[][] dp = new int[a.length()+1][b.length()+1];
    for (int i = 1; i <= a.length(); i++) for (int j = 1; j <= b.length(); j++) dp[i][j] = a.charAt(i-1)==b.charAt(j-1) ? dp[i-1][j-1]+1 : Math.max(dp[i-1][j], dp[i][j-1]);
    return dp[a.length()][b.length()];
}''',
    cpp: '''int lcs(string a, string b) {
    vector<vector<int>> dp(a.size()+1, vector<int>(b.size()+1));
    for (int i = 1; i <= a.size(); i++) for (int j = 1; j <= b.size(); j++) dp[i][j] = a[i-1] == b[j-1] ? dp[i-1][j-1] + 1 : max(dp[i-1][j], dp[i][j-1]);
    return dp[a.size()][b.size()];
}''',
  ),
  'activity-selection': AlgorithmCode(
    python: '''def activity_selection(activities):
    activities.sort(key=lambda x: x[1])
    chosen, last_end = [], float('-inf')
    for start, end in activities:
        if start >= last_end:
            chosen.append((start, end)); last_end = end
    return chosen''',
    java: '''public static List<int[]> activitySelection(List<int[]> acts) {
    acts.sort((a,b) -> a[1] - b[1]);
    List<int[]> chosen = new ArrayList<>(); int last = Integer.MIN_VALUE;
    for (int[] a : acts) if (a[0] >= last) { chosen.add(a); last = a[1]; }
    return chosen;
}''',
    cpp: '''void activitySelection(vector<pair<int,int>>& acts) {
    sort(acts.begin(), acts.end(), [](auto a, auto b){ return a.second < b.second; });
    int last = INT_MIN; for (auto [s,e] : acts) if (s >= last) last = e;
}''',
  ),
  'huffman': AlgorithmCode(
    python: '''def huffman(freq):
    import heapq
    heap = [[w, [ch, '']] for ch, w in freq.items()]
    heapq.heapify(heap)
    while len(heap) > 1:
        lo, hi = heapq.heappop(heap), heapq.heappop(heap)
        for p in lo[1:]: p[1] = '0' + p[1]
        for p in hi[1:]: p[1] = '1' + p[1]
        heapq.heappush(heap, [lo[0] + hi[0]] + lo[1:] + hi[1:])
    return dict(heap[0][1:])''',
    java: '''public static void huffman(Map<Character, Integer> freq) {
    PriorityQueue<Node> pq = new PriorityQueue<>((a,b) -> a.freq - b.freq);
    for (var e : freq.entrySet()) pq.add(new Node(e.getKey(), e.getValue()));
    while (pq.size() > 1) pq.add(new Node('\0', pq.poll().freq + pq.poll().freq));
}''',
    cpp: '''void huffman(map<char,int>& freq) {
    priority_queue<int, vector<int>, greater<int>> pq;
    for (auto [ch,f] : freq) pq.push(f);
    while (pq.size() > 1) { int a = pq.top(); pq.pop(); int b = pq.top(); pq.pop(); pq.push(a + b); }
}''',
  ),
  'bst-operations': AlgorithmCode(
    python: '''class BSTNode:
    def __init__(self, value): self.value, self.left, self.right = value, None, None

def bst_insert(root, value):
    if root is None: return BSTNode(value)
    if value < root.value: root.left = bst_insert(root.left, value)
    elif value > root.value: root.right = bst_insert(root.right, value)
    return root''',
    java: '''public static Node bstInsert(Node root, int value) {
    if (root == null) return new Node(value);
    if (value < root.value) root.left = bstInsert(root.left, value);
    else if (value > root.value) root.right = bstInsert(root.right, value);
    return root;
}''',
    cpp: '''void bstInsert(Node*& root, int value) {
    if (!root) { root = new Node(value); return; }
    if (value < root->value) bstInsert(root->left, value);
    else if (value > root->value) bstInsert(root->right, value);
}''',
  ),
  'avl-tree': AlgorithmCode(
    python: '''def avl_height(node):
    return node.height if node else 0

def avl_balance(node):
    return avl_height(node.left) - avl_height(node.right) if node else 0

def avl_insert(root, value):
    # Insert like BST, then rotate when balance is outside [-1, 1]
    return root''',
    java: '''public static int avlHeight(Node node) { return node == null ? 0 : node.height; }
public static int avlBalance(Node node) { return node == null ? 0 : avlHeight(node.left) - avlHeight(node.right); }
public static Node avlInsert(Node root, int value) { return root; }''',
    cpp: '''int avlHeight(Node* n) { return n ? n->height : 0; }
int avlBalance(Node* n) { return n ? avlHeight(n->left) - avlHeight(n->right) : 0; }
void avlInsert(Node*& root, int value) { /* BST insert, update height, rotate */ }''',
  ),
  'tree-traversals': AlgorithmCode(
    python: '''def tree_traversals_inorder(root):
    if root is None: return []
    return tree_traversals_inorder(root.left) + [root.value] + tree_traversals_inorder(root.right)''',
    java: '''public static void treeTraversalsInorder(Node root, List<Integer> out) {
    if (root == null) return;
    treeTraversalsInorder(root.left, out); out.add(root.value); treeTraversalsInorder(root.right, out);
}''',
    cpp: '''void treeTraversalsInorder(Node* root, vector<int>& out) {
    if (!root) return;
    treeTraversalsInorder(root->left, out); out.push_back(root->value); treeTraversalsInorder(root->right, out);
}''',
  ),
  'heap-sort-tree': AlgorithmCode(
    python: '''def heap_sort_tree(arr):
    import heapq
    heapq.heapify(arr)
    return [heapq.heappop(arr) for _ in range(len(arr))]''',
    java: '''public static void heapSortTree(int[] arr) {
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    for (int x : arr) heap.add(x);
    for (int i = 0; i < arr.length; i++) arr[i] = heap.poll();
}''',
    cpp: '''void heapSortTree(vector<int>& arr) {
    make_heap(arr.begin(), arr.end());
    sort_heap(arr.begin(), arr.end());
}''',
  ),
};
