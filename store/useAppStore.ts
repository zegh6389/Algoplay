import { create } from 'zustand';
import { MasteryLevel, getMasteryLevel } from '@/utils/quizData';

// User Progress Types
export interface SkillNode {
  id: string;
  category: string;
  name: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  xpEarned: number;
}

// Quiz Score tracking
export interface QuizScore {
  algorithmId: string;
  score: number; // Percentage
  correctAnswers: number;
  totalQuestions: number;
  timestamp: string;
}

// Challenge completion tracking
export interface ChallengeCompletion {
  challengeId: string;
  algorithmUsed: string;
  nodesVisited: number;
  pathLength: number;
  passed: boolean;
  timestamp: string;
}

// Mastery tracking per algorithm
export interface AlgorithmMastery {
  algorithmId: string;
  quizScores: number[]; // Array of percentage scores
  masteryLevel: MasteryLevel;
  challengesCompleted: number;
  totalChallenges: number;
}

export interface UserProgress {
  level: number;
  totalXP: number;
  currentStreak: number;
  lastPlayedDate: string | null;
  completedAlgorithms: string[];
  unlockedCategories: string[];
  skillNodes: SkillNode[];
  // New assessment fields
  quizHistory: QuizScore[];
  challengeHistory: ChallengeCompletion[];
  algorithmMastery: Record<string, AlgorithmMastery>;
}

// Game State Types
export interface GameState {
  highScores: {
    sorterBest: number;
    gridEscapeWins: number;
  };
  dailyChallengeCompleted: boolean;
  dailyChallengeDate: string | null;
}

// Visualization State
export interface VisualizationSettings {
  speed: number; // 0.5 to 3
  arraySize: number;
  showComplexity: boolean;
  showCode: boolean;
}

// Store Interface
interface AppState {
  // User Progress
  userProgress: UserProgress;
  gameState: GameState;
  visualizationSettings: VisualizationSettings;

  // Actions
  completeAlgorithm: (algorithmId: string, xp: number) => void;
  unlockCategory: (categoryId: string) => void;
  updateStreak: () => void;
  addXP: (amount: number) => void;
  setVisualizationSpeed: (speed: number) => void;
  setArraySize: (size: number) => void;
  toggleShowComplexity: () => void;
  toggleShowCode: () => void;
  updateHighScore: (game: 'sorterBest' | 'gridEscapeWins', score: number) => void;
  completeDailyChallenge: () => void;
  resetProgress: () => void;

  // Quiz & Mastery Actions
  recordQuizScore: (algorithmId: string, score: number, correctAnswers: number, totalQuestions: number) => void;
  recordChallengeCompletion: (challengeId: string, algorithmUsed: string, nodesVisited: number, pathLength: number, passed: boolean) => void;
  getAlgorithmMastery: (algorithmId: string) => AlgorithmMastery;
  getLevelProgress: () => { currentXP: number; xpForNextLevel: number; progress: number };
}

const initialSkillNodes: SkillNode[] = [
  // Searching
  { id: 'linear-search', category: 'searching', name: 'Linear Search', isUnlocked: true, isCompleted: false, xpEarned: 0 },
  { id: 'binary-search', category: 'searching', name: 'Binary Search', isUnlocked: false, isCompleted: false, xpEarned: 0 },
  // Sorting
  { id: 'bubble-sort', category: 'sorting', name: 'Bubble Sort', isUnlocked: true, isCompleted: false, xpEarned: 0 },
  { id: 'selection-sort', category: 'sorting', name: 'Selection Sort', isUnlocked: true, isCompleted: false, xpEarned: 0 },
  { id: 'insertion-sort', category: 'sorting', name: 'Insertion Sort', isUnlocked: false, isCompleted: false, xpEarned: 0 },
  { id: 'merge-sort', category: 'sorting', name: 'Merge Sort', isUnlocked: false, isCompleted: false, xpEarned: 0 },
  { id: 'quick-sort', category: 'sorting', name: 'Quick Sort', isUnlocked: false, isCompleted: false, xpEarned: 0 },
  // Graphs
  { id: 'bfs', category: 'graphs', name: 'BFS', isUnlocked: true, isCompleted: false, xpEarned: 0 },
  { id: 'dfs', category: 'graphs', name: 'DFS', isUnlocked: true, isCompleted: false, xpEarned: 0 },
  { id: 'dijkstra', category: 'graphs', name: 'Dijkstra', isUnlocked: false, isCompleted: false, xpEarned: 0 },
  { id: 'astar', category: 'graphs', name: 'A*', isUnlocked: false, isCompleted: false, xpEarned: 0 },
  // Dynamic Programming
  { id: 'fibonacci', category: 'dynamic-programming', name: 'Fibonacci', isUnlocked: true, isCompleted: false, xpEarned: 0 },
  { id: 'knapsack', category: 'dynamic-programming', name: 'Knapsack', isUnlocked: false, isCompleted: false, xpEarned: 0 },
  // Greedy
  { id: 'activity-selection', category: 'greedy', name: 'Activity Selection', isUnlocked: false, isCompleted: false, xpEarned: 0 },
];

