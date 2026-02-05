// Secure Local Storage
// Provides fast and persistent state management
// Uses AsyncStorage for Expo compatibility (MMKV can be added for production builds)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Storage Keys
export const StorageKeys = {
  // User Data
  USER_PROGRESS: 'algoplay_user_progress',
  USER_XP: 'algoplay_user_xp',
  USER_LEVEL: 'algoplay_user_level',
  USER_STREAKS: 'algoplay_user_streaks',
  LAST_PLAYED_DATE: 'algoplay_last_played_date',

  // Game State
  HIGH_SCORES: 'algoplay_high_scores',
  DAILY_CHALLENGE: 'algoplay_daily_challenge',
  COMPLETED_ALGORITHMS: 'algoplay_completed_algorithms',
  ALGORITHM_MASTERY: 'algoplay_algorithm_mastery',

  // Preferences
  VISUALIZATION_SPEED: 'algoplay_visualization_speed',
  ARRAY_SIZE: 'algoplay_array_size',
  SHOW_COMPLEXITY: 'algoplay_show_complexity',
  SHOW_CODE: 'algoplay_show_code',

  // Security
  SECURITY_CHECKSUM: 'algoplay_security_checksum',
  INSTALL_ID: 'algoplay_install_id',
  LAST_SECURITY_CHECK: 'algoplay_last_security_check',

  // Guest Mode
  GUEST_MODE: 'algoplay_guest_mode',
  GUEST_USERNAME: 'algoplay_guest_username',
} as const;

// In-memory cache for synchronous access
const memoryCache = new Map<string, any>();

// Type-safe storage operations
export const SecureStorage = {
  // String operations - async with memory cache
  getString: (key: string): string | undefined => {
    return memoryCache.get(key) as string | undefined;
  },

  setString: (key: string, value: string): boolean => {
    try {
      memoryCache.set(key, value);
      // Async persist to AsyncStorage
      AsyncStorage.setItem(key, value).catch((err) =>
        console.error(`[SecureStorage] Async persist error for ${key}:`, err)
      );
      return true;
    } catch (error) {
      console.error(`[SecureStorage] Error setting string for key ${key}:`, error);
      return false;
    }
  },

  // Number operations
  getNumber: (key: string): number | undefined => {
    const value = memoryCache.get(key);
    return typeof value === 'number' ? value : undefined;
  },

  setNumber: (key: string, value: number): boolean => {
    try {
      memoryCache.set(key, value);
      AsyncStorage.setItem(key, value.toString()).catch((err) =>
        console.error(`[SecureStorage] Async persist error for ${key}:`, err)
      );
      return true;
    } catch (error) {
      console.error(`[SecureStorage] Error setting number for key ${key}:`, error);
      return false;
    }
  },

  // Boolean operations
  getBoolean: (key: string): boolean | undefined => {
    const value = memoryCache.get(key);
    return typeof value === 'boolean' ? value : undefined;
  },

  setBoolean: (key: string, value: boolean): boolean => {
    try {
      memoryCache.set(key, value);
      AsyncStorage.setItem(key, value.toString()).catch((err) =>
        console.error(`[SecureStorage] Async persist error for ${key}:`, err)
      );
      return true;
    } catch (error) {
      console.error(`[SecureStorage] Error setting boolean for key ${key}:`, error);
      return false;
    }
  },

  // Object operations (JSON serialized)
  getObject: <T>(key: string): T | undefined => {
    return memoryCache.get(key) as T | undefined;
  },

  setObject: <T>(key: string, value: T): boolean => {
    try {
      memoryCache.set(key, value);
      AsyncStorage.setItem(key, JSON.stringify(value)).catch((err) =>
        console.error(`[SecureStorage] Async persist error for ${key}:`, err)
      );
      return true;
    } catch (error) {
      console.error(`[SecureStorage] Error setting object for key ${key}:`, error);
      return false;
    }
  },

  // Delete operation
  delete: (key: string): boolean => {
    try {
      memoryCache.delete(key);
      AsyncStorage.removeItem(key).catch((err) =>
        console.error(`[SecureStorage] Async delete error for ${key}:`, err)
      );
      return true;
    } catch (error) {
      console.error(`[SecureStorage] Error deleting key ${key}:`, error);
      return false;
    }
  },

  // Check if key exists
  contains: (key: string): boolean => {
    return memoryCache.has(key);
  },

  // Clear all storage (use with caution)
  clearAll: (): boolean => {
    try {
      const keys = Array.from(memoryCache.keys());
      memoryCache.clear();
      AsyncStorage.multiRemove(keys).catch((err) =>
        console.error(`[SecureStorage] Async clear error:`, err)
      );
      return true;
    } catch (error) {
      console.error(`[SecureStorage] Error clearing storage:`, error);
      return false;
    }
  },

  // Get all keys
  getAllKeys: (): string[] => {
    return Array.from(memoryCache.keys());
  },

  // Initialize: Load all data from AsyncStorage into memory cache
  initialize: async (): Promise<void> => {
    try {
      const keys = Object.values(StorageKeys);
      const pairs = await AsyncStorage.multiGet(keys);

      pairs.forEach(([key, value]) => {
        if (value !== null) {
          // Try to parse as JSON, fallback to raw value
          try {
            const parsed = JSON.parse(value);
            memoryCache.set(key, parsed);
          } catch {
            // Not JSON, store as-is
            // Check if it's a number
            const numValue = parseFloat(value);
            if (!isNaN(numValue) && value === numValue.toString()) {
              memoryCache.set(key, numValue);
            } else if (value === 'true') {
              memoryCache.set(key, true);
            } else if (value === 'false') {
              memoryCache.set(key, false);
            } else {
              memoryCache.set(key, value);
            }
          }
        }
      });

      console.log('[SecureStorage] Initialized with', memoryCache.size, 'cached items');
    } catch (error) {
      console.error('[SecureStorage] Initialization error:', error);
    }
  },
};

