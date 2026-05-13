// Security Provider Component
// Wraps the app and monitors for suspicious activity
// Displays the Hardcore Hacker AI terminal when threats are detected
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import HackerSecurityMonitor, { SecurityAlert, useSecurityMonitor } from './HackerSecurityMonitor';
import {
  logSecurityEvent,
  performSecurityCheck,
} from '@/lib/securityMonitor';

// Disable the "hardcore hacker" security monitor by default. It can be enabled for
// debugging via `EXPO_PUBLIC_ENABLE_SECURITY_MONITOR=true`.
const ENABLE_SECURITY_MONITOR = process.env.EXPO_PUBLIC_ENABLE_SECURITY_MONITOR === 'true';

interface SecurityContextType {
  triggerSecurityAlert: (
    severity: SecurityAlert['severity'],
    type: SecurityAlert['type'],
    message: string,
    details?: string
  ) => void;
  checkXPIntegrity: (currentXP: number, previousXP: number) => boolean;
  isSecure: boolean;
  alertCount: number;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: React.ReactNode;
}

export default function SecurityProvider({ children }: SecurityProviderProps) {
  const { userProgress, securityState, addSecurityAlert, loadSecureProgress, validateAndSaveProgress } = useAppStore();
  const { triggerAlert, dismissAlert, currentAlert, alerts, checkXPIntegrity } = useSecurityMonitor();
  const [showMonitor, setShowMonitor] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [sessionStartXP, setSessionStartXP] = useState(userProgress.totalXP);
  const [isInitialized, setIsInitialized] = useState(false);
  const [previousProgress, setPreviousProgress] = useState({
    level: userProgress.level,
    totalXP: userProgress.totalXP,
  });

  // Load secure progress on mount
  useEffect(() => {
    loadSecureProgress().then(() => {
      // Sync state after load to avoid false positives on initial diff
      const current = useAppStore.getState().userProgress;
      setPreviousProgress({
        level: current.level,
        totalXP: current.totalXP,
      });
      setSessionStartXP(current.totalXP);
      setIsInitialized(true);
    });
  }, []);

  // Monitor progress changes
  useEffect(() => {
    const checkProgress = async () => {
      // Skip if not initialized or no change
      if (!isInitialized) return;

      if (
        userProgress.level === previousProgress.level &&
        userProgress.totalXP === previousProgress.totalXP
      ) {
        return;
      }

      if (ENABLE_SECURITY_MONITOR) {
        // Log the event
        logSecurityEvent({
          type: 'progress_update',
          timestamp: Date.now(),
          data: {
            level: userProgress.level,
            totalXP: userProgress.totalXP,
            completedAlgorithms: userProgress.completedAlgorithms.length,
          },
          previousState: previousProgress,
        });

        // Perform security check
        const result = await performSecurityCheck(
          {
            level: userProgress.level,
            totalXP: userProgress.totalXP,
            completedAlgorithms: userProgress.completedAlgorithms,
            currentStreak: userProgress.currentStreak,
          },
          previousProgress,
          sessionStartTime,
          sessionStartXP
        );

        // Add any alerts to the store
        result.alerts.forEach((alert) => {
          addSecurityAlert(alert.type, alert.message);
        });

        // Show the terminal if there are alerts
        if (
          result.alerts.length > 0 &&
          result.alerts.some((a) => a.type === 'critical' || a.type === 'warning')
        ) {
          const mostSevereAlert =
            result.alerts.find((a) => a.type === 'critical') || result.alerts[0];

          triggerAlert(
            mostSevereAlert.type === 'critical' ? 'critical' : 'high',
            'data_tampering',
            mostSevereAlert.message,
            'The system has detected activity that deviates from expected patterns.'
          );
          setShowMonitor(true);
        }
      }

      // Save progress securely
      await validateAndSaveProgress();

      // Update previous progress
      setPreviousProgress({
        level: userProgress.level,
        totalXP: userProgress.totalXP,
      });
    };

    checkProgress();
  }, [userProgress.level, userProgress.totalXP]);

  // Check for existing security alerts in store
  useEffect(() => {
    if (!ENABLE_SECURITY_MONITOR) return;

    const unacknowledgedAlerts = securityState.securityAlerts.filter((a) => !a.acknowledged);
    const severeAlerts = unacknowledgedAlerts.filter((a) => a.type === 'critical' || a.type === 'warning');

    if (severeAlerts.length > 0 && !showMonitor && !currentAlert) {
      const alert = severeAlerts[0];
      triggerAlert(
        alert.type === 'critical' ? 'critical' : alert.type === 'warning' ? 'high' : 'medium',
        'data_tampering',
        alert.message
      );
      setShowMonitor(true);
    }
  }, [securityState.securityAlerts]);

  const handleDismiss = useCallback(() => {
    dismissAlert();
    setShowMonitor(false);
  }, [dismissAlert]);

  const handleInvestigate = useCallback(() => {
    // Could navigate to a security dashboard or show more details
    console.log('Investigating security alert:', currentAlert);
  }, [currentAlert]);

  const contextValue: SecurityContextType = {
    triggerSecurityAlert: triggerAlert,
    checkXPIntegrity,
    isSecure: securityState.isValidSession,
    alertCount: alerts.length,
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
      {ENABLE_SECURITY_MONITOR && (
        <HackerSecurityMonitor
          visible={showMonitor && currentAlert !== null}
          alert={currentAlert}
          onDismiss={handleDismiss}
          onInvestigate={handleInvestigate}
        />
      )}
    </SecurityContext.Provider>
  );
}
