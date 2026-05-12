// Standalone audit script — run with: dart run test/audit_standalone.dart
import 'dart:math';
import '../lib/algorithms/sorting/sorting_algorithms.dart';
import '../lib/algorithms/searching/searching_algorithms.dart';
import '../lib/algorithms/models/sort_step.dart';
import '../lib/algorithms/models/search_step.dart';

int _failCount = 0;
int _total = 0;

void check(String name, bool condition, [String? detail]) {
  final status = condition ? '✅ PASS' : '❌ FAIL';
  print('  $status  $name${detail != null ? ' — $detail' : ''}');
  if (!condition) _failCount++;
  _total++;
}

void header(String title) {
  print('\n${'=' * 70}');
  print('  $title');
  print('${'=' * 70}');
}

Future<List<int>> sortedResult(Stream<SortStep> Function(List<int>) fn, List<int> input) async {
  List<int> result = [];
  await for (final step in fn(List<int>.from(input))) {
    result = List<int>.from(step.array);
  }
  return result;
}

bool isSorted(List<int> a) {
  for (int i = 1; i < a.length; i++) if (a[i] < a[i - 1]) return false;
  return true;
}

bool sameElements(List<int> a, List<int> b) {
  final ma = <int, int>{};
  for (final v in a) ma[v] = (ma[v] ?? 0) + 1;
  final mb = <int, int>{};
  for (final v in b) mb[v] = (mb[v] ?? 0) + 1;
  if (ma.length != mb.length) return false;
  for (final k in ma.keys) if (ma[k] != mb[k]) return false;
  return true;
}

bool listEq(List<int> a, List<int> b) {
  if (a.length != b.length) return false;
  for (int i = 0; i < a.length; i++) if (a[i] != b[i]) return false;
  return true;
}

// ── Sorting Tests ───────────────────────────────────────────────────────────

Future<void> testSort(String name, Stream<SortStep> Function(List<int>) fn) async {
  header(name);
  final cases = <String, List<int>>{
    'random': [64, 34, 25, 12, 22, 11, 90],
    'sorted': [1, 2, 3, 4, 5, 6, 7],
    'reversed': [7, 6, 5, 4, 3, 2, 1],
    'single': [42],
    'two': [2, 1],
    'duplicates': [5, 2, 5, 1, 2, 3, 1],
    'all same': [7, 7, 7, 7, 7],
    'empty': [],
  };

  for (final e in cases.entries) {
    if (e.value.isEmpty) {
      try {
        await sortedResult(fn, e.value);
        check('${e.key}: no crash', true);
      } catch (ex) {
        check('${e.key}: no crash', false, '$ex');
      }
      continue;
    }
    final result = await sortedResult(fn, List<int>.from(e.value));
    final expected = List<int>.from(e.value)..sort();
    check('${e.key}: sorted', isSorted(result));
    check('${e.key}: same elements', sameElements(result, e.value));
    check('${e.key}: matches dart:sort', listEq(result, expected));
  }

  // Stream quality
  final steps = await fn([64, 34, 25, 12, 22, 11, 90]).toList();
  check('steps non-empty', steps.isNotEmpty);
  check('first step starts', steps.first.operation.toLowerCase().contains('start'));
  check('last step completes', steps.last.operation.toLowerCase().contains('complete'));
  check('last step all sorted', steps.last.sorted.length == 7, 'sorted=${steps.last.sorted.length}');
  check('all steps preserve length', steps.every((s) => s.array.length == 7));

  bool inBounds = true;
  for (final s in steps) {
    for (final i in [...s.comparing, ...s.swapping, ...s.sorted]) {
      if (i < 0 || i >= 7) { inBounds = false; break; }
    }
    if (s.pivot != null && (s.pivot! < 0 || s.pivot! >= 7)) inBounds = false;
  }
  check('all indices in bounds', inBounds);
}

// ── Searching Tests ─────────────────────────────────────────────────────────

