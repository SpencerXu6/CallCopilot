import { useState } from 'react';
import {
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
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGES = [
  { label: '中文', name: 'Chinese', flag: '🇨🇳', sub: 'Chinese' },
  { label: 'Español', name: 'Spanish', flag: '🇪🇸', sub: 'Spanish' },
  { label: 'Français', name: 'French', flag: '🇫🇷', sub: 'French' },
  { label: '한국어', name: 'Korean', flag: '🇰🇷', sub: 'Korean' },
  { label: '日本語', name: 'Japanese', flag: '🇯🇵', sub: 'Japanese' },
  { label: 'Português', name: 'Portuguese', flag: '🇧🇷', sub: 'Portuguese' },
  { label: 'Tiếng Việt', name: 'Vietnamese', flag: '🇻🇳', sub: 'Vietnamese' },
  { label: 'हिंदी', name: 'Hindi', flag: '🇮🇳', sub: 'Hindi' },
];

const USE_CASES = [
  { icon: '🏥', label: 'Healthcare', sub: 'Doctor appointments, insurance, pharmacy' },
  { icon: '🏦', label: 'Banking & Finance', sub: 'Account questions, disputes, transfers' },
  { icon: '💡', label: 'Utilities & Home', sub: 'Internet, electricity, trash, water' },
  { icon: '📦', label: 'Customer Service', sub: 'Returns, cancellations, subscriptions' },
  { icon: '🎯', label: 'Other', sub: 'General phone calls in English' },
];

const TOTAL_STEPS = 3;

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('Chinese');
  const [useCase, setUseCase] = useState('');

  const goNext = () => setStep(s => s + 1);

  const finish = async () => {
    await AsyncStorage.multiSet([
      ['callcopilot_name', name.trim() || 'there'],
      ['callcopilot_language', language],
      ['callcopilot_use_case', useCase],
      ['callcopilot_needs_onboarding', 'false'],
    ]);
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>

        {/* Progress bar — shown on steps 1-3 */}
        {step > 0 && step <= TOTAL_STEPS && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` as any }]} />
          </View>
        )}

        {/* ── STEP 0: Welcome ── */}
        {step === 0 && (
          <View style={styles.welcomeScreen}>
            <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.welcomeGradient}>
              <View style={styles.welcomeLogoBox}>
                <Text style={styles.welcomeLogoIcon}>📞</Text>
              </View>
              <Text style={styles.welcomeTitle}>Welcome to{'\n'}CallCopilot</Text>
              <Text style={styles.welcomeSub}>
                Your AI assistant for English phone calls — available in your language, anytime.
              </Text>
            </LinearGradient>
            <View style={styles.welcomeBottom}>
              <Text style={styles.welcomeBodyTitle}>What CallCopilot does</Text>
              <View style={styles.featureList}>
                {[
                  ['🎙️', 'Records what the agent says'],
                  ['🧠', 'Explains it in your language'],
                  ['💬', 'Gives you an English reply to read aloud'],
                ].map(([icon, text]) => (
                  <View key={text} style={styles.featureRow}>
                    <Text style={styles.featureIcon}>{icon}</Text>
                    <Text style={styles.featureText}>{text}</Text>
                  </View>
                ))}
              </View>
              <Pressable
                onPress={goNext}
                style={({ pressed }) => [styles.primaryBtnWrapper, pressed && styles.pressed]}>
                <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>Get Started →</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── STEP 1: Name ── */}
        {step === 1 && (
          <ScrollView contentContainerStyle={styles.stepContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.stepEyebrow}>Step 1 of {TOTAL_STEPS}</Text>
            <Text style={styles.stepTitle}>What should we{'\n'}call you?</Text>
            <Text style={styles.stepSub}>
              We'll use your name to personalize your experience.
            </Text>
            <View style={styles.nameInputWrapper}>
              <TextInput
                style={styles.nameInput}
                placeholder="Your first name"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={goNext}
              />
            </View>
            <Pressable
              onPress={goNext}
              style={({ pressed }) => [styles.primaryBtnWrapper, pressed && styles.pressed]}>
              <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Continue →</Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={goNext} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip for now</Text>
            </Pressable>
          </ScrollView>
        )}

        {/* ── STEP 2: Language ── */}
        {step === 2 && (
          <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.stepEyebrow}>Step 2 of {TOTAL_STEPS}</Text>
            <Text style={styles.stepTitle}>What's your{'\n'}primary language?</Text>
            <Text style={styles.stepSub}>
              The AI will explain everything in this language. You can change it anytime.
            </Text>
            <View style={styles.langGrid}>
              {LANGUAGES.map(lang => {
                const active = language === lang.name;
                return (
                  <Pressable
                    key={lang.name}
                    onPress={() => setLanguage(lang.name)}
                    style={({ pressed }) => [
                      styles.langTile,
                      active && styles.langTileActive,
                      pressed && styles.pressed,
                    ]}>
                    <Text style={styles.langTileFlag}>{lang.flag}</Text>
                    <Text style={[styles.langTileLabel, active && styles.langTileLabelActive]}>
                      {lang.label}
                    </Text>
                    <Text style={[styles.langTileSub, active && styles.langTileSubActive]}>
                      {lang.sub}
                    </Text>
                    {active && <View style={styles.langCheckmark}><Text style={styles.langCheckmarkText}>✓</Text></View>}
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              onPress={goNext}
              style={({ pressed }) => [styles.primaryBtnWrapper, pressed && styles.pressed]}>
              <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Continue →</Text>
              </LinearGradient>
            </Pressable>
          </ScrollView>
        )}

        {/* ── STEP 3: Use Case ── */}
        {step === 3 && (
          <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.stepEyebrow}>Step 3 of {TOTAL_STEPS}</Text>
            <Text style={styles.stepTitle}>What will you use{'\n'}CallCopilot for most?</Text>
            <Text style={styles.stepSub}>
              This helps us tailor guidance to your most common situations.
            </Text>
            <View style={styles.useCaseList}>
              {USE_CASES.map(uc => {
                const active = useCase === uc.label;
                return (
                  <Pressable
                    key={uc.label}
                    onPress={() => setUseCase(uc.label)}
                    style={({ pressed }) => [
                      styles.useCaseTile,
                      active && styles.useCaseTileActive,
                      pressed && styles.pressed,
                    ]}>
                    <Text style={styles.useCaseIcon}>{uc.icon}</Text>
                    <View style={styles.useCaseInfo}>
                      <Text style={[styles.useCaseLabel, active && styles.useCaseLabelActive]}>
                        {uc.label}
                      </Text>
                      <Text style={styles.useCaseSub}>{uc.sub}</Text>
                    </View>
                    <View style={[styles.useCaseRadio, active && styles.useCaseRadioActive]}>
                      {active && <View style={styles.useCaseRadioDot} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              onPress={finish}
              disabled={!useCase}
              style={({ pressed }) => [
                styles.primaryBtnWrapper,
                !useCase && styles.primaryBtnDisabled,
                pressed && useCase && styles.pressed,
              ]}>
              <LinearGradient
                colors={useCase ? ['#0EA5E9', '#0284C7'] : ['#CBD5E1', '#CBD5E1']}
                style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Finish Setup →</Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={finish} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip for now</Text>
            </Pressable>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },

  // Progress
  progressBar: {
    height: 3,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 0,
  },
  progressFill: {
    height: 3,
    backgroundColor: '#0EA5E9',
    borderRadius: 2,
  },

  // Welcome
  welcomeScreen: { flex: 1 },
  welcomeGradient: {
    paddingTop: 56,
    paddingBottom: 48,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  welcomeLogoBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  welcomeLogoIcon: { fontSize: 32 },
  welcomeTitle: {
    fontSize: 34, fontWeight: '600', color: '#FFFFFF',
    textAlign: 'center', letterSpacing: -0.6, lineHeight: 40, marginBottom: 14,
  },
  welcomeSub: {
    fontSize: 16, color: 'rgba(255,255,255,0.85)',
    textAlign: 'center', lineHeight: 24, maxWidth: 300,
  },
  welcomeBottom: { flex: 1, padding: 28, justifyContent: 'space-between' },
  welcomeBodyTitle: {
    fontSize: 17, fontWeight: '600', color: '#0F172A', marginBottom: 16, letterSpacing: -0.2,
  },
  featureList: { gap: 14, marginBottom: 32 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: { fontSize: 22, width: 32, textAlign: 'center' },
  featureText: { fontSize: 15, color: '#1E293B', fontWeight: '400', flex: 1 },

  // Steps
  stepContent: { padding: 28, paddingTop: 36, paddingBottom: 48 },
  stepEyebrow: {
    fontSize: 12, fontWeight: '700', color: '#0EA5E9',
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12,
  },
  stepTitle: {
    fontSize: 32, fontWeight: '600', color: '#0F172A',
    lineHeight: 36, letterSpacing: -0.6, marginBottom: 10,
  },
  stepSub: {
    fontSize: 16, color: '#64748B', lineHeight: 24, marginBottom: 32,
  },

  // Name input
  nameInputWrapper: { marginBottom: 28 },
  nameInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1, borderColor: '#F1F5F9',
    borderRadius: 16, paddingHorizontal: 20,
    paddingVertical: 16, fontSize: 18,
    color: '#0F172A', fontWeight: '500',
  },

  // Language grid
  langGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, marginBottom: 32,
  },
  langTile: {
    width: '47%', backgroundColor: '#F8FAFC',
    borderWidth: 1.5, borderColor: '#F1F5F9',
    borderRadius: 18, padding: 16,
    alignItems: 'center', position: 'relative',
  },
  langTileActive: { backgroundColor: '#EFF6FF', borderColor: '#0EA5E9' },
  langTileFlag: { fontSize: 28, marginBottom: 8 },
  langTileLabel: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  langTileLabelActive: { color: '#0284C7' },
  langTileSub: { fontSize: 11, color: '#94A3B8' },
  langTileSubActive: { color: '#0EA5E9' },
  langCheckmark: {
    position: 'absolute', top: 8, right: 8,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#0EA5E9',
    alignItems: 'center', justifyContent: 'center',
  },
  langCheckmarkText: { fontSize: 11, color: '#FFFFFF', fontWeight: '700' },

  // Use cases
  useCaseList: { gap: 10, marginBottom: 32 },
  useCaseTile: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5, borderColor: '#F1F5F9',
    borderRadius: 18, padding: 16,
  },
  useCaseTileActive: { backgroundColor: '#EFF6FF', borderColor: '#0EA5E9' },
  useCaseIcon: { fontSize: 24, width: 32, textAlign: 'center' },
  useCaseInfo: { flex: 1 },
  useCaseLabel: { fontSize: 15, fontWeight: '600', color: '#0F172A', marginBottom: 2 },
  useCaseLabelActive: { color: '#0284C7' },
  useCaseSub: { fontSize: 12, color: '#94A3B8' },
  useCaseRadio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#CBD5E1',
    alignItems: 'center', justifyContent: 'center',
  },
  useCaseRadioActive: { borderColor: '#0EA5E9' },
  useCaseRadioDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#0EA5E9',
  },

  // Primary button
  primaryBtnWrapper: { borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtn: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },

  // Skip
  skipBtn: { paddingVertical: 12, alignItems: 'center' },
  skipText: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },
});
