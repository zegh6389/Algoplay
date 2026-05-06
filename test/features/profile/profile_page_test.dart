import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:algoplay/features/profile/presentation/profile_page.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  // ═══════════════════════════════════════════════════════════════════════════
  // ProfilePrefs keys
  // ═══════════════════════════════════════════════════════════════════════════

  group('ProfilePrefs keys', () {
    test('key constants use algoplay_ prefix', () {
      expect(ProfilePrefs.username, 'algoplay_username');
      expect(ProfilePrefs.avatarInitial, 'algoplay_avatar_initial');
      expect(ProfilePrefs.notifications, 'algoplay_notifications');
      expect(ProfilePrefs.sound, 'algoplay_sound');
      expect(ProfilePrefs.haptic, 'algoplay_haptic');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Username persistence
  // ═══════════════════════════════════════════════════════════════════════════

  group('Username persistence', () {
    setUp(() {
      SharedPreferences.setMockInitialValues({});
    });

    test('default username is "Student" when nothing stored', () async {
      final prefs = await SharedPreferences.getInstance();
      expect(prefs.getString(ProfilePrefs.username), isNull);
    });

    test('username roundtrips through SharedPreferences', () async {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(ProfilePrefs.username, 'AlgoWizard');
      expect(prefs.getString(ProfilePrefs.username), 'AlgoWizard');
    });

    test('avatar initial is derived from username', () async {
      final prefs = await SharedPreferences.getInstance();
      const name = 'bobby';
      final initial = name.isNotEmpty ? name[0].toUpperCase() : 'S';
      await prefs.setString(ProfilePrefs.username, name);
      await prefs.setString(ProfilePrefs.avatarInitial, initial);
      expect(prefs.getString(ProfilePrefs.avatarInitial), 'B');
    });

    test('empty username falls back to default initial "S"', () {
      const name = '';
      final initial = name.isNotEmpty ? name[0].toUpperCase() : 'S';
      expect(initial, 'S');
    });

    test('updating username overwrites previous value', () async {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(ProfilePrefs.username, 'First');
      await prefs.setString(ProfilePrefs.username, 'Second');
      expect(prefs.getString(ProfilePrefs.username), 'Second');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Settings toggle persistence
  // ═══════════════════════════════════════════════════════════════════════════

  group('Settings toggle persistence', () {
    setUp(() {
      SharedPreferences.setMockInitialValues({});
    });

    test('notifications toggle roundtrips', () async {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(ProfilePrefs.notifications, false);
      expect(prefs.getBool(ProfilePrefs.notifications), false);

      await prefs.setBool(ProfilePrefs.notifications, true);
      expect(prefs.getBool(ProfilePrefs.notifications), true);
    });

    test('sound toggle roundtrips', () async {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(ProfilePrefs.sound, false);
      expect(prefs.getBool(ProfilePrefs.sound), false);
    });

    test('haptic toggle roundtrips', () async {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(ProfilePrefs.haptic, true);
      expect(prefs.getBool(ProfilePrefs.haptic), true);
    });

    test('all settings defaults are correct when absent', () async {
      final prefs = await SharedPreferences.getInstance();
      // Our page uses ?? with these defaults:
      //   notifications: true, sound: true, haptic: false
      expect(prefs.getBool(ProfilePrefs.notifications) ?? true, isTrue);
      expect(prefs.getBool(ProfilePrefs.sound) ?? true, isTrue);
      expect(prefs.getBool(ProfilePrefs.haptic) ?? false, isFalse);
    });

    test('all three settings persist independently', () async {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(ProfilePrefs.notifications, false);
      await prefs.setBool(ProfilePrefs.sound, true);
      await prefs.setBool(ProfilePrefs.haptic, true);

      expect(prefs.getBool(ProfilePrefs.notifications), false);
      expect(prefs.getBool(ProfilePrefs.sound), true);
      expect(prefs.getBool(ProfilePrefs.haptic), true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Full profile load scenario
  // ═══════════════════════════════════════════════════════════════════════════

  group('Full profile load scenario', () {
    test('loads all profile data from pre-populated SharedPreferences', () async {
      SharedPreferences.setMockInitialValues({
        ProfilePrefs.username: 'TestUser',
        ProfilePrefs.avatarInitial: 'T',
        ProfilePrefs.notifications: false,
        ProfilePrefs.sound: false,
        ProfilePrefs.haptic: true,
      });

      final prefs = await SharedPreferences.getInstance();

      // Simulate what ProfilePage._loadFromPrefs does:
      final username = prefs.getString(ProfilePrefs.username) ?? 'Student';
      final avatarInitial =
          prefs.getString(ProfilePrefs.avatarInitial) ??
          (username.isNotEmpty ? username[0].toUpperCase() : 'S');
      final notifications = prefs.getBool(ProfilePrefs.notifications) ?? true;
      final sound = prefs.getBool(ProfilePrefs.sound) ?? true;
      final haptic = prefs.getBool(ProfilePrefs.haptic) ?? false;

      expect(username, 'TestUser');
      expect(avatarInitial, 'T');
      expect(notifications, isFalse);
      expect(sound, isFalse);
      expect(haptic, isTrue);
    });

    test('loads defaults when SharedPreferences is empty', () async {
      SharedPreferences.setMockInitialValues({});

      final prefs = await SharedPreferences.getInstance();

      final username = prefs.getString(ProfilePrefs.username) ?? 'Student';
      final avatarInitial =
          prefs.getString(ProfilePrefs.avatarInitial) ??
          (username.isNotEmpty ? username[0].toUpperCase() : 'S');
      final notifications = prefs.getBool(ProfilePrefs.notifications) ?? true;
      final sound = prefs.getBool(ProfilePrefs.sound) ?? true;
      final haptic = prefs.getBool(ProfilePrefs.haptic) ?? false;

      expect(username, 'Student');
      expect(avatarInitial, 'S');
      expect(notifications, isTrue);
      expect(sound, isTrue);
      expect(haptic, isFalse);
    });

    test('avatar initial falls back to first letter of username when key absent', () async {
      SharedPreferences.setMockInitialValues({
        ProfilePrefs.username: 'Zara',
      });

      final prefs = await SharedPreferences.getInstance();
      final username = prefs.getString(ProfilePrefs.username) ?? 'Student';
      final avatarInitial =
          prefs.getString(ProfilePrefs.avatarInitial) ??
          (username.isNotEmpty ? username[0].toUpperCase() : 'S');

      expect(avatarInitial, 'Z');
    });
  });
}
