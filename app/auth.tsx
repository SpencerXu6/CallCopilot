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

            <View style={styles.logoArea}>
              <View style={styles.logoMark}>
                <Text style={styles.logoMarkText}>C</Text>
              </View>
              <Text style={styles.appName}>CallCopilot</Text>
              <Text style={styles.appSub}>Your bilingual call assistant</Text>
            </View>

            <View style={styles.segmentedRow}>
              <Pressable
                style={[styles.segment, mode === 'signin' && styles.segmentActive]}
                onPress={() => switchMode('signin')}>
                <Text style={[styles.segmentText, mode === 'signin' && styles.segmentTextActive]}>
                  Log In
                </Text>
              </Pressable>
              <Pressable
                style={[styles.segment, mode === 'signup' && styles.segmentActive]}
                onPress={() => switchMode('signup')}>
                <Text style={[styles.segmentText, mode === 'signup' && styles.segmentTextActive]}>
                  Sign Up
                </Text>
              </Pressable>
            </View>

            <View style={styles.fieldCard}>
              <TextInput
                style={styles.fieldInput}
                placeholder="Email"
                placeholderTextColor="#AEAEB2"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.fieldSep} />
              <TextInput
                style={styles.fieldInput}
                placeholder="Password"
                placeholderTextColor="#AEAEB2"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              {mode === 'signup' && (
                <>
                  <View style={styles.fieldSep} />
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="Confirm Password"
                    placeholderTextColor="#AEAEB2"
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry
                  />
                </>
              )}
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}
            {!!notice && <Text style={styles.noticeText}>{notice}</Text>}

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={({ pressed }) => [styles.ctaBtn, pressed && styles.pressed]}>
              {loading
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.ctaBtnText}>
                    {mode === 'signin' ? 'Log In' : 'Create Account'}
                  </Text>
              }
            </Pressable>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F7' },
  flex: { flex: 1 },
  content: { paddingBottom: 48 },
  contentWide: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 48 },
  inner: { paddingHorizontal: 20 },
  innerWide: { maxWidth: 400, width: '100%' },
  pressed: { opacity: 0.7 },

  logoArea: { alignItems: 'center', paddingTop: 64, paddingBottom: 44 },
  logoMark: {
    width: 60, height: 60, borderRadius: 15,
    backgroundColor: '#000000',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  logoMarkText: { fontSize: 26, fontWeight: '700', color: '#FFFFFF' },
  appName: { fontSize: 28, fontWeight: '700', color: '#000000', letterSpacing: -0.5, marginBottom: 4 },
  appSub: { fontSize: 15, color: '#6E6E73' },

  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(120,120,128,0.12)',
    borderRadius: 11,
    padding: 2,
    marginBottom: 16,
  },
  segment: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: { fontSize: 14, fontWeight: '500', color: '#6E6E73' },
  segmentTextActive: { color: '#000000', fontWeight: '600' },

  fieldCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  fieldInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    color: '#000000',
  },
  fieldSep: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E5EA', marginLeft: 16 },

  errorText: { fontSize: 13, color: '#FF3B30', marginBottom: 12, paddingHorizontal: 4 },
  noticeText: { fontSize: 13, color: '#34C759', marginBottom: 12, paddingHorizontal: 4 },

  ctaBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  ctaBtnText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
});
