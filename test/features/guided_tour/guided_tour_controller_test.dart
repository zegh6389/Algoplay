import 'package:algoplay/features/guided_tour/algoplay_tour_keys.dart';
import 'package:algoplay/features/guided_tour/guided_tour_controller.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('guided tour', () {
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

    test('resetTour clears first run completion flag', () async {
      SharedPreferences.setMockInitialValues({
        GuidedTourController.guidedTourSeenKey: true,
      });

      final prefs = await SharedPreferences.getInstance();
      expect(prefs.getBool(GuidedTourController.guidedTourSeenKey), isTrue);

      await GuidedTourController.resetTour();

      expect(prefs.getBool(GuidedTourController.guidedTourSeenKey), isNull);
    });
  });
}
