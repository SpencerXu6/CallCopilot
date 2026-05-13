import { useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityIndicator,
  Image,
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

  const switchMode = (m: Mode) => { setMode(m); setError(''); setNotice(''); };

  const handleSubmit = async () => {
    setError(''); setNotice('');
    const trimEmail = email.trim().toLowerCase();
    if (!trimEmail || !password) { setError('Please enter your email and password.'); return; }
    if (mode === 'signup') {
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (password !== confirm) { setError('Passwords do not match.'); return; }
    }
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await signIn(trimEmail, password);
        if (error) throw error;
        await AsyncStorage.removeItem('callcopilot_guest');
      } else {
        const { error } = await signUp(trimEmail, password);
        if (error) throw error;
        await AsyncStorage.multiSet([
          ['callcopilot_needs_onboarding', 'true'],
          ['callcopilot_guest', 'false'],
        ]);
        setNotice('Account created! Check your email to confirm, then sign in.');
        setMode('signin');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const formFields = (
    <>
      <View style={styles.segmentedRow}>
        <Pressable
          style={[styles.segment, mode === 'signin' && styles.segmentActive]}
          onPress={() => switchMode('signin')}>
          <Text style={[styles.segmentText, mode === 'signin' && styles.segmentTextActive]}>Log In</Text>
        </Pressable>
        <Pressable
          style={[styles.segment, mode === 'signup' && styles.segmentActive]}
          onPress={() => switchMode('signup')}>
          <Text style={[styles.segmentText, mode === 'signup' && styles.segmentTextActive]}>Sign Up</Text>
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
          : <Text style={styles.ctaBtnText}>{mode === 'signin' ? 'Log In' : 'Create Account'}</Text>
        }
      </Pressable>

      <Pressable
        onPress={async () => {
          await AsyncStorage.setItem('callcopilot_guest', 'true');
          router.replace('/');
        }}
        style={({ pressed }) => [styles.guestBtn, pressed && styles.pressed]}>
        <Text style={styles.guestBtnText}>Continue as Guest</Text>
      </Pressable>
    </>
  );

  if (isWide) {
    return (
      <SafeAreaView style={styles.wideSafe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.wideScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.wideCard}>
              <LinearGradient colors={['#007AFF', '#0052CC']} style={styles.wideCardBrand}>
                <Image source={require('../assets/images/logo.png')} style={styles.logoImageSm} />
                <Text style={styles.appNameWhite}>LingoLine</Text>
                <Text style={styles.appSubWhite}>Your AI interpreter for English phone calls.</Text>
              </LinearGradient>
              <View style={styles.wideCardForm}>
                {formFields}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient colors={['#007AFF', '#0052CC']} style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.brandArea}>
          <Image source={require('../assets/images/logo.png')} style={styles.logoImage} />
          <Text style={styles.appName}>LingoLine</Text>
          <Text style={styles.appSub}>Your AI interpreter for English phone calls.</Text>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}>
          <ScrollView
            style={styles.formSheet}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {formFields}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  pressed: { opacity: 0.7 },

  brandArea: {
    alignItems: 'center',
    paddingTop: 44,
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  logoImage: { width: 80, height: 80, borderRadius: 18, marginBottom: 16 },
  appName: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.5, marginBottom: 6 },
  appSub: { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },

  formSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  formContent: { padding: 24, paddingBottom: 64, flexGrow: 1 },

  // Wide layout
  wideSafe: { flex: 1, backgroundColor: '#F2F2F7' },
  wideScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  wideCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  wideCardBrand: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logoImageSm: { width: 64, height: 64, borderRadius: 15, marginBottom: 12 },
  appNameWhite: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.4, marginBottom: 5 },
  appSubWhite: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  wideCardForm: { backgroundColor: '#FFFFFF', padding: 24, paddingBottom: 32 },

  // Shared form
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(120,120,128,0.12)',
    borderRadius: 11,
    padding: 2,
    marginBottom: 20,
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
    backgroundColor: '#F2F2F7',
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
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaBtnText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },

  guestBtn: { paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  guestBtnText: { fontSize: 15, color: '#6E6E73' },
});
