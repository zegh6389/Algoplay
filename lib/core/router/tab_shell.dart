import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:algoplay/core/services/ad_service.dart';
import 'package:algoplay/core/services/feature_tour_service.dart';
import 'package:algoplay/shared/providers/feature_tour_provider.dart';
import 'package:algoplay/shared/providers/premium_provider.dart';
import 'package:algoplay/shared/widgets/banner_ad_wrapper.dart';
import '../../features/guided_tour/algoplay_tour_keys.dart';
import '../../features/guided_tour/guided_tour_controller.dart';

class TabShellWidget extends ConsumerStatefulWidget {
  final StatefulNavigationShell navigationShell;

  const TabShellWidget({super.key, required this.navigationShell});

  @override
  ConsumerState<TabShellWidget> createState() => _TabShellWidgetState();
}

class _TabShellWidgetState extends ConsumerState<TabShellWidget> {
  int _tabSwitchCount = 0;

  @override
  void initState() {
    super.initState();
    // Pre-load interstitial on app start
    AdService.instance.loadInterstitialAd();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _maybeStartGuidedTour();
    });
  }

  Future<void> _maybeStartGuidedTour() async {
    final hasSeenTour = await FeatureTourService.instance.hasSeenMainTour();
    if (!mounted || hasSeenTour) return;

    // Always start the first-run tour from the Lessons tab (branch 0).
    widget.navigationShell.goBranch(0, initialLocation: true);

    // Poll until all tab bar keys have a painted context. The double
    // post-frame approach is not reliable because goBranch() switches the
    // shell synchronously but the TabBarView children are built lazily.
    _pollAndShowTour(const Duration(milliseconds: 50), maxAttempts: 20);
  }

  int _tourPollCount = 0;

  Future<void> _pollAndShowTour(
    Duration interval, {
    required int maxAttempts,
  }) async {
    if (!mounted || _tourPollCount >= maxAttempts) {
      _tourPollCount = 0;
      return;
    }

    _tourPollCount++;

    final allReady = [
      AlgoPlayTourKeys.lessonsTabKey,
      AlgoPlayTourKeys.exploreTabKey,
      AlgoPlayTourKeys.playTabKey,
      AlgoPlayTourKeys.statsTabKey,
      AlgoPlayTourKeys.profileTabKey,
    ].every((key) => key.currentContext != null);

    if (allReady) {
      _tourPollCount = 0;
      if (mounted) _showGuidedTour();
      return;
    }

    await Future.delayed(interval);
    if (mounted) _pollAndShowTour(interval, maxAttempts: maxAttempts);
  }

  void _showGuidedTour() {
    GuidedTourController().showTour(
      context,
      onTourStarted: () {
        if (!mounted) return;
        ref.read(featureTourActiveProvider.notifier).state = true;
      },
      onTourEnded: () {
        if (!mounted) return;
        ref.read(featureTourActiveProvider.notifier).state = false;
      },
    );
  }

  void _onTabTap(int index) {
    if (index != widget.navigationShell.currentIndex) {
      _tabSwitchCount++;
      // Show interstitial every 4th tab switch
      if (_tabSwitchCount % 4 == 0) {
        final isPremium = ref.read(premiumProvider);
        final tourActive = ref.read(featureTourActiveProvider);
        if (!isPremium && !tourActive) {
          AdService.instance.showInterstitialAd();
        }
      }
    }
    widget.navigationShell.goBranch(
      index,
      initialLocation: index == widget.navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isPremium = ref.watch(premiumProvider);

    return Scaffold(
      body: BannerAdWrapper(
        isPremium: isPremium,
        child: widget.navigationShell,
      ),
      bottomNavigationBar: SafeArea(
        top: false,
        child: _AnimatedBottomNavBar(
          currentIndex: widget.navigationShell.currentIndex,
          onTap: _onTabTap,
        ),
      ),
    );
  }
}

