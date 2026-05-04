import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/section_header.dart';
import '../../../shared/widgets/xp_progress_bar.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Profile Page — User profile with avatar, achievements, settings, and
/// account management. Uses ConsumerStatefulWidget for toggle states.
// ═══════════════════════════════════════════════════════════════════════════════
class ProfilePage extends ConsumerStatefulWidget {
  const ProfilePage({super.key});

  @override
  ConsumerState<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends ConsumerState<ProfilePage> {
  bool _notificationsEnabled = true;
  bool _soundEnabled = true;
  bool _hapticEnabled = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.card,
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.xl,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Profile Header ──────────────────────────────────────────────
            _buildProfileHeader(),
            const SizedBox(height: AppSpacing.xxl),

            // ── Achievements ────────────────────────────────────────────────
            SectionHeader(title: 'Achievements'),
            const SizedBox(height: AppSpacing.md),
            _buildAchievements(),
            const SizedBox(height: AppSpacing.xxl),

            // ── Settings ────────────────────────────────────────────────────
            SectionHeader(title: 'Settings'),
            const SizedBox(height: AppSpacing.md),
            _buildSettings(),
            const SizedBox(height: AppSpacing.xxl),

            // ── Account ─────────────────────────────────────────────────────
            SectionHeader(title: 'Account'),
            const SizedBox(height: AppSpacing.md),
            _buildAccount(),
            const SizedBox(height: AppSpacing.xxl),

            // ── Sign Out ────────────────────────────────────────────────────
            _buildSignOutButton(),
            const SizedBox(height: AppSpacing.xl),
          ],
        ),
      ),
    );
  }

  // ── Profile Header ────────────────────────────────────────────────────────

  Widget _buildProfileHeader() {
    return Column(
      children: [
        // Avatar circle
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: AppColors.primary100,
            shape: BoxShape.circle,
          ),
          alignment: Alignment.center,
          child: Text(
            'S',
            style: AppTypography.h1.copyWith(
              color: AppColors.primary500,
              fontSize: 36,
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.md),

        // Username
        Text('Student', style: AppTypography.h2),
        const SizedBox(height: AppSpacing.xs),

        // Level caption
        Text(
          'Level 5',
          style: AppTypography.caption.copyWith(
            color: AppColors.secondary500,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: AppSpacing.lg),

        // XP Progress Bar
        const XpProgressBar(
          currentXP: 420,
          nextLevelXP: 500,
          level: 5,
        ),
      ],
    );
  }

  // ── Achievements ──────────────────────────────────────────────────────────

  Widget _buildAchievements() {
    const achievements = <Map<String, dynamic>>[
      {'label': 'First Sort',     'icon': Icons.sort,              'achieved': true},
      {'label': 'Speed Demon',    'icon': Icons.speed,             'achieved': true},
      {'label': 'Streak Master',  'icon': Icons.local_fire_department, 'achieved': true},
      {'label': 'Algorithm Guru', 'icon': Icons.psychology,        'achieved': false},
      {'label': 'Battle Champ',   'icon': Icons.emoji_events,      'achieved': false},
      {'label': 'Perfect Score',  'icon': Icons.star,              'achieved': false},
    ];

    return SizedBox(
      height: 100,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: achievements.length,
        separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.md),
        itemBuilder: (context, index) {
          final item = achievements[index];
          final achieved = item['achieved'] as bool;
          return _AchievementBadge(
            label: item['label'] as String,
            icon: item['icon'] as IconData,
            achieved: achieved,
          );
        },
      ),
    );
  }

  // ── Settings ──────────────────────────────────────────────────────────────

  Widget _buildSettings() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: AppRadius.lgBorder,
        boxShadow: AppShadows.sm,
      ),
      child: Column(
        children: [
          _SettingsTile(
            icon: Icons.notifications_outlined,
            title: 'Notifications',
            value: _notificationsEnabled,
            onChanged: (v) => setState(() => _notificationsEnabled = v),
          ),
          const Divider(height: 1, indent: 56),
          _SettingsTile(
            icon: Icons.volume_up_outlined,
            title: 'Sound Effects',
            value: _soundEnabled,
            onChanged: (v) => setState(() => _soundEnabled = v),
          ),
          const Divider(height: 1, indent: 56),
          _SettingsTile(
            icon: Icons.vibration_outlined,
            title: 'Haptic Feedback',
            value: _hapticEnabled,
            onChanged: (v) => setState(() => _hapticEnabled = v),
          ),
        ],
      ),
    );
  }

  // ── Account ───────────────────────────────────────────────────────────────

  Widget _buildAccount() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: AppRadius.lgBorder,
        boxShadow: AppShadows.sm,
      ),
      child: Column(
        children: [
          // Edit Profile
          ListTile(
            leading: const Icon(Icons.person_outline, color: AppColors.textSecondary),
            title: Text('Edit Profile', style: AppTypography.body),
            trailing: const Icon(Icons.chevron_right, color: AppColors.textMuted, size: 20),
            contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            onTap: () {},
          ),
          const Divider(height: 1, indent: 56),
          // Subscription
          ListTile(
            leading: const Icon(Icons.card_membership_outlined, color: AppColors.textSecondary),
            title: Text('Subscription', style: AppTypography.body),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Free Plan',
                  style: AppTypography.caption,
                ),
                const SizedBox(width: AppSpacing.sm),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: AppSpacing.xs,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.secondary500,
                    borderRadius: AppRadius.smBorder,
                  ),
                  child: const Text(
                    'Upgrade',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textInverse,
                    ),
                  ),
                ),
              ],
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            onTap: () {},
          ),
        ],
      ),
    );
  }

  // ── Sign Out ──────────────────────────────────────────────────────────────

  Widget _buildSignOutButton() {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton(
        onPressed: () {},
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.error600,
          side: const BorderSide(color: AppColors.error600),
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
          shape: RoundedRectangleBorder(
            borderRadius: AppRadius.mdBorder,
          ),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
          ),
        ),
        child: const Text('Sign Out'),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Circular achievement badge with label underneath
// ═══════════════════════════════════════════════════════════════════════════════
class _AchievementBadge extends StatelessWidget {
  const _AchievementBadge({
    required this.label,
    required this.icon,
    required this.achieved,
  });

  final String label;
  final IconData icon;
  final bool achieved;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 52,
          height: 52,
          decoration: BoxDecoration(
            color: achieved ? AppColors.primary500 : AppColors.sunken,
            shape: BoxShape.circle,
          ),
          alignment: Alignment.center,
          child: Icon(
            icon,
            size: 24,
            color: achieved ? AppColors.textInverse : AppColors.textMuted,
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
        SizedBox(
          width: 64,
          child: Text(
            label,
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: AppTypography.overline.copyWith(
              color: achieved ? AppColors.textPrimary : AppColors.textMuted,
            ),
          ),
        ),
      ],
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Settings list tile with icon, title, and Switch
// ═══════════════════════════════════════════════════════════════════════════════
class _SettingsTile extends StatelessWidget {
  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.value,
    required this.onChanged,
  });

  final IconData icon;
  final String title;
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppColors.textSecondary),
      title: Text(title, style: AppTypography.body),
      trailing: Switch(
        value: value,
        onChanged: onChanged,
        activeThumbColor: AppColors.primary500,
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
    );
  }
}
