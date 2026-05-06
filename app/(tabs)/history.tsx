import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { loadCallSessions, deleteCallSession, SavedSession } from '@/services/history';
import { EntryView } from '@/components/call-entry';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { SideNav } from '@/components/side-nav';

const LANGUAGE_FLAGS: Record<string, string> = {
  Chinese: '🇨🇳', Spanish: '🇪🇸', French: '🇫🇷',
  Korean: '🇰🇷', Japanese: '🇯🇵', Portuguese: '🇧🇷',
  Vietnamese: '🇻🇳', Hindi: '🇮🇳',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SessionCard({ session, onDelete }: { session: SavedSession; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const flag = LANGUAGE_FLAGS[session.language] ?? '🌐';

  const confirmDelete = () => {
    Alert.alert('Delete Session', 'Remove this call from your history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <View style={styles.sessionCard}>
      <Pressable
        onPress={() => setExpanded(v => !v)}
        style={({ pressed }) => [styles.sessionRow, pressed && styles.pressed]}>
        <Text style={styles.sessionFlag}>{flag}</Text>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionGoal} numberOfLines={1}>{session.goal}</Text>
          <Text style={styles.sessionMeta}>
            {formatDate(session.created_at)} · {session.entries.length} exchange{session.entries.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.sessionRight}>
          <Pressable
            onPress={confirmDelete}
            hitSlop={8}
            style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}>
            <Text style={styles.deleteBtnText}>Delete</Text>
          </Pressable>
          <Text style={styles.chevron}>{expanded ? '▲' : '›'}</Text>
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.sessionEntries}>
          <View style={styles.entriesDivider} />
          {session.entries.map(entry => (
            <EntryView key={entry.id} entry={entry} />
          ))}
        </View>
      )}
    </View>
  );
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isWide } = useBreakpoint();

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    try {
      const data = await loadCallSessions(user.id);
      setSessions(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchSessions();
  }, [fetchSessions]));

  const handleDelete = async (sessionId: string) => {
    try {
      await deleteCallSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch {
      Alert.alert('Error', 'Could not delete session. Please try again.');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

  return (
    <View style={[styles.root, isWide && styles.rootWide]}>
      {isWide && <SideNav />}

      <SafeAreaView style={styles.safe} edges={isWide ? [] : ['top']}>
        <View style={[styles.inner, isWide && styles.innerWide]}>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>History</Text>
            {!loading && sessions.length > 0 && (
              <Text style={styles.headerCount}>{sessions.length} session{sessions.length !== 1 ? 's' : ''}</Text>
            )}
          </View>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : sessions.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyCircle}>
                <Text style={styles.emptyEmoji}>📋</Text>
              </View>
              <Text style={styles.emptyTitle}>No calls yet</Text>
              <Text style={styles.emptySub}>
                Complete a call and tap End to save it here.
              </Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
              }>
              {sessions.map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onDelete={() => handleDelete(session.id)}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F2F7' },
  rootWide: { flexDirection: 'row' },
  safe: { flex: 1, backgroundColor: '#F2F2F7' },
  pressed: { opacity: 0.7 },

  inner: { flex: 1 },
  innerWide: { maxWidth: 720, alignSelf: 'center', width: '100%' },

  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 34, fontWeight: '700', color: '#000000', letterSpacing: -0.5 },
  headerCount: { fontSize: 15, color: '#AEAEB2' },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyEmoji: { fontSize: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#000000', marginBottom: 8, letterSpacing: -0.3 },
  emptySub: { fontSize: 14, color: '#AEAEB2', textAlign: 'center', lineHeight: 22 },

  list: { paddingHorizontal: 20, paddingBottom: 40, gap: 2 },

  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  sessionFlag: { fontSize: 24 },
  sessionInfo: { flex: 1 },
  sessionGoal: { fontSize: 15, fontWeight: '500', color: '#000000', marginBottom: 3 },
  sessionMeta: { fontSize: 12, color: '#AEAEB2' },
  sessionRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  deleteBtn: { paddingHorizontal: 4, paddingVertical: 2 },
  deleteBtnText: { fontSize: 13, color: '#FF3B30', fontWeight: '500' },
  chevron: { fontSize: 16, color: '#C7C7CC', fontWeight: '500' },

  sessionEntries: { paddingTop: 8 },
  entriesDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E5EA', marginHorizontal: 16, marginBottom: 8 },
});
