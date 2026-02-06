import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/components/AuthProvider';
import { useAppStore } from '@/store/useAppStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export default function Index() {
  const { session, isReady } = useAuth();
  const { guestState } = useAppStore();

  // Show loading spinner while checking auth state
  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.neonCyan} />
      </View>
    );
  }

  // If user is authenticated or guest mode is active, go to tabs
  if (session || guestState.isGuest) {
    return <Redirect href="/(tabs)" />;
  }

  // Otherwise go to login
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
