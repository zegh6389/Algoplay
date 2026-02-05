// AI Security Monitor - Hardcore Hacker Terminal Style Alert System
// Monitors for impossible state changes and displays terminal-style warnings

import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  FadeIn,
  FadeOut,
  SlideInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, BorderRadius, Spacing, FontSizes, Shadows } from '@/constants/theme';
import { useAppStore, SecurityAlert } from '@/store/useAppStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Terminal text typing animation
const useTypingEffect = (text: string, speed: number = 30) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setIsComplete(false);
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayText, isComplete };
};

// Blinking cursor component
const BlinkingCursor = memo(function BlinkingCursor() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.cursor, animatedStyle]}>_</Animated.Text>
  );
});

// Single terminal line component
interface TerminalLineProps {
  prefix?: string;
  text: string;
  type?: 'normal' | 'warning' | 'error' | 'success' | 'info';
  showCursor?: boolean;
  delay?: number;
}

const TerminalLine = memo(function TerminalLine({
  prefix = '>',
  text,
  type = 'normal',
  showCursor = false,
  delay = 0,
}: TerminalLineProps) {
  const [visible, setVisible] = useState(delay === 0);
  const { displayText, isComplete } = useTypingEffect(visible ? text : '', 20);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  if (!visible) return null;

  const getColor = () => {
    switch (type) {
      case 'warning': return Colors.neonYellow;
      case 'error': return Colors.error;
      case 'success': return Colors.neonLime;
      case 'info': return Colors.neonCyan;
      default: return Colors.textPrimary;
    }
  };

  return (
    <View style={styles.terminalLine}>
      <Text style={[styles.terminalPrefix, { color: getColor() }]}>{prefix}</Text>
      <Text style={[styles.terminalText, { color: getColor() }]}>
        {displayText}
        {showCursor && !isComplete && <BlinkingCursor />}
      </Text>
    </View>
  );
});

// Alert modal component
interface AlertModalProps {
  alert: SecurityAlert;
  onAcknowledge: () => void;
  onClose: () => void;
}

