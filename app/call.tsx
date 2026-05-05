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
import { LinearGradient } from 'expo-linear-gradient';
import { useCallSession } from '@/hooks/use-call-session';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { useAuth } from '@/hooks/use-auth';
import { saveCallSession } from '@/services/history';
import { EntryView } from '@/components/call-entry';
import { useBreakpoint } from '@/hooks/use-breakpoint';

export default function CallScreen() {
  const { goal, language } = useLocalSearchParams<{ goal: string; language: string }>();
  const lang = language ?? 'Chinese';
  const { entries, isLoading, error, send } = useCallSession(goal ?? '', lang);
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
        // silently fail — session save is best-effort
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

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={[styles.centeredShell, isWide && styles.centeredShellWide]}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleEnd}
          disabled={saving}
          style={({ pressed }) => [pressed && styles.pressed]}>
          <LinearGradient
            colors={['#FB923C', '#F97316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.endBtn}>
            {saving
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={styles.endBtnText}>结束</Text>
            }
          </LinearGradient>
        </Pressable>
        <Text style={styles.goalText} numberOfLines={1}>{goal}</Text>
        <View style={styles.headerRight}>
          <View style={styles.langBadge}>
            <Text style={styles.langBadgeText}>{lang}</Text>
          </View>
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
              <View style={styles.emptyIconBox}>
                <Text style={styles.emptyEmoji}>👂</Text>
              </View>
              <Text style={styles.emptyTitle}>Ready</Text>
              <Text style={styles.emptySub}>Tap the mic to record, or type below</Text>
              <Text style={styles.emptySub}>点击麦克风录音，或直接输入文字</Text>
            </View>
          )}

          {entries.map(entry => (
            <EntryView key={entry.id} entry={entry} />
          ))}

          {(isLoading || isTranscribing) && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#0EA5E9" />
              <Text style={styles.loadingText}>
                {isTranscribing ? 'Transcribing…' : 'Analyzing…'}
              </Text>
            </View>
          )}

          {(error || recorderError) ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {error ?? recorderError}</Text>
            </View>
          ) : null}
        </ScrollView>

        {isRecording && (
          <View style={styles.recordingBanner}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording — tap to stop</Text>
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <Pressable
            onPress={toggleRecorder}
            disabled={isTranscribing || isLoading}
            style={({ pressed }) => [pressed && styles.pressed]}>
            {isRecording ? (
              <View style={styles.micBtnRed}>
                <Text style={styles.micIcon}>⏹</Text>
              </View>
            ) : (
              <LinearGradient
                colors={isTranscribing ? ['#CBD5E1', '#CBD5E1'] : ['#0EA5E9', '#0284C7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.micBtn}>
                {isTranscribing
                  ? <ActivityIndicator size="small" color="#FFFFFF" />
                  : <Text style={styles.micIcon}>🎙️</Text>
                }
              </LinearGradient>
            )}
          </Pressable>

          <TextInput
            style={styles.input}
            placeholder="Type what the agent said…"
            placeholderTextColor="#94A3B8"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
            editable={!micBusy}
          />

          <Pressable
            onPress={handleSend}
            disabled={!canSend}
            style={({ pressed }) => [pressed && canSend && styles.pressed]}>
            <LinearGradient
              colors={canSend ? ['#0EA5E9', '#0284C7'] : ['#CBD5E1', '#CBD5E1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendBtn}>
              <Text style={styles.sendBtnText}>Send</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  centeredShell: { flex: 1 },
  centeredShellWide: { maxWidth: 800, alignSelf: 'center', width: '100%' },
  flex: { flex: 1 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  endBtn: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 60,
    alignItems: 'center',
    overflow: 'hidden',
  },
  endBtnText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  goalText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginHorizontal: 10,
    fontWeight: '500',
  },
  headerRight: { alignItems: 'flex-end' },
  langBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  langBadgeText: { fontSize: 11, fontWeight: '600', color: '#64748B' },

  scroll: { flex: 1 },
  scrollContent: { paddingVertical: 20, paddingBottom: 12 },

  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyIconBox: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#F8FAFC',
    borderWidth: 1, borderColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#0F172A', marginBottom: 10, letterSpacing: -0.3 },
  emptySub: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 22 },

  loadingRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 16, gap: 10,
  },
  loadingText: { fontSize: 14, color: '#64748B', fontWeight: '500' },

  errorBanner: {
    marginHorizontal: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 14, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#FECACA',
  },
  errorText: { fontSize: 14, color: '#DC2626', lineHeight: 20 },

  recordingBanner: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 10, gap: 8,
    borderTopWidth: 1, borderTopColor: '#FECACA',
  },
  recordingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  recordingText: { fontSize: 13, color: '#EF4444', fontWeight: '600' },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 10,
  },
  micBtn: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end',
  },
  micBtnRed: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end',
  },
  micIcon: { fontSize: 20 },
  input: {
    flex: 1,
    borderWidth: 1, borderColor: '#F1F5F9', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 15, color: '#0F172A',
    maxHeight: 100, lineHeight: 22,
    backgroundColor: '#F8FAFC',
  },
  sendBtn: {
    borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 18,
    alignSelf: 'flex-end', overflow: 'hidden',
  },
  sendBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});
