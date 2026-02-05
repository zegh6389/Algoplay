// Hardcore Hacker AI Security Monitor
// Terminal-style alerts for data tampering and suspicious activity
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Animated as RNAnimated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';

export interface SecurityAlert {
  id: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'data_tampering' | 'impossible_xp' | 'integrity_violation' | 'injection_attempt';
  message: string;
  details?: string;
}

interface HackerSecurityMonitorProps {
  visible: boolean;
  alert: SecurityAlert | null;
  onDismiss: () => void;
  onInvestigate?: () => void;
}

const severityConfig = {
  low: {
    color: Colors.neonYellow,
    icon: 'warning' as const,
    label: 'LOW PRIORITY',
  },
  medium: {
    color: Colors.neonOrange,
    icon: 'alert' as const,
    label: 'MEDIUM THREAT',
  },
  high: {
    color: Colors.alertCoral,
    icon: 'alert-circle' as const,
    label: 'HIGH THREAT',
  },
  critical: {
    color: Colors.neonPink,
    icon: 'skull' as const,
    label: 'CRITICAL BREACH',
  },
};

export default function HackerSecurityMonitor({
  visible,
  alert,
  onDismiss,
  onInvestigate,
}: HackerSecurityMonitorProps) {
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const glowAnim = React.useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (visible && alert) {
      // Trigger haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      // Animate terminal boot-up
      const lines = [
        '> INITIALIZING SECURITY MONITOR...',
        '> SCANNING SYSTEM INTEGRITY...',
        '> [WARNING] ANOMALY DETECTED',
        `> TIMESTAMP: ${new Date(alert.timestamp).toISOString()}`,
        `> THREAT LEVEL: ${severityConfig[alert.severity].label}`,
        '> ',
        `> ${alert.message}`,
      ];

      if (alert.details) {
        lines.push('> ');
        lines.push(`> DETAILS: ${alert.details}`);
      }

      lines.push('> ');
      lines.push('> [ACTION REQUIRED]');

      // Simulate typing effect
      setTerminalLines([]);
      lines.forEach((line, index) => {
        setTimeout(() => {
          setTerminalLines((prev) => [...prev, line]);
        }, index * 150);
      });

      // Pulsing glow effect
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
          RNAnimated.timing(glowAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [visible, alert]);

  if (!alert) return null;

  const config = severityConfig[alert.severity];

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 0, 100, 0)', 'rgba(255, 0, 100, 0.3)'],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <RNAnimated.View style={[styles.shadowGlow, { backgroundColor: glowColor }]} />

        <View style={styles.modalContainer}>
          <LinearGradient
            colors={[Colors.background, Colors.midnightBlueDark]}
            style={styles.gradientBackground}
          />

          {/* Header with Severity Indicator */}
          <View style={styles.header}>
            <View style={[styles.severityBadge, { backgroundColor: config.color + '20', borderColor: config.color }]}>
              <Ionicons name={config.icon} size={24} color={config.color} />
              <Text style={[styles.severityText, { color: config.color }]}>
                {config.label}
              </Text>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
              <Ionicons name="close" size={24} color={Colors.gray400} />
            </TouchableOpacity>
          </View>

          {/* Terminal Display */}
          <View style={styles.terminalContainer}>
            <View style={styles.terminalHeader}>
              <View style={styles.terminalDots}>
                <View style={[styles.dot, { backgroundColor: Colors.alertCoral }]} />
                <View style={[styles.dot, { backgroundColor: Colors.neonYellow }]} />
                <View style={[styles.dot, { backgroundColor: Colors.neonLime }]} />
              </View>
              <Text style={styles.terminalTitle}>SECURITY_MONITOR.SYS</Text>
            </View>

            <View style={styles.terminalContent}>
              {terminalLines.map((line, index) => (
                <View key={index} style={styles.terminalLine}>
                  <Text style={styles.terminalText}>{line}</Text>
                  {index === terminalLines.length - 1 && (
                    <View style={styles.cursor} />
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Alert Type Badge */}
          <View style={styles.alertTypeBadge}>
            <Ionicons name="shield-checkmark" size={16} color={Colors.neonCyan} />
            <Text style={styles.alertTypeText}>
              TYPE: {alert.type.toUpperCase().replace(/_/g, ' ')}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={onDismiss}
              activeOpacity={0.8}
            >
              <Text style={styles.dismissButtonText}>Acknowledge</Text>
            </TouchableOpacity>

            {onInvestigate && (
              <TouchableOpacity
                style={styles.investigateButton}
                onPress={() => {
                  onInvestigate();
                  onDismiss();
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[Colors.neonCyan, Colors.neonPurple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Ionicons name="search" size={20} color={Colors.white} />
                <Text style={styles.investigateButtonText}>Investigate</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Hook for easy integration
export function useSecurityMonitor() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [currentAlert, setCurrentAlert] = useState<SecurityAlert | null>(null);

  const triggerAlert = useCallback((
    severity: SecurityAlert['severity'],
    type: SecurityAlert['type'],
    message: string,
    details?: string
  ) => {
    const alert: SecurityAlert = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      severity,
      type,
      message,
      details,
    };

    setAlerts((prev) => [...prev, alert]);
    setCurrentAlert(alert);
  }, []);

  const dismissAlert = useCallback(() => {
    setCurrentAlert(null);
  }, []);

  const checkXPIntegrity = useCallback((
    currentXP: number,
    previousXP: number,
    maxGainPerAction: number = 500
  ): boolean => {
    const gain = currentXP - previousXP;

    if (gain > maxGainPerAction) {
      triggerAlert(
        'critical',
        'impossible_xp',
        `IMPOSSIBLE XP GAIN DETECTED: +${gain} XP`,
        `Expected max gain: ${maxGainPerAction} XP per action. This indicates potential data tampering or exploit usage.`
      );
      return false;
    }

    if (gain < 0) {
      triggerAlert(
        'high',
        'data_tampering',
        'XP ROLLBACK DETECTED: Negative progression',
        'User progress appears to have been manually altered or corrupted.'
      );
      return false;
    }

    return true;
  }, [triggerAlert]);

  return {
    triggerAlert,
    dismissAlert,
    currentAlert,
    alerts,
    checkXPIntegrity,
  };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  shadowGlow: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    height: 200,
    borderRadius: 200,
    opacity: 0.5,
    transform: [{ scaleX: 2 }],
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.neonPink,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray800,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
  },
  severityText: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray800,
    justifyContent: 'center',
    alignItems: 'center',
  },
  terminalContainer: {
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray800,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  terminalDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  terminalTitle: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  terminalContent: {
    backgroundColor: '#000',
    padding: Spacing.md,
    minHeight: 200,
    maxHeight: 300,
  },
  terminalLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  terminalText: {
    fontSize: FontSizes.sm,
    color: Colors.neonLime,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 20,
  },
  cursor: {
    width: 8,
    height: 16,
    backgroundColor: Colors.neonCyan,
    marginLeft: 4,
  },
  alertTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'center',
    backgroundColor: Colors.neonCyan + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.neonCyan + '40',
  },
  alertTypeText: {
    fontSize: FontSizes.xs,
    color: Colors.neonCyan,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  dismissButton: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.gray800,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray700,
  },
  dismissButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.gray300,
  },
  investigateButton: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  investigateButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.white,
  },
});
