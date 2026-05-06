import 'package:flutter/material.dart';

/// Predefined speed modes for the algorithm visualizer.
enum SpeedMode {
  turtle(1500, '🐢', '1.5s/step'),
  normal(500, '⚡', '0.5s/step'),
  fast(100, '🚀', '0.1s/step'),
  manual(0, '🖐', 'Manual');

  const SpeedMode(this.durationMs, this.icon, this.label);

  /// Duration in milliseconds per step.
  final int durationMs;

  /// Display icon/emoji for the mode.
  final String icon;

  /// Human-readable label.
  final String label;

  /// Whether this mode requires manual stepping.
  bool get isManual => this == SpeedMode.manual;

  /// The [Duration] representation of the step interval.
  Duration get duration => Duration(milliseconds: durationMs);
}

/// A compact horizontal speed‑controller bar for the algorithm visualizer.
///
/// Provides speed‑mode selection, play/pause with animated icon, step
/// forward/backward, reset, and a speed indicator label.
class SpeedController extends StatefulWidget {
  const SpeedController({
    super.key,
    required this.isPlaying,
    required this.currentSpeed,
    this.canStepBack = true,
    this.canStepForward = true,
    required this.onSpeedChanged,
    required this.onPlayPause,
    required this.onStepForward,
    required this.onStepBackward,
    required this.onReset,
  });

  final bool isPlaying;
  final SpeedMode currentSpeed;
  final bool canStepBack;
  final bool canStepForward;

  final ValueChanged<Duration> onSpeedChanged;
  final VoidCallback onPlayPause;
  final VoidCallback onStepForward;
  final VoidCallback onStepBackward;
  final VoidCallback onReset;

  @override
  State<SpeedController> createState() => _SpeedControllerState();
}

class _SpeedControllerState extends State<SpeedController>
    with TickerProviderStateMixin {
  late final AnimationController _playPauseController;

  static const Color _primaryBlue = Color(0xFF3B82F6);

  @override
  void initState() {
    super.initState();
    _playPauseController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
      value: widget.isPlaying ? 1.0 : 0.0,
    );
  }

  @override
  void didUpdateWidget(covariant SpeedController oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.isPlaying != widget.isPlaying) {
      if (widget.isPlaying) {
        _playPauseController.forward();
      } else {
        _playPauseController.reverse();
      }
    }
  }

  @override
  void dispose() {
    _playPauseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1A000000),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // --- Speed mode selector ---
          _buildSpeedModeSelector(),
          const SizedBox(width: 8),
          _buildDivider(),
          const SizedBox(width: 8),

          // --- Step Backward ---
          _buildControlButton(
            icon: Icons.skip_previous_rounded,
            tooltip: 'Step Backward',
            enabled: widget.canStepBack,
            onTap: widget.onStepBackward,
          ),

          // --- Play / Pause ---
          _buildPlayPauseButton(),

          // --- Step Forward ---
          _buildControlButton(
            icon: Icons.skip_next_rounded,
            tooltip: 'Step Forward',
            enabled: widget.canStepForward,
            onTap: widget.onStepForward,
          ),

          const SizedBox(width: 4),
          _buildDivider(),
          const SizedBox(width: 8),

          // --- Reset ---
          _buildControlButton(
            icon: Icons.replay_rounded,
            tooltip: 'Reset',
            enabled: true,
            onTap: widget.onReset,
          ),

          const SizedBox(width: 8),
          _buildDivider(),
          const SizedBox(width: 8),

          // --- Speed indicator ---
          _buildSpeedIndicator(),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Speed mode selector – compact row of icon buttons
  // ---------------------------------------------------------------------------
  Widget _buildSpeedModeSelector() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: SpeedMode.values.map((mode) {
        final isActive = widget.currentSpeed == mode;
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 2),
          child: SizedBox(
            height: 32,
            width: 36,
            child: Tooltip(
              message: '${mode.name[0].toUpperCase()}${mode.name.substring(1)} – ${mode.label}',
              child: Material(
                color: isActive ? _primaryBlue : Colors.transparent,
                borderRadius: BorderRadius.circular(8),
                child: InkWell(
                  borderRadius: BorderRadius.circular(8),
                  onTap: () {
                    if (!isActive) {
                      widget.onSpeedChanged(mode.duration);
                    }
                  },
                  child: Center(
                    child: Text(
                      mode.icon,
                      style: TextStyle(
                        fontSize: 16,
                        color: isActive ? Colors.white : Colors.grey[600],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  // ---------------------------------------------------------------------------
  // Play / Pause with animated icon cross‑fade
  // ---------------------------------------------------------------------------
  Widget _buildPlayPauseButton() {
    return SizedBox(
      height: 36,
      width: 36,
      child: Tooltip(
        message: widget.isPlaying ? 'Pause' : 'Play',
        child: Material(
          color: widget.isPlaying ? _primaryBlue : Colors.grey[200],
          borderRadius: BorderRadius.circular(10),
          child: InkWell(
            borderRadius: BorderRadius.circular(10),
            onTap: widget.onPlayPause,
            child: Center(
              child: AnimatedIcon(
                icon: AnimatedIcons.play_pause,
                progress: _playPauseController,
                color: widget.isPlaying ? Colors.white : _primaryBlue,
                size: 20,
              ),
            ),
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Generic control button (step forward, step backward, reset)
  // ---------------------------------------------------------------------------
  Widget _buildControlButton({
    required IconData icon,
    required String tooltip,
    required bool enabled,
    required VoidCallback onTap,
  }) {
    final color = enabled ? Colors.grey[700] : Colors.grey[300];
    return SizedBox(
      height: 32,
      width: 32,
      child: Tooltip(
        message: tooltip,
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          child: InkWell(
            borderRadius: BorderRadius.circular(8),
            onTap: enabled ? onTap : null,
            child: Center(
              child: Icon(icon, size: 18, color: color),
            ),
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Thin vertical divider separating control groups
  // ---------------------------------------------------------------------------
  Widget _buildDivider() {
    return Container(
      height: 20,
      width: 1,
      color: Colors.grey[300],
    );
  }

  // ---------------------------------------------------------------------------
  // Speed indicator text (e.g. "500ms/step")
  // ---------------------------------------------------------------------------
  Widget _buildSpeedIndicator() {
    final String text;
    if (widget.currentSpeed.isManual) {
      text = 'Manual';
    } else {
      text = '${widget.currentSpeed.durationMs}ms/step';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: Colors.grey[700],
          letterSpacing: 0.3,
        ),
      ),
    );
  }
}
