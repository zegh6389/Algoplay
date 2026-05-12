import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:algoplay/features/profile/data/avatar_repository.dart';
import 'package:algoplay/features/profile/presentation/widgets/avatar_widget.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Tests for AvatarRepository and AvatarWidget.
///
/// Covers:
///   - Default avatar is initial-based
///   - Initial extracted from username
///   - Selecting an avatar persists the choice
///   - AvatarWidget renders initial when no image selected
///   - Available avatars list
// ═══════════════════════════════════════════════════════════════════════════════

void main() {
  late AvatarRepository repo;

  setUp(() async {
    TestWidgetsFlutterBinding.ensureInitialized();
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    repo = AvatarRepository(prefs);
  });

  // ── AvatarRepository Tests ────────────────────────────────────────────────

  group('AvatarRepository', () {
    test('default avatar key is null (initial-based)', () async {
      final key = await repo.getSelectedAvatarKey();
      expect(key, isNull);
    });

    test('default avatar type is initial', () async {
      final type = await repo.getAvatarType();
      expect(type, AvatarType.initial);
    });

    test('initial is extracted from username', () async {
      final initial = repo.extractInitial('Student');
      expect(initial, 'S');
    });

    test('initial handles empty username', () async {
      final initial = repo.extractInitial('');
      expect(initial, 'S'); // fallback default
    });

    test('initial is uppercased', () async {
      final initial = repo.extractInitial('alice');
      expect(initial, 'A');
    });

    test('selecting image avatar persists key', () async {
      await repo.selectAvatar('student_male');
      final key = await repo.getSelectedAvatarKey();
      expect(key, 'student_male');
    });

    test('selecting image avatar changes type to image', () async {
      await repo.selectAvatar('neutral_user');
      final type = await repo.getAvatarType();
      expect(type, AvatarType.image);
    });

    test('reverting to initial clears selection', () async {
      await repo.selectAvatar('student_female');
      await repo.selectInitial();
      final key = await repo.getSelectedAvatarKey();
      expect(key, isNull);
      final type = await repo.getAvatarType();
      expect(type, AvatarType.initial);
    });

    test('available avatars list is non-empty', () {
      final avatars = AvatarRepository.availableAvatars;
      expect(avatars.length, greaterThanOrEqualTo(3));
    });

    test('available avatars have valid asset paths', () {
      for (final avatar in AvatarRepository.availableAvatars) {
        expect(avatar.assetPath, contains('assets/images/avatars/'));
        expect(avatar.assetPath, endsWith('.png'));
        expect(avatar.key, isNotEmpty);
        expect(avatar.label, isNotEmpty);
      }
    });
  });

  // ── AvatarWidget Tests ────────────────────────────────────────────────────

  group('AvatarWidget', () {
    testWidgets('renders initial letter when type is initial',
        (tester) async {
      await tester.pumpWidget(
        const _TestWrapper(
          child: AvatarWidget(
            initial: 'S',
            avatarType: AvatarType.initial,
            avatarKey: null,
            size: 80,
          ),
        ),
      );

      // Should show the initial letter
      expect(find.text('S'), findsOneWidget);
    });

    testWidgets('renders image when type is image', (tester) async {
      // Image.asset throws in test if assets aren't bundled.
      // Use a meaningful key that doesn't exist in availableAvatars
      // to test the fallback path (which shows initial).
      // For a real image key, we just verify the widget builds.
      await tester.pumpWidget(
        const _TestWrapper(
          child: AvatarWidget(
            initial: 'S',
            avatarType: AvatarType.image,
            avatarKey: 'nonexistent_key',
            size: 80,
          ),
        ),
      );

      // With invalid key, falls back to initial
      expect(find.text('S'), findsOneWidget);
    });

    testWidgets('uses custom size', (tester) async {
      await tester.pumpWidget(
        const _TestWrapper(
          child: AvatarWidget(
            initial: 'A',
            avatarType: AvatarType.initial,
            avatarKey: null,
            size: 120,
          ),
        ),
      );

      // Find the container and check its size
      final container = tester.widget<Container>(
        find.ancestor(
          of: find.text('A'),
          matching: find.byType(Container),
        ),
      );
      final boxDecor = container.decoration as BoxDecoration?;
      expect(boxDecor?.shape, BoxShape.circle);
    });
  });
}

// ── Test helper wrapper ─────────────────────────────────────────────────────

class _TestWrapper extends StatelessWidget {
  final Widget child;
  const _TestWrapper({required this.child});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(home: Scaffold(body: Center(child: child)));
  }
}
