import { supabase } from './supabase';
import { CallEntry } from '@/hooks/use-call-session';

export interface SavedSession {
  id: string;
  goal: string;
  language: string;
  entries: CallEntry[];
  created_at: string;
}

export async function saveCallSession(
  userId: string,
  goal: string,
  language: string,
  entries: CallEntry[],
): Promise<void> {
  const { error } = await supabase
    .from('call_sessions')
    .insert({ user_id: userId, goal, language, entries });
  if (error) throw error;
}

export async function loadCallSessions(userId: string): Promise<SavedSession[]> {
  const { data, error } = await supabase
    .from('call_sessions')
    .select('id, goal, language, entries, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SavedSession[];
}

export async function deleteCallSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('call_sessions')
    .delete()
    .eq('id', sessionId);
  if (error) throw error;
}
