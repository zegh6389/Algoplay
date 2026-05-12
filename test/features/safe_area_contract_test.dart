import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  group('safe area contract', () {
    test('every Scaffold screen has SafeArea or explicit MediaQuery padding', () {
      final libDir = Directory('lib');
      final scaffoldFiles =
          libDir
              .listSync(recursive: true)
              .whereType<File>()
              .where((file) => file.path.endsWith('.dart'))
              .where((file) => file.readAsStringSync().contains('Scaffold('))
              .toList()
            ..sort((a, b) => a.path.compareTo(b.path));

      expect(scaffoldFiles, isNotEmpty);

      for (final file in scaffoldFiles) {
        final source = file.readAsStringSync();
        final hasSafeArea =
            source.contains('SafeArea(') ||
            source.contains('SliverSafeArea') ||
            source.contains('MediaQuery.of(context).padding');

        expect(
          hasSafeArea,
          isTrue,
          reason:
              '${file.path} has a Scaffold but no SafeArea or explicit safe-area padding.',
        );
      }
    });

    test(
      'custom bottom navigation bars are protected from the gesture area',
      () {
        final tabShell = File(
          'lib/core/router/tab_shell.dart',
        ).readAsStringSync();
        expect(tabShell, contains('bottomNavigationBar: SafeArea('));
        expect(tabShell, contains('top: false'));
        expect(tabShell, contains('child: _AnimatedBottomNavBar('));

        final gridEscape = File(
          'lib/features/grid_escape/presentation/grid_escape_page.dart',
        ).readAsStringSync();
        expect(gridEscape, contains('bottomNavigationBar: _levelComplete'));
        expect(
          gridEscape,
          contains('SafeArea(top: false, child: _buildNextLevelBar(context))'),
        );
      },
    );

    test('primary full-screen pages wrap their body in SafeArea', () {
      const bodySafeAreaFiles = [
        'lib/features/stats/presentation/stats_page.dart',
        'lib/features/profile/presentation/profile_page.dart',
        'lib/features/premium/presentation/premium_page.dart',
        'lib/features/learn/presentation/lesson_detail_page.dart',
        'lib/features/tutor/presentation/tutor_page.dart',
        'lib/features/battle_arena/presentation/battle_arena_page.dart',
        'lib/features/grid_escape/presentation/grid_escape_page.dart',
      ];

      for (final path in bodySafeAreaFiles) {
        final source = File(path).readAsStringSync();
        expect(
          source,
          contains('body: SafeArea('),
          reason: '$path body must be SafeArea-wrapped.',
        );
      }
    });
  });
}
