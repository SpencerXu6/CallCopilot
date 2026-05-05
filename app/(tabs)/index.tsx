import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/use-auth';
import { t, PRESET_EN } from '@/constants/i18n';
import { TutorialOverlay, TutorialStep } from '@/components/tutorial';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { SideNav } from '@/components/side-nav';

const LANGUAGE_KEY = 'callcopilot_language';
const NAME_KEY = 'callcopilot_name';
const TUTORIAL_KEY = 'callcopilot_tutorial_done';

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

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    emoji: '🌍',
    title: 'Choose your language',
    body: 'Tap any language chip at the top. The AI will explain everything — translation, guidance, notes — in that language.',
  },
  {
    emoji: '✍️',
    title: 'Enter your call goal',
    body: 'Type what you need to accomplish on this call. Be specific — it helps the AI give you better guidance.',
  },
  {
    emoji: '⚡',
    title: 'Use a preset task',
    body: 'Tap any common task to fill your goal instantly. You can edit it after selecting.',
  },
  {
    emoji: '📞',
    title: 'Start your call',
    body: 'Tap the blue card to begin. Put your phone on speaker, then use the mic button to record what the agent says.',
  },
  {
    emoji: '🕐',
    title: 'Review past calls',
    body: 'Every call you complete is saved to the History tab so you can review what was said and what to do next time.',
  },
];

