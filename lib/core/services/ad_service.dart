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
    if (kDebugMode) {
      return 'ca-app-pub-3940256099942544/6300978111';
    }
    if (Platform.isAndroid) {
      return 'ca-app-pub-8157621642469961/2735757394';
    }
    return 'ca-app-pub-3940256099942544/2934735716'; // iOS test
  }

  static String get _interstitialAdUnitId {
    if (kDebugMode) {
      return 'ca-app-pub-3940256099942544/1033173712';
    }
    if (Platform.isAndroid) {
      return 'ca-app-pub-8157621642469961/9109594050';
    }
    return 'ca-app-pub-3940256099942544/4411468910'; // iOS test
  }

  static String get _rewardedAdUnitId {
    if (kDebugMode) {
      return 'ca-app-pub-3940256099942544/5224354917';
    }
    if (Platform.isAndroid) {
      return 'ca-app-pub-8157621642469961/6734712153';
    }
    return 'ca-app-pub-3940256099942544/1712485313'; // iOS test
  }

  // ── State ────────────────────────────────────────────────────────────────
  InterstitialAd? _interstitialAd;
  RewardedAd? _rewardedAd;
  bool _isInitialized = false;
  final Completer<void> _initCompleter = Completer<void>();

  bool get hasCachedInterstitialAd => _interstitialAd != null;

  bool get isInterstitialReady => _interstitialAd != null;

  bool get isRewardedReady => _rewardedAd != null;

  // ── Initialization ───────────────────────────────────────────────────────

  /// Initializes the Mobile Ads SDK and fires consent in background.
  ///
  /// The SDK is initialized immediately without waiting for consent.
  /// Consent handling runs fire-and-forget so it never blocks startup.
  /// The SDK uses cached consent state internally and will serve
  /// non-personalized ads when consent is not yet determined.
  Future<void> init() async {
    if (_isInitialized) return;

    try {
      await MobileAds.instance.initialize();
      _isInitialized = true;
      _initCompleter.complete();

      if (kDebugMode) {
        debugPrint('[AdService] MobileAds initialized');
      }

      // Fire-and-forget: update consent info in background.
      // This never blocks ad loading — the SDK handles consent internally.
      _requestConsentInBackground();
    } catch (e) {
      // Mark initialized even on error so ad methods attempt to load.
      _isInitialized = true;
      if (!_initCompleter.isCompleted) _initCompleter.complete();
      if (kDebugMode) {
        debugPrint('[AdService] init error (SDK still marked ready): $e');
      }
    }
  }

  /// Returns a future that completes when the SDK is ready.
  /// Callers can await this before requesting ads.
  Future<void> get ready => _initCompleter.future;

  /// Updates UMP consent info in the background without blocking ad loading.
  void _requestConsentInBackground() {
    try {
      ConsentInformation.instance.requestConsentInfoUpdate(
        ConsentRequestParameters(tagForUnderAgeOfConsent: false),
        () {
          ConsentForm.loadAndShowConsentFormIfRequired((formError) {
            if (formError != null && kDebugMode) {
              debugPrint(
                '[AdService] consent form error: '
                '${formError.errorCode} ${formError.message}',
              );
            }
          });
        },
        (formError) {
          if (kDebugMode) {
            debugPrint(
              '[AdService] consent update error: '
              '${formError.errorCode} ${formError.message}',
            );
          }
        },
      );
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[AdService] background consent error: $e');
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BANNER AD
  // ═══════════════════════════════════════════════════════════════════════════

  /// Creates and returns a loaded [BannerAd] ready for [AdWidget].
  ///
  /// Returns `null` for premium users or on load failure.
  /// Automatically waits for SDK initialization if needed.
  Future<BannerAd?> getBannerAd() async {
    // Wait for SDK to be ready instead of silently failing.
    if (!_isInitialized) {
      await _initCompleter.future;
    }

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
  /// If the SDK isn't ready yet, this will schedule the load after init.
  void loadRewardedAd() {
    if (!_isInitialized) {
      // Schedule retry after init completes.
      _initCompleter.future.then((_) => loadRewardedAd());
      return;
    }

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
  /// Returns true if the ad was shown.
  bool showRewardedAd({required VoidCallback onReward}) {
    if (!_isInitialized) {
      if (kDebugMode) {
        debugPrint('[AdService] rewarded show skipped — not initialized');
      }
      return false;
    }

    if (PremiumService.instance.isPremium) {
      if (kDebugMode) {
        debugPrint('[AdService] rewarded show skipped — premium user');
      }
      return false;
    }

    if (_rewardedAd == null) {
      if (kDebugMode) {
        debugPrint('[AdService] no rewarded ad cached — loading now');
      }
      loadRewardedAd();
      return false;
    }

    final adToShow = _rewardedAd!;
    _rewardedAd = null;

    adToShow.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        if (kDebugMode) {
          debugPrint('[AdService] rewarded ad dismissed');
        }
        ad.dispose();
        loadRewardedAd(); // pre-load next
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        if (kDebugMode) {
          debugPrint('[AdService] rewarded show error: $error');
        }
        ad.dispose();
        loadRewardedAd();
      },
    );

    adToShow.show(
      onUserEarnedReward: (ad, reward) {
        if (kDebugMode) {
          debugPrint(
            '[AdService] user earned reward: ${reward.amount} ${reward.type}',
          );
        }
        onReward();
      },
    );

    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INTERSTITIAL AD — Between sections
  // ═══════════════════════════════════════════════════════════════════════════

  /// Pre-loads an interstitial ad.  No-op for premium users.
  /// If the SDK isn't ready yet, this will schedule the load after init.
  void loadInterstitialAd() {
    if (!_isInitialized) {
      // Schedule retry after init completes.
      _initCompleter.future.then((_) => loadInterstitialAd());
      return;
    }

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

  /// Shows the pre-loaded interstitial ad. Returns whether an ad was shown.
  ///
  /// [onDismissed] runs after the ad closes, or immediately when there is no ad
  /// to show. This lets transition screens continue safely.
  bool showInterstitialAd({VoidCallback? onShown, VoidCallback? onDismissed}) {
    void continueFlow() => onDismissed?.call();

    if (!_isInitialized) {
      if (kDebugMode) {
        debugPrint('[AdService] interstitial show skipped — not initialized');
      }
      continueFlow();
      return false;
    }

    if (PremiumService.instance.isPremium) {
      if (kDebugMode) {
        debugPrint('[AdService] interstitial show skipped — premium user');
      }
      continueFlow();
      return false;
    }

    final ad = _interstitialAd;
    if (ad == null) {
      if (kDebugMode) {
        debugPrint('[AdService] no interstitial ad cached — loading now');
      }
      loadInterstitialAd();
      continueFlow();
      return false;
    }

    _interstitialAd = null;
    ad.fullScreenContentCallback = FullScreenContentCallback(
      onAdShowedFullScreenContent: (ad) {
        if (kDebugMode) {
          debugPrint('[AdService] interstitial ad shown');
        }
        onShown?.call();
      },
      onAdDismissedFullScreenContent: (ad) {
        if (kDebugMode) {
          debugPrint('[AdService] interstitial ad dismissed');
        }
        ad.dispose();
        loadInterstitialAd(); // pre-load next
        continueFlow();
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        if (kDebugMode) {
          debugPrint('[AdService] interstitial show error: $error');
        }
        ad.dispose();
        loadInterstitialAd();
        continueFlow();
      },
    );

    ad.show();
    return true;
  }

  // ── Consent / Privacy Options ────────────────────────────────────────────

  /// Opens Google's privacy options form when available for the user's region.
  Future<void> showPrivacyOptionsForm() async {
    try {
      await ConsentForm.showPrivacyOptionsForm((formError) {
        if (formError != null && kDebugMode) {
          debugPrint(
            '[AdService] privacy options error: '
            '${formError.errorCode} ${formError.message}',
          );
        }
      });
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[AdService] privacy options show error: $e');
      }
    }
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
