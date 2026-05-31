import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'ad_service.dart';
import 'premium_service.dart';

/// Policy layer on top of [AdService] that enforces Google-safe frequency caps
/// and cooldown windows.
///
/// Strategy:
/// - Interstitial: after every completed module (every module, ad-ready check)
/// - Rewarded lesson unlock: optional early unlock for a locked lesson
/// - Premium users: all ad methods are no-ops
///
/// Cooldown constants are for visualizer playback interstitial, not module completion.
class AdStrategyService {
  AdStrategyService._();

  static final AdStrategyService instance = AdStrategyService._();

  /// Show interstitial after every completed module (cooldown enforced separately).
  static const int moduleInterstitialFrequency = 1;

  /// Cooldown between interstitial shows.
  static const Duration moduleInterstitialCooldown = Duration(minutes: 3);

  // ── SharedPreferences keys ─────────────────────────────────────────────────

  static const String _completedModuleCountKey =
      'algoplay_ads_completed_module_count';

  static const String _lastModuleInterstitialMsKey =
      'algoplay_ads_last_module_interstitial_ms';

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
  /// Frequency gating: every module completion (counter % frequency == 0).
  /// Cooldown: enforced via 3-minute cooldown window between interstitial shows.
  Future<bool> shouldShowModuleInterstitial() async {
    if (PremiumService.instance.isPremium) return false;

    final prefs = await SharedPreferences.getInstance();

    // Check cooldown window
    final nowMs = DateTime.now().millisecondsSinceEpoch;
    final lastMs = prefs.getInt(_lastModuleInterstitialMsKey);

    if (lastMs != null) {
      final elapsed = Duration(milliseconds: nowMs - lastMs);
      if (elapsed < moduleInterstitialCooldown) {
        return false;
      }
    }

    // Increment module completion counter
    final completedCount = (prefs.getInt(_completedModuleCountKey) ?? 0) + 1;
    await prefs.setInt(_completedModuleCountKey, completedCount);

    if (completedCount % moduleInterstitialFrequency != 0) {
      return false;
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

    final shown = AdService.instance.showInterstitialAd(
      onShown: () {
        SharedPreferences.getInstance().then((prefs) {
          prefs.setInt(
            _lastModuleInterstitialMsKey,
            DateTime.now().millisecondsSinceEpoch,
          );
        });
      },
    );

    if (!shown) {
      AdService.instance.loadInterstitialAd();
      return false;
    }

    return true;
  }

  // ── Rewarded lesson unlock helper ──────────────────────────────────────────

  /// Shows a rewarded ad for an explicit lesson unlock choice.
  /// Returns true if the ad was shown.
  /// If the ad isn't cached yet, this will attempt to load and retry once.
  Future<bool> showLessonRewardAd({required VoidCallback onReward}) async {
    if (PremiumService.instance.isPremium) return false;

    // If ad is already cached, show it immediately.
    if (AdService.instance.isRewardedReady) {
      final shown = AdService.instance.showRewardedAd(onReward: onReward);
      if (!shown) {
        AdService.instance.loadRewardedAd();
      }
      return shown;
    }

    // Ad not cached yet — try loading and wait briefly.
    AdService.instance.loadRewardedAd();

    // Poll for up to 3 seconds for the ad to become ready.
    for (int i = 0; i < 15; i++) {
      await Future.delayed(const Duration(milliseconds: 200));
      if (AdService.instance.isRewardedReady) {
        final shown = AdService.instance.showRewardedAd(onReward: onReward);
        if (!shown) {
          AdService.instance.loadRewardedAd();
        }
        return shown;
      }
    }

    // Give up — ad failed to load.
    if (kDebugMode) {
      debugPrint('[AdStrategy] rewarded ad failed to load within 3s');
    }
    return false;
  }
}
