import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/theme/app_theme.dart';
import '../../../shared/providers/app_providers.dart';
import '../../../shared/widgets/section_header.dart';
import '../../../shared/widgets/xp_progress_bar.dart';
import '../../../shared/models/user_progress.dart';
import '../data/avatar_repository.dart';
import 'widgets/avatar_widget.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// SharedPreferences keys used by ProfilePage.
// ═══════════════════════════════════════════════════════════════════════════════
class ProfilePrefs {
  static const username = 'algoplay_username';
  static const avatarInitial = 'algoplay_avatar_initial';
  static const notifications = 'algoplay_notifications';
  static const sound = 'algoplay_sound';
  static const haptic = 'algoplay_haptic';

  // Prevent instantiation.
  ProfilePrefs._();
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Profile Page — User profile with avatar, achievements, settings, and
/// account management. All data persisted via SharedPreferences.
// ═══════════════════════════════════════════════════════════════════════════════
class ProfilePage extends ConsumerStatefulWidget {
  const ProfilePage({super.key});

  @override
  ConsumerState<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends ConsumerState<ProfilePage> {
  // ── Profile fields ────────────────────────────────────────────────────────
  String _username = 'Student';
  String _avatarInitial = 'S';
  AvatarType _avatarType = AvatarType.initial;
  String? _avatarKey;
  late AvatarRepository _avatarRepo;

  // ── Settings toggles ──────────────────────────────────────────────────────
  bool _notificationsEnabled = true;
  bool _soundEnabled = true;
  bool _hapticEnabled = false;

  // ── Loading guard ─────────────────────────────────────────────────────────
  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    _loadFromPrefs();
  }

  // ── Load everything from SharedPreferences ────────────────────────────────

  Future<void> _loadFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    _avatarRepo = AvatarRepository(prefs);
    if (!mounted) return;
    setState(() {
      _username = prefs.getString(ProfilePrefs.username) ?? 'Student';
      _avatarInitial = _avatarRepo.extractInitial(_username);
      _avatarType = prefs.getString('algoplay_avatar_type') == 'image'
          ? AvatarType.image
          : AvatarType.initial;
      _avatarKey = prefs.getString('algoplay_avatar_key');
      _notificationsEnabled = prefs.getBool(ProfilePrefs.notifications) ?? true;
      _soundEnabled = prefs.getBool(ProfilePrefs.sound) ?? true;
      _hapticEnabled = prefs.getBool(ProfilePrefs.haptic) ?? false;
      _initialized = true;
    });
  }

  // ── Persist helpers ───────────────────────────────────────────────────────

  Future<void> _saveUsername(String value) async {
    final initial = _avatarRepo.extractInitial(value);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(ProfilePrefs.username, value);
    await prefs.setString(ProfilePrefs.avatarInitial, initial);
    if (!mounted) return;
    setState(() {
      _username = value;
      _avatarInitial = initial;
    });
  }

  Future<void> _saveSetting(String key, bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(key, value);
  }

  // ── Level / XP helpers ────────────────────────────────────────────────────
  // Level formula mirrors UserProgressNotifier.addXP: level = (xp ~/ 100) + 1

  int get _level => ref.read(userProgressProvider).level;
  int get _totalXP => ref.read(userProgressProvider).totalXP;
  int get _nextLevelXP => _level * 100;

  // ── Achievements computed from UserProgress ───────────────────────────────

