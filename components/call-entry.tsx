import { StyleSheet, Text, View } from 'react-native';
import { CallEntry } from '@/hooks/use-call-session';

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
        <Section
          label="SUGGESTED REPLY"
          content={entry.response.suggestedReply}
          highlight
        />
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
    marginBottom: 5,
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
});
