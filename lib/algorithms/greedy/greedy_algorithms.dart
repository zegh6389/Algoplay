import '../models/dp_step.dart';

/// Streams Activity Selection using [DPStep] as a compact decision-state model.
Stream<DPStep> activitySelectionGreedy() async* {
  const starts = [1, 3, 0, 5, 8, 5];
  const finishes = [2, 4, 6, 7, 9, 9];
  final order = List<int>.generate(starts.length, (i) => i)
    ..sort((a, b) => finishes[a].compareTo(finishes[b]));
  final chosen = <int>[];
  var lastFinish = -1;

  yield DPStep(
    array: order.map((i) => finishes[i]).toList(),
    memo: {for (final i in order) 'A${i + 1}': finishes[i]},
    operation: 'Sort activities by earliest finish time',
    line: 1,
  );

  for (final activity in order) {
    final canChoose = starts[activity] >= lastFinish;
    if (canChoose) {
      chosen.add(activity);
      lastFinish = finishes[activity];
    }
    yield DPStep(
      array: order.map((i) => finishes[i]).toList(),
      currentIndex: order.indexOf(activity),
      comparing: [order.indexOf(activity)],
      sorted: chosen.map(order.indexOf).where((i) => i >= 0).toList(),
      memo: {
        'start': starts[activity],
        'finish': finishes[activity],
        'chosen': chosen.length,
      },
      operation: canChoose
          ? 'Choose A${activity + 1} (${starts[activity]}-${finishes[activity]})'
          : 'Skip A${activity + 1}; overlaps with finish time $lastFinish',
      line: canChoose ? 4 : 6,
      result: chosen.length,
    );
  }

  yield DPStep(
    array: order.map((i) => finishes[i]).toList(),
    sorted: chosen.map(order.indexOf).where((i) => i >= 0).toList(),
    memo: {'chosen': chosen.length},
    operation: 'Selected ${chosen.length} non-overlapping activities',
    line: 7,
    result: chosen.length,
  );
}

/// Streams Huffman coding as repeated greedy merges of the two smallest weights.
Stream<DPStep> huffmanGreedy() async* {
  final heap = <int>[5, 9, 12, 13, 16, 45]..sort();
  var step = 0;

  yield DPStep(
    array: List<int>.from(heap),
    memo: {'nodes': heap.length},
    operation: 'Build a min-heap from character frequencies',
    line: 1,
  );

  while (heap.length > 1) {
    final left = heap.removeAt(0);
    final right = heap.removeAt(0);
    final merged = left + right;
    heap.add(merged);
    heap.sort();
    step++;

    yield DPStep(
      array: List<int>.from(heap),
      comparing: const [0, 1],
      swapping: [heap.indexOf(merged)],
      sorted: [heap.indexOf(merged)],
      memo: {'left': left, 'right': right, 'merged': merged, 'step': step},
      currentIndex: heap.indexOf(merged),
      operation: 'Merge $left and $right into node $merged',
      line: 4,
      result: merged,
    );
  }

  yield DPStep(
    array: List<int>.from(heap),
    sorted: const [0],
    memo: {'root': heap.single},
    operation: 'Huffman tree complete with root weight ${heap.single}',
    line: 6,
    result: heap.single,
  );
}
