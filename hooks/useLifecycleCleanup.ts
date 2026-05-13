// Lifecycle Cleanup Hooks - Memory Leak Prevention System
// Provides proper cleanup for timers, subscriptions, and listeners
import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';

// Interval cleanup hook
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>(callback);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    intervalRef.current = setInterval(() => {
      savedCallback.current?.();
    }, delay);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [delay]);

  // Return cleanup function for manual cleanup if needed
  return useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);
}

// Timeout cleanup hook
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      savedCallback.current?.();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay]);

  return useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);
}

// Multiple timers cleanup hook for game screens
export function useTimerManager() {
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  const addTimer = useCallback((id: string, callback: () => void, delay: number) => {
    // Clear existing timer with same ID
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id)!);
    }

    const timer = setTimeout(() => {
      callback();
      timersRef.current.delete(id);
    }, delay);

    timersRef.current.set(id, timer);
    return id;
  }, []);

  const addInterval = useCallback((id: string, callback: () => void, delay: number) => {
    // Clear existing interval with same ID
    if (intervalsRef.current.has(id)) {
      clearInterval(intervalsRef.current.get(id)!);
    }

    const interval = setInterval(callback, delay);
    intervalsRef.current.set(id, interval);
    return id;
  }, []);

  const clearTimer = useCallback((id: string) => {
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id)!);
      timersRef.current.delete(id);
    }
  }, []);

  const clearIntervalById = useCallback((id: string) => {
    if (intervalsRef.current.has(id)) {
      clearInterval(intervalsRef.current.get(id)!);
      intervalsRef.current.delete(id);
    }
  }, []);

  const clearAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    intervalsRef.current.forEach((interval) => clearInterval(interval));
    timersRef.current.clear();
    intervalsRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAll();
    };
  }, [clearAll]);

  return {
    addTimer,
    addInterval,
    clearTimer,
    clearInterval: clearIntervalById,
    clearAll,
  };
}

// Subscription cleanup hook for Supabase and other subscriptions
type CleanupFunction = () => void;

export function useSubscriptionManager() {
  const subscriptionsRef = useRef<Map<string, CleanupFunction>>(new Map());

  const addSubscription = useCallback((id: string, cleanup: CleanupFunction) => {
    // Clean up existing subscription with same ID
    if (subscriptionsRef.current.has(id)) {
      subscriptionsRef.current.get(id)!();
    }

    subscriptionsRef.current.set(id, cleanup);
    return id;
  }, []);

  const removeSubscription = useCallback((id: string) => {
    if (subscriptionsRef.current.has(id)) {
      subscriptionsRef.current.get(id)!();
      subscriptionsRef.current.delete(id);
    }
  }, []);

  const clearAll = useCallback(() => {
    subscriptionsRef.current.forEach((cleanup) => cleanup());
    subscriptionsRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAll();
    };
  }, [clearAll]);

  return {
    addSubscription,
    removeSubscription,
    clearAll,
  };
}

// App state lifecycle hook for pausing/resuming
export function useAppStateLifecycle(options: {
  onForeground?: () => void;
  onBackground?: () => void;
  onInactive?: () => void;
}) {
  const { onForeground, onBackground, onInactive } = options;
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const prevState = appStateRef.current;

      if (prevState.match(/inactive|background/) && nextAppState === 'active') {
        onForeground?.();
      } else if (nextAppState === 'background') {
        onBackground?.();
      } else if (nextAppState === 'inactive') {
        onInactive?.();
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [onForeground, onBackground, onInactive]);
}

// Animation cleanup hook for Reanimated
export function useAnimationCleanup() {
  const animationsRef = useRef<Set<() => void>>(new Set());

  const registerAnimation = useCallback((cleanup: () => void) => {
    animationsRef.current.add(cleanup);
    return () => {
      animationsRef.current.delete(cleanup);
    };
  }, []);

  const cleanupAll = useCallback(() => {
    animationsRef.current.forEach((cleanup) => cleanup());
    animationsRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAll();
    };
  }, [cleanupAll]);

  return {
    registerAnimation,
    cleanupAll,
  };
}

// Combined lifecycle manager hook
export function useLifecycleManager() {
  const timers = useTimerManager();
  const subscriptions = useSubscriptionManager();
  const animations = useAnimationCleanup();

  const cleanupAll = useCallback(() => {
    timers.clearAll();
    subscriptions.clearAll();
    animations.cleanupAll();
  }, [timers, subscriptions, animations]);

  return {
    timers,
    subscriptions,
    animations,
    cleanupAll,
  };
}

// Debounce hook with cleanup
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

// Throttle hook with cleanup
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;

      if (timeSinceLastRun >= delay) {
        lastRunRef.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastRunRef.current = Date.now();
          callback(...args);
        }, delay - timeSinceLastRun);
      }
    },
    [callback, delay]
  );
}

export default {
  useInterval,
  useTimeout,
  useTimerManager,
  useSubscriptionManager,
  useAppStateLifecycle,
  useAnimationCleanup,
  useLifecycleManager,
  useDebounce,
  useThrottle,
};
