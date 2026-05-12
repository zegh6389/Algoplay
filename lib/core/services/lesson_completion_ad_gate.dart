import 'package:shared_preferences/shared_preferences.dart';

import 'premium_service.dart';

/// Frequency gate for interstitial ads after lesson module completion.
///
/// Keeps lesson ads on natural transitions and prevents showing a full-screen ad
/// after every module. Premium users are always exempt.
class LessonCompletionAdGate {
  LessonCompletionAdGate._();

  static final LessonCompletionAdGate instance = LessonCompletionAdGate._();

  static const int completionsBetweenInterstitials = 3;
  static const Duration minInterstitialGap = Duration(minutes: 3);

  static const String completedSinceInterstitialKey =
      'algoplay_lesson_modules_since_interstitial';
  static const String lastInterstitialShownAtMsKey =
      'algoplay_lesson_last_interstitial_shown_at_ms';

  /// Records one completed module and returns whether an interstitial may be
  /// shown now.
  ///
  /// This does not reset the counter. Call [markInterstitialShown] only after an
  /// interstitial is actually available and shown.
  Future<bool> recordModuleCompletionAndShouldShow({DateTime? now}) async {
    if (PremiumService.instance.isPremium) return false;

    final prefs = await SharedPreferences.getInstance();
    final completedSinceLast =
        (prefs.getInt(completedSinceInterstitialKey) ?? 0) + 1;
    await prefs.setInt(completedSinceInterstitialKey, completedSinceLast);

    if (completedSinceLast < completionsBetweenInterstitials) return false;

    final lastShownAtMs = prefs.getInt(lastInterstitialShownAtMsKey);
    if (lastShownAtMs == null) return true;

    final elapsed = (now ?? DateTime.now()).difference(
      DateTime.fromMillisecondsSinceEpoch(lastShownAtMs),
    );
    return elapsed >= minInterstitialGap;
  }

  /// Marks that an interstitial was actually shown and resets the completion
  /// counter.
  Future<void> markInterstitialShown({DateTime? now}) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(completedSinceInterstitialKey, 0);
    await prefs.setInt(
      lastInterstitialShownAtMsKey,
      (now ?? DateTime.now()).millisecondsSinceEpoch,
    );
  }
}
