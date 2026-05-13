// Security Shielding - Anti-Tampering & Integrity Verification
// Implements security handshake, checksum validation, and tampering detection
import { Platform } from 'react-native';
import { SecureStorage, StorageKeys, getOrCreateInstallId } from './secureStorage';
import Constants from 'expo-constants';

// Security configuration
const SECURITY_CONFIG = {
  CHECKSUM_SALT: 'algoplay-security-v1',
  MAX_XP_PER_DAY: 5000, // Reasonable daily limit
  MAX_LEVEL: 100,
  VALID_ALGORITHMS: [
    'linear-search', 'binary-search', 'bubble-sort', 'selection-sort',
    'insertion-sort', 'merge-sort', 'quick-sort', 'heap-sort',
    'bfs', 'dfs', 'dijkstra', 'astar', 'bst-operations', 'avl-tree'
  ],
};

// Security check result types
interface SecurityCheckResult {
  isValid: boolean;
  issues: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Generate simple checksum for data integrity
function generateChecksum(data: string): string {
  let hash = 0;
  const combined = data + SECURITY_CONFIG.CHECKSUM_SALT;

  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(36);
}

// Validate data integrity
function validateChecksum(data: string, storedChecksum: string): boolean {
  return generateChecksum(data) === storedChecksum;
}

// XP validation - detect abnormal XP gains
function validateXP(xp: number, level: number): SecurityCheckResult {
  const issues: string[] = [];
  let severity: SecurityCheckResult['severity'] = 'low';

  // Check for negative XP
  if (xp < 0) {
    issues.push('Negative XP detected');
    severity = 'critical';
  }

  // Check for unreasonable XP (more than 50,000 at level 1)
  const maxExpectedXP = Math.max(level * 1000, 500);
  if (xp > maxExpectedXP * 10) {
    issues.push(`XP significantly exceeds expected range: ${xp} vs max expected ${maxExpectedXP}`);
    severity = 'high';
  }

  // Check XP-level consistency
  const expectedLevel = Math.floor(xp / 500) + 1;
  if (Math.abs(level - expectedLevel) > 2) {
    issues.push(`Level-XP mismatch: Level ${level} with ${xp} XP (expected ~${expectedLevel})`);
    severity = 'medium';
  }

  return {
    isValid: issues.length === 0,
    issues,
    severity,
  };
}

// Validate completed algorithms
function validateAlgorithms(algorithms: string[]): SecurityCheckResult {
  const issues: string[] = [];
  let severity: SecurityCheckResult['severity'] = 'low';

  // Check for invalid algorithm IDs
  const invalidAlgorithms = algorithms.filter(
    (alg) => !SECURITY_CONFIG.VALID_ALGORITHMS.includes(alg)
  );

  if (invalidAlgorithms.length > 0) {
    issues.push(`Invalid algorithm IDs detected: ${invalidAlgorithms.join(', ')}`);
    severity = 'high';
  }

  // Check for duplicates
  const uniqueAlgorithms = new Set(algorithms);
  if (uniqueAlgorithms.size !== algorithms.length) {
    issues.push('Duplicate algorithms detected in completed list');
    severity = 'medium';
  }

  return {
    isValid: issues.length === 0,
    issues,
    severity,
  };
}

// Launch-time security handshake
export async function performSecurityHandshake(): Promise<SecurityCheckResult> {
  const issues: string[] = [];
  let severity: SecurityCheckResult['severity'] = 'low';

  try {
    // 1. Verify install ID exists and is valid
    const installId = getOrCreateInstallId();
    if (!installId) {
      issues.push('Failed to verify install ID');
      severity = 'high';
    }

    // 2. Check for development/debug mode in production
    if (__DEV__) {
      // In development, this is expected
      console.log('[Security] Running in development mode');
    } else {
      // Production security checks
      const releaseChannel = Constants.expoConfig?.extra?.releaseChannel;
      if (releaseChannel === 'development' || releaseChannel === 'staging') {
        console.log('[Security] Non-production release channel detected');
      }
    }

    // 3. Verify stored data integrity
    const storedXP = SecureStorage.getNumber(StorageKeys.USER_XP);
    const storedLevel = SecureStorage.getNumber(StorageKeys.USER_LEVEL);
    const storedChecksum = SecureStorage.getString(StorageKeys.SECURITY_CHECKSUM);

    if (storedXP !== undefined && storedLevel !== undefined) {
      // Validate XP/Level relationship
      const xpValidation = validateXP(storedXP, storedLevel);
      if (!xpValidation.isValid) {
        issues.push(...xpValidation.issues);
        severity = getHigherSeverity(severity, xpValidation.severity);
      }

      // Verify checksum if it exists
      if (storedChecksum) {
        const currentDataString = `${storedXP}-${storedLevel}`;
        if (!validateChecksum(currentDataString, storedChecksum)) {
          issues.push('Data integrity checksum mismatch - possible tampering');
          severity = 'critical';
        }
      }
    }

    // 4. Validate stored algorithms
    const completedAlgorithms = SecureStorage.getObject<string[]>(StorageKeys.COMPLETED_ALGORITHMS);
    if (completedAlgorithms && Array.isArray(completedAlgorithms)) {
      const algValidation = validateAlgorithms(completedAlgorithms);
      if (!algValidation.isValid) {
        issues.push(...algValidation.issues);
        severity = getHigherSeverity(severity, algValidation.severity);
      }
    }

    // 5. Update last security check timestamp
    SecureStorage.setString(StorageKeys.LAST_SECURITY_CHECK, new Date().toISOString());

    // 6. Log security check (non-blocking)
    console.log(`[Security] Handshake complete. Issues: ${issues.length}, Severity: ${severity}`);

  } catch (error) {
    console.error('[Security] Handshake error:', error);
    issues.push('Security handshake encountered an error');
    severity = 'medium';
  }

  return {
    isValid: issues.length === 0,
    issues,
    severity,
  };
}

// Update security checksum when data changes
export function updateSecurityChecksum(xp: number, level: number): void {
  try {
    const dataString = `${xp}-${level}`;
    const checksum = generateChecksum(dataString);
    SecureStorage.setString(StorageKeys.SECURITY_CHECKSUM, checksum);
  } catch (error) {
    console.error('[Security] Failed to update checksum:', error);
  }
}

// Validate XP gain before applying
export function validateXPGain(
  currentXP: number,
  gainAmount: number,
  source: string
): { isValid: boolean; sanitizedAmount: number; reason?: string } {
  // Check for negative or zero gains
  if (gainAmount <= 0) {
    return { isValid: false, sanitizedAmount: 0, reason: 'Invalid XP amount' };
  }

  // Check for unreasonably large gains
  const maxGainPerAction: Record<string, number> = {
    'algorithm-complete': 500,
    'quiz-complete': 200,
    'challenge-complete': 400,
    'daily-bonus': 100,
    'streak-bonus': 150,
    'battle-win': 300,
    'default': 100,
  };

  const maxAllowed = maxGainPerAction[source] || maxGainPerAction['default'];

  if (gainAmount > maxAllowed) {
    console.warn(`[Security] XP gain of ${gainAmount} exceeds max (${maxAllowed}) for source: ${source}`);
    return {
      isValid: true,
      sanitizedAmount: maxAllowed,
      reason: `XP capped to maximum for ${source}`,
    };
  }

  return { isValid: true, sanitizedAmount: gainAmount };
}

// Check for tampering indicators
export function detectTampering(): { tampered: boolean; indicators: string[] } {
  const indicators: string[] = [];

  try {
    // Check if running in debugger (basic check)
    if (__DEV__) {
      // Expected in development
      return { tampered: false, indicators: [] };
    }

    // Check for Expo Go (could be used for testing modifications)
    if (Constants.appOwnership === 'expo') {
      indicators.push('Running in Expo Go environment');
    }

    // Check for impossible state combinations
    const xp = SecureStorage.getNumber(StorageKeys.USER_XP) ?? 0;
    const level = SecureStorage.getNumber(StorageKeys.USER_LEVEL) ?? 1;
    const streak = SecureStorage.getNumber(StorageKeys.USER_STREAKS) ?? 0;

    // Level 1 with high XP is suspicious
    if (level === 1 && xp > 10000) {
      indicators.push('Level-XP inconsistency detected');
    }

    // Impossible streak values
    if (streak > 365) {
      indicators.push('Unrealistic streak value');
    }

  } catch (error) {
    console.error('[Security] Tampering detection error:', error);
  }

  return {
    tampered: indicators.length > 0,
    indicators,
  };
}

// Reset user data if tampering is detected (with confirmation)
export function handleTamperingDetected(indicators: string[]): void {
  console.warn('[Security] Tampering indicators:', indicators);

  // In production, you might want to:
  // 1. Log to analytics
  // 2. Show a warning to the user
  // 3. Reset to safe defaults
  // 4. Require re-authentication

  // For now, we just log the event
  const event = {
    type: 'tampering_detected',
    indicators,
    timestamp: new Date().toISOString(),
    platform: Platform.OS,
    installId: getOrCreateInstallId(),
  };

  console.log('[Security] Tampering event logged:', JSON.stringify(event));
}

// Secure data persistence with validation
export function securelyPersistProgress(progress: {
  xp: number;
  level: number;
  completedAlgorithms: string[];
}): boolean {
  try {
    // Validate before persisting
    const xpValidation = validateXP(progress.xp, progress.level);
    const algValidation = validateAlgorithms(progress.completedAlgorithms);

    if (!xpValidation.isValid && xpValidation.severity === 'critical') {
      console.error('[Security] Critical XP validation failure - aborting persist');
      return false;
    }

    if (!algValidation.isValid && algValidation.severity === 'high') {
      console.error('[Security] High severity algorithm validation failure - aborting persist');
      return false;
    }

    // Persist data
    SecureStorage.setNumber(StorageKeys.USER_XP, progress.xp);
    SecureStorage.setNumber(StorageKeys.USER_LEVEL, progress.level);
    SecureStorage.setObject(StorageKeys.COMPLETED_ALGORITHMS, progress.completedAlgorithms);

    // Update checksum
    updateSecurityChecksum(progress.xp, progress.level);

    return true;
  } catch (error) {
    console.error('[Security] Failed to persist progress:', error);
    return false;
  }
}

// Helper: Get higher severity level
function getHigherSeverity(
  current: SecurityCheckResult['severity'],
  compare: SecurityCheckResult['severity']
): SecurityCheckResult['severity'] {
  const levels = { low: 0, medium: 1, high: 2, critical: 3 };
  return levels[compare] > levels[current] ? compare : current;
}

// SSL Pinning configuration (to be used with network requests)
export const SSLPinningConfig = {
  // Supabase domains - in production, you'd pin specific certificates
  domains: [
    '*.supabase.co',
    '*.supabase.com',
  ],
  // Certificate hashes would go here in production
  // These would be SHA256 hashes of the certificate public keys
  certificateHashes: [] as string[],
};

// ProGuard/R8 configuration hint for Android
// Note: Actual ProGuard rules should be in android/app/proguard-rules.pro
export const ProGuardHints = `
# ProGuard rules for Algoplay security
# Add these to android/app/proguard-rules.pro

# Keep security classes
-keep class com.algoplay.security.** { *; }

# Obfuscate class names
-repackageclasses ''
-allowaccessmodification

# Remove debug information
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
}

# String encryption (requires additional tools)
# Consider using tools like DexGuard for enhanced protection
`;

export default {
  performSecurityHandshake,
  updateSecurityChecksum,
  validateXPGain,
  detectTampering,
  handleTamperingDetected,
  securelyPersistProgress,
  SSLPinningConfig,
};
