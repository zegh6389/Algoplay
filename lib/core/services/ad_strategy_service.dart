import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'ad_service.dart';
import 'premium_service.dart';

/// Policy layer on top of [AdService] that enforces Google-safe frequency caps,
/// cooldown windows, and one-time lesson-reward claiming.
///
/// Strategy:
/// - Interstitial: after every completed module, gated by 3-min cooldown
/// - Rewarded lesson bonus: optional +50 XP after each completed lesson
/// - Premium users: all ad methods are no-ops
class AdStrategyService {
  AdStrategyService._();

  static final AdStrategyService instance = AdStrategyService._();

  /// Show interstitial after every completed module (cooldown enforced separately).
  static const int moduleInterstitialFrequency = 1;

  /// Cooldown between interstitial shows.
  static const Duration moduleInterstitialCooldown = Duration(minutes: 3);

  /// XP reward for watching the optional lesson-completion rewarded ad.
  static const int lessonRewardBonusXp = 50;

  // ── SharedPreferences keys ─────────────────────────────────────────────────

  static const String _completedModuleCountKey =
      'algoplay_ads_completed_module_count';

  static const String _lastModuleInterstitialMsKey =
      'algoplay_ads_last_module_interstitial_ms';

  static const String _lessonRewardClaimPrefix =
      'algoplay_ads_lesson_reward_claimed_';

  // ── Pre-loading ────────────────────────────────────────────────────────────

  /// Pre-loads interstitial and rewarded ads so they are ready when needed.
  /// Call from `initState` of any learning screen.
  void preloadLearningAds() {
    if (PremiumService.instance.isPremium) return;

    AdService.instance.loadInterstitialAd();
    AdService.instance.loadRewardedAd();
  }

  // ── Interstitial helpers ───────────────────────────────────────────────────

  /// Returns true if a module completion should trigger an interstitial ad.
  /// Checks both the cooldown window and ad readiness.
  Future<bool> shouldShowModuleInterstitial() async {
    if (PremiumService.instance.isPremium) return false;

    final prefs = await SharedPreferences.getInstance();

    // Increment module completion counter
    final completedCount =
        (prefs.getInt(_completedModuleCountKey) ?? 0) + 1;
    await prefs.setInt(_completedModuleCountKey, completedCount);

    if (completedCount % moduleInterstitialFrequency != 0) {
      return false;
    }

    // Check cooldown
    final nowMs = DateTime.now().millisecondsSinceEpoch;
    final lastMs = prefs.getInt(_lastModuleInterstitialMsKey);

    if (lastMs != null) {
      final elapsed = Duration(milliseconds: nowMs - lastMs);
      if (elapsed < moduleInterstitialCooldown) {
        return false;
      }
    }

    return AdService.instance.isInterstitialReady;
  }

  /// Shows an interstitial if allowed by policy, then pre-loads the next one.
  /// Returns true if an ad was shown.
  Future<bool> showModuleInterstitialIfAllowed() async {
    final allowed = await shouldShowModuleInterstitial();

    if (!allowed) {
      AdService.instance.loadInterstitialAd();
      return false;
    }

    final shown = AdService.instance.showInterstitialAd();

    if (!shown) {
      AdService.instance.loadInterstitialAd();
      return false;
    }

    // Record successful show for cooldown tracking
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(
      _lastModuleInterstitialMsKey,
      DateTime.now().millisecondsSinceEpoch,
    );

    return true;
  }

  // ── Rewarded lesson bonus helpers ─────────────────────────────────────────

  /// Returns true if the lesson bonus has already been claimed.
  Future<bool> hasClaimedLessonReward(int lessonId) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('$_lessonRewardClaimPrefix$lessonId') ?? false;
  }

  /// Marks the lesson bonus as claimed so it cannot be offered again.
  Future<void> markLessonRewardClaimed(int lessonId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('$_lessonRewardClaimPrefix$lessonId', true);
  }

  /// Shows the rewarded ad for the optional lesson bonus.
  /// Returns true if the ad was shown.
  bool showLessonRewardAd({required VoidCallback onReward}) {
    if (PremiumService.instance.isPremium) return false;

    final shown = AdService.instance.showRewardedAd(onReward: onReward);

    if (!shown) {
      AdService.instance.loadRewardedAd();
    }

    return shown;
  }
}