export default function HomeScreen() {
  const [goal, setGoal] = useState('');
  const [language, setLanguage] = useState('Chinese');
  const [name, setName] = useState('');
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const { signOut } = useAuth();
  const { isWide, isDesktop } = useBreakpoint();

  useEffect(() => {
    AsyncStorage.multiGet([LANGUAGE_KEY, NAME_KEY, TUTORIAL_KEY]).then(pairs => {
      const lang = pairs[0][1];
      const savedName = pairs[1][1];
      const tutorialDone = pairs[2][1];
      if (lang) setLanguage(lang);
      if (savedName) setName(savedName);
      if (!tutorialDone) setShowTutorial(true);
    });
  }, []);

  const selectLanguage = async (langName: string) => {
    setLanguage(langName);
    await AsyncStorage.setItem(LANGUAGE_KEY, langName);
  };

  const startCall = () => {
    const trimmed = goal.trim();
    if (!trimmed) return;
    router.push({ pathname: '/call', params: { goal: trimmed, language } });
  };

  const handleSignOut = () => {
    const strings = t(language);
    Alert.alert(strings.signOutTitle, strings.signOutMessage, [
      { text: strings.cancel, style: 'cancel' },
      { text: strings.signOutConfirm, style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const advanceTutorial = () => {
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setTutorialStep(s => s + 1);
    } else {
      dismissTutorial();
    }
  };

  const dismissTutorial = async () => {
    setShowTutorial(false);
    await AsyncStorage.setItem(TUTORIAL_KEY, 'true');
  };

  const strings = t(language);
  const canStart = goal.trim().length > 0;
  const presets = strings.presets;

  const langChips = LANGUAGES.map(lang => {
    const active = language === lang.name;
    return (
      <Pressable
        key={lang.name}
        style={({ pressed }) => [
          styles.langChip,
          active && styles.langChipActive,
          pressed && styles.pressed,
        ]}
        onPress={() => selectLanguage(lang.name)}>
        <Text style={styles.langFlag}>{lang.flag}</Text>
        <Text style={[styles.langLabel, active && styles.langLabelActive]}>{lang.label}</Text>
      </Pressable>
    );
  });

  const presetCards = PRESET_EN.map((en, i) => {
    const active = goal === en;
    return (
      <Pressable
        key={en}
        style={({ pressed }) => [
          styles.presetCard,
          active && styles.presetCardActive,
          pressed && styles.pressed,
        ]}
        onPress={() => setGoal(en)}>
        <Text style={[styles.presetZh, active && styles.presetZhActive]}>{presets[i] ?? en}</Text>
        <Text style={[styles.presetEn, active && styles.presetEnActive]} numberOfLines={2}>{en}</Text>
      </Pressable>
    );
  });

  return (
    <View style={[styles.root, isWide && styles.rootWide]}>
      {isWide && <SideNav />}

      <SafeAreaView style={styles.safe} edges={isWide ? [] : ['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {/* Mobile header — hidden on wide (sidebar has logo) */}
            {!isWide && (
              <View style={styles.header}>
                <View style={styles.logoRow}>
                  <View style={styles.logoBox}>
                    <Text style={styles.logoIcon}>📞</Text>
                  </View>
                  <Text style={styles.logoName}>CallCopilot</Text>
                </View>
                <Pressable
                  onPress={handleSignOut}
                  style={({ pressed }) => [styles.profileBtn, pressed && styles.pressed]}>
                  <Text style={styles.profileIcon}>👤</Text>
                </Pressable>
              </View>
            )}

            {/* Centering wrapper */}
            <View style={[styles.inner, isWide && styles.innerWide]}>

              {/* Hero */}
              <View style={[styles.hero, isWide && styles.heroWide]}>
                <Text style={[styles.heroTitle, isDesktop && styles.heroTitleLg]}>
                  {strings.heroTitle}
                </Text>
                <Text style={styles.heroSub}>
                  {name ? `👋 ${name} — ` : ''}{strings.heroSub}
                </Text>
              </View>

              {/* Language */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{strings.myLanguage}</Text>
              </View>
              {isWide ? (
                <View style={styles.langGrid}>{langChips}</View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.langScroll}
                  style={styles.langRow}>
                  {langChips}
                </ScrollView>
              )}

              {/* Goal input */}
              <View style={styles.inputCard}>
                <Text style={styles.inputCardTitle}>{strings.goalTitle}</Text>
                <Text style={styles.inputCardSub}>{strings.goalSub}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={strings.goalPlaceholder}
                  placeholderTextColor="#94A3B8"
                  value={goal}
                  onChangeText={setGoal}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Presets */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{strings.commonTasks}</Text>
              </View>
              {isWide ? (
                <View style={styles.presetsGrid}>{presetCards}</View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.presetsScroll}
                  style={styles.presetsRow}>
                  {presetCards}
                </ScrollView>
              )}

              {/* Start call */}
              <Pressable
                onPress={startCall}
                disabled={!canStart}
                style={({ pressed }) => [
                  styles.startWrapper,
                  !canStart && styles.startDisabled,
                  pressed && canStart && styles.pressed,
                ]}>
                <LinearGradient
                  colors={['#0EA5E9', '#0284C7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.startCard}>
                  <View>
                    <Text style={styles.startCardLabel}>{strings.ready}</Text>
                    <Text style={styles.startCardTitle}>{strings.startCall}</Text>
                  </View>
                  <View style={styles.startIconBox}>
                    <Text style={styles.startIconEmoji}>📞</Text>
                  </View>
                </LinearGradient>
              </Pressable>

              <Text style={styles.tip}>{strings.tip}</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <TutorialOverlay
        steps={TUTORIAL_STEPS}
        currentStep={tutorialStep}
        onNext={advanceTutorial}
        onSkip={dismissTutorial}
        visible={showTutorial}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  rootWide: { flexDirection: 'row' },
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  scroll: { paddingBottom: 48 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },

  // Centering wrapper
  inner: { width: '100%' },
  innerWide: { maxWidth: 720, alignSelf: 'center' },

  // Mobile header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 28, paddingTop: 16, paddingBottom: 8,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#0F172A',
    alignItems: 'center', justifyContent: 'center',
  },
  logoIcon: { fontSize: 18 },
  logoName: { fontSize: 20, fontWeight: '600', color: '#0F172A', letterSpacing: -0.3 },
  profileBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC',
    borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },
  profileIcon: { fontSize: 18 },

  // Hero
  hero: { paddingHorizontal: 28, paddingTop: 28, paddingBottom: 24 },
  heroWide: { paddingTop: 48, paddingHorizontal: 28 },
  heroTitle: { fontSize: 36, fontWeight: '600', color: '#0F172A', lineHeight: 40, letterSpacing: -0.8 },
  heroTitleLg: { fontSize: 46, lineHeight: 52 },
  heroSub: { fontSize: 14, color: '#94A3B8', marginTop: 8, fontWeight: '400', lineHeight: 20 },

  sectionHeader: { paddingHorizontal: 28, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#0F172A', letterSpacing: -0.2 },

  // Language — mobile scroll
  langRow: { marginBottom: 24 },
  langScroll: { paddingLeft: 20, paddingRight: 8, gap: 8 },

  // Language — wide grid
  langGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    marginBottom: 24, paddingHorizontal: 28,
  },

  langChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 999,
  },
  langChipActive: { backgroundColor: '#EFF6FF', borderColor: '#0EA5E9' },
  langFlag: { fontSize: 16 },
  langLabel: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  langLabelActive: { color: '#0284C7' },

  // Goal input
  inputCard: {
    marginHorizontal: 20, marginBottom: 28, backgroundColor: '#FFFFFF', borderRadius: 24,
    padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 20, elevation: 3,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  inputCardTitle: { fontSize: 18, fontWeight: '600', color: '#0F172A', letterSpacing: -0.2, marginBottom: 2 },
  inputCardSub: { fontSize: 14, color: '#64748B', marginBottom: 14, fontWeight: '400' },
  textInput: {
    borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 14,
    padding: 14, fontSize: 15, color: '#0F172A',
    minHeight: 88, lineHeight: 22, backgroundColor: '#F8FAFC',
  },

  // Presets — mobile scroll
  presetsRow: { marginBottom: 24 },
  presetsScroll: { paddingLeft: 20, paddingRight: 8, gap: 10 },

  // Presets — wide grid
  presetsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    marginBottom: 24, paddingHorizontal: 20,
  },

  presetCard: {
    minWidth: 140, backgroundColor: '#F8FAFC', borderWidth: 1,
    borderColor: '#F1F5F9', borderRadius: 20, padding: 16,
  },
  presetCardActive: { backgroundColor: '#EFF6FF', borderColor: '#0EA5E9' },
  presetZh: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  presetZhActive: { color: '#0284C7' },
  presetEn: { fontSize: 11, color: '#64748B', lineHeight: 16, fontWeight: '400' },
  presetEnActive: { color: '#0EA5E9' },

  // Start call
  startWrapper: { marginHorizontal: 20, marginBottom: 24, borderRadius: 32, overflow: 'hidden' },
  startDisabled: { opacity: 0.35 },
  startCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24,
  },
  startCardLabel: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  startCardTitle: { fontSize: 24, fontWeight: '600', color: '#FFFFFF', letterSpacing: -0.4 },
  startIconBox: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  startIconEmoji: { fontSize: 22 },

  tip: { fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 },
});
