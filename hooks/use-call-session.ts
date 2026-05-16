import { Platform } from 'react-native';
import { useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { sendCallMessage, ParsedResponse } from '@/services/claude';

export interface CallEntry {
  id: string;
  agentText: string;
  response: ParsedResponse;
}

type HistoryMessage = { role: 'user' | 'assistant'; content: string };

export function useCallSession(goal: string, language = 'Chinese') {
  const [entries, setEntries] = useState<CallEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const history = useRef<HistoryMessage[]>([]);
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';
  const isLoadingRef = useRef(false);
  const pendingRef = useRef<string[]>([]);

  const recordCustomerReply = (englishText: string) => {
    history.current.push({
      role: 'user',
      content: `[Customer replied in English]: "${englishText}"`,
    });
  };

  const setLoadingState = (val: boolean) => {
    isLoadingRef.current = val;
    setIsLoading(val);
  };

  const sendOne = async (agentText: string) => {
    setLoadingState(true);
    setError(null);
    history.current.push({ role: 'user', content: agentText });
    try {
      const parsed = await sendCallMessage(apiKey, goal, history.current, language);
      if (parsed === null) {
        // AI detected user speech — discard silently
        history.current.pop();
      } else {
        const assistantContent = [
          `[理解 / Understanding]\n${parsed.understanding}`,
          `[翻译 / Translation]\n${parsed.translation}`,
          `[下一步建议 / What to Do Next]\n${parsed.nextStep}`,
          `[推荐回复 / Suggested Reply]\n${parsed.suggestedReply}`,
          parsed.notes ? `[补充说明 / Notes]\n${parsed.notes}` : '',
        ]
          .filter(Boolean)
          .join('\n\n');
        history.current.push({ role: 'assistant', content: assistantContent });
        setEntries(prev => [
          ...prev,
          { id: Date.now().toString(), agentText, response: parsed },
        ]);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }
      }
    } catch (e) {
      history.current.pop();
      setError(e instanceof Error ? e.message : 'Failed to get response. Check your connection.');
    } finally {
      // Drain queue without dropping isLoading to false between items
      if (pendingRef.current.length > 0) {
        const next = pendingRef.current.shift()!;
        sendOne(next);
      } else {
        setLoadingState(false);
      }
    }
  };

  const send = (agentText: string) => {
    if (!agentText.trim()) return;
    if (isLoadingRef.current) {
      pendingRef.current.push(agentText);
      return;
    }
    sendOne(agentText);
  };

  return { entries, isLoading, error, send, recordCustomerReply };
}
