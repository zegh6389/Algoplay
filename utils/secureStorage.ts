// Secure Storage Utility with Encryption
// Prevents modding by encrypting sensitive game data like XP, Level, and Leaderboard positions

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// SecureStore interface to avoid direct dependency
interface SecureStoreAPI {
  setItemAsync: (key: string, value: string) => Promise<void>;
  getItemAsync: (key: string) => Promise<string | null>;
  deleteItemAsync: (key: string) => Promise<void>;
}

// Dynamically import SecureStore only when available (not on web)
let SecureStore: SecureStoreAPI | null = null;
let secureStoreInitialized = false;

const initSecureStore = async () => {
  if (secureStoreInitialized) return;
  secureStoreInitialized = true;

  if (Platform.OS !== 'web') {
    try {
      // Use require with string interpolation to avoid static analysis
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const moduleName = 'expo-secure-store';
      const module = require(moduleName);
      if (module && typeof module.setItemAsync === 'function') {
        SecureStore = module as SecureStoreAPI;
      }
    } catch {
      // SecureStore not available, will fall back to AsyncStorage
      SecureStore = null;
    }
  }
};

// Simple encryption key derived from app identifier
// In production, this should be more sophisticated
const ENCRYPTION_KEY = 'AL6O_S3CUR3_K3Y_2024';
const STORAGE_PREFIX = '@algoverse_secure_';

// XOR-based encryption (simple but effective for casual modding prevention)
const encryptData = (data: string): string => {
  let encrypted = '';
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
    encrypted += String.fromCharCode(charCode);
  }
  // Convert to base64 for safe storage
  return btoa(encrypted);
};

const decryptData = (encryptedData: string): string => {
  try {
    // Decode from base64
    const decoded = atob(encryptedData);
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      decrypted += String.fromCharCode(charCode);
    }
    return decrypted;
  } catch {
    return '';
  }
};

// Checksum to detect tampering
const generateChecksum = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

const verifyChecksum = (data: string, checksum: string): boolean => {
  return generateChecksum(data) === checksum;
};

// Secure storage interface
interface SecureData<T> {
  data: T;
  checksum: string;
  timestamp: number;
  version: number;
}

const DATA_VERSION = 1;

// Store sensitive data securely
export const setSecureItem = async <T>(key: string, value: T): Promise<boolean> => {
  try {
    await initSecureStore();

    const jsonData = JSON.stringify(value);
    const checksum = generateChecksum(jsonData);

    const secureData: SecureData<T> = {
      data: value,
      checksum,
      timestamp: Date.now(),
      version: DATA_VERSION,
    };

    const encryptedData = encryptData(JSON.stringify(secureData));
    const storageKey = STORAGE_PREFIX + key;

    if (Platform.OS !== 'web' && SecureStore) {
      // Use SecureStore on native platforms
      await SecureStore.setItemAsync(storageKey, encryptedData);
    } else {
      // Fall back to AsyncStorage on web (less secure)
      await AsyncStorage.setItem(storageKey, encryptedData);
    }

    return true;
  } catch (error) {
    console.error('Secure storage write error:', error);
    return false;
  }
};

// Retrieve and verify secure data
export const getSecureItem = async <T>(key: string, defaultValue: T): Promise<{ data: T; isValid: boolean; isTampered: boolean }> => {
  try {
    await initSecureStore();

    const storageKey = STORAGE_PREFIX + key;
    let encryptedData: string | null = null;

    if (Platform.OS !== 'web' && SecureStore) {
      encryptedData = await SecureStore.getItemAsync(storageKey);
    } else {
      encryptedData = await AsyncStorage.getItem(storageKey);
    }

    if (!encryptedData) {
      return { data: defaultValue, isValid: true, isTampered: false };
    }

    const decrypted = decryptData(encryptedData);
    if (!decrypted) {
      // Decryption failed - data may have been tampered with
      return { data: defaultValue, isValid: false, isTampered: true };
    }

    const secureData: SecureData<T> = JSON.parse(decrypted);

    // Verify checksum
    const expectedChecksum = generateChecksum(JSON.stringify(secureData.data));
    if (secureData.checksum !== expectedChecksum) {
      // Checksum mismatch - data has been modified
      return { data: defaultValue, isValid: false, isTampered: true };
    }

    // Verify version
    if (secureData.version !== DATA_VERSION) {
      // Version mismatch - may need migration
      return { data: secureData.data, isValid: true, isTampered: false };
    }

    return { data: secureData.data, isValid: true, isTampered: false };
  } catch (error) {
    console.error('Secure storage read error:', error);
    return { data: defaultValue, isValid: false, isTampered: false };
  }
};

