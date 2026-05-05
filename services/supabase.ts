import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// On web, use localStorage directly (AsyncStorage crashes during SSR; SecureStore is native-only).
// Guard with typeof window so this is safe even if the module is evaluated server-side.
const StorageAdapter = Platform.OS === 'web'
  ? {
      getItem: (key: string) => Promise.resolve(
        typeof window !== 'undefined' ? window.localStorage.getItem(key) : null
      ),
      setItem: (key: string, value: string) => Promise.resolve(
        typeof window !== 'undefined' ? window.localStorage.setItem(key, value) : undefined
      ),
      removeItem: (key: string) => Promise.resolve(
        typeof window !== 'undefined' ? window.localStorage.removeItem(key) : undefined
      ),
    }
  : {
      getItem: (key: string) => SecureStore.getItemAsync(key),
      setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
      removeItem: (key: string) => SecureStore.deleteItemAsync(key),
    };

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: StorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
