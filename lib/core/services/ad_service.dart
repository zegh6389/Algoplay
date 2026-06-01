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

  // ── Retry constants ──────────────────────────────────────────────────────
  static const int _maxRetryAttempts = 3;
  static const Duration _initialRetryDelay = Duration(seconds: 5);
  static const Duration _maxRetryDelay = Duration(minutes: 2);

  // ── State ────────────────────────────────────────────────────────────────
  InterstitialAd? _interstitialAd;
  RewardedAd? _rewardedAd;
  bool _isInitialized = false;

  int _interstitialRetryCount = 0;
  int _rewardedRetryCount = 0;
  Timer? _interstitialRetryTimer;
  Timer? _rewardedRetryTimer;

  bool _isRewardedLoading = false;
  bool _isInterstitialLoading = false;

  /// Completer that resolves once [init] finishes — allows callers to await
  /// readiness instead of silently skipping ad loads.
  final Completer<void> _initCompleter = Completer<void>();

  /// A future that completes when the Mobile Ads SDK is ready.
  Future<void> get ready => _initCompleter.future;

  bool get hasCachedInterstitialAd => _interstitialAd != null;

  bool get isInterstitialReady => _interstitialAd != null;

  bool get isRewardedReady => _rewardedAd != null;

  /// Whether a rewarded ad is currently being loaded (useful for UI loading states).
  bool get isRewardedLoading => _isRewardedLoading;

  /// Whether an interstitial ad is currently being loaded.
  bool get isInterstitialLoading => _isInterstitialLoading;

  // ── Initialization ───────────────────────────────────────────────────────

  /// Initializes the Mobile Ads SDK.  Call once during app startup.
  ///
  /// The SDK is always initialized regardless of consent outcome so that ads
  /// can still be served (the SDK respects cached consent status internally).
  /// Consent and SDK init run concurrently to minimise wall-clock time.
  Future<void> init() async {
    if (_isInitialized) return;
    try {
      // Run consent request and SDK initialization concurrently.
      // Even if consent fails/times out, the SDK should still initialize —
      // it uses cached consent state and can serve limited ads.
      // Initialize SDK immediately — never blocks on consent.
      // Consent runs fire-and-forget in background so it never blocks.
      await MobileAds.instance.initialize();
      _requestConsentInBackground();

      _isInitialized = true;
      if (!_initCompleter.isCompleted) _initCompleter.complete();
      if (kDebugMode) {
        debugPrint('[AdService] MobileAds initialized');
      }
    } catch (e) {
      // Even on error, mark as initialized so ad methods can attempt to load.
      // Individual ad loads will fail gracefully if the SDK is unhealthy.
      _isInitialized = true;
      if (!_initCompleter.isCompleted) _initCompleter.complete();
      if (kDebugMode) {
        debugPrint('[AdService] init error (SDK still marked ready): $e');
      }
    }
  }

  /// Fire-and-forget: update consent info in background.
  /// This never blocks ad loading — the SDK handles consent internally.
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

  Future<bool> _collectConsentAsync() async {
    final completer = Completer<bool>();

    void completeWithCanRequestAds() {
      ConsentInformation.instance
          .canRequestAds()
          .then((canRequestAds) {
            if (!completer.isCompleted) {
              completer.complete(canRequestAds);
            }
          })
          .catchError((Object error) {
            if (kDebugMode) {
              debugPrint('[AdService] consent status error: $error');
            }
            if (!completer.isCompleted) {
              completer.complete(true);
            }
          });
    }

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
            completeWithCanRequestAds();
          }).catchError((Object error) {
            if (kDebugMode) {
              debugPrint('[AdService] consent form load error: $error');
            }
            completeWithCanRequestAds();
          });
        },
        (formError) {
          if (kDebugMode) {
            debugPrint(
              '[AdService] consent update error: '
              '${formError.errorCode} ${formError.message}',
            );
          }
          completeWithCanRequestAds();
        },
      );
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[AdService] consent request error: $e');
      }
      completeWithCanRequestAds();
    }

    return completer.future.timeout(
      const Duration(seconds: 5),
      onTimeout: () => true,
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RETRY HELPER
  // ═══════════════════════════════════════════════════════════════════════════

  Duration _retryDelay(int attempt) {
    // Exponential backoff: 5s, 10s, 20s, 40s... capped at 2 minutes
    final delay = _initialRetryDelay * (1 << attempt);
    return delay < _maxRetryDelay ? delay : _maxRetryDelay;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BANNER AD
  // ═══════════════════════════════════════════════════════════════════════════

  /// Creates and returns a loaded [BannerAd] ready for [AdWidget].
  ///
  /// Returns `null` for premium users or on load failure.
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
  /// Includes automatic retry with exponential backoff on failure.
  void loadRewardedAd() {
    if (!_isInitialized) {
      // SDK not ready yet — schedule load for after init completes
      _initCompleter.future.then((_) => loadRewardedAd());
      return;
    }

    if (PremiumService.instance.isPremium) {
      if (kDebugMode) {
        debugPrint('[AdService] rewarded load skipped — premium user');
      }
      return;
    }

    // Prevent duplicate loads
    if (_isRewardedLoading) {
      if (kDebugMode) {
        debugPrint('[AdService] rewarded load already in progress — skipping');
      }
      return;
    }

    _isRewardedLoading = true;
    _rewardedRetryTimer?.cancel();

    RewardedAd.load(
      adUnitId: _rewardedAdUnitId,
      request: const AdRequest(),
      rewardedAdLoadCallback: RewardedAdLoadCallback(
        onAdLoaded: (ad) {
          _rewardedAd = ad;
          _rewardedRetryCount = 0;
          _isRewardedLoading = false;
          if (kDebugMode) {
            debugPrint('[AdService] rewarded ad loaded');
          }
        },
        onAdFailedToLoad: (error) {
          _isRewardedLoading = false;
          if (kDebugMode) {
            debugPrint(
              '[AdService] rewarded ad failed to load (attempt ${_rewardedRetryCount + 1}/$_maxRetryAttempts): $error',
            );
          }
          _rewardedAd = null;
          _scheduleRewardedRetry();
        },
      ),
    );
  }

  void _scheduleRewardedRetry() {
    if (_rewardedRetryCount >= _maxRetryAttempts) {
      if (kDebugMode) {
        debugPrint(
          '[AdService] rewarded retry exhausted after $_maxRetryAttempts attempts',
        );
      }
      _rewardedRetryCount = 0;
      return;
    }

    final delay = _retryDelay(_rewardedRetryCount);
    _rewardedRetryCount++;

    if (kDebugMode) {
      debugPrint(
        '[AdService] rewarded retry #$_rewardedRetryCount in ${delay.inSeconds}s',
      );
    }

    _rewardedRetryTimer?.cancel();
    _rewardedRetryTimer = Timer(delay, () {
      if (!PremiumService.instance.isPremium && _isInitialized) {
        loadRewardedAd();
      }
    });
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
        debugPrint(
          '[AdService] no rewarded ad cached — '
          '${_isRewardedLoading ? "loading in progress" : "loading now"}',
        );
      }
      if (!_isRewardedLoading) {
        loadRewardedAd();
      }
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
  /// Includes automatic retry with exponential backoff on failure.
  void loadInterstitialAd() {
    if (!_isInitialized) {
      // SDK not ready yet — schedule load for after init completes
      _initCompleter.future.then((_) => loadInterstitialAd());
      return;
    }

    if (PremiumService.instance.isPremium) {
      if (kDebugMode) {
        debugPrint('[AdService] interstitial load skipped — premium user');
      }
      return;
    }

    // Prevent duplicate loads
    if (_isInterstitialLoading) {
      if (kDebugMode) {
        debugPrint(
          '[AdService] interstitial load already in progress — skipping',
        );
      }
      return;
    }

    _isInterstitialLoading = true;
    _interstitialRetryTimer?.cancel();

    InterstitialAd.load(
      adUnitId: _interstitialAdUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _interstitialAd = ad;
          _interstitialRetryCount = 0;
          _isInterstitialLoading = false;
          if (kDebugMode) {
            debugPrint('[AdService] interstitial ad loaded');
          }
        },
        onAdFailedToLoad: (error) {
          _isInterstitialLoading = false;
          if (kDebugMode) {
            debugPrint(
              '[AdService] interstitial failed to load (attempt ${_interstitialRetryCount + 1}/$_maxRetryAttempts): $error',
            );
          }
          _interstitialAd = null;
          _scheduleInterstitialRetry();
        },
      ),
    );
  }

  void _scheduleInterstitialRetry() {
    if (_interstitialRetryCount >= _maxRetryAttempts) {
      if (kDebugMode) {
        debugPrint(
          '[AdService] interstitial retry exhausted after $_maxRetryAttempts attempts',
        );
      }
      _interstitialRetryCount = 0;
      return;
    }

    final delay = _retryDelay(_interstitialRetryCount);
    _interstitialRetryCount++;

    if (kDebugMode) {
      debugPrint(
        '[AdService] interstitial retry #$_interstitialRetryCount in ${delay.inSeconds}s',
      );
    }

    _interstitialRetryTimer?.cancel();
    _interstitialRetryTimer = Timer(delay, () {
      if (!PremiumService.instance.isPremium && _isInitialized) {
        loadInterstitialAd();
      }
    });
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
        debugPrint(
          '[AdService] no interstitial ad cached — '
          '${_isInterstitialLoading ? "loading in progress" : "loading now"}',
        );
      }
      if (!_isInterstitialLoading) {
        loadInterstitialAd();
      }
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
    _interstitialRetryTimer?.cancel();
    _rewardedRetryTimer?.cancel();
    _interstitialAd?.dispose();
    _rewardedAd?.dispose();
    _interstitialAd = null;
    _rewardedAd = null;
    _isRewardedLoading = false;
    _isInterstitialLoading = false;
    if (kDebugMode) {
      debugPrint('[AdService] disposed');
    }
  }
}
