import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types for user profiles
export interface UserProfile {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  level: number;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_played_date: string | null;
  completed_algorithms: string[];
  algorithm_mastery: Record<string, AlgorithmMasteryData>;
  created_at: string;
  updated_at: string;
}

export interface AlgorithmMasteryData {
  algorithmId: string;
  quizScores: number[];
  masteryLevel: 'none' | 'bronze' | 'silver' | 'gold';
  challengesCompleted: number;
  totalChallenges: number;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_xp: number;
  level: number;
  rank?: number;
}

export interface BattleResult {
  id: string;
  user_id: string;
  algorithm1: string;
  algorithm2: string;
  winner: string;
  array_size: number;
  algorithm1_operations: number;
  algorithm2_operations: number;
  algorithm1_time_ms: number;
  algorithm2_time_ms: number;
  ai_explanation: string | null;
  created_at: string;
}
