import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '@fastshot/auth';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar style="light" />
      <AuthProvider
        supabaseClient={supabase}
      >
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="visualizer/[algorithm]"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="game/grid-escape"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="game/the-sorter"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="game/race-mode"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="game/battle-arena"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="tutor"
            options={{
              presentation: 'modal',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="visualizer/tree"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="library/index"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="library/[lessonId]"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="dashboard"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="cheatsheet"
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="leaderboard"
            options={{
              animation: 'slide_from_right',
            }}
          />
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
