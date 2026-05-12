import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

import '../../core/services/ad_service.dart';
import '../../core/theme/app_theme.dart';
import '../providers/premium_provider.dart';

/// Inline banner placement for scrollable lesson content.
///
/// This is intentionally not a sticky bottom banner. Lesson reader screens have
/// bottom navigation/CTA controls, and AdMob guidance discourages banners
/// immediately next to next/navigation buttons because it can drive accidental
/// clicks.
class InlineBannerAd extends ConsumerStatefulWidget {
  const InlineBannerAd({
    super.key,
    this.margin = const EdgeInsets.symmetric(vertical: AppSpacing.lg),
  });

  final EdgeInsetsGeometry margin;

  @override
  ConsumerState<InlineBannerAd> createState() => _InlineBannerAdState();
}

class _InlineBannerAdState extends ConsumerState<InlineBannerAd> {
  BannerAd? _bannerAd;
  bool _hasRequestedAd = false;

  @override
  void initState() {
    super.initState();
    if (!ref.read(adFreeProvider)) {
      _loadAd();
    }
  }

  Future<void> _loadAd() async {
    _hasRequestedAd = true;
    _disposeAd();

    final banner = await AdService.instance.getBannerAd();
    if (!mounted) {
      banner?.dispose();
      return;
    }

    if (banner != null) {
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
    final isAdFree = ref.watch(adFreeProvider);
    if (isAdFree) {
      if (_bannerAd != null || _hasRequestedAd) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (!mounted) return;
          setState(() {
            _disposeAd();
            _hasRequestedAd = false;
          });
        });
      }
      return const SizedBox.shrink();
    }

    final banner = _bannerAd;
    if (banner == null) {
      if (!_hasRequestedAd) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted && !_hasRequestedAd) {
            _loadAd();
          }
        });
      }
      return const SizedBox.shrink();
    }

    return Padding(
      padding: widget.margin,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Advertisement',
            style: AppTypography.caption.copyWith(
              color: AppColors.textMuted,
              fontSize: 11,
              letterSpacing: 0.2,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Container(
            width: banner.size.width.toDouble(),
            height: banner.size.height.toDouble(),
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppColors.card,
              border: Border.all(color: AppColors.sunken),
              borderRadius: AppRadius.smBorder,
            ),
            clipBehavior: Clip.antiAlias,
            child: AdWidget(ad: banner),
          ),
        ],
      ),
    );
  }
}