class _AnimatedBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  static const _tabs = <_TabConfig>[
    _TabConfig(icon: Icons.menu_book, label: 'Lessons'),
    _TabConfig(icon: Icons.explore, label: 'Explore'),
    _TabConfig(icon: Icons.sports_esports, label: 'Play'),
    _TabConfig(icon: Icons.bar_chart, label: 'Stats'),
    _TabConfig(icon: Icons.person, label: 'Profile'),
  ];

  const _AnimatedBottomNavBar({
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      height: 64,
      decoration: BoxDecoration(
        color: colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: List.generate(_tabs.length, (index) {
          final tab = _tabs[index];
          final isSelected = index == currentIndex;

          return _SpringTabButton(
            key: AlgoPlayTourKeys.tabKeyForIndex(index),
            isSelected: isSelected,
            onTap: () => onTap(index),
            icon: tab.icon,
            label: tab.label,
            activeColor: colorScheme.primary,
            inactiveColor: colorScheme.onSurfaceVariant,
          );
        }),
      ),
    );
  }
}

class _TabConfig {
  final IconData icon;
  final String label;
  const _TabConfig({required this.icon, required this.label});
}

class _SpringTabButton extends StatefulWidget {
  final bool isSelected;
  final VoidCallback onTap;
  final IconData icon;
  final String label;
  final Color activeColor;
  final Color inactiveColor;

  const _SpringTabButton({
    super.key,
    required this.isSelected,
    required this.onTap,
    required this.icon,
    required this.label,
    required this.activeColor,
    required this.inactiveColor,
  });

  @override
  State<_SpringTabButton> createState() => _SpringTabButtonState();
}

class _SpringTabButtonState extends State<_SpringTabButton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scaleAnimation;
  late final Animation<double> _bounceAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );

    // Spring-like bounce using a custom curve
    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween(
          begin: 1.0,
          end: 1.3,
        ).chain(CurveTween(curve: Curves.easeOutCubic)),
        weight: 30,
      ),
      TweenSequenceItem(
        tween: Tween(
          begin: 1.3,
          end: 0.9,
        ).chain(CurveTween(curve: Curves.easeInOut)),
        weight: 25,
      ),
      TweenSequenceItem(
        tween: Tween(
          begin: 0.9,
          end: 1.05,
        ).chain(CurveTween(curve: Curves.easeOut)),
        weight: 25,
      ),
      TweenSequenceItem(
        tween: Tween(
          begin: 1.05,
          end: 1.0,
        ).chain(CurveTween(curve: Curves.easeOut)),
        weight: 20,
      ),
    ]).animate(_controller);

    // Vertical bounce (icon jumps up then settles)
    _bounceAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween(
          begin: 0.0,
          end: -8.0,
        ).chain(CurveTween(curve: Curves.easeOutCubic)),
        weight: 35,
      ),
      TweenSequenceItem(
        tween: Tween(
          begin: -8.0,
          end: 2.0,
        ).chain(CurveTween(curve: Curves.easeInOut)),
        weight: 30,
      ),
      TweenSequenceItem(
        tween: Tween(
          begin: 2.0,
          end: 0.0,
        ).chain(CurveTween(curve: Curves.easeOut)),
        weight: 35,
      ),
    ]).animate(_controller);

    if (widget.isSelected) {
      _controller.value = 1.0;
    }
  }

  @override
  void didUpdateWidget(covariant _SpringTabButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isSelected && !oldWidget.isSelected) {
      _controller.forward(from: 0.0);
    } else if (!widget.isSelected) {
      _controller.reverse();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = widget.isSelected ? widget.activeColor : widget.inactiveColor;

    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: widget.onTap,
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Transform.translate(
              offset: Offset(0, _bounceAnimation.value),
              child: Transform.scale(
                scale: _scaleAnimation.value,
                child: child,
              ),
            );
          },
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(widget.icon, color: color, size: 24),
              const SizedBox(height: 4),
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 200),
                style: TextStyle(
                  fontSize: widget.isSelected ? 12 : 11,
                  fontWeight: widget.isSelected
                      ? FontWeight.w600
                      : FontWeight.w500,
                  color: color,
                ),
                child: Text(widget.label),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