// Helper functions for common operations
export const UserDataStorage = {
  // XP and Level
  saveXP: (xp: number) => SecureStorage.setNumber(StorageKeys.USER_XP, xp),
  getXP: () => SecureStorage.getNumber(StorageKeys.USER_XP) ?? 0,

  saveLevel: (level: number) => SecureStorage.setNumber(StorageKeys.USER_LEVEL, level),
  getLevel: () => SecureStorage.getNumber(StorageKeys.USER_LEVEL) ?? 1,

  // Streaks
  saveStreak: (streak: number) => SecureStorage.setNumber(StorageKeys.USER_STREAKS, streak),
  getStreak: () => SecureStorage.getNumber(StorageKeys.USER_STREAKS) ?? 0,

  // Last Played
  saveLastPlayedDate: (date: string) => SecureStorage.setString(StorageKeys.LAST_PLAYED_DATE, date),
  getLastPlayedDate: () => SecureStorage.getString(StorageKeys.LAST_PLAYED_DATE),

  // High Scores
  saveHighScores: (scores: Record<string, number>) => SecureStorage.setObject(StorageKeys.HIGH_SCORES, scores),
  getHighScores: () => SecureStorage.getObject<Record<string, number>>(StorageKeys.HIGH_SCORES) ?? {},

  // Completed Algorithms
  saveCompletedAlgorithms: (algorithms: string[]) => SecureStorage.setObject(StorageKeys.COMPLETED_ALGORITHMS, algorithms),
  getCompletedAlgorithms: () => SecureStorage.getObject<string[]>(StorageKeys.COMPLETED_ALGORITHMS) ?? [],

  // Full User Progress
  saveUserProgress: (progress: any) => SecureStorage.setObject(StorageKeys.USER_PROGRESS, progress),
  getUserProgress: () => SecureStorage.getObject(StorageKeys.USER_PROGRESS),
};

// Generate unique install ID for security tracking
export const getOrCreateInstallId = (): string => {
  let installId = SecureStorage.getString(StorageKeys.INSTALL_ID);
  if (!installId) {
    installId = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    SecureStorage.setString(StorageKeys.INSTALL_ID, installId);
  }
  return installId;
};

export default SecureStorage;
