import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';

function AuthGuard() {
  const { session, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const current = segments[0] as string;
    const inAuth = current === 'auth';
    const inOnboarding = current === 'onboarding';

    if (!session && !inAuth) {
      router.replace('/auth' as never);
      return;
    }

    if (session && inAuth) {
      AsyncStorage.getItem('callcopilot_needs_onboarding').then(flag => {
        if (flag === 'true') {
          router.replace('/onboarding' as never);
        } else {
          router.replace('/');
        }
      });
      return;
    }

    if (session && !inOnboarding && !inAuth) {
      AsyncStorage.getItem('callcopilot_needs_onboarding').then(flag => {
        if (flag === 'true') {
          router.replace('/onboarding' as never);
        }
      });
    }
  }, [session, loading, segments]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthGuard />
      <Stack>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="call" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
