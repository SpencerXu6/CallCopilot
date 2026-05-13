import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
import { useCallSession } from '@/hooks/use-call-session';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { useSpeakForMe } from '@/hooks/use-speak-for-me';
import { useAuth } from '@/hooks/use-auth';
import { saveCallSession } from '@/services/history';
import { EntryView } from '@/components/call-entry';
import { useBreakpoint } from '@/hooks/use-breakpoint';

export default function CallScreen() {
  const { goal, language } = useLocalSearchParams<{ goal: string; language: string }>();
  const lang = language ?? 'Chinese';
  const { entries, isLoading, error, send, recordCustomerReply } = useCallSession(goal ?? '', lang);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const { isWide } = useBreakpoint();

  const { user } = useAuth();
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';
  const { state: recorderState, error: recorderError, toggle: toggleRecorder } = useAudioRecorder(
    apiKey,
    (transcript) => send(transcript),
  );
  const {
    state: sfmState,
    error: sfmError,
    lastSpoken,
    toggle: toggleSfm,
    cancel: cancelSfm,
  } = useSpeakForMe(apiKey, lang, recordCustomerReply);

  useEffect(() => {
    if (entries.length > 0 || isLoading) {
      scrollRef.current?.scrollToEnd({ animated: true });
    }
  }, [entries, isLoading]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    send(text);
  };

  const handleEnd = async () => {
    if (user && entries.length > 0) {
      setSaving(true);
      try {
        await saveCallSession(user.id, goal ?? '', lang, entries);
      } catch {
        // best-effort save
      } finally {
        setSaving(false);
      }
    }
    router.back();
  };

  const isRecording = recorderState === 'recording';
  const isTranscribing = recorderState === 'transcribing';
  const micBusy = isRecording || isTranscribing || isLoading;
  const canSend = !!input.trim() && !isLoading && !isRecording;

  const sfmRecording = sfmState === 'recording';
  const sfmProcessing = sfmState === 'processing';
  const sfmSpeaking = sfmState === 'speaking';
  const sfmBusy = sfmState !== 'idle';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={[styles.shell, isWide && styles.shellWide]}>

        <View style={styles.header}>
          <Pressable
            onPress={handleEnd}
            disabled={saving}
            style={({ pressed }) => [styles.endBtn, pressed && styles.pressed]}>
            {saving
              ? <ActivityIndicator size="small" color="#FF3B30" />
              : <Text style={styles.endBtnText}>End</Text>
            }
          </Pressable>
          <Text style={styles.goalText} numberOfLines={1}>{goal}</Text>
          <View style={styles.langBadge}>
            <Text style={styles.langBadgeText}>{lang}</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
          keyboardVerticalOffset={0}>
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>

            {entries.length === 0 && !isLoading && (
              <View style={styles.emptyState}>
                <View style={styles.emptyCircle}>
                  <Text style={styles.emptyEmoji}>👂</Text>
                </View>
                <Text style={styles.emptyTitle}>Ready</Text>
                <Text style={styles.emptySub}>Tap the mic to record, or type below</Text>
              </View>
            )}

            {entries.map(entry => (
              <EntryView key={entry.id} entry={entry} />
            ))}

            {(isLoading || isTranscribing || sfmProcessing) && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>
                  {isTranscribing ? 'Transcribing…' : sfmProcessing ? 'Translating…' : 'Analyzing…'}
                </Text>
              </View>
            )}

            {(error || recorderError || sfmError) ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error ?? recorderError ?? sfmError}</Text>
              </View>
            ) : null}
          </ScrollView>

          {isRecording && (
            <View style={styles.recordingBanner}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording — tap mic to stop</Text>
            </View>
          )}

          {sfmRecording && (
            <View style={styles.sfmRecordingBanner}>
              <View style={styles.sfmRecordingDot} />
              <Text style={styles.sfmRecordingText}>Speak your reply — tap to stop</Text>
            </View>
          )}

          {sfmSpeaking && lastSpoken && (
            <View style={styles.sfmSpeakingBanner}>
              <Pressable
                onPress={cancelSfm}
                style={({ pressed }) => [styles.sfmStopBtn, pressed && styles.pressed]}>
                <Text style={styles.sfmStopBtnText}>■ Stop</Text>
              </Pressable>
              <Text style={styles.sfmSpeakingText} numberOfLines={2}>{lastSpoken}</Text>
            </View>
          )}

          <View style={styles.inputBar}>
            <Pressable
              onPress={toggleSfm}
              disabled={micBusy || sfmProcessing || sfmSpeaking}
              style={({ pressed }) => [
                styles.sfmBtn,
                sfmRecording && styles.sfmBtnActive,
                (micBusy || sfmProcessing || sfmSpeaking) && styles.btnDisabled,
                pressed && styles.pressed,
              ]}>
              {sfmProcessing
                ? <ActivityIndicator size="small" color="#007AFF" />
                : <Text style={styles.sfmBtnIcon}>
                    {sfmRecording ? '⏹' : '🗣️'}
                  </Text>
              }
            </Pressable>

            <Pressable
              onPress={toggleRecorder}
              disabled={isTranscribing || isLoading || sfmBusy}
              style={({ pressed }) => [
                styles.micBtn,
                isRecording && styles.micBtnActive,
                (isTranscribing || isLoading || sfmBusy) && styles.btnDisabled,
                pressed && styles.pressed,
              ]}>
              {isTranscribing
                ? <ActivityIndicator size="small" color="#007AFF" />
                : <Text style={[styles.micIcon, isRecording && styles.micIconActive]}>
                    {isRecording ? '⏹' : '🎙️'}
                  </Text>
              }
            </Pressable>

            <TextInput
              style={styles.input}
              placeholder="Type what the agent said…"
              placeholderTextColor="#AEAEB2"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline
              editable={!micBusy && !sfmBusy}
            />

            <Pressable
              onPress={handleSend}
              disabled={!canSend}
              style={({ pressed }) => [
                styles.sendBtn,
                !canSend && styles.sendBtnDisabled,
                pressed && canSend && styles.pressed,
              ]}>
              <Text style={[styles.sendBtnText, !canSend && styles.sendBtnTextDisabled]}>Send</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F7' },
  shell: { flex: 1 },
  shellWide: { maxWidth: 800, alignSelf: 'center', width: '100%' },
  flex: { flex: 1 },
  pressed: { opacity: 0.7 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F2F2F7',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  endBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,59,48,0.10)',
    minWidth: 56,
    alignItems: 'center',
  },
  endBtnText: { fontSize: 15, fontWeight: '600', color: '#FF3B30' },
  goalText: {
    flex: 1,
    fontSize: 14,
    color: '#6E6E73',
    textAlign: 'center',
    marginHorizontal: 10,
    fontWeight: '500',
  },
  langBadge: {
    backgroundColor: 'rgba(120,120,128,0.12)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  langBadgeText: { fontSize: 12, fontWeight: '600', color: '#6E6E73' },

  scroll: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollContent: { paddingVertical: 24, paddingBottom: 12 },

  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyEmoji: { fontSize: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#000000', marginBottom: 8, letterSpacing: -0.3 },
  emptySub: { fontSize: 14, color: '#AEAEB2', textAlign: 'center', lineHeight: 22 },

  loadingRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 16, gap: 10,
  },
  loadingText: { fontSize: 14, color: '#6E6E73', fontWeight: '500' },

  errorBanner: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(255,59,48,0.08)',
    borderRadius: 12, padding: 14, marginBottom: 8,
  },
  errorText: { fontSize: 14, color: '#FF3B30', lineHeight: 20 },

  recordingBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,59,48,0.06)',
    paddingVertical: 10, gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,59,48,0.2)',
  },
  recordingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FF3B30' },
  recordingText: { fontSize: 13, color: '#FF3B30', fontWeight: '600' },

  sfmRecordingBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,122,255,0.06)',
    paddingVertical: 10, gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(0,122,255,0.2)',
  },
  sfmRecordingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#007AFF' },
  sfmRecordingText: { fontSize: 13, color: '#007AFF', fontWeight: '600' },

  sfmSpeakingBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,122,255,0.06)',
    paddingVertical: 10, paddingHorizontal: 14, gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(0,122,255,0.2)',
  },
  sfmStopBtn: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,122,255,0.12)',
  },
  sfmStopBtnText: { fontSize: 12, fontWeight: '600', color: '#007AFF' },
  sfmSpeakingText: { flex: 1, fontSize: 13, color: '#007AFF', fontWeight: '500', lineHeight: 18 },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#F2F2F7',
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#C6C6C8',
    gap: 8,
  },
  sfmBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(120,120,128,0.12)',
    alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end',
  },
  sfmBtnActive: { backgroundColor: 'rgba(0,122,255,0.14)' },
  sfmBtnIcon: { fontSize: 20 },
  micBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(120,120,128,0.12)',
    alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end',
  },
  micBtnActive: { backgroundColor: 'rgba(255,59,48,0.12)' },
  btnDisabled: { opacity: 0.4 },
  micIcon: { fontSize: 20 },
  micIconActive: {},
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 15, color: '#000000',
    maxHeight: 100, lineHeight: 22,
  },
  sendBtn: {
    paddingHorizontal: 16, paddingVertical: 11,
    backgroundColor: '#007AFF',
    borderRadius: 20, alignSelf: 'flex-end',
  },
  sendBtnDisabled: { backgroundColor: 'rgba(120,120,128,0.12)' },
  sendBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  sendBtnTextDisabled: { color: '#AEAEB2' },
});
