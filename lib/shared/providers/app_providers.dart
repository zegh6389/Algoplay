import 'dart:convert';

import 'package:flutter/foundation.dart' show immutable;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/user_progress.dart';
import '../models/game_state.dart';
import '../models/subscription_state.dart';

// ---------------------------------------------------------------------------
// Persistence keys
// ---------------------------------------------------------------------------

const _kUserProgressKey = 'algoplay_user_progress';
const _kGameStateKey = 'algoplay_game_state';
const _kSubscriptionKey = 'algoplay_subscription';

// ---------------------------------------------------------------------------
// Visualization Settings
// ---------------------------------------------------------------------------

@immutable
class VisualizationSettings {
  final double speed;
  final int arraySize;
  final bool showComplexity;
  final bool showCode;

  const VisualizationSettings({
    this.speed = 1.0,
    this.arraySize = 20,
    this.showComplexity = true,
    this.showCode = true,
  });

  VisualizationSettings copyWith({
    double? speed,
    int? arraySize,
    bool? showComplexity,
    bool? showCode,
  }) {
    return VisualizationSettings(
      speed: speed ?? this.speed,
      arraySize: arraySize ?? this.arraySize,
      showComplexity: showComplexity ?? this.showComplexity,
      showCode: showCode ?? this.showCode,
    );
  }
}

// ---------------------------------------------------------------------------
// UserProgressNotifier
// ---------------------------------------------------------------------------

class UserProgressNotifier extends StateNotifier<UserProgress> {
  UserProgressNotifier() : super(const UserProgress());

  /// Load persisted state from SharedPreferences.
  Future<void> loadFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_kUserProgressKey);
    if (raw != null) {
      state = UserProgress.fromJson(
        jsonDecode(raw) as Map<String, dynamic>,
      );
    }
  }

  /// Persist current state to SharedPreferences.
  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kUserProgressKey, jsonEncode(state.toJson()));
  }

  // ---- Actions ----

  void addXP(int amount) {
    final newXP = state.totalXP + amount;
    // Simple level formula: 100 XP per level (adjust as needed)
    final newLevel = (newXP ~/ 100) + 1;
    state = state.copyWith(totalXP: newXP, level: newLevel);
    _persist();
  }

  void completeAlgorithm(String algorithmId) {
    if (state.completedAlgorithms.contains(algorithmId)) return;
    state = state.copyWith(
      completedAlgorithms: [...state.completedAlgorithms, algorithmId],
    );
    _persist();
  }

  void unlockCategory(String category) {
    if (state.unlockedCategories.contains(category)) return;
    state = state.copyWith(
      unlockedCategories: [...state.unlockedCategories, category],
    );
    _persist();
  }

  void updateStreak(String todayDate) {
    if (state.lastPlayedDate == todayDate) return;

    int newStreak = state.currentStreak;
    // Simple streak logic: increment if played yesterday, else reset to 1.
    // For a real app, compare actual date deltas.
    if (state.lastPlayedDate != null) {
      final last = DateTime.tryParse(state.lastPlayedDate!);
      final today = DateTime.tryParse(todayDate);
      if (last != null && today != null) {
        final diff = today.difference(last).inDays;
        if (diff == 1) {
          newStreak++;
        } else if (diff > 1) {
          newStreak = 1;
        }
        // diff == 0 handled above (same day, early return)
      } else {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    state = state.copyWith(
      currentStreak: newStreak,
      lastPlayedDate: todayDate,
    );
    _persist();
  }

  void recordQuizScore(QuizScore score) {
    state = state.copyWith(
      quizHistory: [...state.quizHistory, score],
    );
    // Also update algorithm mastery
    _updateMasteryFromQuiz(score);
    _persist();
  }

  void _updateMasteryFromQuiz(QuizScore score) {
    final existing = state.algorithmMastery[score.algorithmId];
    final newScores = existing != null
        ? [...existing.quizScores, score.score / score.totalQuestions * 100]
        : <double>[score.score / score.totalQuestions * 100];

    final avgScore = newScores.reduce((a, b) => a + b) / newScores.length;
    final masteryLevel = (avgScore * 0.6).clamp(0.0, 100.0);

    final mastery = AlgorithmMastery(
      algorithmId: score.algorithmId,
      quizScores: newScores,
      masteryLevel: masteryLevel,
      challengesCompleted: existing?.challengesCompleted ?? 0,
      totalChallenges: existing?.totalChallenges ?? 0,
    );

    state = state.copyWith(
      algorithmMastery: {...state.algorithmMastery, score.algorithmId: mastery},
    );
  }

  void recordChallenge(ChallengeCompletion completion) {
    state = state.copyWith(
      challengeHistory: [...state.challengeHistory, completion],
    );
    // Also update algorithm mastery
    _updateMasteryFromChallenge(completion);
    _persist();
  }

  void _updateMasteryFromChallenge(ChallengeCompletion completion) {
    final existing = state.algorithmMastery[completion.algorithmUsed];
    final completed = (existing?.challengesCompleted ?? 0) + 1;
    final total = existing?.totalChallenges ?? 0;

    // Recalculate mastery: 60% quiz avg + 40% challenge completion ratio
    final quizAvg = existing != null && existing.quizScores.isNotEmpty
        ? existing.quizScores.reduce((a, b) => a + b) / existing.quizScores.length
        : 0.0;
    final challengeRatio = total > 0 ? (completed / total) * 100 : 0.0;
    final masteryLevel = (quizAvg * 0.6 + challengeRatio * 0.4).clamp(0.0, 100.0);

    final mastery = AlgorithmMastery(
      algorithmId: completion.algorithmUsed,
      quizScores: existing?.quizScores ?? [],
      masteryLevel: masteryLevel,
      challengesCompleted: completed,
      totalChallenges: total,
    );

    state = state.copyWith(
      algorithmMastery: {...state.algorithmMastery, completion.algorithmUsed: mastery},
    );
  }

  void setTotalChallengesForAlgorithm(String algorithmId, int total) {
    final existing = state.algorithmMastery[algorithmId];
    final mastery = (existing ?? AlgorithmMastery(
      algorithmId: algorithmId,
      quizScores: [],
      masteryLevel: 0,
      challengesCompleted: 0,
      totalChallenges: total,
    )).copyWith(totalChallenges: total);

    state = state.copyWith(
      algorithmMastery: {...state.algorithmMastery, algorithmId: mastery},
    );
    _persist();
  }

  void updateSkillNode(String nodeId, {bool? isUnlocked, bool? isCompleted, int? xpEarned}) {
    final nodes = state.skillNodes.map((node) {
      if (node.id == nodeId) {
        return node.copyWith(
          isUnlocked: isUnlocked,
          isCompleted: isCompleted,
          xpEarned: xpEarned,
        );
      }
      return node;
    }).toList();

    state = state.copyWith(skillNodes: nodes);
    _persist();
  }

  void setSkillNodes(List<SkillNode> nodes) {
    state = state.copyWith(skillNodes: nodes);
    _persist();
  }

  void reset() {
    state = const UserProgress();
    _persist();
  }
}

// ---------------------------------------------------------------------------
// GameStateNotifier
// ---------------------------------------------------------------------------

class GameStateNotifier extends StateNotifier<GameState> {
  GameStateNotifier() : super(const GameState());

  Future<void> loadFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_kGameStateKey);
    if (raw != null) {
      state = GameState.fromJson(
        jsonDecode(raw) as Map<String, dynamic>,
      );
    }
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kGameStateKey, jsonEncode(state.toJson()));
  }

  void updateSorterBest(int score) {
    if (score > state.highScores.sorterBest) {
      state = state.copyWith(
        highScores: state.highScores.copyWith(sorterBest: score),
      );
      _persist();
    }
  }

  void incrementGridEscapeWins() {
    state = state.copyWith(
      highScores:
          state.highScores.copyWith(gridEscapeWins: state.highScores.gridEscapeWins + 1),
    );
    _persist();
  }

  /// Records Grid Escape best total score (max-wins the stored value).
  void updateGridEscapeBest(int score) {
    if (score > state.highScores.gridEscapeBestScore) {
      state = state.copyWith(
        highScores:
            state.highScores.copyWith(gridEscapeBestScore: score),
      );
      _persist();
    }
  }

  void incrementBattleArenaWins() {
    state = state.copyWith(
      highScores: state.highScores.copyWith(
          battleArenaWins: state.highScores.battleArenaWins + 1),
    );
    _persist();
  }

  /// Records Battle Arena best score (max-wins the stored value).
  void updateBattleArenaBest(int score) {
    if (score > state.highScores.battleArenaBestScore) {
      state = state.copyWith(
        highScores:
            state.highScores.copyWith(battleArenaBestScore: score),
      );
      _persist();
    }
  }

  /// Records Race Mode best score (max-wins the stored value).
  void updateRaceModeBest(int score) {
    if (score > state.highScores.raceModeBest) {
      state = state.copyWith(
        highScores: state.highScores.copyWith(raceModeBest: score),
      );
      _persist();
    }
  }

  void completeDailyChallenge(String date) {
    state = state.copyWith(
      dailyChallengeCompleted: true,
      dailyChallengeDate: date,
    );
    _persist();
  }

  void resetDailyChallenge() {
    state = state.copyWith(
      dailyChallengeCompleted: false,
      dailyChallengeDate: null,
    );
    _persist();
  }

  void reset() {
    state = const GameState();
    _persist();
  }
}

