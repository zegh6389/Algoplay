import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/haptics.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/providers/app_providers.dart';
import '../../../shared/services/game_result_recorder.dart';
import '../../arena/data/arena_repository.dart';
import '../data/question_bank.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Battle Arena Page — Head-to-head algorithm battle game.
///
/// Two players compete to answer algorithm questions faster and more
/// accurately. Real-time scoring, time pressure, and streak bonuses.
// ═══════════════════════════════════════════════════════════════════════════════

/// Battle state enum
enum BattleState { idle, countdown, battle, finished }

// ═══════════════════════════════════════════════════════════════════════════════
/// BattleArenaPage
// ═══════════════════════════════════════════════════════════════════════════════
class BattleArenaPage extends ConsumerStatefulWidget {
  const BattleArenaPage({super.key});

  @override
  ConsumerState<BattleArenaPage> createState() => _BattleArenaPageState();
}

class _BattleArenaPageState extends ConsumerState<BattleArenaPage>
    with TickerProviderStateMixin {
  /// Probability the simulated opponent answers a question correctly.
  static const double _opponentAccuracy = 0.7;

  BattleState _state = BattleState.idle;
  int _currentQuestionIndex = 0;
  int _playerScore = 0;
  int _opponentScore = 0;
  int _playerStreak = 0;
  int _opponentStreak = 0;
  String? _selectedAnswer;
  bool? _answerCorrect;
  int _timeRemaining = 15;
  int _questionNumber = 1;
  bool _recorded = false;
  late List<BattleQuestion> _questions;
  Timer? _timer;
  Timer? _opponentTimer;

  late AnimationController _countdownController;
  late Animation<int> _countdownAnimation;

  @override
  void initState() {
    super.initState();
    _questions = QuestionBank.generate(
      count: 5,
      seed: Random().nextInt(100000),
    );
    _countdownController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    );
    _countdownAnimation = IntTween(begin: 3, end: 1).animate(
      CurvedAnimation(parent: _countdownController, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    _opponentTimer?.cancel();
    _countdownController.dispose();
    super.dispose();
  }

  void _startBattle() {
    setState(() {
      _questions = QuestionBank.generate(
        count: 5,
        seed: Random().nextInt(100000),
      );
      _state = BattleState.countdown;
      _playerScore = 0;
      _opponentScore = 0;
      _playerStreak = 0;
      _opponentStreak = 0;
      _currentQuestionIndex = 0;
      _questionNumber = 1;
      _recorded = false;
    });

    _countdownController.forward(from: 0).then((_) {
      if (!mounted) return;
      setState(() => _state = BattleState.battle);
      _startQuestionTimer();
    });
  }

  void _startQuestionTimer() {
    final question = _questions[_currentQuestionIndex];
    _timer?.cancel();
    setState(() {
      _timeRemaining = question.timeLimitSeconds;
      _selectedAnswer = null;
      _answerCorrect = null;
    });

    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted || _state != BattleState.battle) return;
      setState(() => _timeRemaining--);
      if (_timeRemaining <= 0) {
        _timer?.cancel();
        _onTimeUp();
      }
    });

    _simulateOpponent(question);
  }

  /// Player ran out of time — counts as a wrong (unanswered) guess.
  void _onTimeUp() {
    if (_selectedAnswer != null) return; // already answered
    Haptics.error();
    setState(() {
      _selectedAnswer = ''; // sentinel locks the options
      _answerCorrect = false;
      _playerStreak = 0;
    });
    Future.delayed(const Duration(milliseconds: 1200), () {
      if (mounted) _advanceQuestion();
    });
  }

  /// Opponent answers after ~60% of the time limit elapses, with a fixed
  /// accuracy — independent of the player's score (no rubber-banding).
  ///
  /// The response is tagged with the question index so a slow opponent reply
  /// can never bleed into the next question if the player answered fast.
  void _simulateOpponent(BattleQuestion question) {
    final myIndex = _currentQuestionIndex;
    final delaySeconds = (question.timeLimitSeconds * 0.6).round();
    _opponentTimer?.cancel();
    _opponentTimer = Timer(Duration(seconds: delaySeconds), () {
      if (!mounted || _state != BattleState.battle) return;
      if (_currentQuestionIndex != myIndex) return; // advanced past this question
      setState(() {
        final correct = Random().nextDouble() < _opponentAccuracy;
        if (correct) {
          _opponentScore += 10 + (_opponentStreak * 2);
          _opponentStreak++;
        } else {
          _opponentStreak = 0;
        }
      });
    });
  }

  void _selectAnswer(String answer) {
    if (_selectedAnswer != null) return;

    _timer?.cancel();
    final question = _questions[_currentQuestionIndex];
    final isCorrect = answer == question.correctAnswer;

    setState(() {
      _selectedAnswer = answer;
      _answerCorrect = isCorrect;
      if (isCorrect) {
        Haptics.success();
        _playerScore += 10 + (_playerStreak * 2);
        _playerStreak++;
      } else {
        Haptics.error();
        _playerStreak = 0;
      }
    });

    Future.delayed(const Duration(milliseconds: 1500), () {
      if (mounted) _advanceQuestion();
    });
  }

  void _advanceQuestion() {
    _timer?.cancel();
    if (_currentQuestionIndex < _questions.length - 1) {
      setState(() {
        _currentQuestionIndex++;
        _questionNumber++;
      });
      _startQuestionTimer();
    } else {
      _finishMatch();
    }
  }

  void _finishMatch() {
    _timer?.cancel();
    final won = _playerScore > _opponentScore;
    if (won) {
      Haptics.heavy();
    } else if (_playerScore == _opponentScore) {
      Haptics.light();
    } else {
      Haptics.error();
    }
    setState(() => _state = BattleState.finished);
    _recordResult();
  }

  void _recordResult() {
    if (_recorded) return;
    _recorded = true;
    final won = _playerScore > _opponentScore; // strict — ties are not wins

    // Persist to Elite Arena's match history.
    ArenaRepository().recordMatch(
      MatchRecord(
        opponent: 'Rival',
        result: won ? 'win' : 'loss',
        score: '$_playerScore-$_opponentScore',
        date: DateTime.now().toIso8601String(),
        algorithm: 'Mixed',
      ),
    );

    // Fan out XP / activity / high-score across all stores.
    GameResultRecorder.record(
      ref,
      GameResult(
        game: GameId.battleArena,
        won: won,
        score: _playerScore,
        xpReward: won ? 15 + (_playerScore ~/ 10) : _playerScore ~/ 20,
        activityMinutes: 3,
        category: 'battle-arena',
      ),
    );
  }

  void _resetBattle() {
    _timer?.cancel();
    _opponentTimer?.cancel();
    setState(() => _state = BattleState.idle);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        backgroundColor: AppColors.card,
        title: const Text('Battle Arena'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
      ),
      body: SafeArea(top: false, child: _buildBody()),
    );
  }

  Widget _buildBody() {
    switch (_state) {
      case BattleState.idle:
        return _buildIdleState();
      case BattleState.countdown:
        return _buildCountdownState();
      case BattleState.battle:
        return _buildBattleState();
      case BattleState.finished:
        return _buildFinishedState();
    }
  }

  Widget _buildIdleState() {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        children: [
          const Spacer(),
          // Arena icon
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: AppColors.secondary500.withValues(alpha: 0.12),
              borderRadius: AppRadius.xlBorder,
            ),
            alignment: Alignment.center,
            child: const Icon(
              Icons.sports_martial_arts,
              size: 48,
              color: AppColors.secondary500,
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          Text('Battle Arena', style: AppTypography.h1),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Challenge another player in a head-to-head\nalgorithm showdown!',
            textAlign: TextAlign.center,
            style: AppTypography.body.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.xxl),
          _buildRulesList(),
          const Spacer(),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _startBattle,
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.secondary500,
                minimumSize: const Size.fromHeight(52),
                shape: RoundedRectangleBorder(borderRadius: AppRadius.mdBorder),
              ),
              child: const Text('Find Opponent'),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
        ],
      ),
    );
  }

  Widget _buildRulesList() {
    final rules = [
      'Answer algorithm questions faster than your opponent',
      'Correct answers earn points + streak bonuses',
      '5 rounds total — highest score wins',
      'Questions cover sorting, searching, graphs & more',
    ];
    return Column(
      children: [
        Text('How to Play', style: AppTypography.h3),
        const SizedBox(height: AppSpacing.md),
        ...rules.map(
          (r) => Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.sm),
            child: Row(
              children: [
                const Icon(
                  Icons.check_circle,
                  color: AppColors.success600,
                  size: 18,
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(child: Text(r, style: AppTypography.caption)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCountdownState() {
    return Center(
      child: AnimatedBuilder(
        animation: _countdownAnimation,
        builder: (context, child) {
          return Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Get Ready!',
                style: AppTypography.h2.copyWith(color: AppColors.secondary500),
              ),
              const SizedBox(height: AppSpacing.xl),
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: AppColors.secondary500,
                  borderRadius: AppRadius.xlBorder,
                  boxShadow: AppShadows.lg,
                ),
                alignment: Alignment.center,
                child: Text(
                  '${_countdownAnimation.value}',
                  style: const TextStyle(
                    fontSize: 64,
                    fontWeight: FontWeight.w900,
                    color: AppColors.textInverse,
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildBattleState() {
    final question = _questions[_currentQuestionIndex];

    return Column(
      children: [
        // ── Score Bar ──
        _buildScoreBar(),

        // ── Question Progress ──
        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.md,
          ),
          child: Row(
            children: [
              Text(
                'Question $_questionNumber / ${_questions.length}',
                style: AppTypography.caption,
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.sm,
                  vertical: AppSpacing.xs,
                ),
                decoration: BoxDecoration(
                  color: _timeRemaining <= 5
                      ? AppColors.error600
                      : AppColors.sunken,
                  borderRadius: AppRadius.smBorder,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.timer,
                      size: 14,
                      color: _timeRemaining <= 5
                          ? AppColors.textInverse
                          : AppColors.textMuted,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${_timeRemaining}s',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: _timeRemaining <= 5
                            ? AppColors.textInverse
                            : AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        // ── Question Card ──
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: AppRadius.lgBorder,
              boxShadow: AppShadows.sm,
            ),
            child: Column(
              children: [
                Text(question.question, style: AppTypography.h3),
                const SizedBox(height: AppSpacing.lg),
                // Options grid
                ...question.options.map(
                  (option) => Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                    child: _AnswerOption(
                      text: option,
                      isSelected: _selectedAnswer == option,
                      isCorrect: option == question.correctAnswer,
                      showResult: _selectedAnswer != null,
                      onTap: () => _selectAnswer(option),
                    ),
                  ),
                ),
                if (_selectedAnswer != null && !_answerCorrect!) ...[
                  const SizedBox(height: AppSpacing.md),
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.primary50,
                      borderRadius: AppRadius.mdBorder,
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.lightbulb_outline,
                          color: AppColors.primary500,
                          size: 18,
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: Text(
                            question.hint,
                            style: AppTypography.caption.copyWith(
                              color: AppColors.primary700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),

        const Spacer(),

        // ── Streak indicator ──
        if (_playerStreak >= 2)
          Container(
            margin: const EdgeInsets.only(bottom: AppSpacing.lg),
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.sm,
            ),
            decoration: BoxDecoration(
              color: AppColors.solarAmber.withValues(alpha: 0.15),
              borderRadius: AppRadius.mdBorder,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.local_fire_department,
                  color: AppColors.secondary500,
                  size: 20,
                ),
                const SizedBox(width: AppSpacing.sm),
                Text(
                  '${_playerStreak} Streak! +${_playerStreak * 2} bonus',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.secondary700,
                  ),
                ),
              ],
            ),
          ),

        SizedBox(height: MediaQuery.of(context).padding.bottom + AppSpacing.lg),
      ],
    );
  }

  Widget _buildScoreBar() {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.md,
      ),
      decoration: const BoxDecoration(
        color: AppColors.card,
        border: Border(bottom: BorderSide(color: AppColors.sunken)),
      ),
      child: Row(
        children: [
          // Player
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('You', style: AppTypography.caption),
                Text(
                  '$_playerScore pts',
                  style: AppTypography.h3.copyWith(color: AppColors.primary500),
                ),
              ],
            ),
          ),

          // VS divider
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.xs,
            ),
            decoration: BoxDecoration(
              color: AppColors.sunken,
              borderRadius: AppRadius.smBorder,
            ),
            child: Text(
              'VS',
              style: AppTypography.bodyBold.copyWith(
                color: AppColors.textMuted,
                fontSize: 12,
              ),
            ),
          ),

          // Opponent
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text('Opponent', style: AppTypography.caption),
                Text(
                  '$_opponentScore pts',
                  style: AppTypography.h3.copyWith(
                    color: AppColors.secondary500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFinishedState() {
    final isDraw = _playerScore == _opponentScore;
    final playerWon = _playerScore > _opponentScore;
    final bestScore = ref.watch(gameStateProvider).highScores.battleArenaBestScore;

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        children: [
          const Spacer(),
          // Result icon
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: playerWon
                  ? AppColors.success600.withValues(alpha: 0.12)
                  : AppColors.error600.withValues(alpha: 0.12),
              borderRadius: AppRadius.xlBorder,
            ),
            alignment: Alignment.center,
            child: Icon(
              playerWon ? Icons.emoji_events : Icons.sentiment_dissatisfied,
              size: 48,
              color: playerWon ? AppColors.solarGold : AppColors.error600,
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          Text(
            isDraw ? 'Draw!' : (playerWon ? 'Victory!' : 'Defeat'),
            style: AppTypography.display.copyWith(
              color: playerWon ? AppColors.success600 : AppColors.error600,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            isDraw
                ? 'A dead heat — rematch?'
                : playerWon
                    ? 'You dominated the arena!'
                    : 'Better luck next time!',
            style: AppTypography.body.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.xxl),

          // Score comparison
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: AppRadius.lgBorder,
              boxShadow: AppShadows.sm,
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    children: [
                      Text('You', style: AppTypography.caption),
                      const SizedBox(height: AppSpacing.sm),
                      Text(
                        '$_playerScore',
                        style: AppTypography.display.copyWith(
                          color: AppColors.primary500,
                        ),
                      ),
                      Text('points', style: AppTypography.overline),
                      if (_playerStreak > 0) ...[
                        const SizedBox(height: AppSpacing.sm),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.local_fire_department,
                              color: AppColors.secondary500,
                              size: 16,
                            ),
                            Text(
                              ' $_playerStreak streak',
                              style: AppTypography.caption.copyWith(
                                color: AppColors.secondary500,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
                Container(width: 1, height: 80, color: AppColors.sunken),
                Expanded(
                  child: Column(
                    children: [
                      Text('Opponent', style: AppTypography.caption),
                      const SizedBox(height: AppSpacing.sm),
                      Text(
                        '$_opponentScore',
                        style: AppTypography.display.copyWith(
                          color: AppColors.secondary500,
                        ),
                      ),
                      Text('points', style: AppTypography.overline),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          // Best score badge
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.sm,
            ),
            decoration: BoxDecoration(
              color: AppColors.solarGold.withValues(alpha: 0.12),
              borderRadius: AppRadius.mdBorder,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.emoji_events, size: 16, color: AppColors.solarGold),
                const SizedBox(width: AppSpacing.xs),
                Text(
                  'Best: $bestScore pts',
                  style: AppTypography.caption.copyWith(
                    color: AppColors.solarGold,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
          const Spacer(),

          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _startBattle,
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.primary500,
                minimumSize: const Size.fromHeight(52),
                shape: RoundedRectangleBorder(borderRadius: AppRadius.mdBorder),
              ),
              child: const Text('Play Again'),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: _resetBattle,
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(48),
                shape: RoundedRectangleBorder(borderRadius: AppRadius.mdBorder),
              ),
              child: const Text('Back to Menu'),
            ),
          ),
          SizedBox(
            height: MediaQuery.of(context).padding.bottom + AppSpacing.lg,
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Answer option button
// ═══════════════════════════════════════════════════════════════════════════════
class _AnswerOption extends StatelessWidget {
  const _AnswerOption({
    required this.text,
    required this.isSelected,
    required this.isCorrect,
    required this.showResult,
    required this.onTap,
  });

  final String text;
  final bool isSelected;
  final bool isCorrect;
  final bool showResult;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    Color backgroundColor;
    Color borderColor;
    Color textColor;

    if (showResult) {
      if (isCorrect) {
        backgroundColor = AppColors.success100;
        borderColor = AppColors.success600;
        textColor = AppColors.success600;
      } else if (isSelected) {
        backgroundColor = AppColors.error100;
        borderColor = AppColors.error600;
        textColor = AppColors.error600;
      } else {
        backgroundColor = AppColors.card;
        borderColor = AppColors.sunken;
        textColor = AppColors.textMuted;
      }
    } else {
      backgroundColor = AppColors.card;
      borderColor = AppColors.sunken;
      textColor = AppColors.textPrimary;
    }

    return GestureDetector(
      onTap: showResult ? null : onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: double.infinity,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: AppRadius.mdBorder,
          border: Border.all(color: borderColor, width: 1.5),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                text,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                  color: textColor,
                ),
              ),
            ),
            if (showResult && isCorrect)
              const Icon(
                Icons.check_circle,
                color: AppColors.success600,
                size: 20,
              ),
            if (showResult && isSelected && !isCorrect)
              const Icon(Icons.cancel, color: AppColors.error600, size: 20),
          ],
        ),
      ),
    );
  }
}
