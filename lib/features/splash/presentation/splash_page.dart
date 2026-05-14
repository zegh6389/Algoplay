import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  Timer? _navigationTimer;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2400),
    )..forward(from: 0.0);

    _navigationTimer = Timer(const Duration(milliseconds: 3200), () {
      if (mounted) context.go('/home');
    });
  }

  @override
  void dispose() {
    _navigationTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFFFFFF),
      body: Stack(
        fit: StackFit.expand,
        children: [
          // User's splash image as background
          Image.asset(
            'assets/images/splash-screen.png',
            fit: BoxFit.cover,
            alignment: Alignment.center,
          ),
          // Bottom loading overlay
          SafeArea(
            child: Align(
              alignment: Alignment.bottomCenter,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(48, 0, 48, 48),
                child: AnimatedBuilder(
                  animation: _controller,
                  builder: (context, _) {
                    return Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _LoadingBar(progress: _controller.value),
                        const SizedBox(height: 16),
                        const _LoadingText(),
                      ],
                    );
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Animated gradient loading bar matching splash screen teal/cyan palette
class _LoadingBar extends StatelessWidget {
  const _LoadingBar({required this.progress});

  final double progress;

  @override
  Widget build(BuildContext context) {
    final fillWidth = (0.05 + progress * 0.90).clamp(0.0, 1.0);

    return Container(
      height: 6,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(999),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        fit: StackFit.expand,
        children: [
          FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: fillWidth,
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [
                    Color(0xFF00C4B1), // teal from image
                    Color(0xFF12D7C5), // cyan
                    Color(0xFF178BFF), // blue
                    Color(0xFF8E4DFF), // purple
                  ],
                ),
                borderRadius: BorderRadius.circular(999),
              ),
            ),
          ),
          // Shimmer sweep
          if (progress < 1.0)
            FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: fillWidth,
              child: Stack(
                children: [
                  Transform.translate(
                    offset: Offset((progress * 2 - 1) * 200, 0),
                    child: Container(
                      width: 60,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.white.withValues(alpha: 0),
                            Colors.white.withValues(alpha: 0.3),
                            Colors.white.withValues(alpha: 0),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

/// Fixed text: "Loading your next adventure... 💚"
class _LoadingText extends StatelessWidget {
  const _LoadingText();

  @override
  Widget build(BuildContext context) {
    return const Text(
      'Loading your next adventure...  💚',
      style: TextStyle(
        color: Colors.white,
        fontSize: 15,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.3,
      ),
    );
  }
}
