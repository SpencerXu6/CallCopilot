import { router, usePathname } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/use-auth';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const NAV: { label: string; path: string; icon: IoniconName; iconActive: IoniconName }[] = [
  { label: 'Home',     path: '/',         icon: 'home-outline',     iconActive: 'home' },
  { label: 'History',  path: '/history',  icon: 'time-outline',     iconActive: 'time' },
  { label: 'Profile',  path: '/profile',  icon: 'person-outline',   iconActive: 'person' },
  { label: 'Settings', path: '/settings', icon: 'settings-outline', iconActive: 'settings' },
];

export function SideNav() {
  const pathname = usePathname();
  const { session, user } = useAuth();

  const initial = user?.email?.[0]?.toUpperCase() ?? 'G';

  return (
    <View style={styles.sidebar}>

      {/* Brand */}
      <View style={styles.brand}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.wordmark}>LingoLine</Text>
      </View>

      {/* User info */}
      {session && user ? (
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.userMeta}>
            <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
            <Text style={styles.userRole}>Signed in</Text>
          </View>
        </View>
      ) : (
        <View style={styles.userCard}>
          <View style={[styles.avatar, styles.avatarGuest]}>
            <Ionicons name="person-outline" size={16} color="#AEAEB2" />
          </View>
          <View style={styles.userMeta}>
            <Text style={styles.userEmail}>Guest</Text>
            <Text style={styles.userRole}>No account</Text>
          </View>
        </View>
      )}

      <View style={styles.divider} />

      {/* Nav items */}
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
                pressed && !active && styles.navItemPressed,
              ]}>
              <Ionicons
                name={active ? item.iconActive : item.icon}
                size={19}
                color={active ? '#007AFF' : '#6E6E73'}
                style={styles.navIcon}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Bottom */}
      <View style={styles.bottom}>
        <View style={styles.divider} />
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>LingoLine · v1.0</Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    backgroundColor: '#FAFAFA',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#E5E5EA',
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
  },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  logo: { width: 32, height: 32, borderRadius: 8 },
  wordmark: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.3,
  },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGuest: { backgroundColor: '#E5E5EA' },
  avatarText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  userMeta: { flex: 1 },
  userEmail: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.1,
  },
  userRole: { fontSize: 11, color: '#AEAEB2', marginTop: 1 },

  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E5EA', marginVertical: 8 },

  nav: { gap: 2 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 10,
  },
  navItemActive: {
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  navItemPressed: { opacity: 0.6 },
  navIcon: { width: 22 },
  navLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6E6E73',
  },
  navLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },

  bottom: { marginTop: 'auto' },
  appInfo: { paddingHorizontal: 4, paddingTop: 8 },
  appInfoText: { fontSize: 11, color: '#C7C7CC' },
});
