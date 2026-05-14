import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/theme/app_theme.dart';

class OnboardingPage extends ConsumerStatefulWidget {
  const OnboardingPage({super.key});

  @override
  ConsumerState<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends ConsumerState<OnboardingPage> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingStep> _steps = [
    const OnboardingStep(
      title: 'Welcome to Algoplay!',
      description: 'Master algorithms through interactive visualizations and games.',
      icon: Icons.play_arrow_rounded,
      color: AppColors.primary500,
    ),
    const OnboardingStep(
      title: 'See Algorithms in Action',
      description: 'Watch step-by-step executions of sorting, searching, and pathfinding algorithms.',
      icon: Icons.visibility,
      color: AppColors.catSearching,
    ),
    const OnboardingStep(
      title: 'Play to Learn',
      description: 'Test your skills in Battle Arena, Grid Escape, and other mini-games.',
      icon: Icons.sports_esports,
      color: AppColors.secondary500,
    ),
    const OnboardingStep(
      title: 'Track Your Progress',
      description: 'Earn XP, keep your daily streak alive, and level up your algorithm mastery.',
      icon: Icons.trending_up,
      color: AppColors.solarGold,
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentPage < _steps.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOutQuart,
      );
    } else {
      _finishOnboarding();
    }
  }

  Future<void> _finishOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('has_completed_onboarding', true);
    if (mounted) context.go('/home');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: Column(
          children: [
            // Top Row: Skip button
            Align(
              alignment: Alignment.topRight,
              child: TextButton(
                onPressed: _finishOnboarding,
                child: const Text(
                  'Skip',
                  style: TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.bold),
                ),
              ),
            ),

            // Main Content: PageView
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: (index) {
                  setState(() => _currentPage = index);
                },
                itemCount: _steps.length,
                itemBuilder: (context, index) {
                  final step = _steps[index];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Icon Container
                        Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            color: step.color.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(step.icon, size: 64, color: step.color),
                        ),
                        const SizedBox(height: AppSpacing.xxl),
                        // Title
                        Text(
                          step.title,
                          style: AppTypography.h1.copyWith(color: AppColors.textPrimary),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: AppSpacing.md),
                        // Description
                        Text(
                          step.description,
                          style: AppTypography.body.copyWith(color: AppColors.textSecondary),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),

            // Bottom Area: Indicators and Next/Start Button
            Padding(
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Page Indicators
                  Row(
                    children: List.generate(
                      _steps.length,
                      (index) => AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        margin: const EdgeInsets.only(right: 8),
                        height: 8,
                        width: _currentPage == index ? 24 : 8,
                        decoration: BoxDecoration(
                          color: _currentPage == index ? AppColors.primary500 : AppColors.sunken,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ),
                  ),
                  // Next/Start Button
                  ElevatedButton(
                    onPressed: _nextPage,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary500,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: AppRadius.mdBorder,
                      ),
                    ),
                    child: Text(
                      _currentPage == _steps.length - 1 ? 'Start Playing' : 'Next',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
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

class OnboardingStep {
  final String title;
  final String description;
  final IconData icon;
  final Color color;

  const OnboardingStep({
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
  });
}
