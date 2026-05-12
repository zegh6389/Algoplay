import 'package:shared_preferences/shared_preferences.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Avatar type — either initial-based (letter in circle) or image-based
/// (Icons8 avatar PNG).
// ═══════════════════════════════════════════════════════════════════════════════
enum AvatarType { initial, image }

// ═══════════════════════════════════════════════════════════════════════════════
/// Definition of an image avatar from the bundled Icons8 assets.
// ═══════════════════════════════════════════════════════════════════════════════
class AvatarDef {
  final String key;
  final String label;
  final String assetPath;
  const AvatarDef({
    required this.key,
    required this.label,
    required this.assetPath,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Manages avatar selection via SharedPreferences.
///
/// Persisted keys:
///   - `algoplay_avatar_type`: "initial" | "image"
///   - `algoplay_avatar_key`: avatar key (e.g. "neutral_user") or absent
// ═══════════════════════════════════════════════════════════════════════════════
class AvatarRepository {
  final SharedPreferences _prefs;

  static const _typeKey = 'algoplay_avatar_type';
  static const _avatarKey = 'algoplay_avatar_key';

  /// Bundled Icons8 avatar assets shipped with the app.
  static const availableAvatars = <AvatarDef>[
    AvatarDef(
      key: 'neutral_user',
      label: 'Neutral',
      assetPath: 'assets/images/avatars/neutral_user.png',
    ),
    AvatarDef(
      key: 'student_female',
      label: 'Student',
      assetPath: 'assets/images/avatars/student_female.png',
    ),
    AvatarDef(
      key: 'student_male',
      label: 'Scholar',
      assetPath: 'assets/images/avatars/student_male.png',
    ),
  ];

  AvatarRepository(this._prefs);

  // ── Read ──────────────────────────────────────────────────────────────────

  Future<AvatarType> getAvatarType() async {
    final raw = _prefs.getString(_typeKey);
    if (raw == 'image') return AvatarType.image;
    return AvatarType.initial;
  }

  Future<String?> getSelectedAvatarKey() async {
    return _prefs.getString(_avatarKey);
  }

  /// Resolve the asset path for the currently selected avatar.
  /// Returns null if avatar type is initial.
  Future<String?> getSelectedAssetPath() async {
    final type = await getAvatarType();
    if (type != AvatarType.image) return null;
    final key = await getSelectedAvatarKey();
    if (key == null) return null;
    try {
      return availableAvatars
          .firstWhere((a) => a.key == key)
          .assetPath;
    } catch (_) {
      return null;
    }
  }

  // ── Write ─────────────────────────────────────────────────────────────────

  Future<void> selectAvatar(String key) async {
    await _prefs.setString(_typeKey, 'image');
    await _prefs.setString(_avatarKey, key);
  }

  Future<void> selectInitial() async {
    await _prefs.setString(_typeKey, 'initial');
    await _prefs.remove(_avatarKey);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /// Extract first-letter initial from a username.
  /// Returns 'S' as fallback for empty strings.
  String extractInitial(String username) {
    if (username.isEmpty) return 'S';
    return username[0].toUpperCase();
  }
}
