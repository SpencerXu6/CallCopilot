import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { SideNav } from '@/components/side-nav';

const LANGUAGE_KEY = 'callcopilot_language';
const NAME_KEY = 'callcopilot_name';
const USE_CASE_KEY = 'callcopilot_use_case';

const LANGUAGES = [
  { label: '中文', name: 'Chinese', flag: '🇨🇳' },
  { label: 'Español', name: 'Spanish', flag: '🇪🇸' },
  { label: 'Français', name: 'French', flag: '🇫🇷' },
  { label: '한국어', name: 'Korean', flag: '🇰🇷' },
  { label: '日本語', name: 'Japanese', flag: '🇯🇵' },
  { label: 'Português', name: 'Portuguese', flag: '🇧🇷' },
  { label: 'Tiếng Việt', name: 'Vietnamese', flag: '🇻🇳' },
  { label: 'हिंदी', name: 'Hindi', flag: '🇮🇳' },
];

const USE_CASES = [
  { label: 'Healthcare', sub: 'Doctor appointments, insurance, pharmacy' },
  { label: 'Banking & Finance', sub: 'Account questions, disputes, transfers' },
  { label: 'Utilities & Home', sub: 'Internet, electricity, trash, water' },
  { label: 'Customer Service', sub: 'Returns, cancellations, subscriptions' },
  { label: 'Other', sub: 'General phone calls in English' },
];

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('Chinese');
  const [useCase, setUseCase] = useState('');
  const [saved, setSaved] = useState(false);
  const { isWide } = useBreakpoint();

  useEffect(() => {
    AsyncStorage.multiGet([NAME_KEY, LANGUAGE_KEY, USE_CASE_KEY]).then(pairs => {
      if (pairs[0][1]) setName(pairs[0][1]);
      if (pairs[1][1]) setLanguage(pairs[1][1]);
      if (pairs[2][1]) setUseCase(pairs[2][1]);
    });
  }, []);

  const save = async () => {
    await AsyncStorage.multiSet([
      [NAME_KEY, name.trim() || 'there'],
      [LANGUAGE_KEY, language],
      [USE_CASE_KEY, useCase],
    ]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <View style={[styles.root, isWide && styles.rootWide]}>
      {isWide && <SideNav />}

      <SafeAreaView style={styles.safe} edges={isWide ? [] : ['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={[styles.inner, isWide && styles.innerWide]}>

            <View style={styles.header}>
              <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <Text style={styles.sectionLabel}>NAME</Text>
            <View style={styles.fieldCard}>
              <TextInput
                style={styles.fieldInput}
                placeholder="Your first name"
                placeholderTextColor="#AEAEB2"
                value={name}
                onChangeText={setName}
                autoCorrect={false}
                autoCapitalize="words"
              />
            </View>

            <Text style={styles.sectionLabel}>LANGUAGE</Text>
            <View style={styles.langGrid}>
              {LANGUAGES.map(lang => {
                const active = language === lang.name;
                return (
                  <Pressable
                    key={lang.name}
                    onPress={() => setLanguage(lang.name)}
                    style={({ pressed }) => [
                      styles.langChip,
                      active && styles.langChipActive,
                      pressed && styles.pressed,
                    ]}>
                    <Text style={styles.langFlag}>{lang.flag}</Text>
                    <Text style={[styles.langLabel, active && styles.langLabelActive]}>
                      {lang.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sectionLabel}>COMMON USE</Text>
            <View style={styles.useCaseCard}>
              {USE_CASES.map((uc, i) => {
                const active = useCase === uc.label;
                return (
                  <View key={uc.label}>
                    {i > 0 && <View style={styles.sep} />}
                    <Pressable
                      onPress={() => setUseCase(uc.label)}
                      style={({ pressed }) => [styles.useCaseRow, pressed && styles.pressed]}>
                      <View style={styles.useCaseText}>
                        <Text style={styles.useCaseLabel}>{uc.label}</Text>
                        <Text style={styles.useCaseSub}>{uc.sub}</Text>
                      </View>
                      <View style={[styles.radio, active && styles.radioActive]}>
                        {active && <View style={styles.radioDot} />}
                      </View>
                    </Pressable>
                  </View>
                );
              })}
            </View>

            <Pressable
              onPress={save}
              style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}>
              <Text style={styles.saveBtnText}>{saved ? 'Saved ✓' : 'Save Changes'}</Text>
            </Pressable>

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

  inner: { width: '100%' },
  innerWide: { maxWidth: 680, alignSelf: 'center' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 34, fontWeight: '700', color: '#000000', letterSpacing: -0.5 },

  sectionLabel: {
    fontSize: 13, fontWeight: '600', color: '#6E6E73',
    textTransform: 'uppercase', letterSpacing: 0.4,
    paddingHorizontal: 20, marginTop: 28, marginBottom: 10,
  },

  fieldCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  fieldInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    color: '#000000',
  },

  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20 },
  langChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9,
    backgroundColor: '#FFFFFF', borderRadius: 999,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  langChipActive: {
    backgroundColor: 'rgba(0,122,255,0.08)',
    borderColor: '#007AFF',
  },
  langFlag: { fontSize: 15 },
  langLabel: { fontSize: 14, fontWeight: '500', color: '#6E6E73' },
  langLabelActive: { color: '#007AFF', fontWeight: '600' },

  useCaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E5EA', marginLeft: 16 },
  useCaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  useCaseText: { flex: 1 },
  useCaseLabel: { fontSize: 15, fontWeight: '500', color: '#000000', marginBottom: 2 },
  useCaseSub: { fontSize: 13, color: '#AEAEB2' },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#C7C7CC',
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: '#007AFF' },
  radioDot: {
    width: 11, height: 11, borderRadius: 6,
    backgroundColor: '#007AFF',
  },

  saveBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 17,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
});
