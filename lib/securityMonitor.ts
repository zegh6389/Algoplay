// AI-Powered Security Monitoring System
// Integrates with Newell AI for intelligent anomaly detection
import { useAppStore, SecurityAlert } from '@/store/useAppStore';

const NEWELL_API_URL = process.env.EXPO_PUBLIC_NEWELL_API_URL || 'https://newell.fastshot.ai';
const PROJECT_ID = process.env.EXPO_PUBLIC_PROJECT_ID || '';

// Security thresholds
const THRESHOLDS = {
  MAX_XP_PER_ACTION: 200, // Max XP that can be earned in a single action
  MAX_XP_PER_HOUR: 2000, // Max XP per hour
  MAX_LEVEL_JUMP: 5, // Maximum level increase allowed in one session
  MIN_ACTION_INTERVAL_MS: 500, // Minimum time between actions
  SUSPICIOUS_PATTERN_THRESHOLD: 3, // Number of suspicious actions before alerting
};

interface SecurityEvent {
  type: 'xp_gain' | 'level_up' | 'progress_update' | 'data_access' | 'storage_modification';
  timestamp: number;
  data: Record<string, any>;
  previousState?: Record<string, any>;
}

interface SecurityAnalysisResult {
  isSuspicious: boolean;
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  reason?: string;
  recommendation?: string;
  shouldBlock: boolean;
}

// Track recent events for pattern analysis
const recentEvents: SecurityEvent[] = [];
const MAX_RECENT_EVENTS = 100;

/**
 * Log a security event for pattern analysis
 */
export const logSecurityEvent = (event: SecurityEvent): void => {
  recentEvents.push(event);
  if (recentEvents.length > MAX_RECENT_EVENTS) {
    recentEvents.shift();
  }
};

/**
 * Analyze XP gain for suspicious patterns
 */
export const analyzeXPGain = (
  currentXP: number,
  previousXP: number,
  xpGained: number,
  sessionStartTime: number
): SecurityAnalysisResult => {
  const sessionDurationHours = (Date.now() - sessionStartTime) / (1000 * 60 * 60);

  // Check for negative XP (impossible in normal gameplay)
  if (xpGained < 0) {
    return {
      isSuspicious: true,
      threatLevel: 'critical',
      reason: 'NEGATIVE XP GAIN DETECTED - Data manipulation suspected',
      recommendation: 'Reset session and verify data integrity',
      shouldBlock: true,
    };
  }

  // Check for excessive single XP gain
  if (xpGained > THRESHOLDS.MAX_XP_PER_ACTION) {
    return {
      isSuspicious: true,
      threatLevel: 'high',
      reason: `XP GAIN EXCEEDS THRESHOLD: +${xpGained} XP (max: ${THRESHOLDS.MAX_XP_PER_ACTION})`,
      recommendation: 'Possible exploit or modified game data',
      shouldBlock: true,
    };
  }

  // Check session rate limit
  if (sessionDurationHours > 0) {
    const sessionXP = currentXP - previousXP;
    const xpPerHour = sessionXP / sessionDurationHours;

    if (xpPerHour > THRESHOLDS.MAX_XP_PER_HOUR * 2) {
      return {
        isSuspicious: true,
        threatLevel: 'high',
        reason: `ABNORMAL XP RATE: ${Math.round(xpPerHour)} XP/hr (expected max: ${THRESHOLDS.MAX_XP_PER_HOUR})`,
        recommendation: 'Automated tool or exploit suspected',
        shouldBlock: true,
      };
    }

    if (xpPerHour > THRESHOLDS.MAX_XP_PER_HOUR) {
      return {
        isSuspicious: true,
        threatLevel: 'medium',
        reason: `HIGH XP EARNING RATE: ${Math.round(xpPerHour)} XP/hr`,
        recommendation: 'Monitor for continued suspicious activity',
        shouldBlock: false,
      };
    }
  }

  // Check for rapid consecutive actions
  const recentXPEvents = recentEvents.filter(
    (e) => e.type === 'xp_gain' && Date.now() - e.timestamp < 60000
  );
  if (recentXPEvents.length > 10) {
    return {
      isSuspicious: true,
      threatLevel: 'medium',
      reason: 'RAPID XP ACCUMULATION: Too many XP events in short time',
      recommendation: 'Possible automated clicking or exploit',
      shouldBlock: false,
    };
  }

  return {
    isSuspicious: false,
    threatLevel: 'none',
    shouldBlock: false,
  };
};

/**
 * Analyze level changes for suspicious patterns
 */
export const analyzeLevelChange = (
  currentLevel: number,
  previousLevel: number,
  currentXP: number
): SecurityAnalysisResult => {
  const expectedLevel = Math.floor(currentXP / 500) + 1;
  const levelJump = currentLevel - previousLevel;

  // Check for level/XP mismatch
  if (currentLevel !== expectedLevel) {
    return {
      isSuspicious: true,
      threatLevel: 'critical',
      reason: `LEVEL/XP MISMATCH: Level ${currentLevel} (expected: ${expectedLevel} based on ${currentXP} XP)`,
      recommendation: 'Data integrity violation - possible save file modification',
      shouldBlock: true,
    };
  }

  // Check for impossible level jump
  if (levelJump > THRESHOLDS.MAX_LEVEL_JUMP) {
    return {
      isSuspicious: true,
      threatLevel: 'high',
      reason: `IMPOSSIBLE LEVEL JUMP: +${levelJump} levels in single session`,
      recommendation: 'Possible memory manipulation or save editing',
      shouldBlock: true,
    };
  }

  return {
    isSuspicious: false,
    threatLevel: 'none',
    shouldBlock: false,
  };
};

