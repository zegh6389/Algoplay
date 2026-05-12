import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';
import '../data/avatar_repository.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Avatar display widget.
///
/// Renders either:
///   - A letter initial in a colored circle (default)
///   - A bundled Icons8 avatar image in a circle
// ═══════════════════════════════════════════════════════════════════════════════
class AvatarWidget extends StatelessWidget {
  final String initial;
  final AvatarType avatarType;
  final String? avatarKey;
  final double size;

  const AvatarWidget({
    super.key,
    required this.initial,
    required this.avatarType,
    this.avatarKey,
    this.size = 80,
  });

  @override
  Widget build(BuildContext context) {
    if (avatarType == AvatarType.image && avatarKey != null) {
      final def = AvatarRepository.availableAvatars
          .where((a) => a.key == avatarKey)
          .firstOrNull;
      if (def != null) {
        return _buildCircle(
          child: ClipOval(
            child: Image.asset(
              def.assetPath,
              width: size,
              height: size,
              fit: BoxFit.cover,
            ),
          ),
        );
      }
    }

    // Fallback: initial-based avatar
    return _buildCircle(
      child: Text(
        initial,
        style: AppTypography.h1.copyWith(
          color: AppColors.primary500,
          fontSize: size * 0.45,
        ),
      ),
    );
  }

  Widget _buildCircle({required Widget child}) {
    return Container(
      width: size,
      height: size,
      decoration: const BoxDecoration(
        color: AppColors.primary100,
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: child,
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Avatar picker dialog — shows grid of available avatars + initial option.
// ═══════════════════════════════════════════════════════════════════════════════
class AvatarPickerDialog extends StatelessWidget {
  final String currentInitial;
  final AvatarType currentType;
  final String? currentAvatarKey;

  const AvatarPickerDialog({
    super.key,
    required this.currentInitial,
    required this.currentType,
    this.currentAvatarKey,
  });

  /// Shows the picker and returns the selected (AvatarType, String? key).
  static Future<(AvatarType, String?)?> show(
    BuildContext context, {
    required String initial,
    required AvatarType type,
    String? avatarKey,
  }) {
    return showDialog<(AvatarType, String?)>(
      context: context,
      builder: (_) => AvatarPickerDialog(
        currentInitial: initial,
        currentType: type,
        currentAvatarKey: avatarKey,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Choose Avatar'),
      content: SizedBox(
        width: 280,
        child: Wrap(
          spacing: 12,
          runSpacing: 12,
          alignment: WrapAlignment.Center,
          children: [
            // Initial option
            _AvatarOption(
              isSelected: currentType == AvatarType.initial,
              onTap: () => Navigator.of(context).pop((AvatarType.initial, null)),
              child: Container(
                width: 56,
                height: 56,
                decoration: const BoxDecoration(
                  color: AppColors.primary100,
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: Text(
                  currentInitial,
                  style: AppTypography.h2.copyWith(
                    color: AppColors.primary500,
                    fontSize: 28,
                  ),
                ),
              ),
            ),
            // Image options
            ...AvatarRepository.availableAvatars.map((def) {
              return _AvatarOption(
                isSelected:
                    currentType == AvatarType.image && currentAvatarKey == def.key,
                onTap: () =>
                    Navigator.of(context).pop((AvatarType.image, def.key)),
                child: ClipOval(
                  child: Image.asset(
                    def.assetPath,
                    width: 56,
                    height: 56,
                    fit: BoxFit.cover,
                  ),
                ),
              );
            }),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
      ],
    );
  }
}

class _AvatarOption extends StatelessWidget {
  final bool isSelected;
  final VoidCallback onTap;
  final Widget child;

  const _AvatarOption({
    required this.isSelected,
    required this.onTap,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(3),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: isSelected
              ? Border.all(color: AppColors.primary500, width: 3)
              : null,
        ),
        child: child,
      ),
    );
  }
}
