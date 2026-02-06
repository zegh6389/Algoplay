// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));

// Mock expo-linking
jest.mock('expo-linking', () => ({
  createURL: jest.fn((path: string) => `algoplay://${path}`),
}));

// Mock react-native Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Set env vars for tests using real credentials
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://dgzmjvyrsyrubdkfruoa.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnem1qdnlyc3lydWJka2ZydW9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjAzNjYsImV4cCI6MjA4NTg5NjM2Nn0.ZXNkL8Ymi4lBkG3zDL9TCzMzQQEm7o2HFSgHURTHt7w';
