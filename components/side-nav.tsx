import { router, usePathname } from 'expo-router';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/hooks/use-auth';

const NAV = [
  { label: 'Home', emoji: '🏠', path: '/' },
  { label: 'History', emoji: '🕐', path: '/history' },
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
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>📞</Text>
          </View>
          <Text style={styles.logoName}>CallCopilot</Text>
        </View>

        <View style={styles.nav}>
          {NAV.map(item => {
            const active = pathname === item.path;
            return (
              <Pressable
                key={item.path}
                onPress={() => router.push(item.path as never)}
                style={({ pressed }) => [
                  styles.navItem,
                  active && styles.navItemActive,
                  pressed && styles.navItemPressed,
                ]}>
                <Text style={styles.navEmoji}>{item.emoji}</Text>
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
    width: 220,
    backgroundColor: '#FAFAFA',
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: { fontSize: 15 },
  logoName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  nav: { gap: 2 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  navItemActive: { backgroundColor: '#EFF6FF' },
  navItemPressed: { opacity: 0.75 },
  navEmoji: { fontSize: 16 },
  navLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  navLabelActive: {
    color: '#0284C7',
    fontWeight: '600',
  },
  signOutBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  signOutText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
