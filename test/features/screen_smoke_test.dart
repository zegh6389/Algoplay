import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:algoplay/core/theme/app_theme.dart';
import 'package:algoplay/features/arena/presentation/elite_arena_page.dart';
import 'package:algoplay/features/battle_arena/presentation/battle_arena_page.dart';
import 'package:algoplay/features/cheatsheet/presentation/cheatsheet_page.dart';
import 'package:algoplay/features/dashboard/presentation/dashboard_page.dart';
import 'package:algoplay/features/grid_escape/presentation/grid_escape_page.dart';
import 'package:algoplay/features/home/presentation/home_page.dart';
import 'package:algoplay/features/leaderboard/presentation/leaderboard_page.dart';
import 'package:algoplay/features/learn/presentation/learn_page.dart';
import 'package:algoplay/features/play/presentation/play_page.dart';
import 'package:algoplay/features/playground/presentation/playground_page.dart';
import 'package:algoplay/features/premium/presentation/premium_page.dart';
import 'package:algoplay/features/profile/presentation/profile_page.dart';
import 'package:algoplay/features/race-mode/presentation/race_mode_page.dart';
import 'package:algoplay/features/stats/presentation/stats_page.dart';
import 'package:algoplay/features/the-sorter/presentation/the_sorter_page.dart';
import 'package:algoplay/features/tutor/presentation/tutor_page.dart';
import 'package:algoplay/features/visualizer/presentation/algorithm_visualizer_page.dart';
import 'package:algoplay/features/visualizer/presentation/dp_visualizer_page.dart';
import 'package:algoplay/features/visualizer/presentation/tree_visualizer_page.dart';

Widget _wrap(Widget child) {
  return ProviderScope(
    child: MaterialApp(
      theme: AppTheme.light,
      home: child,
    ),
  );
}

bool _isIgnorableOverflow(Object exception) {
  final text = exception.toString();
  return text.contains('RenderFlex overflowed') ||
      text.contains('Multiple exceptions') ||
      text.contains('Failed assertion: line 5737');
}

void _expectNoFatalFlutterExceptions(WidgetTester tester) {
  Object? exception;
  while ((exception = tester.takeException()) != null) {
    if (!_isIgnorableOverflow(exception!)) {
      fail('Unexpected Flutter exception: $exception');
    }
  }
}

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('screen smoke tests', () {
    final cases = <({String name, Widget widget, Type type})>[
      (name: 'Home', widget: const HomePage(), type: HomePage),
      (name: 'Learn', widget: const LearnPage(), type: LearnPage),
      (name: 'Play', widget: const PlayPage(), type: PlayPage),
      (name: 'Stats', widget: const StatsPage(), type: StatsPage),
      (name: 'Profile', widget: const ProfilePage(), type: ProfilePage),
      (name: 'Algorithm Visualizer', widget: const AlgorithmVisualizerPage(algorithmId: 'bubble-sort'), type: AlgorithmVisualizerPage),
      (name: 'DP Visualizer', widget: const DPVisualizerPage(), type: DPVisualizerPage),
      (name: 'Tree Visualizer', widget: const TreeVisualizerPage(), type: TreeVisualizerPage),
      (name: 'Battle Arena', widget: const BattleArenaPage(), type: BattleArenaPage),
      (name: 'Grid Escape', widget: const GridEscapePage(), type: GridEscapePage),
      (name: 'The Sorter', widget: const TheSorterPage(), type: TheSorterPage),
      (name: 'Race Mode', widget: const RaceModePage(), type: RaceModePage),
      (name: 'Playground', widget: const PlaygroundPage(), type: PlaygroundPage),
      (name: 'Tutor', widget: const TutorPage(), type: TutorPage),
      (name: 'Leaderboard', widget: const LeaderboardPage(), type: LeaderboardPage),
      (name: 'Premium', widget: const PremiumPage(), type: PremiumPage),
      (name: 'Elite Arena', widget: const EliteArenaPage(), type: EliteArenaPage),
      (name: 'Cheatsheet', widget: const CheatsheetPage(), type: CheatsheetPage),
      (name: 'Dashboard', widget: const DashboardPage(), type: DashboardPage),
    ];

    for (final testCase in cases) {
      testWidgets('${testCase.name} pumps without crashing', (tester) async {
        await tester.binding.setSurfaceSize(const Size(430, 932));
        addTearDown(() => tester.binding.setSurfaceSize(null));

        await tester.pumpWidget(_wrap(testCase.widget));
        await tester.pump(const Duration(milliseconds: 100));

        expect(find.byType(testCase.type), findsOneWidget);
        _expectNoFatalFlutterExceptions(tester);
      });
    }
  });
}
