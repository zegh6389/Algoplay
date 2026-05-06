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
      duration: const Duration(milliseconds: 1500),
    )..repeat();

    _navigationTimer = Timer(const Duration(milliseconds: 2400), () {
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
      backgroundColor: const Color(0xFF030D3B),
      body: Stack(
        fit: StackFit.expand,
        children: [
          Image.asset(
            'assets/images/splash-screen.png',
            fit: BoxFit.cover,
            alignment: Alignment.center,
          ),
          const _SplashVignette(),
          SafeArea(
            child: Align(
              alignment: Alignment.bottomCenter,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(40, 0, 40, 42),
                child: AnimatedBuilder(
                  animation: _controller,
                  builder: (context, _) {
                    return Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _AnimatedLoadingBar(value: _controller.value),
                        const SizedBox(height: 18),
                        _LoadingText(value: _controller.value),
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

class _SplashVignette extends StatelessWidget {
  const _SplashVignette();

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.transparent,
            Colors.transparent,
            const Color(0xFF020832).withValues(alpha: 0.08),
            const Color(0xFF020832).withValues(alpha: 0.24),
          ],
          stops: const [0.0, 0.64, 0.82, 1.0],
        ),
      ),
    );
  }
}

class _AnimatedLoadingBar extends StatelessWidget {
  const _AnimatedLoadingBar({required this.value});

  final double value;

  @override
  Widget build(BuildContext context) {
    final progress = 0.18 + (value * 0.76);
    final shimmer = (value * 2) - 1;

    return Container(
      height: 14,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF10D6D0).withValues(alpha: 0.22),
            blurRadius: 24,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        fit: StackFit.expand,
        children: [
          FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: progress.clamp(0.0, 1.0),
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [
                    Color(0xFF12D7C5),
                    Color(0xFF178BFF),
                    Color(0xFF8E4DFF),
                  ],
                ),
                borderRadius: BorderRadius.circular(999),
              ),
            ),
          ),
          Transform.translate(
            offset: Offset(shimmer * 170, 0),
            child: Container(
              width: 80,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.white.withValues(alpha: 0),
                    Colors.white.withValues(alpha: 0.38),
                    Colors.white.withValues(alpha: 0),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LoadingText extends StatelessWidget {
  const _LoadingText({required this.value});

  final double value;

  static const _text = 'Loading Algoplay';
  static const _cursor = '│';

  @override
  Widget build(BuildContext context) {
    // Typewriter reveal: characters appear one by one
    final charCount = (value * _text.length).floor().clamp(0, _text.length);
    final revealed = _text.substring(0, charCount);
    final showCursor = (value * 8).floor().isOdd;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          revealed,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.92),
            fontSize: 18,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.2,
            shadows: [
              Shadow(
                color: const Color(0xFF12D7C5).withValues(alpha: 0.35),
                blurRadius: 12,
              ),
            ],
          ),
        ),
        if (charCount < _text.length)
          Text(
            showCursor ? _cursor : ' ',
            style: TextStyle(
              color: const Color(0xFF12D7C5).withValues(alpha: 0.8),
              fontSize: 18,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.2,
            ),
          ),
      ],
    );
  }
}
