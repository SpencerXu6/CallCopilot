import { useRef, useState } from 'react';
import { sendCallMessage, ParsedResponse } from '@/services/claude';

export interface CallEntry {
  id: string;
  agentText: string;
  response: ParsedResponse;
}

type HistoryMessage = { role: 'user' | 'assistant'; content: string };

export function useCallSession(goal: string) {
  const [entries, setEntries] = useState<CallEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const history = useRef<HistoryMessage[]>([]);
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';

  const send = async (agentText: string) => {
    if (!agentText.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    history.current.push({ role: 'user', content: agentText });

    try {
      const parsed = await sendCallMessage(apiKey, goal, history.current);

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
    } catch (e) {
      history.current.pop();
      setError(e instanceof Error ? e.message : 'Failed to get response. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return { entries, isLoading, error, send };
}
