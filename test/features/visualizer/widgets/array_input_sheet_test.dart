import 'dart:io';

import 'package:algoplay/features/visualizer/widgets/array_input_sheet.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Future<ArrayInputResult?> openSheet(
    WidgetTester tester, {
    bool showTarget = false,
    List<int>? initialArray,
  }) async {
    ArrayInputResult? result;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Builder(
            builder: (context) => ElevatedButton(
              onPressed: () async {
                result = await showArrayInputSheet(
                  context,
                  showTarget: showTarget,
                  initialArray: initialArray,
                );
              },
              child: const Text('Open'),
            ),
          ),
        ),
      ),
    );

    await tester.tap(find.text('Open'));
    await tester.pumpAndSettle();
    return result;
  }

  testWidgets('manual and random sheet does not show bar preview text', (
    tester,
  ) async {
    await openSheet(tester, initialArray: [5, 1, 3]);

    expect(find.text('Preview will appear here'), findsNothing);
    expect(find.text('Manual'), findsOneWidget);
    expect(find.text('Random'), findsOneWidget);
    expect(find.textContaining('Elements: 3'), findsOneWidget);
  });

  testWidgets('manual input field gives array text enough vertical room', (
    tester,
  ) async {
    await openSheet(tester, initialArray: [64, 25, 12, 22, 11]);

    final field = tester.widget<TextField>(find.byType(TextField).first);
    expect(field.textAlignVertical, TextAlignVertical.center);

    final decoration = field.decoration!;
    final padding = decoration.contentPadding! as EdgeInsets;
    expect(decoration.floatingLabelBehavior, FloatingLabelBehavior.always);
    expect(padding.top, 24);
    expect(padding.bottom, 16);

    expect(
      find.ancestor(
        of: find.byType(TextField).first,
        matching: find.byWidgetPredicate(
          (widget) =>
              widget is Padding &&
              widget.padding == const EdgeInsets.only(top: 8),
        ),
      ),
      findsOneWidget,
    );
  });

  test('manual input source does not constrain the text field height', () {
    final source = File(
      'lib/features/visualizer/widgets/array_input_sheet.dart',
    ).readAsStringSync();

    expect(source, contains('height: 210,'));
    expect(source, contains('padding: const EdgeInsets.only(top: 8),'));
    expect(source, isNot(contains('height: 64,\n          child: TextField')));
    expect(source, isNot(contains('height: 76,\n          child: TextField')));
  });

  testWidgets('tree input sheet labels values as tree values', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Builder(
            builder: (context) => ElevatedButton(
              onPressed: () => showArrayInputSheet(
                context,
                inputKind: VisualizerInputKind.treeValues,
                initialArray: const [50, 30, 70],
              ),
              child: const Text('Open'),
            ),
          ),
        ),
      ),
    );

    await tester.tap(find.text('Open'));
    await tester.pumpAndSettle();

    expect(find.text('Tree values'), findsOneWidget);
    expect(find.text('Array values'), findsNothing);
    expect(find.textContaining('Values: 3'), findsOneWidget);

    final field = tester.widget<TextField>(find.byType(TextField).first);
    final padding = field.decoration!.contentPadding! as EdgeInsets;
    expect(
      field.decoration!.floatingLabelBehavior,
      FloatingLabelBehavior.always,
    );
    expect(padding.bottom, 16);
    expect(
      find.ancestor(
        of: find.byType(TextField).first,
        matching: find.byWidgetPredicate(
          (widget) =>
              widget is Padding &&
              widget.padding == const EdgeInsets.only(top: 8),
        ),
      ),
      findsOneWidget,
    );
  });

  testWidgets('manual input applies parsed comma separated integers', (
    tester,
  ) async {
    ArrayInputResult? result;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Builder(
            builder: (context) => ElevatedButton(
              onPressed: () async {
                result = await showArrayInputSheet(context);
              },
              child: const Text('Open'),
            ),
          ),
        ),
      ),
    );

    await tester.tap(find.text('Open'));
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextField).first, '9, 1, 5');
    await tester.pump();
    expect(find.textContaining('Elements: 3'), findsOneWidget);

    await tester.tap(find.text('Apply'));
    await tester.pumpAndSettle();

    expect(result?.array, equals([9, 1, 5]));
    expect(result?.target, isNull);
  });

  testWidgets('random tab generates default sized array and applies it', (
    tester,
  ) async {
    ArrayInputResult? result;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Builder(
            builder: (context) => ElevatedButton(
              onPressed: () async {
                result = await showArrayInputSheet(context);
              },
              child: const Text('Open'),
            ),
          ),
        ),
      ),
    );

    await tester.tap(find.text('Open'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Random'));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Generate Random Array'));
    await tester.pump();
    expect(find.textContaining('Elements: 15'), findsOneWidget);

    await tester.tap(find.text('Apply'));
    await tester.pumpAndSettle();

    expect(result?.array.length, 15);
    expect(result?.array.every((value) => value >= 1 && value <= 100), isTrue);
  });
}
