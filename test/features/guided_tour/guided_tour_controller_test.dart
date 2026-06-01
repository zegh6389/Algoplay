import 'dart:io';

import 'package:algoplay/core/services/feature_tour_service.dart';
import 'package:algoplay/features/guided_tour/algoplay_tour_keys.dart';
import 'package:algoplay/features/guided_tour/guided_tour_controller.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('guided tour', () {
    setUp(() {
      SharedPreferences.setMockInitialValues({});
    });

    test('maps bottom navigation tabs to stable tour keys', () {
      expect(
        AlgoPlayTourKeys.tabKeyForIndex(0),
        same(AlgoPlayTourKeys.lessonsTabKey),
      );
      expect(
        AlgoPlayTourKeys.tabKeyForIndex(1),
        same(AlgoPlayTourKeys.exploreTabKey),
      );
      expect(
        AlgoPlayTourKeys.tabKeyForIndex(2),
        same(AlgoPlayTourKeys.playTabKey),
      );
      expect(
        AlgoPlayTourKeys.tabKeyForIndex(3),
        same(AlgoPlayTourKeys.statsTabKey),
      );
      expect(
        AlgoPlayTourKeys.tabKeyForIndex(4),
        same(AlgoPlayTourKeys.profileTabKey),
      );
      expect(
        AlgoPlayTourKeys.tabKeyForIndex(99),
        same(AlgoPlayTourKeys.lessonsTabKey),
      );
    });

    test(
      'FeatureTourService persists and clears main tour completion flag',
      () async {
        final service = FeatureTourService.instance;

        expect(await service.hasSeenMainTour(), isFalse);

        await service.markMainTourSeen();
        expect(await service.hasSeenMainTour(), isTrue);

        await service.resetMainTour();
        expect(await service.hasSeenMainTour(), isFalse);
      },
    );

    test('resetTour clears first run completion flag', () async {
      SharedPreferences.setMockInitialValues({
        GuidedTourController.guidedTourSeenKey: true,
      });

      final prefs = await SharedPreferences.getInstance();
      expect(prefs.getBool(GuidedTourController.guidedTourSeenKey), isTrue);

      await GuidedTourController.resetTour();

      expect(prefs.getBool(GuidedTourController.guidedTourSeenKey), isNull);
    });

    test('tab shell returns to lessons branch before starting first tour', () {
      final source = File('lib/core/router/tab_shell.dart').readAsStringSync();

      expect(source, contains('FeatureTourService.instance.hasSeenMainTour()'));
      expect(
        source,
        contains('Always start the first-run tour from the Lessons tab'),
      );
      expect(
        source,
        contains('widget.navigationShell.goBranch(0, initialLocation: true)'),
      );
      // Polling approach ensures tab keys are painted before targets are created
      expect(source, contains('_pollAndShowTour'));
      expect(source, contains('every((key) => key.currentContext != null)'));
      expect(source, contains('_showGuidedTour()'));
    });

    test('tab shell blocks interstitial ads while guided tour is active', () {
      final source = File('lib/core/router/tab_shell.dart').readAsStringSync();

      expect(source, contains('featureTourActiveProvider'));
      expect(
        source,
        contains('final tourActive = ref.read(featureTourActiveProvider);'),
      );
      expect(source, contains('if (!isPremium && !tourActive && cooledDown)'));
      expect(source, contains('onTourStarted'));
      expect(source, contains('onTourEnded'));
    });

    test('main tab tour uses current production copy', () {
      final source = File(
        'lib/features/guided_tour/guided_tour_controller.dart',
      ).readAsStringSync();

      expect(source, contains('Follow guided modules, track progress'));
      expect(source, contains('Browse topics, open visualizers'));
      expect(source, contains('Battle Arena, Grid Escape, Race Mode'));
      expect(source, contains('Track your XP, streaks, active days'));
      expect(source, contains('upgrade if you want ad-free learning'));
    });
  });
}
