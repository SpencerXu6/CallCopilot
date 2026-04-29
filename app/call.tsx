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
        <Text style={styles.agentLabel}>📞 客服说 / Agent said:</Text>
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
    (transcript) => send(transcript)
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

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.endBtn}>
          <Text style={styles.endBtnText}>结束</Text>
        </Pressable>
        <Text style={styles.goalText} numberOfLines={1}>
          {goal}
        </Text>
        <View style={styles.endBtnPlaceholder} />
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
              <Text style={styles.emptyEmoji}>👂</Text>
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
              <ActivityIndicator size="small" color="#0a7ea4" />
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
            <Text style={styles.recordingText}>正在录音… Recording — tap mic to stop</Text>
          </View>
        )}

        <View style={styles.inputBar}>
          <Pressable
            style={[styles.micBtn, isRecording && styles.micBtnActive]}
            onPress={toggleRecorder}
            disabled={isTranscribing || isLoading}>
            {isTranscribing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.micIcon}>{isRecording ? '⏹' : '🎙️'}</Text>
            )}
          </Pressable>

          <TextInput
            style={styles.input}
            placeholder="输入客服说的话… / Type what agent said…"
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
            editable={!micBusy}
          />

          <Pressable
            style={[styles.sendBtn, (!input.trim() || isLoading || isRecording) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading || isRecording}>
            <Text style={styles.sendBtnText}>发送</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  endBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  endBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  endBtnPlaceholder: {
    width: 52,
  },
  goalText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
  },
  entry: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  agentBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  agentLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  agentText: {
    fontSize: 15,
    color: '#1E293B',
    lineHeight: 22,
  },
  responseCards: {
    gap: 6,
  },
  sectionCard: {
    borderLeftWidth: 3,
    borderRadius: 10,
    padding: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  sectionContent: {
    fontSize: 15,
    color: '#1E293B',
    lineHeight: 22,
  },
  sectionContentBold: {
    fontWeight: '600',
    fontSize: 16,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  errorBanner: {
    marginHorizontal: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    lineHeight: 20,
  },
  recordingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  recordingText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  micBtnActive: {
    backgroundColor: '#DC2626',
  },
  micIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1E293B',
    maxHeight: 100,
    lineHeight: 22,
  },
  sendBtn: {
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-end',
  },
  sendBtnDisabled: {
    opacity: 0.35,
  },
  sendBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
