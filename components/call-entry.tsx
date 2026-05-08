import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CallEntry } from '@/hooks/use-call-session';
import { speak, stopSpeaking } from '@/services/tts';

type SectionProps = {
  label: string;
  content: string;
  highlight?: boolean;
  muted?: boolean;
};

function Section({ label, content, highlight, muted }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Text style={[
        styles.sectionContent,
        highlight && styles.sectionContentHighlight,
        muted && styles.sectionContentMuted,
      ]}>
        {content}
      </Text>
    </View>
  );
}

function SuggestedReplySection({ content }: { content: string }) {
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      speak(content, () => setSpeaking(false)).catch(() => setSpeaking(false));
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionLabel}>SUGGESTED REPLY</Text>
        <Pressable
          onPress={handleSpeak}
          style={({ pressed }) => [styles.speakBtn, speaking && styles.speakBtnActive, pressed && styles.pressed]}>
          <Text style={[styles.speakBtnText, speaking && styles.speakBtnTextActive]}>
            {speaking ? '■ Stop' : '▶ Speak'}
          </Text>
        </Pressable>
      </View>
      <Text style={[styles.sectionContent, styles.sectionContentHighlight]}>{content}</Text>
    </View>
  );
}

export function EntryView({ entry }: { entry: CallEntry }) {
  return (
    <View style={styles.entry}>
      <View style={styles.agentBubble}>
        <Text style={styles.agentText}>{entry.agentText}</Text>
      </View>

      <View style={styles.responseCard}>
        <Section
          label="UNDERSTANDING"
          content={entry.response.understanding}
        />
        <View style={styles.divider} />
        <Section
          label="TRANSLATION"
          content={entry.response.translation}
        />
        <View style={styles.divider} />
        <Section
          label="WHAT TO DO NEXT"
          content={entry.response.nextStep}
        />
        <View style={styles.divider} />
        <SuggestedReplySection content={entry.response.suggestedReply} />
        {entry.response.notes ? (
          <>
            <View style={styles.divider} />
            <Section
              label="NOTES"
              content={entry.response.notes}
              muted
            />
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  entry: {
    marginHorizontal: 16,
    marginBottom: 28,
  },

  agentBubble: {
    backgroundColor: '#E5E5EA',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
    maxWidth: '86%',
  },
  agentText: {
    fontSize: 15,
    color: '#000000',
    lineHeight: 22,
  },

  responseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },

  section: {
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#AEAEB2',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionContent: {
    fontSize: 15,
    color: '#000000',
    lineHeight: 22,
  },
  sectionContentHighlight: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    lineHeight: 24,
  },
  sectionContentMuted: {
    color: '#6E6E73',
    fontSize: 14,
  },

  speakBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,122,255,0.10)',
  },
  speakBtnActive: {
    backgroundColor: 'rgba(255,59,48,0.10)',
  },
  speakBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  speakBtnTextActive: {
    color: '#FF3B30',
  },
  pressed: { opacity: 0.7 },
});
