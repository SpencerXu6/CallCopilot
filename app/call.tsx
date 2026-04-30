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
import { useCallSession, CallEntry } from '@/hooks/use-call-session';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';

type SectionCardProps = {
  label: string;
  content: string;
  accent: string;
  bg: string;
  bold?: boolean;
};

function SectionCard({ label, content, accent, bg, bold }: SectionCardProps) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: bg, borderLeftColor: accent }]}>
      <Text style={[styles.sectionLabel, { color: accent }]}>{label}</Text>
      <Text style={[styles.sectionContent, bold && styles.sectionContentBold]}>{content}</Text>
    </View>
  );
}

function EntryView({ entry }: { entry: CallEntry }) {
  return (
    <View style={styles.entry}>
      <View style={styles.agentBubble}>
        <Text style={styles.agentLabel}>客服说 / AGENT SAID</Text>
        <Text style={styles.agentText}>{entry.agentText}</Text>
      </View>
      <View style={styles.responseCards}>
        <SectionCard
          label="理解 / Understanding"
          content={entry.response.understanding}
          accent="#3B82F6"
          bg="#EFF6FF"
        />
        <SectionCard
          label="翻译 / Translation"
          content={entry.response.translation}
          accent="#22C55E"
          bg="#F0FDF4"
        />
        <SectionCard
          label="下一步建议 / What to Do Next"
          content={entry.response.nextStep}
          accent="#F97316"
          bg="#FFF7ED"
        />
        <SectionCard
          label="推荐回复 / Suggested Reply"
          content={entry.response.suggestedReply}
          accent="#14B8A6"
          bg="#F0FDFA"
          bold
        />
        {entry.response.notes ? (
          <SectionCard
            label="补充说明 / Notes"
            content={entry.response.notes}
            accent="#6B7280"
            bg="#F9FAFB"
          />
        ) : null}
      </View>
    </View>
  );
}

export default function CallScreen() {
  const { goal } = useLocalSearchParams<{ goal: string }>();
  const { entries, isLoading, error, send } = useCallSession(goal ?? '');
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

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

  const isRecording = recorderState === 'recording';
  const isTranscribing = recorderState === 'transcribing';
  const micBusy = isRecording || isTranscribing || isLoading;
  const canSend = !!input.trim() && !isLoading && !isRecording;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [pressed && styles.pressed]}>
          <LinearGradient
            colors={['#FB923C', '#F97316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.endBtn}>
            <Text style={styles.endBtnText}>结束</Text>
          </LinearGradient>
        </Pressable>
        <Text style={styles.goalText} numberOfLines={1}>
          {goal}
        </Text>
        <View style={styles.headerPlaceholder} />
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
              <Text style={styles.emptyTitle}>准备好了 / Ready</Text>
              <Text style={styles.emptySub}>点击麦克风录音，或直接输入文字</Text>
              <Text style={styles.emptySub}>Tap mic to record, or type below</Text>
            </View>
          )}

          {entries.map(entry => (
            <EntryView key={entry.id} entry={entry} />
          ))}

          {(isLoading || isTranscribing) && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#0EA5E9" />
              <Text style={styles.loadingText}>
                {isTranscribing ? '正在转录… Transcribing…' : '正在分析… Analyzing…'}
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
            <Text style={styles.recordingText}>正在录音… Recording — tap to stop</Text>
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
                {isTranscribing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.micIcon}>🎙️</Text>
                )}
              </LinearGradient>
            )}
          </Pressable>

          <TextInput
            style={styles.input}
            placeholder="输入客服说的话…"
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
              <Text style={styles.sendBtnText}>发送</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: { flex: 1 },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },

  // Header
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
    overflow: 'hidden',
  },
  endBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  goalText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginHorizontal: 12,
    fontWeight: '500',
  },
  headerPlaceholder: { width: 60 },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingVertical: 20,
    paddingBottom: 12,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  emptySub: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Entry
  entry: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  agentBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  agentLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  agentText: {
    fontSize: 15,
    color: '#0F172A',
    lineHeight: 22,
    fontWeight: '400',
  },
  responseCards: { gap: 6 },
  sectionCard: {
    borderLeftWidth: 3,
    borderRadius: 14,
    padding: 14,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  sectionContent: {
    fontSize: 15,
    color: '#1E293B',
    lineHeight: 22,
    fontWeight: '400',
  },
  sectionContentBold: {
    fontWeight: '600',
    fontSize: 16,
    color: '#0F172A',
  },

  // Loading & error
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  errorBanner: {
    marginHorizontal: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    lineHeight: 20,
  },

  // Recording banner
  recordingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 10,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 10,
  },
  micBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  micBtnRed: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  micIcon: { fontSize: 20 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    maxHeight: 100,
    lineHeight: 22,
    backgroundColor: '#F8FAFC',
    fontWeight: '400',
  },
  sendBtn: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignSelf: 'flex-end',
    overflow: 'hidden',
  },
  sendBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