/**
 * Analyze data patterns using AI (calls Newell API)
 */
export const analyzeWithAI = async (
  userProgress: Record<string, any>,
  recentActivity: SecurityEvent[]
): Promise<SecurityAnalysisResult> => {
  // Skip AI analysis if no API available
  if (!NEWELL_API_URL || !PROJECT_ID) {
    return {
      isSuspicious: false,
      threatLevel: 'none',
      shouldBlock: false,
    };
  }

  try {
    const prompt = `You are a security analyst for a mobile game. Analyze this user activity for potential cheating or exploitation.

User Progress:
- Level: ${userProgress.level}
- Total XP: ${userProgress.totalXP}
- Completed Algorithms: ${userProgress.completedAlgorithms?.length || 0}
- Current Streak: ${userProgress.currentStreak}

Recent Activity (last ${recentActivity.length} events):
${recentActivity.slice(-10).map(e => `- ${e.type}: ${JSON.stringify(e.data)}`).join('\n')}

ONLY respond with a JSON object (no other text):
{
  "isSuspicious": boolean,
  "threatLevel": "none" | "low" | "medium" | "high" | "critical",
  "reason": "brief explanation or null",
  "shouldBlock": boolean
}`;

    const response = await fetch(`${NEWELL_API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: PROJECT_ID,
        message: prompt,
        conversationId: `security_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      throw new Error('AI analysis request failed');
    }

    const result = await response.json();
    const aiResponse = result.message || result.response || '';

    // Parse AI response
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          isSuspicious: Boolean(parsed.isSuspicious),
          threatLevel: parsed.threatLevel || 'none',
          reason: parsed.reason || undefined,
          shouldBlock: Boolean(parsed.shouldBlock),
        };
      }
    } catch {
      // AI response parsing failed, return safe default
    }
  } catch (error) {
    console.error('AI security analysis failed:', error);
  }

  return {
    isSuspicious: false,
    threatLevel: 'none',
    shouldBlock: false,
  };
};

/**
 * Generate a security alert from analysis result
 */
export const generateSecurityAlert = (
  result: SecurityAnalysisResult,
  eventType: string
): SecurityAlert | null => {
  if (!result.isSuspicious) return null;

  const severityMap: Record<string, SecurityAlert['type']> = {
    none: 'info',
    low: 'info',
    medium: 'warning',
    high: 'warning',
    critical: 'critical',
  };

  return {
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: severityMap[result.threatLevel] || 'warning',
    message: result.reason || `Suspicious ${eventType} detected`,
    timestamp: new Date().toISOString(),
    acknowledged: false,
  };
};

/**
 * Full security check pipeline
 */
export const performSecurityCheck = async (
  currentState: {
    level: number;
    totalXP: number;
    completedAlgorithms: string[];
    currentStreak: number;
  },
  previousState: {
    level: number;
    totalXP: number;
  },
  sessionStartTime: number
): Promise<{
  shouldProceed: boolean;
  alerts: SecurityAlert[];
}> => {
  const alerts: SecurityAlert[] = [];

  // XP analysis
  const xpGained = currentState.totalXP - previousState.totalXP;
  const xpResult = analyzeXPGain(
    currentState.totalXP,
    previousState.totalXP,
    xpGained,
    sessionStartTime
  );

  if (xpResult.isSuspicious) {
    const alert = generateSecurityAlert(xpResult, 'XP gain');
    if (alert) alerts.push(alert);
  }

  // Level analysis
  const levelResult = analyzeLevelChange(
    currentState.level,
    previousState.level,
    currentState.totalXP
  );

  if (levelResult.isSuspicious) {
    const alert = generateSecurityAlert(levelResult, 'level change');
    if (alert) alerts.push(alert);
  }

  // Determine if we should block the action
  const shouldBlock = xpResult.shouldBlock || levelResult.shouldBlock;

  return {
    shouldProceed: !shouldBlock,
    alerts,
  };
};

/**
 * Format security event for terminal display
 */
export const formatSecurityLog = (
  event: SecurityEvent,
  result: SecurityAnalysisResult
): string[] => {
  const lines: string[] = [];
  const timestamp = new Date(event.timestamp).toISOString();

  lines.push(`> [${timestamp}] EVENT: ${event.type.toUpperCase()}`);
  lines.push(`> DATA: ${JSON.stringify(event.data)}`);

  if (result.isSuspicious) {
    lines.push(`> [WARNING] THREAT LEVEL: ${result.threatLevel.toUpperCase()}`);
    if (result.reason) {
      lines.push(`> ANALYSIS: ${result.reason}`);
    }
    if (result.recommendation) {
      lines.push(`> RECOMMENDATION: ${result.recommendation}`);
    }
  } else {
    lines.push(`> STATUS: CLEAN`);
  }

  return lines;
};
