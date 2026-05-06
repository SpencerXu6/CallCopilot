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
  { label: 'Healthcare', sub: 'Doctor appointments, insurance, pharmacy' },
  { label: 'Banking & Finance', sub: 'Account questions, disputes, transfers' },
  { label: 'Utilities & Home', sub: 'Internet, electricity, trash, water' },
  { label: 'Customer Service', sub: 'Returns, cancellations, subscriptions' },
  { label: 'Other', sub: 'General phone calls in English' },
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

        {step > 0 && step <= TOTAL_STEPS && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` as any }]} />
          </View>
        )}

        {/* Step 0: Welcome */}
        {step === 0 && (
          <View style={styles.welcomeScreen}>
            <View style={styles.welcomeContent}>
              <View style={styles.logoMark}>
                <Text style={styles.logoMarkText}>C</Text>
              </View>
              <Text style={styles.welcomeTitle}>Welcome to{'\n'}CallCopilot</Text>
              <Text style={styles.welcomeSub}>
                Your AI assistant for English phone calls, explained in your language.
              </Text>
              <View style={styles.featureList}>
                {[
                  ['Record', 'Capture what the agent says'],
                  ['Understand', 'Get a full explanation in your language'],
                  ['Reply', 'Receive an English response to read aloud'],
                ].map(([title, desc]) => (
                  <View key={title} style={styles.featureRow}>
                    <View style={styles.featureDot} />
                    <View style={styles.featureText}>
                      <Text style={styles.featureTitle}>{title}</Text>
                      <Text style={styles.featureDesc}>{desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.welcomeFooter}>
              <Pressable
                onPress={goNext}
                style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}>
                <Text style={styles.primaryBtnText}>Get Started</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Step 1: Name */}
        {step === 1 && (
          <ScrollView contentContainerStyle={styles.stepContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.stepTitle}>What should we{'\n'}call you?</Text>
            <Text style={styles.stepSub}>We'll use your name to personalize your experience.</Text>
            <View style={styles.fieldCard}>
              <TextInput
                style={styles.fieldInput}
                placeholder="First name"
                placeholderTextColor="#AEAEB2"
                value={name}
                onChangeText={setName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={goNext}
              />
            </View>
            <Pressable
              onPress={goNext}
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}>
              <Text style={styles.primaryBtnText}>Continue</Text>
            </Pressable>
            <Pressable onPress={goNext} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </ScrollView>
        )}

        {/* Step 2: Language */}
        {step === 2 && (
          <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>What's your{'\n'}primary language?</Text>
            <Text style={styles.stepSub}>The AI explains everything in this language. Change it anytime.</Text>
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
                    <Text style={styles.langFlag}>{lang.flag}</Text>
                    <Text style={[styles.langLabel, active && styles.langLabelActive]}>{lang.label}</Text>
                    <Text style={[styles.langSub, active && styles.langSubActive]}>{lang.sub}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              onPress={goNext}
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}>
              <Text style={styles.primaryBtnText}>Continue</Text>
            </Pressable>
          </ScrollView>
        )}

        {/* Step 3: Use Case */}
        {step === 3 && (
          <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>What will you use{'\n'}CallCopilot for?</Text>
            <Text style={styles.stepSub}>Helps us tailor guidance to your situation.</Text>
            <View style={styles.useCaseCard}>
              {USE_CASES.map((uc, i) => {
                const active = useCase === uc.label;
                const isLast = i === USE_CASES.length - 1;
                return (
                  <View key={uc.label}>
                    <Pressable
                      onPress={() => setUseCase(uc.label)}
                      style={({ pressed }) => [styles.useCaseRow, pressed && styles.pressed]}>
                      <View style={styles.useCaseLeft}>
                        <Text style={styles.useCaseLabel}>{uc.label}</Text>
                        <Text style={styles.useCaseSub}>{uc.sub}</Text>
                      </View>
                      <View style={[styles.radio, active && styles.radioActive]}>
                        {active && <View style={styles.radioDot} />}
                      </View>
                    </Pressable>
                    {!isLast && <View style={styles.rowSep} />}
                  </View>
                );
              })}
            </View>
            <Pressable
              onPress={finish}
              disabled={!useCase}
              style={({ pressed }) => [
                styles.primaryBtn,
                !useCase && styles.primaryBtnDisabled,
                pressed && !!useCase && styles.pressed,
              ]}>
              <Text style={styles.primaryBtnText}>Finish Setup</Text>
            </Pressable>
            <Pressable onPress={finish} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </ScrollView>
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F7' },
  flex: { flex: 1 },
  pressed: { opacity: 0.7 },

  progressTrack: { height: 2, backgroundColor: '#E5E5EA' },
  progressFill: { height: 2, backgroundColor: '#007AFF' },

  welcomeScreen: { flex: 1, justifyContent: 'space-between' },
  welcomeContent: { paddingHorizontal: 28, paddingTop: 56 },
  logoMark: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: '#000000',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 32,
  },
  logoMarkText: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  welcomeTitle: {
    fontSize: 34, fontWeight: '700', color: '#000000',
    lineHeight: 40, letterSpacing: -0.5, marginBottom: 12,
  },
  welcomeSub: { fontSize: 17, color: '#6E6E73', lineHeight: 26, marginBottom: 44 },
  featureList: { gap: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  featureDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#007AFF', marginTop: 5 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '600', color: '#000000', marginBottom: 2 },
  featureDesc: { fontSize: 14, color: '#6E6E73' },
  welcomeFooter: { padding: 28, paddingBottom: 40 },

  stepContent: { paddingHorizontal: 20, paddingTop: 44, paddingBottom: 48 },
  stepTitle: {
    fontSize: 34, fontWeight: '700', color: '#000000',
    lineHeight: 40, letterSpacing: -0.5, marginBottom: 8,
  },
  stepSub: { fontSize: 15, color: '#6E6E73', lineHeight: 22, marginBottom: 32 },

  fieldCard: { backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
  fieldInput: {
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 17, color: '#000000',
  },

  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  langTile: {
    width: '47.5%', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    alignItems: 'center', borderWidth: 2, borderColor: 'transparent',
  },
  langTileActive: { borderColor: '#007AFF', backgroundColor: 'rgba(0,122,255,0.06)' },
  langFlag: { fontSize: 26, marginBottom: 8 },
  langLabel: { fontSize: 15, fontWeight: '600', color: '#000000', marginBottom: 2 },
  langLabelActive: { color: '#007AFF' },
  langSub: { fontSize: 12, color: '#AEAEB2' },
  langSubActive: { color: '#007AFF' },

  useCaseCard: { backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 24, overflow: 'hidden' },
  useCaseRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  useCaseLeft: { flex: 1 },
  useCaseLabel: { fontSize: 15, fontWeight: '500', color: '#000000', marginBottom: 2 },
  useCaseSub: { fontSize: 13, color: '#AEAEB2' },
  rowSep: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E5EA', marginLeft: 16 },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#C7C7CC',
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: '#007AFF' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#007AFF' },

  primaryBtn: {
    backgroundColor: '#007AFF', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12,
  },
  primaryBtnDisabled: { opacity: 0.4 },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },

  skipBtn: { paddingVertical: 10, alignItems: 'center' },
  skipText: { fontSize: 15, color: '#AEAEB2' },
});
