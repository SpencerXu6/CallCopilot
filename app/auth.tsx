import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/use-auth';
import { useBreakpoint } from '@/hooks/use-breakpoint';

type Mode = 'signin' | 'signup';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const { signIn, signUp } = useAuth();
  const { isWide } = useBreakpoint();

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setNotice('');
  };

  const handleSubmit = async () => {
    setError('');
    setNotice('');
    const trimEmail = email.trim().toLowerCase();

    if (!trimEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirm) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await signIn(trimEmail, password);
        if (error) throw error;
      } else {
        const { error } = await signUp(trimEmail, password);
        if (error) throw error;
        await AsyncStorage.setItem('callcopilot_needs_onboarding', 'true');
        setNotice('Account created! Check your email to confirm, then sign in.');
        setMode('signin');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={[styles.content, isWide && styles.contentWide]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={[styles.inner, isWide && styles.innerWide]}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Text style={styles.logoIcon}>📞</Text>
            </View>
            <Text style={styles.appName}>CallCopilot</Text>
            <Text style={styles.appSub}>Your bilingual call assistant</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>

            {/* Mode tabs */}
            <View style={styles.tabRow}>
              <Pressable
                style={[styles.tab, mode === 'signin' && styles.tabActive]}
                onPress={() => switchMode('signin')}>
                <Text style={[styles.tabText, mode === 'signin' && styles.tabTextActive]}>
                  Log In
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tab, mode === 'signup' && styles.tabActive]}
                onPress={() => switchMode('signup')}>
                <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
                  Sign Up
                </Text>
              </Pressable>
            </View>

            {/* Fields */}
            <View style={styles.fields}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Email</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="you@example.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Password</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {mode === 'signup' && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Confirm Password</Text>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry
                  />
                </View>
              )}
            </View>

            {/* Error / Notice */}
            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}
            {!!notice && (
              <View style={styles.noticeBox}>
                <Text style={styles.noticeText}>✅ {notice}</Text>
              </View>
            )}

            {/* CTA */}
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={({ pressed }) => [styles.ctaWrapper, pressed && styles.pressed]}>
              <LinearGradient
                colors={['#0EA5E9', '#0284C7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaBtn}>
                {loading
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={styles.ctaBtnText}>
                      {mode === 'signin' ? 'Log In' : 'Create Account'}
                    </Text>
                }
              </LinearGradient>
            </Pressable>
          </View>

          <Text style={styles.footer}>
            Your data is stored securely. We never share your information.
          </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  content: { paddingBottom: 48 },
  contentWide: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 48 },
  inner: { width: '100%' },
  innerWide: { maxWidth: 480, width: '100%' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 36,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoIcon: { fontSize: 28 },
  appName: {
    fontSize: 26,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  appSub: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '400',
  },

  // Card
  card: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 3,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#0F172A',
  },

  // Fields
  fields: { gap: 16, marginBottom: 20 },
  fieldGroup: { gap: 6 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.1,
  },
  fieldInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: '#0F172A',
  },

  // Feedback
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: { fontSize: 14, color: '#DC2626', lineHeight: 20 },
  noticeBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  noticeText: { fontSize: 14, color: '#16A34A', lineHeight: 20 },

  // CTA
  ctaWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaBtn: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  footer: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 40,
    lineHeight: 18,
  },
});
