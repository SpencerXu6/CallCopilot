import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { useAuth } from '@/hooks/use-auth';
import { SideNav } from '@/components/side-nav';
import { VOICE_KEY, type VoicePreference, getEnglishVoices } from '@/services/tts';

export default function SettingsScreen() {
  const { isWide } = useBreakpoint();
  const { session, user, signOut } = useAuth();
  const [voice, setVoice] = useState<VoicePreference>('auto');
  const [voices, setVoices] = useState<Speech.Voice[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(VOICE_KEY).then(val => {
      if (val && val !== 'female' && val !== 'male') setVoice(val);
    });
    getEnglishVoices().then(setVoices);
  }, []);

  const selectVoice = async (pref: VoicePreference) => {
    setVoice(pref);
    await AsyncStorage.setItem(VOICE_KEY, pref);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const voiceOptions = [
    { id: 'auto', label: 'Auto' },
    ...voices.map(v => ({
      id: v.identifier,
      label: v.name.replace(' (Enhanced)', '').replace(' (Default)', ''),
    })),
  ];

  return (
    <View style={[styles.root, isWide && styles.rootWide]}>
      {isWide && <SideNav />}

      <SafeAreaView style={styles.safe} edges={isWide ? [] : ['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>

          <View style={[styles.inner, isWide && styles.innerWide]}>
            <Text style={styles.title}>Settings</Text>

            <Text style={styles.sectionLabel}>VOICE</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Speaking Voice</Text>
              <Text style={styles.cardSub}>
                Used when reading suggested replies aloud during a call.
              </Text>
              <View style={styles.chipRow}>
                {voiceOptions.map(v => {
                  const active = voice === v.id;
                  return (
                    <Pressable
                      key={v.id}
                      onPress={() => selectVoice(v.id)}
                      style={({ pressed }) => [
                        styles.chip,
                        active && styles.chipActive,
                        pressed && styles.pressed,
                      ]}>
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {v.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Text style={styles.sectionLabel}>ACCOUNT</Text>
            {session ? (
              <>
                <View style={styles.listCard}>
                  <View style={styles.listRow}>
                    <Text style={styles.listLabel}>Email</Text>
                    <Text style={styles.listValue} numberOfLines={1}>
                      {user?.email ?? '—'}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={handleSignOut}
                  style={({ pressed }) => [styles.dangerBtn, pressed && styles.pressed]}>
                  <Text style={styles.dangerBtnText}>Sign Out</Text>
                </Pressable>
              </>
            ) : (
              <View style={styles.listCard}>
                <View style={styles.listRow}>
                  <Text style={styles.listLabel}>Status</Text>
                  <Text style={styles.listValue}>Guest</Text>
                </View>
              </View>
            )}

            <Text style={styles.sectionLabel}>ABOUT</Text>
            <View style={styles.listCard}>
              <View style={styles.listRow}>
                <Text style={styles.listLabel}>App</Text>
                <Text style={styles.listValue}>LingoLine</Text>
              </View>
              <View style={styles.listSep} />
              <View style={styles.listRow}>
                <Text style={styles.listLabel}>Version</Text>
                <Text style={styles.listValue}>1.0.0</Text>
              </View>
            </View>

          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F2F7' },
  rootWide: { flexDirection: 'row' },
  safe: { flex: 1, backgroundColor: '#F2F2F7' },
  scroll: { paddingBottom: 48 },
  pressed: { opacity: 0.7 },

  inner: { paddingHorizontal: 20, paddingTop: 20 },
  innerWide: { maxWidth: 780, alignSelf: 'center', width: '100%' },

  title: {
    fontSize: 34, fontWeight: '700', color: '#000000',
    letterSpacing: -0.5, marginBottom: 28, marginTop: 8,
  },

  sectionLabel: {
    fontSize: 13, fontWeight: '600', color: '#6E6E73',
    textTransform: 'uppercase', letterSpacing: 0.4,
    marginBottom: 8, marginTop: 4,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#000000', marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#6E6E73', lineHeight: 18, marginBottom: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#F2F2F7', borderRadius: 999,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  chipActive: { backgroundColor: 'rgba(0,122,255,0.08)', borderColor: '#007AFF' },
  chipText: { fontSize: 14, fontWeight: '500', color: '#6E6E73' },
  chipTextActive: { color: '#007AFF', fontWeight: '600' },

  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  listSep: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E5EA', marginLeft: 16 },
  listLabel: { fontSize: 15, color: '#000000' },
  listValue: { fontSize: 15, color: '#AEAEB2', maxWidth: '60%', textAlign: 'right' },

  dangerBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dangerBtnText: { fontSize: 17, fontWeight: '600', color: '#FF3B30' },
});
