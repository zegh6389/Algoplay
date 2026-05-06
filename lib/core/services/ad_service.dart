import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

import 'premium_service.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// AdService — Thin wrapper around Google Mobile Ads (AdMob).
///
/// All public methods check [PremiumService.isPremiumUser()] first; premium
/// users never see ads.  Production ad-unit IDs configured for Android;
/// iOS IDs still use test units until iOS release.
// ═══════════════════════════════════════════════════════════════════════════════

class AdService {
  AdService._();
  static final AdService instance = AdService._();

  // ── Ad Unit IDs ──────────────────────────────────────────────────────────
  // Production IDs (Android). iOS still uses test IDs until iOS release.

  static String get _bannerAdUnitId {
    if (Platform.isAndroid) {
      return 'ca-app-pub-8157621642469961/2735757394';
    }
    return 'ca-app-pub-3940256099942544/2934735716'; // iOS test
  }

  static String get _interstitialAdUnitId {
    if (Platform.isAndroid) {
      return 'ca-app-pub-8157621642469961/9109594050';
    }
    return 'ca-app-pub-3940256099942544/4411468910'; // iOS test
  }

  static String get _rewardedAdUnitId {
    if (Platform.isAndroid) {
      return 'ca-app-pub-8157621642469961/6734712153';
    }
    return 'ca-app-pub-3940256099942544/1712485313'; // iOS test
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
      if (kDebugMode) {
        debugPrint('[AdService] MobileAds initialized');
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[AdService] init error: $e');
      }
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
      if (kDebugMode) {
        debugPrint('[AdService] banner skipped — premium user');
      }
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
          if (kDebugMode) {
            debugPrint('[AdService] banner loaded');
          }
          completer.complete(banner);
        },
        onAdFailedToLoad: (ad, error) {
          if (kDebugMode) {
            debugPrint('[AdService] banner failed: $error');
          }
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
      if (kDebugMode) {
        debugPrint('[AdService] rewarded load skipped — premium user');
      }
      return;
    }

    RewardedAd.load(
      adUnitId: _rewardedAdUnitId,
      request: const AdRequest(),
      rewardedAdLoadCallback: RewardedAdLoadCallback(
        onAdLoaded: (ad) {
          _rewardedAd = ad;
          if (kDebugMode) {
            debugPrint('[AdService] rewarded ad loaded');
          }
        },
        onAdFailedToLoad: (error) {
          if (kDebugMode) {
            debugPrint('[AdService] rewarded ad failed to load: $error');
          }
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
      if (kDebugMode) {
        debugPrint('[AdService] rewarded show skipped — premium user');
      }
      return;
    }

    if (_rewardedAd == null) {
      if (kDebugMode) {
        debugPrint('[AdService] no rewarded ad cached — loading now');
      }
      loadRewardedAd();
      return;
    }

    _rewardedAd!.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        if (kDebugMode) {
          debugPrint('[AdService] rewarded ad dismissed');
        }
        ad.dispose();
        _rewardedAd = null;
        loadRewardedAd(); // pre-load next
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        if (kDebugMode) {
          debugPrint('[AdService] rewarded show error: $error');
        }
        ad.dispose();
        _rewardedAd = null;
        loadRewardedAd();
      },
    );

    _rewardedAd!.show(
      onUserEarnedReward: (ad, reward) {
        if (kDebugMode) {
          debugPrint('[AdService] user earned reward: ${reward.amount} ${reward.type}');
        }
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
      if (kDebugMode) {
        debugPrint('[AdService] interstitial load skipped — premium user');
      }
      return;
    }

    InterstitialAd.load(
      adUnitId: _interstitialAdUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _interstitialAd = ad;
          if (kDebugMode) {
            debugPrint('[AdService] interstitial ad loaded');
          }
        },
        onAdFailedToLoad: (error) {
          if (kDebugMode) {
            debugPrint('[AdService] interstitial failed to load: $error');
          }
          _interstitialAd = null;
        },
      ),
    );
  }

  /// Shows the pre-loaded interstitial ad.  No-op for premium users or when
  /// no ad is cached.
  void showInterstitialAd() {
    if (PremiumService.instance.isPremium) {
      if (kDebugMode) {
        debugPrint('[AdService] interstitial show skipped — premium user');
      }
      return;
    }

    if (_interstitialAd == null) {
      if (kDebugMode) {
        debugPrint('[AdService] no interstitial ad cached — loading now');
      }
      loadInterstitialAd();
      return;
    }

    _interstitialAd!.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        if (kDebugMode) {
          debugPrint('[AdService] interstitial ad dismissed');
        }
        ad.dispose();
        _interstitialAd = null;
        loadInterstitialAd(); // pre-load next
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        if (kDebugMode) {
          debugPrint('[AdService] interstitial show error: $error');
        }
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
    if (kDebugMode) {
      debugPrint('[AdService] disposed');
    }
  }
}