// ---------------------------------------------------------------------------
// SubscriptionNotifier
// ---------------------------------------------------------------------------

class SubscriptionNotifier extends StateNotifier<SubscriptionState> {
  SubscriptionNotifier() : super(const SubscriptionState(isLoading: true));

  Future<void> loadFromStorage() async {
    state = state.copyWith(isLoading: true);
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_kSubscriptionKey);
    if (raw != null) {
      state = SubscriptionState.fromJson(
        jsonDecode(raw) as Map<String, dynamic>,
      ).copyWith(isLoading: false, isInitialized: true);
    } else {
      state = state.copyWith(isLoading: false, isInitialized: true);
    }
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kSubscriptionKey, jsonEncode(state.toJson()));
  }

  void setPremium(bool isPremium) {
    state = state.copyWith(isPremium: isPremium);
    _persist();
  }

  void incrementAdsWatched() {
    state = state.copyWith(totalAdsWatched: state.totalAdsWatched + 1);
    _persist();
  }

  void reset() {
    state = const SubscriptionState();
    _persist();
  }
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

final userProgressProvider =
    StateNotifierProvider<UserProgressNotifier, UserProgress>((ref) {
  final notifier = UserProgressNotifier();
  notifier.loadFromStorage();
  return notifier;
});

final gameStateProvider =
    StateNotifierProvider<GameStateNotifier, GameState>((ref) {
  final notifier = GameStateNotifier();
  notifier.loadFromStorage();
  return notifier;
});

final subscriptionProvider =
    StateNotifierProvider<SubscriptionNotifier, SubscriptionState>((ref) {
  final notifier = SubscriptionNotifier();
  notifier.loadFromStorage();
  return notifier;
});

final visualizationSettingsProvider =
    StateProvider<VisualizationSettings>((ref) {
  return const VisualizationSettings();
});
