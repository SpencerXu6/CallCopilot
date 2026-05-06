import { router, usePathname } from 'expo-router';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/hooks/use-auth';

const NAV = [
  { label: 'Home', path: '/' },
  { label: 'History', path: '/history' },
] as const;

export function SideNav() {
  const pathname = usePathname();
  const { signOut, session } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <View style={styles.sidebar}>
      <View>
        <Text style={styles.wordmark}>CallCopilot</Text>

        <View style={styles.nav}>
          {NAV.map(item => {
            const active = pathname === item.path;
            return (
              <Pressable
                key={item.path}
                onPress={() => router.push(item.path as never)}
                style={({ pressed }) => [
                  styles.navItem,
                  pressed && styles.navItemPressed,
                ]}>
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {session && (
        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [styles.signOutBtn, pressed && styles.navItemPressed]}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 200,
    backgroundColor: '#F2F2F7',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#C6C6C8',
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  wordmark: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.3,
    marginBottom: 36,
  },
  nav: { gap: 2 },
  navItem: {
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  navItemPressed: { opacity: 0.6 },
  navLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6E6E73',
  },
  navLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  signOutBtn: {
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  signOutText: {
    fontSize: 15,
    color: '#FF3B30',
    fontWeight: '500',
  },
});
