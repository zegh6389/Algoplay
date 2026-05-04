import 'package:flutter/foundation.dart';

// ---------------------------------------------------------------------------
// Sub-models
// ---------------------------------------------------------------------------

@immutable
class SkillNode {
  final String id;
  final String category;
  final String name;
  final bool isUnlocked;
  final bool isCompleted;
  final int xpEarned;

  const SkillNode({
    required this.id,
    required this.category,
    required this.name,
    this.isUnlocked = false,
    this.isCompleted = false,
    this.xpEarned = 0,
  });

  SkillNode copyWith({
    String? id,
    String? category,
    String? name,
    bool? isUnlocked,
    bool? isCompleted,
    int? xpEarned,
  }) {
    return SkillNode(
      id: id ?? this.id,
      category: category ?? this.category,
      name: name ?? this.name,
      isUnlocked: isUnlocked ?? this.isUnlocked,
      isCompleted: isCompleted ?? this.isCompleted,
      xpEarned: xpEarned ?? this.xpEarned,
    );
  }

  factory SkillNode.fromJson(Map<String, dynamic> json) {
    return SkillNode(
      id: json['id'] as String,
      category: json['category'] as String,
      name: json['name'] as String,
      isUnlocked: json['isUnlocked'] as bool? ?? false,
      isCompleted: json['isCompleted'] as bool? ?? false,
      xpEarned: json['xpEarned'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'category': category,
        'name': name,
        'isUnlocked': isUnlocked,
        'isCompleted': isCompleted,
        'xpEarned': xpEarned,
      };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SkillNode &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          category == other.category &&
          name == other.name &&
          isUnlocked == other.isUnlocked &&
          isCompleted == other.isCompleted &&
          xpEarned == other.xpEarned;

  @override
  int get hashCode => Object.hash(id, category, name, isUnlocked, isCompleted, xpEarned);
}

@immutable
class QuizScore {
  final String algorithmId;
  final int score;
  final int correctAnswers;
  final int totalQuestions;
  final String timestamp;

  const QuizScore({
    required this.algorithmId,
    required this.score,
    required this.correctAnswers,
    required this.totalQuestions,
    required this.timestamp,
  });

  QuizScore copyWith({
    String? algorithmId,
    int? score,
    int? correctAnswers,
    int? totalQuestions,
    String? timestamp,
  }) {
    return QuizScore(
      algorithmId: algorithmId ?? this.algorithmId,
      score: score ?? this.score,
      correctAnswers: correctAnswers ?? this.correctAnswers,
      totalQuestions: totalQuestions ?? this.totalQuestions,
      timestamp: timestamp ?? this.timestamp,
    );
  }

  factory QuizScore.fromJson(Map<String, dynamic> json) {
    return QuizScore(
      algorithmId: json['algorithmId'] as String,
      score: json['score'] as int,
      correctAnswers: json['correctAnswers'] as int,
      totalQuestions: json['totalQuestions'] as int,
      timestamp: json['timestamp'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'algorithmId': algorithmId,
        'score': score,
        'correctAnswers': correctAnswers,
        'totalQuestions': totalQuestions,
        'timestamp': timestamp,
      };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is QuizScore &&
          runtimeType == other.runtimeType &&
          algorithmId == other.algorithmId &&
          score == other.score &&
          correctAnswers == other.correctAnswers &&
          totalQuestions == other.totalQuestions &&
          timestamp == other.timestamp;

  @override
  int get hashCode =>
      Object.hash(algorithmId, score, correctAnswers, totalQuestions, timestamp);
}

@immutable
class ChallengeCompletion {
  final String challengeId;
  final String algorithmUsed;
  final List<String> nodesVisited;
  final int pathLength;
  final bool passed;
  final String timestamp;

  const ChallengeCompletion({
    required this.challengeId,
    required this.algorithmUsed,
    required this.nodesVisited,
    required this.pathLength,
    required this.passed,
    required this.timestamp,
  });

  ChallengeCompletion copyWith({
    String? challengeId,
    String? algorithmUsed,
    List<String>? nodesVisited,
    int? pathLength,
    bool? passed,
    String? timestamp,
  }) {
    return ChallengeCompletion(
      challengeId: challengeId ?? this.challengeId,
      algorithmUsed: algorithmUsed ?? this.algorithmUsed,
      nodesVisited: nodesVisited ?? this.nodesVisited,
      pathLength: pathLength ?? this.pathLength,
      passed: passed ?? this.passed,
      timestamp: timestamp ?? this.timestamp,
    );
  }

  factory ChallengeCompletion.fromJson(Map<String, dynamic> json) {
    return ChallengeCompletion(
      challengeId: json['challengeId'] as String,
      algorithmUsed: json['algorithmUsed'] as String,
      nodesVisited: (json['nodesVisited'] as List<dynamic>).cast<String>(),
      pathLength: json['pathLength'] as int,
      passed: json['passed'] as bool,
      timestamp: json['timestamp'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'challengeId': challengeId,
        'algorithmUsed': algorithmUsed,
        'nodesVisited': nodesVisited,
        'pathLength': pathLength,
        'passed': passed,
        'timestamp': timestamp,
      };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ChallengeCompletion &&
          runtimeType == other.runtimeType &&
          challengeId == other.challengeId &&
          algorithmUsed == other.algorithmUsed &&
          listEquals(nodesVisited, other.nodesVisited) &&
          pathLength == other.pathLength &&
          passed == other.passed &&
          timestamp == other.timestamp;

  @override
  int get hashCode =>
      Object.hash(challengeId, algorithmUsed, Object.hashAll(nodesVisited), pathLength, passed, timestamp);
}

@immutable
class AlgorithmMastery {
  final String algorithmId;
  final List<double> quizScores;
  final double masteryLevel;
  final int challengesCompleted;
  final int totalChallenges;

  const AlgorithmMastery({
    required this.algorithmId,
    required this.quizScores,
    required this.masteryLevel,
    required this.challengesCompleted,
    required this.totalChallenges,
  });

  AlgorithmMastery copyWith({
    String? algorithmId,
    List<double>? quizScores,
    double? masteryLevel,
    int? challengesCompleted,
    int? totalChallenges,
  }) {
    return AlgorithmMastery(
      algorithmId: algorithmId ?? this.algorithmId,
      quizScores: quizScores ?? this.quizScores,
      masteryLevel: masteryLevel ?? this.masteryLevel,
      challengesCompleted: challengesCompleted ?? this.challengesCompleted,
      totalChallenges: totalChallenges ?? this.totalChallenges,
    );
  }

  factory AlgorithmMastery.fromJson(Map<String, dynamic> json) {
    return AlgorithmMastery(
      algorithmId: json['algorithmId'] as String,
      quizScores: (json['quizScores'] as List<dynamic>).cast<double>(),
      masteryLevel: (json['masteryLevel'] as num).toDouble(),
      challengesCompleted: json['challengesCompleted'] as int,
      totalChallenges: json['totalChallenges'] as int,
    );
  }

  Map<String, dynamic> toJson() => {
        'algorithmId': algorithmId,
        'quizScores': quizScores,
        'masteryLevel': masteryLevel,
        'challengesCompleted': challengesCompleted,
        'totalChallenges': totalChallenges,
      };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AlgorithmMastery &&
          runtimeType == other.runtimeType &&
          algorithmId == other.algorithmId &&
          listEquals(quizScores, other.quizScores) &&
          masteryLevel == other.masteryLevel &&
          challengesCompleted == other.challengesCompleted &&
          totalChallenges == other.totalChallenges;

  @override
  int get hashCode =>
      Object.hash(algorithmId, Object.hashAll(quizScores), masteryLevel, challengesCompleted, totalChallenges);
}

// ---------------------------------------------------------------------------
// Main model
// ---------------------------------------------------------------------------

@immutable
class UserProgress {
  final int level;
  final int totalXP;
  final int currentStreak;
  final String? lastPlayedDate;
  final List<String> completedAlgorithms;
  final List<String> unlockedCategories;
  final List<SkillNode> skillNodes;
  final List<QuizScore> quizHistory;
  final List<ChallengeCompletion> challengeHistory;
  final Map<String, AlgorithmMastery> algorithmMastery;

  const UserProgress({
    this.level = 1,
    this.totalXP = 0,
    this.currentStreak = 0,
    this.lastPlayedDate,
    this.completedAlgorithms = const [],
    this.unlockedCategories = const [],
    this.skillNodes = const [],
    this.quizHistory = const [],
    this.challengeHistory = const [],
    this.algorithmMastery = const {},
  });

  UserProgress copyWith({
    int? level,
    int? totalXP,
    int? currentStreak,
    String? lastPlayedDate,
    List<String>? completedAlgorithms,
    List<String>? unlockedCategories,
    List<SkillNode>? skillNodes,
    List<QuizScore>? quizHistory,
    List<ChallengeCompletion>? challengeHistory,
    Map<String, AlgorithmMastery>? algorithmMastery,
  }) {
    return UserProgress(
      level: level ?? this.level,
      totalXP: totalXP ?? this.totalXP,
      currentStreak: currentStreak ?? this.currentStreak,
      lastPlayedDate: lastPlayedDate ?? this.lastPlayedDate,
      completedAlgorithms: completedAlgorithms ?? this.completedAlgorithms,
      unlockedCategories: unlockedCategories ?? this.unlockedCategories,
      skillNodes: skillNodes ?? this.skillNodes,
      quizHistory: quizHistory ?? this.quizHistory,
      challengeHistory: challengeHistory ?? this.challengeHistory,
      algorithmMastery: algorithmMastery ?? this.algorithmMastery,
    );
  }

  factory UserProgress.fromJson(Map<String, dynamic> json) {
    return UserProgress(
      level: json['level'] as int? ?? 1,
      totalXP: json['totalXP'] as int? ?? 0,
      currentStreak: json['currentStreak'] as int? ?? 0,
      lastPlayedDate: json['lastPlayedDate'] as String?,
      completedAlgorithms: (json['completedAlgorithms'] as List<dynamic>?)?.cast<String>() ?? [],
      unlockedCategories: (json['unlockedCategories'] as List<dynamic>?)?.cast<String>() ?? [],
      skillNodes: (json['skillNodes'] as List<dynamic>?)
              ?.map((e) => SkillNode.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      quizHistory: (json['quizHistory'] as List<dynamic>?)
              ?.map((e) => QuizScore.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      challengeHistory: (json['challengeHistory'] as List<dynamic>?)
              ?.map((e) => ChallengeCompletion.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      algorithmMastery: (json['algorithmMastery'] as Map<String, dynamic>?)
              ?.map((k, v) => MapEntry(k, AlgorithmMastery.fromJson(v as Map<String, dynamic>))) ??
          {},
    );
  }

  Map<String, dynamic> toJson() => {
        'level': level,
        'totalXP': totalXP,
        'currentStreak': currentStreak,
        'lastPlayedDate': lastPlayedDate,
        'completedAlgorithms': completedAlgorithms,
        'unlockedCategories': unlockedCategories,
        'skillNodes': skillNodes.map((e) => e.toJson()).toList(),
        'quizHistory': quizHistory.map((e) => e.toJson()).toList(),
        'challengeHistory': challengeHistory.map((e) => e.toJson()).toList(),
        'algorithmMastery': algorithmMastery.map((k, v) => MapEntry(k, v.toJson())),
      };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is UserProgress &&
          runtimeType == other.runtimeType &&
          level == other.level &&
          totalXP == other.totalXP &&
          currentStreak == other.currentStreak &&
          lastPlayedDate == other.lastPlayedDate &&
          listEquals(completedAlgorithms, other.completedAlgorithms) &&
          listEquals(unlockedCategories, other.unlockedCategories) &&
          listEquals(skillNodes, other.skillNodes) &&
          listEquals(quizHistory, other.quizHistory) &&
          listEquals(challengeHistory, other.challengeHistory) &&
          _mapEquals(algorithmMastery, other.algorithmMastery);

  @override
  int get hashCode => Object.hash(
        level,
        totalXP,
        currentStreak,
        lastPlayedDate,
        Object.hashAll(completedAlgorithms),
        Object.hashAll(unlockedCategories),
        Object.hashAll(skillNodes),
        Object.hashAll(quizHistory),
        Object.hashAll(challengeHistory),
        Object.hashAllUnordered(algorithmMastery.entries),
      );
}

bool _mapEquals<K, V>(Map<K, V> a, Map<K, V> b) {
  if (a.length != b.length) return false;
  for (final key in a.keys) {
    if (!b.containsKey(key) || a[key] != b[key]) return false;
  }
  return true;
}
