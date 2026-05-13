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
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    body: 'Tap any language chip at the top. The AI will explain everything in that language.',
  },
  {
    emoji: '✍️',
    title: 'Enter your call goal',
    body: 'Type what you need to accomplish. Be specific — it helps the AI give better guidance.',
  },
  {
    emoji: '⚡',
    title: 'Use a quick start',
    body: 'Tap any common task to fill your goal instantly. You can edit it after.',
  },
  {
    emoji: '📞',
    title: 'Start your call',
    body: 'Tap Start Call. Put your phone on speaker, then use the mic to record the agent.',
  },
  {
    emoji: '🕐',
    title: 'Review past calls',
    body: 'Every completed call is saved to History so you can review it later.',
  },
];

export default function HomeScreen() {
  const [goal, setGoal] = useState('');
  const [language, setLanguage] = useState('Chinese');
  const [name, setName] = useState('');
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const { signOut, user } = useAuth();
  const { isWide, isDesktop } = useBreakpoint();

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.multiGet([LANGUAGE_KEY, NAME_KEY, TUTORIAL_KEY]).then(pairs => {
      if (cancelled) return;
      const lang = pairs[0][1];
      const savedName = pairs[1][1];
      const tutorialDone = pairs[2][1];
      if (lang) setLanguage(lang);
      if (savedName) setName(savedName);
      if (!tutorialDone) setShowTutorial(true);
    });
    return () => { cancelled = true; };
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
          styles.presetChip,
          active && styles.presetChipActive,
          pressed && styles.pressed,
        ]}
        onPress={() => setGoal(en)}>
        <Text style={[styles.presetText, active && styles.presetTextActive]} numberOfLines={2}>
          {presets[i] ?? en}
        </Text>
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

            <LinearGradient
              colors={['#EBF4FF', '#F2F2F7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.heroGradient}>
              {!isWide && (
                <View style={styles.header}>
                  <Text style={styles.wordmark}>LingoLine</Text>
                  {user ? (
                    <Pressable
                      onPress={handleSignOut}
                      style={({ pressed }) => [styles.signOutBtn, pressed && styles.pressed]}>
                      <Text style={styles.signOutText}>Sign Out</Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={async () => {
                        await AsyncStorage.setItem('callcopilot_guest', 'false');
                        router.replace('/auth' as never);
                      }}
                      style={({ pressed }) => [styles.signOutBtn, pressed && styles.pressed]}>
                      <Text style={styles.signInText}>Sign In</Text>
                    </Pressable>
                  )}
                </View>
              )}
              <View style={[styles.inner, isWide && styles.innerWide]}>
                <View style={[styles.hero, isWide && styles.heroWide]}>
                  <Text style={[styles.heroTitle, isDesktop && styles.heroTitleLg]}>
                    {strings.heroTitle}
                  </Text>
                  {name ? (
                    <Text style={styles.heroSub}>{name} — {strings.heroSub}</Text>
                  ) : (
                    <Text style={styles.heroSub}>{strings.heroSub}</Text>
                  )}
                </View>
              </View>
            </LinearGradient>

            <View style={[styles.inner, isWide && styles.innerWide]}>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>{strings.myLanguage}</Text>
                {isWide ? (
                  <View style={styles.langGrid}>{langChips}</View>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.langScroll}>
                    {langChips}
                  </ScrollView>
                )}
              </View>

              <View style={styles.section}>
                <View style={styles.goalCard}>
                  <TextInput
                    style={styles.goalInput}
                    placeholder={strings.goalPlaceholder}
                    placeholderTextColor="#AEAEB2"
                    value={goal}
                    onChangeText={setGoal}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>{strings.commonTasks}</Text>
                {isWide ? (
                  <View style={styles.presetsGrid}>{presetCards}</View>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.presetsScroll}>
                    {presetCards}
                  </ScrollView>
                )}
              </View>

              <Pressable
                onPress={startCall}
                disabled={!canStart}
                style={({ pressed }) => [
                  styles.ctaBtn,
                  !canStart && styles.ctaBtnDisabled,
                  pressed && canStart && styles.pressed,
                ]}>
                <Text style={styles.ctaBtnText}>{strings.startCall}</Text>
              </Pressable>

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
  root: { flex: 1, backgroundColor: '#F2F2F7' },
  rootWide: { flexDirection: 'row' },
  safe: { flex: 1, backgroundColor: '#F2F2F7' },
  flex: { flex: 1 },
  scroll: { paddingBottom: 48 },
  pressed: { opacity: 0.7 },

  inner: { width: '100%' },
  innerWide: { maxWidth: 800, alignSelf: 'center' },

  heroGradient: { paddingBottom: 4 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  wordmark: { fontSize: 20, fontWeight: '700', color: '#000000', letterSpacing: -0.4 },
  signOutBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  signOutText: { fontSize: 15, color: '#FF3B30', fontWeight: '500' },
  signInText: { fontSize: 15, color: '#007AFF', fontWeight: '500' },

  hero: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 32 },
  heroWide: { paddingTop: 48 },
  heroTitle: {
    fontSize: 34, fontWeight: '700', color: '#000000',
    lineHeight: 40, letterSpacing: -0.5, marginBottom: 8,
  },
  heroTitleLg: { fontSize: 44, lineHeight: 50 },
  heroSub: { fontSize: 15, color: '#6E6E73', lineHeight: 22 },

  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 13, fontWeight: '600', color: '#6E6E73',
    textTransform: 'uppercase', letterSpacing: 0.4,
    paddingHorizontal: 20, marginBottom: 10,
  },

  langScroll: { paddingHorizontal: 20, gap: 8 },
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

  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  goalInput: {
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 17, color: '#000000',
    minHeight: 96, lineHeight: 24,
  },

  presetsScroll: { paddingHorizontal: 20, gap: 8 },
  presetsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20 },
  presetChip: {
    paddingHorizontal: 14, paddingVertical: 9,
    backgroundColor: '#FFFFFF', borderRadius: 999,
    borderWidth: 1.5, borderColor: 'transparent',
    maxWidth: 220,
  },
  presetChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  presetText: { fontSize: 14, fontWeight: '500', color: '#000000' },
  presetTextActive: { color: '#FFFFFF' },

  ctaBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    marginHorizontal: 20,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaBtnDisabled: { opacity: 0.35 },
  ctaBtnText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
});