  List<_AchievementDef> _computeAchievements(UserProgress progress) {
    return [
      _AchievementDef(
        label: 'First Sort',
        icon: Icons.sort,
        achieved: progress.completedAlgorithms.isNotEmpty,
      ),
      _AchievementDef(
        label: 'Speed Demon',
        icon: Icons.speed,
        achieved: progress.quizHistory.any((q) => q.score == q.totalQuestions),
      ),
      _AchievementDef(
        label: 'Streak Master',
        icon: Icons.local_fire_department,
        achieved: progress.currentStreak >= 3,
      ),
      _AchievementDef(
        label: 'Algorithm Guru',
        icon: Icons.psychology,
        achieved: progress.completedAlgorithms.length >= 10,
      ),
      _AchievementDef(
        label: 'Battle Champ',
        icon: Icons.emoji_events,
        achieved: progress.challengeHistory.any((c) => c.passed),
      ),
      _AchievementDef(
        label: 'Perfect Score',
        icon: Icons.star,
        achieved: progress.quizHistory
            .any((q) => q.correctAnswers == q.totalQuestions),
      ),
    ];
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    // Don't render until prefs have been loaded.
    if (!_initialized) {
      return const Scaffold(
        backgroundColor: AppColors.card,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final progress = ref.watch(userProgressProvider);

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
            // ── Profile Header ────────────────────────────────────────────
            _buildProfileHeader(),
            const SizedBox(height: AppSpacing.xxl),

            // ── Achievements ──────────────────────────────────────────────
            const SectionHeader(title: 'Achievements'),
            const SizedBox(height: AppSpacing.md),
            _buildAchievements(progress),
            const SizedBox(height: AppSpacing.xxl),

            // ── Settings ──────────────────────────────────────────────────
            const SectionHeader(title: 'Settings'),
            const SizedBox(height: AppSpacing.md),
            _buildSettings(),
            const SizedBox(height: AppSpacing.xxl),

            // ── Account ───────────────────────────────────────────────────
            const SectionHeader(title: 'Account'),
            const SizedBox(height: AppSpacing.md),
            _buildAccount(),
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
        // Avatar circle — tappable to change
        GestureDetector(
          onTap: () => _showAvatarPicker(),
          child: AvatarWidget(
            initial: _avatarInitial,
            avatarType: _avatarType,
            avatarKey: _avatarKey,
            size: 80,
          ),
        ),
        const SizedBox(height: AppSpacing.md),

        // Username
        Text(_username, style: AppTypography.h2),
        const SizedBox(height: AppSpacing.xs),

        // Level caption
        Text(
          'Level $_level',
          style: AppTypography.caption.copyWith(
            color: AppColors.secondary500,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: AppSpacing.lg),

        // XP Progress Bar
        XpProgressBar(
          currentXP: _totalXP,
          nextLevelXP: _nextLevelXP,
          level: _level,
        ),
      ],
    );
  }

  // ── Achievements ──────────────────────────────────────────────────────────

  Widget _buildAchievements(UserProgress progress) {
    final achievements = _computeAchievements(progress);

    return SizedBox(
      height: 100,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: achievements.length,
        separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.md),
        itemBuilder: (context, index) {
          final item = achievements[index];
          return _AchievementBadge(
            label: item.label,
            icon: item.icon,
            achieved: item.achieved,
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
            onChanged: (v) {
              setState(() => _notificationsEnabled = v);
              _saveSetting(ProfilePrefs.notifications, v);
            },
          ),
          const Divider(height: 1, indent: 56),
          _SettingsTile(
            icon: Icons.volume_up_outlined,
            title: 'Sound Effects',
            value: _soundEnabled,
            onChanged: (v) {
              setState(() => _soundEnabled = v);
              _saveSetting(ProfilePrefs.sound, v);
            },
          ),
          const Divider(height: 1, indent: 56),
          _SettingsTile(
            icon: Icons.vibration_outlined,
            title: 'Haptic Feedback',
            value: _hapticEnabled,
            onChanged: (v) {
              setState(() => _hapticEnabled = v);
              _saveSetting(ProfilePrefs.haptic, v);
            },
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
            onTap: () => _showEditProfileDialog(),
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
            onTap: () => context.go('/premium'),
          ),
        ],
      ),
    );
  }

  // ── Avatar Picker ─────────────────────────────────────────────────────────

  Future<void> _showAvatarPicker() async {
    final result = await AvatarPickerDialog.show(
      context,
      initial: _avatarInitial,
      type: _avatarType,
      avatarKey: _avatarKey,
    );
    if (result == null) return;

    final (type, key) = result;
    if (type == AvatarType.image && key != null) {
      await _avatarRepo.selectAvatar(key);
    } else {
      await _avatarRepo.selectInitial();
    }

    if (!mounted) return;
    setState(() {
      _avatarType = type;
      _avatarKey = key;
    });
  }

  // ── Edit Profile Dialog ───────────────────────────────────────────────────

  void _showEditProfileDialog() {
    final controller = TextEditingController(text: _username);

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: const Text('Edit Username'),
          content: TextField(
            controller: controller,
            autofocus: true,
            maxLength: 20,
            decoration: const InputDecoration(
              labelText: 'Username',
              border: OutlineInputBorder(),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () {
                final newName = controller.text.trim();
                if (newName.isNotEmpty) {
                  _saveUsername(newName);
                }
                Navigator.of(ctx).pop();
              },
              child: const Text('Save'),
            ),
          ],
        );
      },
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Internal data class for computed achievements.
// ═══════════════════════════════════════════════════════════════════════════════
class _AchievementDef {
  final String label;
  final IconData icon;
  final bool achieved;
  const _AchievementDef({
    required this.label,
    required this.icon,
    required this.achieved,
  });
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
