import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:algoplay/core/services/lesson_completion_ad_gate.dart';
import 'package:algoplay/core/services/premium_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late LessonCompletionAdGate gate;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    await PremiumService.instance.clear();
    gate = LessonCompletionAdGate.instance;
  });

  tearDown(() async {
    await PremiumService.instance.clear();
  });

  test(
    'allows lesson interstitial only after three completed modules',
    () async {
      final now = DateTime(2026, 1, 1, 12);

      expect(await gate.recordModuleCompletionAndShouldShow(now: now), isFalse);
      expect(await gate.recordModuleCompletionAndShouldShow(now: now), isFalse);
      expect(await gate.recordModuleCompletionAndShouldShow(now: now), isTrue);
    },
  );

  test('resets count and enforces minimum gap after an ad is shown', () async {
    final shownAt = DateTime(2026, 1, 1, 12);
    final tooSoon = shownAt.add(const Duration(minutes: 2));
    final lateEnough = shownAt.add(const Duration(minutes: 4));

    expect(
      await gate.recordModuleCompletionAndShouldShow(now: shownAt),
      isFalse,
    );
    expect(
      await gate.recordModuleCompletionAndShouldShow(now: shownAt),
      isFalse,
    );
    expect(
      await gate.recordModuleCompletionAndShouldShow(now: shownAt),
      isTrue,
    );

    await gate.markInterstitialShown(now: shownAt);
    final prefs = await SharedPreferences.getInstance();
    expect(
      prefs.getInt(LessonCompletionAdGate.completedSinceInterstitialKey),
      0,
    );

    expect(
      await gate.recordModuleCompletionAndShouldShow(now: tooSoon),
      isFalse,
    );
    expect(
      await gate.recordModuleCompletionAndShouldShow(now: tooSoon),
      isFalse,
    );
    expect(
      await gate.recordModuleCompletionAndShouldShow(now: tooSoon),
      isFalse,
    );

    expect(
      await gate.recordModuleCompletionAndShouldShow(now: lateEnough),
      isTrue,
    );
  });

  test(
    'premium users do not advance the lesson interstitial counter',
    () async {
      await PremiumService.instance.setPremium(true);

      expect(
        await gate.recordModuleCompletionAndShouldShow(
          now: DateTime(2026, 1, 1, 12),
        ),
        isFalse,
      );

      final prefs = await SharedPreferences.getInstance();
      expect(
        prefs.getInt(LessonCompletionAdGate.completedSinceInterstitialKey),
        isNull,
      );
    },
  );
}
