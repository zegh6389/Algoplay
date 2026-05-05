import 'dart:async';
import '../../features/learn/data/algorithm_data.dart';
import '../models/dp_step.dart';

/// Streams the Fibonacci DP algorithm step by step.
Stream<DPStep> fibonacciDp(int n) async* {
  final memo = <int, int>{0: 0};
  final table = List<int>.filled(n + 1, 0);

  // Initialize table visualization with fib(0) stored in memo.
  yield DPStep(
    array: List<int>.from(table),
    memo: Map.from(memo),
    currentIndex: 0,
    operation: 'Initialize DP table with base case fib(0) = 0',
    line: 1,
    result: n == 0 ? 0 : null,
  );

  // Build table iteratively (bottom-up tabulation).
  for (var i = 1; i <= n; i++) {
    if (i == 1) {
      memo[i] = 1;
      table[i] = 1;
      yield DPStep(
        array: List<int>.from(table),
        memo: Map.from(memo),
        currentIndex: i,
        operation: 'Base case: fib(1) = 1',
        line: 2,
        sorted: const [0, 1],
      );
    } else {
      final newVal = memo[i - 1]! + memo[i - 2]!;
      memo[i] = newVal;
      table[i] = newVal;
      yield DPStep(
        array: List<int>.from(table),
        memo: Map.from(memo),
        currentIndex: i,
        operation: 'fib($i) = fib(${i - 1}) + fib(${i - 2}) = $newVal',
        line: 4,
        comparing: [i - 1, i - 2],
        sorted: List.generate(i + 1, (idx) => idx),
      );
    }
  }

  yield DPStep(
    array: List<int>.from(table),
    memo: Map.from(memo),
    currentIndex: n,
    operation: 'fib($n) = ${memo[n]} — Complete!',
    line: 6,
    result: memo[n],
    sorted: List.generate(n + 1, (idx) => idx),
  );
}

/// Streams the LCS (Longest Common Subsequence) DP algorithm step by step.
Stream<DPStep> lcsDp(String s1, String s2) async* {
  final m = s1.length;
  final n = s2.length;

  // Initialize the DP table with zeros
  final table = List.generate(m + 1, (_) => List<int>.filled(n + 1, 0));

  yield DPStep(
    array: [0],
    comparing: [],
    swapping: [],
    sorted: [],
    memo: {for (var i = 0; i <= m; i++) for (var j = 0; j <= n; j++) '$i,$j': 0},
    currentIndex: 0,
    operation: 'Initialize ${m}x${n} DP table with zeros',
    line: 1,
  );

  // Fill the DP table
  for (var i = 1; i <= m; i++) {
    for (var j = 1; j <= n; j++) {
      if (s1[i - 1] == s2[j - 1]) {
        table[i][j] = table[i - 1][j - 1] + 1;
        yield DPStep(
          array: table[i],
          memo: {for (var pi = 0; pi <= m; pi++) for (var pj = 0; pj <= n; pj++) '$pi,$pj': table[pi][pj]},
          currentIndex: i * n + j,
          operation: 'Match! "${s1[i - 1]}" → LCS[$i][$j] = ${table[i][j]}',
          line: 3,
          comparing: [i - 1],
          sorted: List.generate(i, (idx) => idx),
        );
      } else {
        table[i][j] = table[i - 1][j] > table[i][j - 1] ? table[i - 1][j] : table[i][j - 1];
        yield DPStep(
          array: table[i],
          memo: {for (var pi = 0; pi <= m; pi++) for (var pj = 0; pj <= n; pj++) '$pi,$pj': table[pi][pj]},
          currentIndex: i * n + j,
          operation: 'No match → LCS[$i][$j] = ${table[i][j]} (max of ${table[i - 1][j]}, ${table[i][j - 1]})',
          line: 5,
          sorted: [],
        );
      }
    }
  }

  yield DPStep(
    array: table[m],
    memo: {for (var pi = 0; pi <= m; pi++) for (var pj = 0; pj <= n; pj++) '$pi,$pj': table[pi][pj]},
    currentIndex: m * n + n,
    operation: 'LCS = ${table[m][n]} — Complete!',
    line: 7,
    result: table[m][n],
    sorted: List.generate(m + 1, (idx) => idx),
  );
}

/// Streams the 0/1 Knapsack DP algorithm step by step.
Stream<DPStep> knapsackDp(List<int> weights, List<int> values, int capacity) async* {
  final n = weights.length;
  final dp = List.generate(n + 1, (_) => List<int>.filled(capacity + 1, 0));

  yield DPStep(
    array: [0],
    memo: {for (var i = 0; i <= n; i++) for (var j = 0; j <= capacity; j++) '$i,$j': 0},
    currentIndex: 0,
    operation: 'Initialize ${n}x${capacity + 1} DP table',
    line: 1,
  );

  for (var i = 1; i <= n; i++) {
    final w = weights[i - 1];
    final v = values[i - 1];
    for (var wgt = 0; wgt <= capacity; wgt++) {
      if (wgt < w) {
        dp[i][wgt] = dp[i - 1][wgt];
        yield DPStep(
          array: dp[i],
          memo: {for (var pi = 0; pi <= n; pi++) for (var pj = 0; pj <= capacity; pj++) '$pi,$pj': dp[pi][pj]},
          currentIndex: i * (capacity + 1) + wgt,
          operation: 'Item $i (wt=$w, val=$v) too heavy for capacity $wgt → skip',
          line: 3,
          comparing: [wgt],
        );
      } else {
        final include = dp[i - 1][wgt - w] + v;
        final exclude = dp[i - 1][wgt];
        dp[i][wgt] = include > exclude ? include : exclude;
        yield DPStep(
          array: dp[i],
          memo: {for (var pi = 0; pi <= n; pi++) for (var pj = 0; pj <= capacity; pj++) '$pi,$pj': dp[pi][pj]},
          currentIndex: i * (capacity + 1) + wgt,
          operation: 'Item $i: include=$include vs exclude=$exclude → max=${i * (capacity + 1) + wgt}',
          line: 5,
          comparing: [wgt - w, wgt],
          swapping: include > exclude ? [wgt] : [],
        );
      }
    }
  }

  yield DPStep(
    array: dp[n],
    memo: {for (var i = 0; i <= n; i++) for (var j = 0; j <= capacity; j++) '$i,$j': dp[i][j]},
    currentIndex: n * (capacity + 1) + capacity,
    operation: 'Maximum value = ${dp[n][capacity]} — Complete!',
    line: 7,
    result: dp[n][capacity],
    sorted: List.generate(n + 1, (idx) => idx),
  );
}