Future<void> testSearch(String name, Stream<SearchStep> Function(List<int>, int) fn, {bool sorted = false}) async {
  header(name);
  final arr = sorted ? [3, 7, 11, 15, 22, 28, 35, 42, 56, 68]
                     : [64, 34, 25, 12, 22, 11, 90];

  Future<void> tc(String label, List<int> a, int target, bool expectFound) async {
    final steps = await fn(List<int>.from(a), target).toList();
    check('$label: steps non-empty', steps.isNotEmpty);
    final last = steps.last;
    check('$label: found=$expectFound matches', last.found == expectFound,
      'found=${last.found}');
    if (expectFound) {
      final foundSteps = steps.where((s) => s.found);
      check('$label: found step exists', foundSteps.isNotEmpty);
      if (foundSteps.isNotEmpty) {
        final idx = foundSteps.first.comparing.isNotEmpty
            ? foundSteps.first.comparing.first : foundSteps.first.currentIndex;
        check('$label: correct index',
          idx >= 0 && idx < a.length && a[idx] == target,
          'idx=$idx, a[$idx]=${(idx >= 0 && idx < a.length) ? a[idx] : "OOB"}');
      }
    } else {
      check('$label: no found steps', steps.every((s) => !s.found));
      check('$label: says not found', last.operation.toLowerCase().contains('not found'));
    }
    check('$label: comparing in bounds',
      steps.every((s) => s.comparing.every((i) => i >= 0 && i < a.length)));
    check('$label: eliminated unique',
      last.eliminated.toSet().length == last.eliminated.length);
  }

  await tc('target at start', arr, arr.first, true);
  await tc('target at end', arr, arr.last, true);
  await tc('target in middle', arr, arr[arr.length ~/ 2], true);
  await tc('target not found (large)', arr, 999, false);
  await tc('target not found (small)', arr, -1, false);
  await tc('single found', [42], 42, true);
  await tc('single not found', [42], 99, false);
}

// ── UID Tracking Simulation ─────────────────────────────────────────────────

Future<void> testUidTracking() async {
  header('UID Swap Tracking Simulation');

  Future<void> simulate(String name, Stream<SortStep> Function(List<int>) fn, List<int> input) async {
    final steps = await fn(List<int>.from(input)).toList();
    final n = input.length;
    var uids = List.generate(n, (i) => i);
    var swapCount = 0;

    for (final step in steps) {
      if (step.swapping.length == 2) {
        final a = step.swapping[0], b = step.swapping[1];
        if (a < n && b < n) {
          final t = uids[a]; uids[a] = uids[b]; uids[b] = t;
          swapCount++;
        }
      }
    }

    final isPerm = uids.toSet().length == n && uids.every((u) => u >= 0 && u < n);
    check('$name: UIDs valid permutation', isPerm, 'uids=$uids');

    final isIdentity = listEq(uids, List.generate(n, (i) => i));
    if (swapCount > 0 && isIdentity) {
      check('$name: ⚠️ DOUBLE-SWAP BUG — UIDs reverted to identity despite $swapCount swaps', false);
    } else if (swapCount == 0 && !isIdentity) {
      check('$name: ⚠️ UNEXPECTED — UIDs changed without swap steps', false);
    } else {
      check('$name: UID swaps are meaningful ($swapCount swaps)', true);
    }
  }

  await simulate('Bubble Sort', bubbleSort, [5, 3, 1, 4, 2]);
  await simulate('Selection Sort', selectionSort, [5, 3, 1, 4, 2]);
  await simulate('Insertion Sort', insertionSort, [5, 3, 1, 4, 2]);
  await simulate('Quick Sort', quickSort, [5, 3, 1, 4, 2]);
  await simulate('Heap Sort', heapSort, [5, 3, 1, 4, 2]);
  await simulate('Merge Sort', mergeSort, [5, 3, 1, 4, 2]);
}

// ── Timing: Pre-swap vs Post-swap Detection ─────────────────────────────────