const initialUserProgress: UserProgress = {
  level: 1,
  totalXP: 0,
  currentStreak: 0,
  lastPlayedDate: null,
  completedAlgorithms: [],
  unlockedCategories: ['searching', 'sorting', 'graphs'],
  skillNodes: initialSkillNodes,
  // New assessment fields
  quizHistory: [],
  challengeHistory: [],
  algorithmMastery: {},
};

const initialGameState: GameState = {
  highScores: {
    sorterBest: 0,
    gridEscapeWins: 0,
  },
  dailyChallengeCompleted: false,
  dailyChallengeDate: null,
};

const initialVisualizationSettings: VisualizationSettings = {
  speed: 1,
  arraySize: 10,
  showComplexity: true,
  showCode: true,
};

export const useAppStore = create<AppState>((set, get) => ({
  userProgress: initialUserProgress,
  gameState: initialGameState,
  visualizationSettings: initialVisualizationSettings,

  completeAlgorithm: (algorithmId: string, xp: number) => {
    set((state) => {
      const newSkillNodes = state.userProgress.skillNodes.map((node) => {
        if (node.id === algorithmId) {
          return { ...node, isCompleted: true, xpEarned: node.xpEarned + xp };
        }
        return node;
      });

      // Unlock next algorithm in category
      const completedNode = newSkillNodes.find((n) => n.id === algorithmId);
      if (completedNode) {
        const categoryNodes = newSkillNodes.filter((n) => n.category === completedNode.category);
        const currentIndex = categoryNodes.findIndex((n) => n.id === algorithmId);
        if (currentIndex < categoryNodes.length - 1) {
          const nextNode = categoryNodes[currentIndex + 1];
          const nextIndex = newSkillNodes.findIndex((n) => n.id === nextNode.id);
          if (nextIndex !== -1) {
            newSkillNodes[nextIndex] = { ...newSkillNodes[nextIndex], isUnlocked: true };
          }
        }
      }

      const newTotalXP = state.userProgress.totalXP + xp;
      const newLevel = Math.floor(newTotalXP / 500) + 1;

      return {
        userProgress: {
          ...state.userProgress,
          skillNodes: newSkillNodes,
          totalXP: newTotalXP,
          level: newLevel,
          completedAlgorithms: state.userProgress.completedAlgorithms.includes(algorithmId)
            ? state.userProgress.completedAlgorithms
            : [...state.userProgress.completedAlgorithms, algorithmId],
        },
      };
    });
  },

  unlockCategory: (categoryId: string) => {
    set((state) => ({
      userProgress: {
        ...state.userProgress,
        unlockedCategories: state.userProgress.unlockedCategories.includes(categoryId)
          ? state.userProgress.unlockedCategories
          : [...state.userProgress.unlockedCategories, categoryId],
      },
    }));
  },

  updateStreak: () => {
    const today = new Date().toISOString().split('T')[0];
    set((state) => {
      const lastPlayed = state.userProgress.lastPlayedDate;
      let newStreak = state.userProgress.currentStreak;

      if (lastPlayed) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastPlayed === yesterdayStr) {
          newStreak += 1;
        } else if (lastPlayed !== today) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      return {
        userProgress: {
          ...state.userProgress,
          currentStreak: newStreak,
          lastPlayedDate: today,
        },
      };
    });
  },

  addXP: (amount: number) => {
    set((state) => {
      const newTotalXP = state.userProgress.totalXP + amount;
      const newLevel = Math.floor(newTotalXP / 500) + 1;

      return {
        userProgress: {
          ...state.userProgress,
          totalXP: newTotalXP,
          level: newLevel,
        },
      };
    });
  },

  setVisualizationSpeed: (speed: number) => {
    set((state) => ({
      visualizationSettings: {
        ...state.visualizationSettings,
        speed: Math.max(0.5, Math.min(3, speed)),
      },
    }));
  },

  setArraySize: (size: number) => {
    set((state) => ({
      visualizationSettings: {
        ...state.visualizationSettings,
        arraySize: Math.max(5, Math.min(20, size)),
      },
    }));
  },

  toggleShowComplexity: () => {
    set((state) => ({
      visualizationSettings: {
        ...state.visualizationSettings,
        showComplexity: !state.visualizationSettings.showComplexity,
      },
    }));
  },

  toggleShowCode: () => {
    set((state) => ({
      visualizationSettings: {
        ...state.visualizationSettings,
        showCode: !state.visualizationSettings.showCode,
      },
    }));
  },

  updateHighScore: (game: 'sorterBest' | 'gridEscapeWins', score: number) => {
    set((state) => ({
      gameState: {
        ...state.gameState,
        highScores: {
          ...state.gameState.highScores,
          [game]: Math.max(state.gameState.highScores[game], score),
        },
      },
    }));
  },

  completeDailyChallenge: () => {
    const today = new Date().toISOString().split('T')[0];
    set((state) => ({
      gameState: {
        ...state.gameState,
        dailyChallengeCompleted: true,
        dailyChallengeDate: today,
      },
    }));
  },

  resetProgress: () => {
    set({
      userProgress: initialUserProgress,
      gameState: initialGameState,
      visualizationSettings: initialVisualizationSettings,
    });
  },

  // Quiz & Mastery Actions
  recordQuizScore: (algorithmId: string, score: number, correctAnswers: number, totalQuestions: number) => {
    set((state) => {
      const newQuizScore: QuizScore = {
        algorithmId,
        score,
        correctAnswers,
        totalQuestions,
        timestamp: new Date().toISOString(),
      };

      const currentMastery = state.userProgress.algorithmMastery[algorithmId] || {
        algorithmId,
        quizScores: [],
        masteryLevel: 'none' as MasteryLevel,
        challengesCompleted: 0,
        totalChallenges: 0,
      };

      const updatedQuizScores = [...currentMastery.quizScores, score];
      const newMasteryLevel = getMasteryLevel(updatedQuizScores);

      return {
        userProgress: {
          ...state.userProgress,
          quizHistory: [...state.userProgress.quizHistory, newQuizScore],
          algorithmMastery: {
            ...state.userProgress.algorithmMastery,
            [algorithmId]: {
              ...currentMastery,
              quizScores: updatedQuizScores,
              masteryLevel: newMasteryLevel,
            },
          },
        },
      };
    });
  },

  recordChallengeCompletion: (challengeId: string, algorithmUsed: string, nodesVisited: number, pathLength: number, passed: boolean) => {
    set((state) => {
      const newChallenge: ChallengeCompletion = {
        challengeId,
        algorithmUsed,
        nodesVisited,
        pathLength,
        passed,
        timestamp: new Date().toISOString(),
      };

      // Update mastery for the algorithm used
      const currentMastery = state.userProgress.algorithmMastery[algorithmUsed] || {
        algorithmId: algorithmUsed,
        quizScores: [],
        masteryLevel: 'none' as MasteryLevel,
        challengesCompleted: 0,
        totalChallenges: 0,
      };

      const updatedMastery = {
        ...currentMastery,
        challengesCompleted: passed ? currentMastery.challengesCompleted + 1 : currentMastery.challengesCompleted,
        totalChallenges: currentMastery.totalChallenges + 1,
      };

      // Recalculate mastery based on quiz scores AND challenge completion
      const combinedScore = calculateCombinedMastery(updatedMastery.quizScores, updatedMastery.challengesCompleted, updatedMastery.totalChallenges);
      updatedMastery.masteryLevel = getMasteryLevel([combinedScore]);

      return {
        userProgress: {
          ...state.userProgress,
          challengeHistory: [...state.userProgress.challengeHistory, newChallenge],
          algorithmMastery: {
            ...state.userProgress.algorithmMastery,
            [algorithmUsed]: updatedMastery,
          },
        },
      };
    });
  },

  getAlgorithmMastery: (algorithmId: string) => {
    const state = get();
    return state.userProgress.algorithmMastery[algorithmId] || {
      algorithmId,
      quizScores: [],
      masteryLevel: 'none' as MasteryLevel,
      challengesCompleted: 0,
      totalChallenges: 0,
    };
  },

  getLevelProgress: () => {
    const state = get();
    const xpPerLevel = 500;
    const currentLevelXP = (state.userProgress.level - 1) * xpPerLevel;
    const currentXP = state.userProgress.totalXP - currentLevelXP;
    const xpForNextLevel = xpPerLevel;
    const progress = Math.min(currentXP / xpForNextLevel, 1);

    return { currentXP, xpForNextLevel, progress };
  },
}));

// Helper function to calculate combined mastery score
function calculateCombinedMastery(quizScores: number[], challengesCompleted: number, totalChallenges: number): number {
  let quizAvg = 0;
  let challengeScore = 0;

  if (quizScores.length > 0) {
    quizAvg = quizScores.reduce((a, b) => a + b, 0) / quizScores.length;
  }

  if (totalChallenges > 0) {
    challengeScore = (challengesCompleted / totalChallenges) * 100;
  }

  // Weight: 60% quiz, 40% challenges
  if (quizScores.length === 0 && totalChallenges === 0) return 0;
  if (quizScores.length === 0) return challengeScore;
  if (totalChallenges === 0) return quizAvg;

  return quizAvg * 0.6 + challengeScore * 0.4;
}
