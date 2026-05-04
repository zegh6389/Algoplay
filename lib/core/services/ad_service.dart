import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

import 'premium_service.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// AdService — Thin wrapper around Google Mobile Ads (AdMob).
///
/// All public methods check [PremiumService.isPremiumUser()] first; premium
/// users never see ads.  Uses test ad-unit IDs by default — swap for real
/// IDs before release.
// ═══════════════════════════════════════════════════════════════════════════════

class AdService {
  AdService._();
  static final AdService instance = AdService._();

  // ── Test Ad Unit IDs ─────────────────────────────────────────────────────
  // https://developers.google.com/admob/android/test-ads
  // https://developers.google.com/admob/ios/test-ads

  static String get _bannerAdUnitId {
    if (Platform.isAndroid) {
      return 'ca-app-pub-3940256099942544/6300978111';
    }
    return 'ca-app-pub-3940256099942544/2934735716'; // iOS
  }

  static String get _interstitialAdUnitId {
    if (Platform.isAndroid) {
      return 'ca-app-pub-3940256099942544/1033173712';
    }
    return 'ca-app-pub-3940256099942544/4411468910'; // iOS
  }

  static String get _rewardedAdUnitId {
    if (Platform.isAndroid) {
      return 'ca-app-pub-3940256099942544/5224354917';
    }
    return 'ca-app-pub-3940256099942544/1712485313'; // iOS
  }

  // ── State ────────────────────────────────────────────────────────────────
  InterstitialAd? _interstitialAd;
  RewardedAd? _rewardedAd;
  bool _isInitialized = false;

  // ── Initialization ───────────────────────────────────────────────────────

  /// Initializes the Mobile Ads SDK.  Call once during app startup.
  Future<void> init() async {
    if (_isInitialized) return;
    try {
      await MobileAds.instance.initialize();
      _isInitialized = true;
      debugPrint('[AdService] MobileAds initialized');
    } catch (e) {
      debugPrint('[AdService] init error: $e');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BANNER AD
  // ═══════════════════════════════════════════════════════════════════════════

  /// Creates and returns a loaded [BannerAd] ready for [AdWidget].
  ///
  /// Returns `null` for premium users or on load failure.
  Future<BannerAd?> getBannerAd() async {
    if (PremiumService.instance.isPremium) {
      debugPrint('[AdService] banner skipped — premium user');
      return null;
    }

    final Completer<BannerAd?> completer = Completer<BannerAd?>();

    late final BannerAd banner;
    banner = BannerAd(
      adUnitId: _bannerAdUnitId,
      size: AdSize.banner, // 320×50
      request: const AdRequest(),
      listener: BannerAdListener(
        onAdLoaded: (_) {
          debugPrint('[AdService] banner loaded');
          completer.complete(banner);
        },
        onAdFailedToLoad: (ad, error) {
          debugPrint('[AdService] banner failed: $error');
          ad.dispose();
          completer.complete(null);
        },
      ),
    );

    banner.load();
    return completer.future;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REWARDED AD — "Watch ad for hint" feature
  // ═══════════════════════════════════════════════════════════════════════════

  /// Pre-loads a rewarded ad.  No-op for premium users.
  void loadRewardedAd() {
    if (PremiumService.instance.isPremium) {
      debugPrint('[AdService] rewarded load skipped — premium user');
      return;
    }

    RewardedAd.load(
      adUnitId: _rewardedAdUnitId,
      request: const AdRequest(),
      rewardedAdLoadCallback: RewardedAdLoadCallback(
        onAdLoaded: (ad) {
          _rewardedAd = ad;
          debugPrint('[AdService] rewarded ad loaded');
        },
        onAdFailedToLoad: (error) {
          debugPrint('[AdService] rewarded ad failed to load: $error');
          _rewardedAd = null;
        },
      ),
    );
  }

  /// Shows the pre-loaded rewarded ad.  Calls [onReward] when the user earns
  /// the reward (i.e. watched the full ad).
  ///
  /// No-op for premium users or when no ad is cached.
  void showRewardedAd({required VoidCallback onReward}) {
    if (PremiumService.instance.isPremium) {
      debugPrint('[AdService] rewarded show skipped — premium user');
      return;
    }

    if (_rewardedAd == null) {
      debugPrint('[AdService] no rewarded ad cached — loading now');
      loadRewardedAd();
      return;
    }

    _rewardedAd!.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        debugPrint('[AdService] rewarded ad dismissed');
        ad.dispose();
        _rewardedAd = null;
        loadRewardedAd(); // pre-load next
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        debugPrint('[AdService] rewarded show error: $error');
        ad.dispose();
        _rewardedAd = null;
        loadRewardedAd();
      },
    );

    _rewardedAd!.show(
      onUserEarnedReward: (ad, reward) {
        debugPrint('[AdService] user earned reward: ${reward.amount} ${reward.type}');
        onReward();
      },
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INTERSTITIAL AD — Between sections
  // ═══════════════════════════════════════════════════════════════════════════

  /// Pre-loads an interstitial ad.  No-op for premium users.
  void loadInterstitialAd() {
    if (PremiumService.instance.isPremium) {
      debugPrint('[AdService] interstitial load skipped — premium user');
      return;
    }

    InterstitialAd.load(
      adUnitId: _interstitialAdUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _interstitialAd = ad;
          debugPrint('[AdService] interstitial ad loaded');
        },
        onAdFailedToLoad: (error) {
          debugPrint('[AdService] interstitial failed to load: $error');
          _interstitialAd = null;
        },
      ),
    );
  }

  /// Shows the pre-loaded interstitial ad.  No-op for premium users or when
  /// no ad is cached.
  void showInterstitialAd() {
    if (PremiumService.instance.isPremium) {
      debugPrint('[AdService] interstitial show skipped — premium user');
      return;
    }

    if (_interstitialAd == null) {
      debugPrint('[AdService] no interstitial ad cached — loading now');
      loadInterstitialAd();
      return;
    }

    _interstitialAd!.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        debugPrint('[AdService] interstitial ad dismissed');
        ad.dispose();
        _interstitialAd = null;
        loadInterstitialAd(); // pre-load next
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        debugPrint('[AdService] interstitial show error: $error');
        ad.dispose();
        _interstitialAd = null;
        loadInterstitialAd();
      },
    );

    _interstitialAd!.show();
  }

  // ── Cleanup ──────────────────────────────────────────────────────────────

  /// Dispose all cached ads.  Call when the service is no longer needed.
  void dispose() {
    _interstitialAd?.dispose();
    _rewardedAd?.dispose();
    _interstitialAd = null;
    _rewardedAd = null;
    debugPrint('[AdService] disposed');
  }
}
