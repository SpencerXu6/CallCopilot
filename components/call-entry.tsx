import { StyleSheet, Text, View } from 'react-native';
import { CallEntry } from '@/hooks/use-call-session';

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

export function EntryView({ entry }: { entry: CallEntry }) {
  return (
    <View style={styles.entry}>
      <View style={styles.agentBubble}>
        <Text style={styles.agentLabel}>AGENT SAID</Text>
        <Text style={styles.agentText}>{entry.agentText}</Text>
      </View>
      <View style={styles.responseCards}>
        <SectionCard
          label="Understanding"
          content={entry.response.understanding}
          accent="#3B82F6"
          bg="#EFF6FF"
        />
        <SectionCard
          label="Translation"
          content={entry.response.translation}
          accent="#22C55E"
          bg="#F0FDF4"
        />
        <SectionCard
          label="What to Do Next"
          content={entry.response.nextStep}
          accent="#F97316"
          bg="#FFF7ED"
        />
        <SectionCard
          label="Suggested Reply"
          content={entry.response.suggestedReply}
          accent="#14B8A6"
          bg="#F0FDFA"
          bold
        />
        {entry.response.notes ? (
          <SectionCard
            label="Notes"
            content={entry.response.notes}
            accent="#6B7280"
            bg="#F9FAFB"
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
