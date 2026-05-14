import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/theme/app_theme.dart';

/// Solar onboarding for first-time Algoplay users.
///
/// The first-run route and preference key are wired from SplashPage.
class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  static const seenKey = 'has_completed_onboarding';

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final PageController _pageController = PageController();
  int _currentIndex = 0;

  final List<_OnboardingSlide> _slides = const [
    _OnboardingSlide(
      title: 'Welcome to AlgoPlay!',
      description:
          'Master algorithms through interactive\nvisualizations and games.',
      artwork: _ArtworkType.welcome,
    ),
    _OnboardingSlide(
      title: 'See Algorithms in Action',
      description:
          'Watch step-by-step executions of sorting,\nsearching, and pathfinding algorithms.',
      artwork: _ArtworkType.visualize,
    ),
    _OnboardingSlide(
      title: 'Play to Learn',
      description:
          'Test your skills in Battle Arena,\nGrid Escape, and other mini-games.',
      artwork: _ArtworkType.play,
    ),
  ];

  Future<void> _finish() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(OnboardingPage.seenKey, true);

    if (!mounted) return;
    context.go('/home');
  }

  void _next() {
    if (_currentIndex == _slides.length - 1) {
      _finish();
      return;
    }

    _pageController.nextPage(
      duration: const Duration(milliseconds: 320),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: Stack(
          children: [
            PageView.builder(
              controller: _pageController,
              itemCount: _slides.length,
              onPageChanged: (index) => setState(() => _currentIndex = index),
              itemBuilder: (context, index) {
                return _OnboardingSlideView(slide: _slides[index]);
              },
            ),

            // Skip button matching the current onboarding screenshots.
            Positioned(
              top: AppSpacing.lg,
              right: AppSpacing.xl,
              child: TextButton(
                onPressed: _finish,
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.textMuted,
                  padding: EdgeInsets.zero,
                  minimumSize: const Size(56, 40),
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: Text(
                  'Skip',
                  style: AppTypography.h3.copyWith(
                    color: AppColors.textMuted,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),

            // Bottom dots + continue button.
            Positioned(
              left: AppSpacing.xl,
              right: AppSpacing.xl,
              bottom: AppSpacing.xl,
              child: Row(
                children: [
                  _OnboardingDots(
                    currentIndex: _currentIndex,
                    count: _slides.length,
                  ),
                  const Spacer(),
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 220),
                    child: _currentIndex == _slides.length - 1
                        ? ElevatedButton(
                            key: const ValueKey('start'),
                            onPressed: _finish,
                            style: ElevatedButton.styleFrom(
                              minimumSize: const Size(128, 48),
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.lg,
                                vertical: AppSpacing.md,
                              ),
                            ),
                            child: const Text('Get Started'),
                          )
                        : IconButton.filled(
                            key: const ValueKey('next'),
                            onPressed: _next,
                            icon: const Icon(Icons.arrow_forward_rounded),
                            style: IconButton.styleFrom(
                              backgroundColor: AppColors.primary500,
                              foregroundColor: AppColors.textInverse,
                              fixedSize: const Size(52, 52),
                              shape: RoundedRectangleBorder(
                                borderRadius: AppRadius.lgBorder,
                              ),
                            ),
                          ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

enum _ArtworkType { welcome, visualize, play }

class _OnboardingSlide {
  const _OnboardingSlide({
    required this.title,
    required this.description,
    required this.artwork,
  });

  final String title;
  final String description;
  final _ArtworkType artwork;
}

class _OnboardingSlideView extends StatelessWidget {
  const _OnboardingSlideView({required this.slide});

  final _OnboardingSlide slide;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxHeight < 720;
        final artworkHeight = (constraints.maxHeight * (compact ? 0.42 : 0.48))
            .clamp(compact ? 250.0 : 330.0, compact ? 330.0 : 430.0)
            .toDouble();
        final topGap = compact ? AppSpacing.xl : constraints.maxHeight * 0.08;
        final titleSize = compact ? 30.0 : 34.0;

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
          child: Column(
            children: [
              SizedBox(height: topGap),
              SizedBox(
                height: artworkHeight,
                width: double.infinity,
                child: FittedBox(
                  fit: BoxFit.contain,
                  child: SizedBox(
                    width: 360,
                    height: 360,
                    child: switch (slide.artwork) {
                      _ArtworkType.welcome => const _WelcomeArtwork(),
                      _ArtworkType.visualize => const _VisualizeArtwork(),
                      _ArtworkType.play => const _PlayArtwork(),
                    },
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              Text(
                slide.title,
                textAlign: TextAlign.center,
                style: AppTypography.display.copyWith(
                  fontSize: titleSize,
                  height: 1.08,
                  letterSpacing: -0.7,
                ),
              ),
              SizedBox(height: compact ? AppSpacing.md : AppSpacing.lg),
              Text(
                slide.description,
                textAlign: TextAlign.center,
                style: AppTypography.h3.copyWith(
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w400,
                  height: 1.45,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _OnboardingDots extends StatelessWidget {
  const _OnboardingDots({required this.currentIndex, required this.count});

  final int currentIndex;
  final int count;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(count, (index) {
        final selected = index == currentIndex;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          curve: Curves.easeOutCubic,
          margin: const EdgeInsets.only(right: AppSpacing.sm),
          width: selected ? 32 : 9,
          height: 9,
          decoration: BoxDecoration(
            color: selected ? AppColors.primary500 : AppColors.sunken,
            borderRadius: AppRadius.fullBorder,
          ),
        );
      }),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Artwork 1: Welcome to AlgoPlay
// ═══════════════════════════════════════════════════════════════════════════════

class _WelcomeArtwork extends StatelessWidget {
  const _WelcomeArtwork();

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      alignment: Alignment.center,
      children: [
        const _GlowCircle(size: 255),
        const Positioned(top: 22, left: 14, child: _CodeSnippetCard()),
        const Positioned(top: 82, right: 6, child: _GrowthChartCard()),
        const Positioned(left: 18, bottom: 96, child: _SortingBarsMini()),
        const Positioned(right: 24, bottom: 78, child: _NodeGraphCard()),
        _CircleIconButton(
          size: 136,
          icon: Icons.play_arrow_rounded,
          iconSize: 84,
          iconColor: AppColors.primary500,
          glowColor: AppColors.primary500.withValues(alpha: 0.18),
        ),
        Positioned(
          left: 0,
          top: 158,
          child: _Sparkle(color: AppColors.primary500.withValues(alpha: 0.55)),
        ),
        Positioned(
          right: 108,
          top: 44,
          child: _Sparkle(
            size: 16,
            color: AppColors.primary300.withValues(alpha: 0.85),
          ),
        ),
        Positioned(
          bottom: 68,
          child: Text(
            '</>',
            style: TextStyle(
              color: AppColors.primary300.withValues(alpha: 0.55),
              fontSize: 28,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
      ],
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Artwork 2: See Algorithms in Action
// ═══════════════════════════════════════════════════════════════════════════════

class _VisualizeArtwork extends StatelessWidget {
  const _VisualizeArtwork();

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      alignment: Alignment.center,
      children: [
        const _GlowCircle(size: 270),
        const Positioned(top: 28, left: 0, child: _BubbleSortBarsCard()),
        const Positioned(top: 30, right: 0, child: _BubbleSortStepCard()),
        CustomPaint(size: const Size(260, 250), painter: _DottedPathPainter()),
        const _EyeIcon(),
        const Positioned(left: 8, bottom: 92, child: _NodeGraphCard()),
        const Positioned(
          right: 0,
          bottom: 70,
          child: _CategoryProgressMiniCard(),
        ),
        Positioned(
          left: 28,
          top: 160,
          child: _Sparkle(
            size: 16,
            color: AppColors.primary300.withValues(alpha: 0.85),
          ),
        ),
        Positioned(
          right: 4,
          top: 164,
          child: _Sparkle(color: AppColors.primary500.withValues(alpha: 0.45)),
        ),
      ],
    );
  }
}

class _EyeIcon extends StatelessWidget {
  const _EyeIcon();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 174,
      height: 124,
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(90),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary500.withValues(alpha: 0.16),
            blurRadius: 32,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Center(
        child: Container(
          width: 78,
          height: 78,
          decoration: const BoxDecoration(
            color: AppColors.primary500,
            shape: BoxShape.circle,
          ),
          alignment: Alignment.center,
          child: Container(
            width: 38,
            height: 38,
            decoration: const BoxDecoration(
              color: AppColors.textPrimary,
              shape: BoxShape.circle,
            ),
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Artwork 3: Play to Learn
// ═══════════════════════════════════════════════════════════════════════════════

class _PlayArtwork extends StatelessWidget {
  const _PlayArtwork();

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      alignment: Alignment.center,
      children: [
        const _GlowCircle(size: 270),
        const Positioned(top: 36, left: 52, child: _XpMiniCard()),
        const Positioned(top: 42, right: 36, child: _MazeMiniCard()),
        const Positioned(left: 4, top: 172, child: _StarCountCard()),
        const Positioned(right: 12, top: 168, child: _StatsMiniCard()),
        const Positioned(bottom: 74, left: 24, child: _LevelMiniCard()),
        const Positioned(bottom: 76, right: 22, child: _RobotFlagMiniCard()),
        const _GameController(),
        Positioned(
          bottom: 92,
          child: Text(
            '</>',
            style: TextStyle(
              color: AppColors.primary300.withValues(alpha: 0.55),
              fontSize: 28,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        Positioned(
          left: 18,
          top: 122,
          child: _Sparkle(color: AppColors.primary500.withValues(alpha: 0.48)),
        ),
        Positioned(
          right: 22,
          top: 124,
          child: _Sparkle(color: AppColors.primary500.withValues(alpha: 0.45)),
        ),
      ],
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Reusable card and artwork widgets
// ═══════════════════════════════════════════════════════════════════════════════

class _GlowCircle extends StatelessWidget {
  const _GlowCircle({required this.size});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: AppColors.primary50.withValues(alpha: 0.85),
        shape: BoxShape.circle,
      ),
    );
  }
}

class _FloatingCard extends StatelessWidget {
  const _FloatingCard({
    required this.child,
    this.width,
    this.height,
    this.padding = const EdgeInsets.all(AppSpacing.md),
  });

  final Widget child;
  final double? width;
  final double? height;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      padding: padding,
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: AppRadius.lgBorder,
        boxShadow: AppShadows.md,
      ),
      child: child,
    );
  }
}

class _CircleIconButton extends StatelessWidget {
  const _CircleIconButton({
    required this.size,
    required this.icon,
    required this.iconSize,
    required this.iconColor,
    required this.glowColor,
  });

  final double size;
  final IconData icon;
  final double iconSize;
  final Color iconColor;
  final Color glowColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: AppColors.card,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(color: glowColor, blurRadius: 35, spreadRadius: 6),
        ],
      ),
      child: Icon(icon, color: iconColor, size: iconSize),
    );
  }
}

class _Sparkle extends StatelessWidget {
  const _Sparkle({this.size = 22, required this.color});

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Icon(Icons.auto_awesome_rounded, size: size, color: color);
  }
}

class _CodeSnippetCard extends StatelessWidget {
  const _CodeSnippetCard();

  @override
  Widget build(BuildContext context) {
    return _FloatingCard(
      width: 164,
      height: 164,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              _TinyDot(color: AppColors.error600),
              SizedBox(width: 7),
              _TinyDot(color: AppColors.solarGold),
              SizedBox(width: 7),
              _TinyDot(color: AppColors.success600),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Text('for i in range(n):', style: _monoStyle()),
          const SizedBox(height: AppSpacing.xs),
          Padding(
            padding: const EdgeInsets.only(left: 22),
            child: Text('for j in range(0,', style: _monoStyle()),
          ),
          const SizedBox(height: AppSpacing.xs),
          Padding(
            padding: const EdgeInsets.only(left: 45),
            child: Text('n-i-1):', style: _monoStyle()),
          ),
          const SizedBox(height: AppSpacing.sm),
          _FakeLine(width: 80, color: AppColors.primary100),
          const SizedBox(height: 5),
          _FakeLine(width: 45, color: AppColors.primary100),
        ],
      ),
    );
  }
}

TextStyle _monoStyle({
  Color color = AppColors.textPrimary,
  double size = 13,
  FontWeight weight = FontWeight.w700,
}) {
  return TextStyle(
    fontFamily: 'SpaceMono',
    fontSize: size,
    fontWeight: weight,
    color: color,
    height: 1.2,
  );
}

class _TinyDot extends StatelessWidget {
  const _TinyDot({required this.color});

  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 8,
      height: 8,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
    );
  }
}

class _FakeLine extends StatelessWidget {
  const _FakeLine({required this.width, required this.color, this.height = 6});

  final double width;
  final double height;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: color,
        borderRadius: AppRadius.fullBorder,
      ),
    );
  }
}

class _GrowthChartCard extends StatelessWidget {
  const _GrowthChartCard();

  @override
  Widget build(BuildContext context) {
    return const _FloatingCard(
      width: 150,
      height: 94,
      padding: EdgeInsets.zero,
      child: CustomPaint(painter: _GrowthChartPainter()),
    );
  }
}

class _SortingBarsMini extends StatelessWidget {
  const _SortingBarsMini();

  @override
  Widget build(BuildContext context) {
    const values = [38.0, 62.0, 118.0, 50.0, 74.0, 32.0];

    return SizedBox(
      width: 144,
      height: 126,
      child: Stack(
        alignment: Alignment.bottomCenter,
        children: [
          Container(
            width: 130,
            height: 8,
            decoration: BoxDecoration(
              color: AppColors.sunken,
              borderRadius: AppRadius.fullBorder,
            ),
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: List.generate(values.length, (index) {
              final isCompare = index < 2;
              return Container(
                width: 16,
                height: values[index],
                margin: const EdgeInsets.symmetric(horizontal: 3),
                decoration: BoxDecoration(
                  color: isCompare
                      ? AppColors.catSorting
                      : AppColors.primary500,
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(AppRadius.sm),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color:
                          (isCompare
                                  ? AppColors.catSorting
                                  : AppColors.primary500)
                              .withValues(alpha: 0.20),
                      blurRadius: 14,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}

class _NodeGraphCard extends StatelessWidget {
  const _NodeGraphCard();

  @override
  Widget build(BuildContext context) {
    return const _FloatingCard(
      width: 126,
      height: 96,
      padding: EdgeInsets.zero,
      child: CustomPaint(painter: _NodeGraphPainter()),
    );
  }
}

class _BubbleSortBarsCard extends StatelessWidget {
  const _BubbleSortBarsCard();

  @override
  Widget build(BuildContext context) {
    const values = [34, 64, 25, 12, 22, 11, 90, 45, 78, 33];

    return _FloatingCard(
      width: 184,
      height: 112,
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: List.generate(values.length, (index) {
          final isCompare = index < 2;
          return Expanded(
            child: Container(
              height: values[index] * 0.75,
              margin: const EdgeInsets.symmetric(horizontal: 2),
              decoration: BoxDecoration(
                color: isCompare ? AppColors.catSorting : AppColors.primary500,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(AppRadius.sm),
                ),
              ),
              alignment: Alignment.center,
              child: FittedBox(
                child: Text(
                  '${values[index]}',
                  style: const TextStyle(
                    color: AppColors.textInverse,
                    fontWeight: FontWeight.w800,
                    fontSize: 10,
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}

class _BubbleSortStepCard extends StatelessWidget {
  const _BubbleSortStepCard();

  @override
  Widget build(BuildContext context) {
    return _FloatingCard(
      width: 150,
      height: 190,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Bubble Sort', style: _monoStyle(size: 14)),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Step 4 of 69',
            style: AppTypography.caption.copyWith(
              color: AppColors.textMuted,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Row(
            children: const [
              _FakeLine(width: 54, height: 5, color: AppColors.primary500),
              _FakeLine(width: 44, height: 5, color: AppColors.primary100),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          RichText(
            text: TextSpan(
              style: _monoStyle(size: 11),
              children: [
                TextSpan(
                  text: 'if ',
                  style: _monoStyle(color: AppColors.catSorting, size: 11),
                ),
                const TextSpan(text: 'arr[j] > arr[j + 1]:'),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          const _FakeLine(width: 78, color: AppColors.primary100),
          const SizedBox(height: 5),
          const _FakeLine(width: 55, color: AppColors.primary100),
        ],
      ),
    );
  }
}

class _CategoryProgressMiniCard extends StatelessWidget {
  const _CategoryProgressMiniCard();

  @override
  Widget build(BuildContext context) {
    return _FloatingCard(
      width: 170,
      height: 170,
      child: Column(
        children: const [
          _ProgressMiniRow(
            label: 'Sorting',
            count: '4/12',
            progress: 0.45,
            active: true,
          ),
          SizedBox(height: AppSpacing.md),
          _ProgressMiniRow(label: 'Searching', count: '0/10', progress: 0),
          SizedBox(height: AppSpacing.md),
          _ProgressMiniRow(label: 'Graphs', count: '0/10', progress: 0),
        ],
      ),
    );
  }
}

class _ProgressMiniRow extends StatelessWidget {
  const _ProgressMiniRow({
    required this.label,
    required this.count,
    required this.progress,
    this.active = false,
  });

  final String label;
  final String count;
  final double progress;
  final bool active;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(
          active ? Icons.check_circle : Icons.circle_outlined,
          size: 17,
          color: active ? AppColors.primary500 : AppColors.textMuted,
        ),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      label,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  Text(
                    count,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 5),
              ClipRRect(
                borderRadius: AppRadius.fullBorder,
                child: LinearProgressIndicator(
                  minHeight: 5,
                  value: progress,
                  backgroundColor: AppColors.sunken,
                  color: AppColors.primary500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _XpMiniCard extends StatelessWidget {
  const _XpMiniCard();

  @override
  Widget build(BuildContext context) {
    return _FloatingCard(
      width: 142,
      height: 132,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          const Positioned(
            top: -34,
            left: 48,
            child: CircleAvatar(
              radius: 22,
              backgroundColor: AppColors.card,
              child: Icon(
                Icons.emoji_events_rounded,
                color: AppColors.primary500,
              ),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              Text(
                'XP Gained',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
              SizedBox(height: AppSpacing.sm),
              Text(
                '150',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                ),
              ),
              SizedBox(height: AppSpacing.sm),
              Row(
                children: [
                  _FakeLine(width: 44, height: 5, color: AppColors.primary500),
                  _FakeLine(width: 66, height: 5, color: AppColors.primary100),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MazeMiniCard extends StatelessWidget {
  const _MazeMiniCard();

  @override
  Widget build(BuildContext context) {
    return const _FloatingCard(
      width: 128,
      height: 108,
      padding: EdgeInsets.zero,
      child: CustomPaint(painter: _MazePainter()),
    );
  }
}

class _StarCountCard extends StatelessWidget {
  const _StarCountCard();

  @override
  Widget build(BuildContext context) {
    return _FloatingCard(
      width: 62,
      height: 84,
      padding: const EdgeInsets.all(AppSpacing.sm),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: const [
          Icon(Icons.star_rounded, color: AppColors.solarAmber, size: 32),
          Text(
            '3',
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 20,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _StatsMiniCard extends StatelessWidget {
  const _StatsMiniCard();

  @override
  Widget build(BuildContext context) {
    return _FloatingCard(
      width: 76,
      height: 76,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: const [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              _TinyBar(height: 20, color: AppColors.primary500),
              SizedBox(width: 5),
              _TinyBar(height: 34, color: AppColors.solarAmber),
              SizedBox(width: 5),
              _TinyBar(height: 26, color: AppColors.success600),
            ],
          ),
          SizedBox(height: AppSpacing.sm),
          _FakeLine(width: 42, color: AppColors.primary100),
        ],
      ),
    );
  }
}

class _TinyBar extends StatelessWidget {
  const _TinyBar({required this.height, required this.color});

  final double height;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 11,
      height: height,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(3),
      ),
    );
  }
}

class _LevelMiniCard extends StatelessWidget {
  const _LevelMiniCard();

  @override
  Widget build(BuildContext context) {
    return _FloatingCard(
      width: 142,
      height: 128,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Row(
            children: [
              Icon(Icons.star_rounded, color: AppColors.solarAmber, size: 24),
              Icon(Icons.star_rounded, color: AppColors.solarAmber, size: 24),
              Icon(Icons.star_rounded, color: AppColors.sunken, size: 24),
            ],
          ),
          SizedBox(height: AppSpacing.sm),
          Text(
            'Level 4',
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          SizedBox(height: AppSpacing.sm),
          Row(
            children: [
              _FakeLine(width: 72, height: 5, color: AppColors.primary500),
              _FakeLine(width: 42, height: 5, color: AppColors.primary100),
            ],
          ),
        ],
      ),
    );
  }
}

class _RobotFlagMiniCard extends StatelessWidget {
  const _RobotFlagMiniCard();

  @override
  Widget build(BuildContext context) {
    return const _FloatingCard(
      width: 140,
      height: 88,
      padding: EdgeInsets.zero,
      child: CustomPaint(painter: _RobotFlagPainter()),
    );
  }
}

class _GameController extends StatelessWidget {
  const _GameController();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 255,
      height: 158,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: 232,
            height: 128,
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(58),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary500.withValues(alpha: 0.16),
                  blurRadius: 30,
                  offset: const Offset(0, 18),
                ),
              ],
            ),
          ),
          const Positioned(
            left: 52,
            child: Icon(
              Icons.add_rounded,
              color: AppColors.primary500,
              size: 58,
            ),
          ),
          const Positioned(
            right: 56,
            top: 50,
            child: Row(
              children: [
                _ControllerDot(),
                SizedBox(width: 12),
                _ControllerDot(),
              ],
            ),
          ),
          const Positioned(right: 73, top: 25, child: _ControllerDot()),
          const Positioned(right: 73, bottom: 25, child: _ControllerDot()),
          const Positioned(
            bottom: 55,
            child: Row(
              children: [
                _FakeLine(width: 26, height: 8, color: AppColors.primary500),
                SizedBox(width: AppSpacing.md),
                _FakeLine(width: 26, height: 8, color: AppColors.primary500),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ControllerDot extends StatelessWidget {
  const _ControllerDot();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 22,
      height: 22,
      decoration: const BoxDecoration(
        color: AppColors.primary500,
        shape: BoxShape.circle,
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Custom painters
// ═══════════════════════════════════════════════════════════════════════════════

class _GrowthChartPainter extends CustomPainter {
  const _GrowthChartPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final gridPaint = Paint()
      ..color = const Color(0xFFE8EEF7)
      ..strokeWidth = 1;

    for (double x = 18; x < size.width - 8; x += 24) {
      canvas.drawLine(Offset(x, 12), Offset(x, size.height - 12), gridPaint);
    }
    for (double y = 16; y < size.height - 8; y += 18) {
      canvas.drawLine(Offset(14, y), Offset(size.width - 12, y), gridPaint);
    }

    final bluePath = Path()
      ..moveTo(16, size.height - 18)
      ..cubicTo(
        42,
        size.height - 34,
        64,
        size.height - 36,
        82,
        size.height - 45,
      )
      ..cubicTo(
        100,
        size.height - 58,
        114,
        size.height - 26,
        size.width - 18,
        size.height - 38,
      );

    canvas.drawPath(
      bluePath,
      Paint()
        ..color = AppColors.primary500
        ..strokeWidth = 4
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round,
    );

    _drawDashedLine(
      canvas,
      Offset(16, size.height - 16),
      Offset(size.width - 18, 20),
      AppColors.success600,
    );
    _drawDashedLine(
      canvas,
      Offset(16, size.height - 18),
      Offset(size.width - 18, size.height - 40),
      AppColors.secondary500,
    );
    _drawDashedLine(
      canvas,
      Offset(16, size.height - 14),
      Offset(size.width - 18, size.height - 26),
      AppColors.catDp,
    );
  }

  void _drawDashedLine(Canvas canvas, Offset start, Offset end, Color color) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;

    const dash = 7.0;
    const gap = 5.0;
    final distance = (end - start).distance;
    final direction = (end - start) / distance;

    double current = 0;
    while (current < distance) {
      final from = start + direction * current;
      final to = start + direction * math.min(current + dash, distance);
      canvas.drawLine(from, to, paint);
      current += dash + gap;
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _NodeGraphPainter extends CustomPainter {
  const _NodeGraphPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final points = [
      Offset(size.width * .25, size.height * .25),
      Offset(size.width * .70, size.height * .25),
      Offset(size.width * .25, size.height * .72),
      Offset(size.width * .72, size.height * .72),
      Offset(size.width * .50, size.height * .52),
    ];

    final baseLine = Paint()
      ..color = const Color(0xFFCBD5E1)
      ..strokeWidth = 2.2
      ..strokeCap = StrokeCap.round;
    final activeLine = Paint()
      ..color = AppColors.primary500
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;

    canvas.drawLine(points[0], points[1], baseLine);
    canvas.drawLine(points[0], points[2], baseLine);
    canvas.drawLine(points[1], points[4], baseLine);
    canvas.drawLine(points[4], points[2], activeLine);
    canvas.drawLine(points[4], points[3], activeLine);

    void node(Offset offset, Color color) {
      canvas.drawCircle(offset, 10, Paint()..color = color);
    }

    node(points[0], AppColors.primary500);
    node(points[1], const Color(0xFFD8E0EB));
    node(points[2], const Color(0xFFD8E0EB));
    node(points[4], const Color(0xFFD8E0EB));
    node(points[3], AppColors.catSorting);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _DottedPathPainter extends CustomPainter {
  const _DottedPathPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final path1 = Path()
      ..moveTo(16, 80)
      ..cubicTo(34, 135, 70, 130, 90, 160);

    final path2 = Path()
      ..moveTo(114, 214)
      ..cubicTo(160, 230, 198, 205, 230, 170);

    _drawDashedPath(canvas, path1);
    _drawDashedPath(canvas, path2);
  }

  void _drawDashedPath(Canvas canvas, Path path) {
    final paint = Paint()
      ..color = AppColors.primary500.withValues(alpha: 0.75)
      ..strokeWidth = 2.6
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    for (final metric in path.computeMetrics()) {
      double distance = 0;
      while (distance < metric.length) {
        final segment = metric.extractPath(distance, distance + 8);
        canvas.drawPath(segment, paint);
        distance += 15;
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _MazePainter extends CustomPainter {
  const _MazePainter();

  @override
  void paint(Canvas canvas, Size size) {
    final grid = Paint()
      ..color = const Color(0xFFE3EAF5)
      ..strokeWidth = 1;

    for (double x = 18; x <= size.width - 18; x += 14) {
      canvas.drawLine(Offset(x, 16), Offset(x, size.height - 16), grid);
    }
    for (double y = 16; y <= size.height - 16; y += 14) {
      canvas.drawLine(Offset(18, y), Offset(size.width - 18, y), grid);
    }

    final pathPaint = Paint()
      ..color = AppColors.primary500
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final path = Path()
      ..moveTo(24, size.height - 22)
      ..lineTo(24, size.height - 62)
      ..lineTo(68, size.height - 62)
      ..lineTo(68, 36)
      ..lineTo(104, 36)
      ..lineTo(104, 23);

    canvas.drawPath(path, pathPaint);
    canvas.drawCircle(
      Offset(24, size.height - 22),
      6,
      Paint()..color = AppColors.primary500,
    );

    canvas.drawRect(
      Rect.fromLTWH(76, 56, 18, 18),
      Paint()..color = AppColors.catSorting.withValues(alpha: 0.78),
    );

    canvas.drawPath(
      Path()
        ..moveTo(104, 23)
        ..lineTo(118, 29)
        ..lineTo(104, 36)
        ..close(),
      Paint()..color = AppColors.primary500,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _RobotFlagPainter extends CustomPainter {
  const _RobotFlagPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final body = RRect.fromRectAndRadius(
      Rect.fromCenter(
        center: Offset(size.width * .44, size.height * .54),
        width: 58,
        height: 46,
      ),
      const Radius.circular(18),
    );
    canvas.drawRRect(body, Paint()..color = AppColors.primary50);

    final face = RRect.fromRectAndRadius(
      Rect.fromCenter(
        center: Offset(size.width * .44, size.height * .54),
        width: 43,
        height: 28,
      ),
      const Radius.circular(9),
    );
    canvas.drawRRect(face, Paint()..color = AppColors.textPrimary);

    final eyePaint = Paint()
      ..color = AppColors.primary500
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(
        center: Offset(size.width * .36, size.height * .52),
        radius: 6,
      ),
      3.2,
      2.7,
      false,
      eyePaint,
    );
    canvas.drawArc(
      Rect.fromCircle(
        center: Offset(size.width * .52, size.height * .52),
        radius: 6,
      ),
      3.2,
      2.7,
      false,
      eyePaint,
    );

    final flagPole = Paint()
      ..color = AppColors.primary300
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;

    canvas.drawLine(
      Offset(size.width * .70, 20),
      Offset(size.width * .70, size.height - 20),
      flagPole,
    );

    canvas.drawPath(
      Path()
        ..moveTo(size.width * .70, 22)
        ..lineTo(size.width * .95, 31)
        ..lineTo(size.width * .70, 43)
        ..close(),
      Paint()..color = AppColors.catSorting,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
