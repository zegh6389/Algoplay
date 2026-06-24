import 'package:flutter/services.dart';

/// Centralized haptic-feedback helper.
///
/// All games and visualizers route tactile feedback through [Haptics] so the
/// feel is consistent across the app and can be silenced globally by flipping
/// [enabled] (e.g. from a settings toggle).
///
/// Semantics of each method:
///  * [selection] — a control was tapped / a value changed (light click).
///  * [light]     — a small event (manual step, chip select).
///  * [medium]    — a positive outcome (correct answer, level cleared).
///  * [heavy]     — a notable event (win/lose, game over).
///  * [success]   — alias for a rewarding medium impact (correct/win).
///  * [error]     — a heavy impact for a wrong answer / failure.
class Haptics {
  Haptics._();

  /// Master toggle. Set to `false` to silence every call below.
  static bool enabled = true;

  /// A control / value was selected (light click).
  static Future<void> selection() async {
    if (!enabled) return;
    await HapticFeedback.selectionClick();
  }

  /// A small event — e.g. a manual step in a visualizer.
  static Future<void> light() async {
    if (!enabled) return;
    await HapticFeedback.lightImpact();
  }

  /// A medium event — e.g. a level cleared.
  static Future<void> medium() async {
    if (!enabled) return;
    await HapticFeedback.mediumImpact();
  }

  /// A heavy event — e.g. game over / match decided.
  static Future<void> heavy() async {
    if (!enabled) return;
    await HapticFeedback.heavyImpact();
  }

  /// Positive outcome — correct answer / win.
  static Future<void> success() async {
    if (!enabled) return;
    await HapticFeedback.mediumImpact();
  }

  /// Negative outcome — wrong answer / loss.
  static Future<void> error() async {
    if (!enabled) return;
    await HapticFeedback.heavyImpact();
  }
}
