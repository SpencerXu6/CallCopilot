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
        style={({ pressed }) => [styles.sessionHeader, pressed && styles.pressed]}>
        <View style={styles.sessionMeta}>
          <Text style={styles.sessionFlag}>{flag}</Text>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionGoal} numberOfLines={1}>{session.goal}</Text>
            <Text style={styles.sessionSub}>
              {formatDate(session.created_at)} · {session.entries.length} exchange{session.entries.length !== 1 ? 's' : ''} · {session.language}
            </Text>
          </View>
        </View>
        <View style={styles.sessionActions}>
          <Pressable
            onPress={confirmDelete}
            hitSlop={8}
            style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}>
            <Text style={styles.deleteBtnText}>🗑</Text>
          </Pressable>
          <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.sessionEntries}>
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
    <SafeAreaView style={styles.safe}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>🕐</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Call History</Text>
            <Text style={styles.headerSub}>{sessions.length} saved session{sessions.length !== 1 ? 's' : ''}</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0EA5E9" />
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBox}>
            <Text style={styles.emptyEmoji}>📋</Text>
          </View>
          <Text style={styles.emptyTitle}>No calls yet</Text>
          <Text style={styles.emptySub}>Your completed calls will appear here after you tap 结束 to end a session.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0EA5E9" />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },

  header: {
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center', justifyContent: 'center',
  },
  logoIcon: { fontSize: 18 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#0F172A', letterSpacing: -0.3 },
  headerSub: { fontSize: 13, color: '#94A3B8', marginTop: 1 },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIconBox: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#F8FAFC',
    borderWidth: 1, borderColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#0F172A', marginBottom: 10, letterSpacing: -0.3 },
  emptySub: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 22 },

  list: { padding: 16, gap: 12, paddingBottom: 32 },

  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
    overflow: 'hidden',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sessionMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  sessionFlag: { fontSize: 28 },
  sessionInfo: { flex: 1 },
  sessionGoal: { fontSize: 15, fontWeight: '600', color: '#0F172A', marginBottom: 3 },
  sessionSub: { fontSize: 12, color: '#94A3B8', fontWeight: '400' },
  sessionActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 16 },
  chevron: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },

  sessionEntries: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },
});