// Remove secure item
export const removeSecureItem = async (key: string): Promise<boolean> => {
  try {
    await initSecureStore();

    const storageKey = STORAGE_PREFIX + key;

    if (Platform.OS !== 'web' && SecureStore) {
      await SecureStore.deleteItemAsync(storageKey);
    } else {
      await AsyncStorage.removeItem(storageKey);
    }

    return true;
  } catch (error) {
    console.error('Secure storage delete error:', error);
    return false;
  }
};

// Secure progress data type
export interface SecureProgressData {
  level: number;
  totalXP: number;
  currentStreak: number;
  completedAlgorithms: string[];
  highScores: {
    sorterBest: number;
    gridEscapeWins: number;
  };
  lastSyncTimestamp: number;
}

// Storage keys
export const SECURE_KEYS = {
  USER_PROGRESS: 'user_progress',
  GAME_STATE: 'game_state',
  LEADERBOARD_POSITION: 'leaderboard_position',
  ANTI_CHEAT_DATA: 'anti_cheat_data',
};

// Anti-cheat: Track impossible state changes
export interface AntiCheatData {
  lastKnownXP: number;
  lastKnownLevel: number;
  maxXPPerSession: number;
  sessionStartTime: number;
  suspiciousActivity: number;
}

export const initAntiCheatData = (): AntiCheatData => ({
  lastKnownXP: 0,
  lastKnownLevel: 1,
  maxXPPerSession: 0,
  sessionStartTime: Date.now(),
  suspiciousActivity: 0,
});

// Validate XP gain
export const validateXPGain = (
  currentXP: number,
  previousXP: number,
  xpGained: number,
  antiCheatData: AntiCheatData
): { isValid: boolean; isSuspicious: boolean; reason?: string } => {
  // Maximum XP that can be earned in a single action
  const MAX_SINGLE_XP = 200; // Generous limit for quiz + visualization

  // Maximum XP per hour (prevents automation)
  const MAX_XP_PER_HOUR = 2000;

  // Check for negative XP gain (cheating)
  if (xpGained < 0) {
    return { isValid: false, isSuspicious: true, reason: 'Negative XP gain detected' };
  }

  // Check for excessive single XP gain
  if (xpGained > MAX_SINGLE_XP) {
    return { isValid: false, isSuspicious: true, reason: `XP gain exceeds maximum: ${xpGained}` };
  }

  // Check session rate limit
  // Only check if session has been running for at least 30 minutes to avoid false positives
  const sessionDuration = (Date.now() - antiCheatData.sessionStartTime) / (1000 * 60 * 60); // Hours
  const sessionDurationMinutes = sessionDuration * 60;
  
  if (sessionDurationMinutes > 30) {
    const sessionXP = currentXP - antiCheatData.lastKnownXP;
    const xpPerHour = sessionDuration > 0 ? sessionXP / sessionDuration : sessionXP;

    if (xpPerHour > MAX_XP_PER_HOUR) {
      return { isValid: true, isSuspicious: true, reason: 'High XP earning rate' };
    }
  }

  return { isValid: true, isSuspicious: false };
};

// Validate level consistency
export const validateLevel = (xp: number, level: number): boolean => {
  const expectedLevel = Math.floor(xp / 500) + 1;
  return level === expectedLevel;
};