const AlertModal = memo(function AlertModal({ alert, onAcknowledge, onClose }: AlertModalProps) {
  const insets = useSafeAreaInsets();
  const glowOpacity = useSharedValue(0.3);
  const scanLinePosition = useSharedValue(0);

  useEffect(() => {
    // Glow effect
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Scan line effect
    scanLinePosition.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );

    // Haptic feedback for critical alerts
    if (alert.type === 'critical') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (alert.type === 'warning') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const scanLineStyle = useAnimatedStyle(() => ({
    top: `${scanLinePosition.value * 100}%`,
  }));

  const getBorderColor = () => {
    switch (alert.type) {
      case 'critical': return Colors.error;
      case 'warning': return Colors.neonYellow;
      default: return Colors.neonCyan;
    }
  };

  const getAlertIcon = () => {
    switch (alert.type) {
      case 'critical': return 'skull';
      case 'warning': return 'warning';
      default: return 'information-circle';
    }
  };

  const terminalLines = [
    { prefix: '[SYSTEM]', text: 'SECURITY MONITOR ACTIVE', type: 'info' as const, delay: 0 },
    { prefix: '[SCAN]', text: 'Analyzing state integrity...', type: 'normal' as const, delay: 300 },
    { prefix: '[ALERT]', text: `${alert.type.toUpperCase()} DETECTED`, type: alert.type === 'critical' ? 'error' as const : 'warning' as const, delay: 600 },
    { prefix: '[MSG]', text: alert.message, type: alert.type === 'critical' ? 'error' as const : 'warning' as const, delay: 900 },
    { prefix: '[TIME]', text: new Date(alert.timestamp).toLocaleTimeString(), type: 'info' as const, delay: 1200 },
    { prefix: '[ACK]', text: 'Awaiting user acknowledgment...', type: 'normal' as const, delay: 1500 },
  ];

  return (
    <Modal
      visible={true}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <BlurView intensity={90} style={styles.modalOverlay}>
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          style={[
            styles.alertContainer,
            { paddingBottom: insets.bottom + Spacing.lg, borderColor: getBorderColor() },
          ]}
        >
          {/* Scan line effect */}
          <Animated.View style={[styles.scanLine, scanLineStyle, { backgroundColor: getBorderColor() + '30' }]} />

          {/* Glow effect */}
          <Animated.View style={[styles.alertGlow, glowStyle, { backgroundColor: getBorderColor() }]} />

          {/* Header */}
          <View style={styles.alertHeader}>
            <View style={[styles.alertIconContainer, { backgroundColor: getBorderColor() + '20' }]}>
              <Ionicons name={getAlertIcon()} size={28} color={getBorderColor()} />
            </View>
            <View style={styles.alertHeaderText}>
              <Text style={[styles.alertTitle, { color: getBorderColor() }]}>
                SECURITY ALERT
              </Text>
              <Text style={styles.alertSubtitle}>
                AI MONITOR // NEWELL_HACKER.EXE
              </Text>
            </View>
          </View>

          {/* Terminal output */}
          <View style={styles.terminalContainer}>
            <View style={styles.terminalHeader}>
              <View style={[styles.terminalDot, { backgroundColor: Colors.error }]} />
              <View style={[styles.terminalDot, { backgroundColor: Colors.neonYellow }]} />
              <View style={[styles.terminalDot, { backgroundColor: Colors.neonLime }]} />
              <Text style={styles.terminalTitle}>security_monitor.sh</Text>
            </View>
            <ScrollView style={styles.terminalContent} showsVerticalScrollIndicator={false}>
              {terminalLines.map((line, index) => (
                <TerminalLine
                  key={index}
                  prefix={line.prefix}
                  text={line.text}
                  type={line.type}
                  delay={line.delay}
                  showCursor={index === terminalLines.length - 1}
                />
              ))}
            </ScrollView>
          </View>

          {/* Action buttons */}
          <View style={styles.alertActions}>
            <TouchableOpacity
              style={[styles.acknowledgeButton, { borderColor: getBorderColor() }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onAcknowledge();
                onClose();
              }}
            >
              <Ionicons name="checkmark-circle" size={20} color={getBorderColor()} />
              <Text style={[styles.acknowledgeText, { color: getBorderColor() }]}>
                ACKNOWLEDGE
              </Text>
            </TouchableOpacity>
          </View>

          {/* Hacker persona signature */}
          <View style={styles.signature}>
            <Text style={styles.signatureText}>
              {'<NEWELL_AI /> // HARDCORE HACKER MODE'}
            </Text>
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
});

// Floating alert indicator
const FloatingIndicator = memo(function FloatingIndicator({
  alertCount,
  onPress,
}: {
  alertCount: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withSpring(1.1, { damping: 8 }),
        withSpring(1, { damping: 8 })
      ),
      -1,
      true
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0.5, { duration: 600 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View style={[styles.floatingIndicator, animatedStyle, glowStyle]}>
        <Ionicons name="shield" size={24} color={Colors.error} />
        {alertCount > 0 && (
          <View style={styles.alertBadge}>
            <Text style={styles.alertBadgeText}>{alertCount}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
});

// Main Security Monitor Component
interface SecurityMonitorProps {
  showFloatingIndicator?: boolean;
}

export default function SecurityMonitor({ showFloatingIndicator = true }: SecurityMonitorProps) {
  const { securityState, acknowledgeAlert, clearOldAlerts } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<SecurityAlert | null>(null);

  // Get unacknowledged alerts
  const unacknowledgedAlerts = securityState.securityAlerts.filter(a => !a.acknowledged);

  // Auto-show modal for critical alerts
  useEffect(() => {
    const criticalAlert = unacknowledgedAlerts.find(a => a.type === 'critical' && !a.acknowledged);
    if (criticalAlert && !currentAlert) {
      setCurrentAlert(criticalAlert);
      setShowModal(true);
    }
  }, [unacknowledgedAlerts]);

  // Clear old alerts periodically
  useEffect(() => {
    const interval = setInterval(() => {
      clearOldAlerts();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  const handleIndicatorPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (unacknowledgedAlerts.length > 0) {
      setCurrentAlert(unacknowledgedAlerts[0]);
      setShowModal(true);
    }
  }, [unacknowledgedAlerts]);

  const handleAcknowledge = useCallback(() => {
    if (currentAlert) {
      acknowledgeAlert(currentAlert.id);
    }
  }, [currentAlert, acknowledgeAlert]);

  const handleClose = useCallback(() => {
    setShowModal(false);
    setCurrentAlert(null);

    // Show next alert if any
    const remainingAlerts = unacknowledgedAlerts.filter(a => a.id !== currentAlert?.id);
    if (remainingAlerts.length > 0 && remainingAlerts[0].type === 'critical') {
      setTimeout(() => {
        setCurrentAlert(remainingAlerts[0]);
        setShowModal(true);
      }, 500);
    }
  }, [unacknowledgedAlerts, currentAlert]);

  if (!showFloatingIndicator && unacknowledgedAlerts.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating indicator */}
      {showFloatingIndicator && unacknowledgedAlerts.length > 0 && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.floatingContainer}
        >
          <FloatingIndicator
            alertCount={unacknowledgedAlerts.length}
            onPress={handleIndicatorPress}
          />
        </Animated.View>
      )}

      {/* Alert modal */}
      {showModal && currentAlert && (
        <AlertModal
          alert={currentAlert}
          onAcknowledge={handleAcknowledge}
          onClose={handleClose}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    top: 100,
    right: Spacing.lg,
    zIndex: 1000,
  },
  floatingIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.error,
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 10,
  },
  alertBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  alertContainer: {
    backgroundColor: 'rgba(10, 14, 23, 0.98)',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    borderWidth: 2,
    borderBottomWidth: 0,
    overflow: 'hidden',
    padding: Spacing.lg,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
  },
  alertGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    opacity: 0.1,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  alertIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertHeaderText: {
    flex: 1,
  },
  alertTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    letterSpacing: 2,
  },
  alertSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  terminalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.gray700,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.gray700,
    gap: Spacing.xs,
  },
  terminalDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  terminalTitle: {
    fontSize: FontSizes.xs,
    color: Colors.gray400,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginLeft: Spacing.sm,
  },
  terminalContent: {
    padding: Spacing.md,
    maxHeight: 200,
  },
  terminalLine: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  terminalPrefix: {
    fontSize: FontSizes.sm,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
    marginRight: Spacing.sm,
  },
  terminalText: {
    fontSize: FontSizes.sm,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
    flexWrap: 'wrap',
  },
  cursor: {
    color: Colors.neonCyan,
    fontWeight: '700',
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  acknowledgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  acknowledgeText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    letterSpacing: 1,
  },
  signature: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray700,
  },
  signatureText: {
    fontSize: FontSizes.xs,
    color: Colors.gray500,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1,
  },
});
