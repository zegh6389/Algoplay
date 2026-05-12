import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

import '../../core/services/ad_service.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Banner-ad wrapper widget.
///
/// Shows a banner ad at the bottom of the screen for **free** users.
/// If the user is premium, or the ad fails to load, the [child] is shown
/// fullscreen without any ad chrome.
///
/// Usage:
/// ```dart
/// BannerAdWrapper(
///   isPremium: ref.watch(premiumProvider),
///   child: const MyScreen(),
/// )
/// ```
// ═══════════════════════════════════════════════════════════════════════════════
class BannerAdWrapper extends StatefulWidget {
  const BannerAdWrapper({
    super.key,
    required this.child,
    this.isPremium = false,
  });

  /// The screen content that sits above the banner.
  final Widget child;

  /// When `true` the banner is hidden entirely.
  final bool isPremium;

  @override
  State<BannerAdWrapper> createState() => _BannerAdWrapperState();
}

class _BannerAdWrapperState extends State<BannerAdWrapper> {
  BannerAd? _bannerAd;

  @override
  void initState() {
    super.initState();
    if (!widget.isPremium) {
      _loadAd();
    }
  }

  @override
  void didUpdateWidget(covariant BannerAdWrapper oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.isPremium && !widget.isPremium) {
      // Transitioned from premium → free; start showing ads.
      _loadAd();
    } else if (!oldWidget.isPremium && widget.isPremium) {
      // Transitioned from free → premium; tear down the ad.
      _disposeAd();
    }
  }

  Future<void> _loadAd() async {
    _disposeAd();

    final banner = await AdService.instance.getBannerAd();
    if (banner != null && mounted) {
      setState(() => _bannerAd = banner);
    }
  }

  void _disposeAd() {
    _bannerAd?.dispose();
    _bannerAd = null;
  }

  @override
  void dispose() {
    _disposeAd();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Premium users never see ads.
    if (widget.isPremium) {
      return widget.child;
    }

    // If the ad hasn't loaded (yet or at all), just show content.
    if (_bannerAd == null) {
      return widget.child;
    }

    return Column(
      children: [
        Expanded(child: widget.child),
        SafeArea(
          top: false,
          child: SizedBox(
            width: _bannerAd!.size.width.toDouble(),
            height: _bannerAd!.size.height.toDouble(),
            child: AdWidget(ad: _bannerAd!),
          ),
        ),
      ],
    );
  }
}