Future<void> testSwapTiming() async {
  header('Swap Step Timing (pre-swap vs post-swap array)');

  Future<void> analyze(String name, Stream<SortStep> Function(List<int>) fn, List<int> input) async {
    final steps = await fn(List<int>.from(input)).toList();
    int preSwapCount = 0;
    int postSwapCount = 0;
    int unknownCount = 0;

    for (int i = 0; i < steps.length; i++) {
      final step = steps[i];
      if (step.swapping.length == 2) {
        final a = step.swapping[0], b = step.swapping[1];
        if (a != b && i + 1 < steps.length) {
          final next = steps[i + 1];
          if (step.array[a] == next.array[b] && step.array[b] == next.array[a]
              && step.array[a] != step.array[b]) {
            preSwapCount++;
          } else {
            postSwapCount++;
          }
        } else {
          unknownCount++;
        }
      }
    }

    check('$name: pre=$preSwapCount post=$postSwapCount unknown=$unknownCount', true);
    if (preSwapCount > 0) {
      check('$name: ⚠️ Has pre-swap steps — UID swaps before value swaps (1 frame glitch)', false);
    }
    if (postSwapCount > 0 && preSwapCount > 0) {
      check('$name: ⚠️ Mix of pre/post — inconsistent swap timing', false);
    }
  }

  await analyze('Bubble Sort', bubbleSort, [5, 3, 1, 4, 2]);
  await analyze('Selection Sort', selectionSort, [5, 3, 1, 4, 2]);
  await analyze('Insertion Sort', insertionSort, [5, 3, 1, 4, 2]);
  await analyze('Quick Sort', quickSort, [5, 3, 1, 4, 2]);
  await analyze('Heap Sort', heapSort, [5, 3, 1, 4, 2]);
  await analyze('Merge Sort', mergeSort, [5, 3, 1, 4, 2]);
}

// ── Visualization Edge Cases ────────────────────────────────────────────────

Future<void> testVisualizationEdgeCases() async {
  header('Visualization Edge Cases');

  final bsNotFound = await binarySearch([1, 3, 5, 7, 9], 4).toList();
  check('binary search not-found: left > right on last step',
    bsNotFound.last.searchRange.left > bsNotFound.last.searchRange.right);

  final bsFirst = await binarySearch([1, 3, 5, 7, 9], 1).toList();
  check('binary search first element: found', bsFirst.last.found);
  check('binary search first element: index 0',
    bsFirst.last.comparing.contains(0) || bsFirst.last.currentIndex == 0);

  final bsLast = await binarySearch([1, 3, 5, 7, 9], 9).toList();
  check('binary search last element: found', bsLast.last.found);

  final linNotFound = await linearSearch([1, 3, 5], 7).toList();
  check('linear search not found: all eliminated',
    linNotFound.last.eliminated.length == 3);

  final bubbleSorted = await bubbleSort([1, 2, 3, 4, 5]).toList();
  final hasEarlyExit = bubbleSorted.any((s) =>
    s.operation.toLowerCase().contains('no swaps'));
  check('bubble sort: early exit on sorted input', hasEarlyExit);

  final selSorted = await selectionSort([1, 2, 3, 4, 5]).toList();
  final swapSteps = selSorted.where((s) => s.swapping.length == 2).length;
  check('selection sort: no swaps on sorted input', swapSteps == 0,
    'swap steps=$swapSteps');

  // Target=0 visualization bug
  check('⚠️ Search viz hides target badge when target=0 (line 804: step.target != 0)', false,
    'condition should not use != 0 check');
}

// ── Main ────────────────────────────────────────────────────────────────────

Future<void> main() async {
  print('╔══════════════════════════════════════════════════════════════════════╗');
  print('║           ALGOPLAY ALGORITHM CORRECTNESS AUDIT                      ║');
  print('╚══════════════════════════════════════════════════════════════════════╝');

  await testSort('Bubble Sort', bubbleSort);
  await testSort('Selection Sort', selectionSort);
  await testSort('Insertion Sort', insertionSort);
  await testSort('Merge Sort', mergeSort);
  await testSort('Quick Sort', quickSort);
  await testSort('Heap Sort', heapSort);

  await testSearch('Linear Search', linearSearch);
  await testSearch('Binary Search', binarySearch, sorted: true);

  await testUidTracking();
  await testSwapTiming();
  await testVisualizationEdgeCases();

  print('\n${'═' * 70}');
  print('  SUMMARY: $_total tests, $_failCount failures');
  if (_failCount == 0) {
    print('  ✅ All tests passed!');
  } else {
    print('  ❌ $_failCount test(s) failed — see above for details');
  }
  print('${'═' * 70}\n');
}
