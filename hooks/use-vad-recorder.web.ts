import { useRef, useState } from 'react';
import { transcribeAudio } from '@/services/whisper';

const CHUNK_MS = 1500;
const SILENCE_CHUNKS = 2;

const HALLUCINATIONS = new Set([
  'thank you', 'thanks', 'thank you for watching', 'thanks for watching',
  'thank you so much', 'thank you very much', 'thank you all', 'thanks everyone',
  'bye', 'bye bye', 'goodbye', 'good bye',
  'you', 'okay', 'ok', 'sure', 'yes', 'no', 'right', 'alright',
  'um', 'uh', 'hmm', 'ah',
]);

function isHallucination(text: string): boolean {
  const normalized = text.toLowerCase().replace(/[.,!?'"…\-]/g, '').trim();
  return HALLUCINATIONS.has(normalized);
}

export type VadState = 'idle' | 'listening';

export function useVadRecorder(apiKey: string, onTranscript: (text: string) => void) {
  const [state, setState] = useState<VadState>('idle');
  const [liveText, setLiveText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const activeRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const liveTextRef = useRef('');
  const silentCountRef = useRef(0);
  const chunkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (chunkTimerRef.current) {
      clearTimeout(chunkTimerRef.current);
      chunkTimerRef.current = null;
    }
  };

  const processTranscript = (transcript: string) => {
    const text = transcript.trim();
    if (text.length > 1 && !isHallucination(text)) {
      const newText = liveTextRef.current ? liveTextRef.current + ' ' + text : text;
      liveTextRef.current = newText;
      setLiveText(newText);
      silentCountRef.current = 0;
    } else {
      silentCountRef.current++;
      if (silentCountRef.current >= SILENCE_CHUNKS && liveTextRef.current) {
        const finalText = liveTextRef.current.trim();
        liveTextRef.current = '';
        setLiveText('');
        silentCountRef.current = 0;
        onTranscript(finalText);
      }
    }
  };

  const startSegment = (stream: MediaStream) => {
    chunksRef.current = [];
    const mr = new MediaRecorder(stream);
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.start();
    mediaRecorderRef.current = mr;
  };

  const processChunk = () => {
    if (!activeRef.current) return;
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state !== 'recording') {
      // no active recorder, reschedule
      if (activeRef.current && streamRef.current) {
        startSegment(streamRef.current);
        chunkTimerRef.current = setTimeout(processChunk, CHUNK_MS);
      }
      return;
    }
    mediaRecorderRef.current = null;

    mr.onstop = async () => {
      const mimeType = mr.mimeType || 'audio/webm';
      const blob = new Blob(chunksRef.current, { type: mimeType });
      chunksRef.current = [];

      let transcript = '';
      try {
        transcript = await transcribeAudio(apiKey, blob, 'en', liveTextRef.current || undefined);
      } catch {
        // best-effort
      }

      if (!activeRef.current) return;

      processTranscript(transcript);

      if (streamRef.current) {
        startSegment(streamRef.current);
        chunkTimerRef.current = setTimeout(processChunk, CHUNK_MS);
      }
    };
    mr.stop();
  };

  const start = async () => {
    setError(null);
    setLiveText('');
    liveTextRef.current = '';
    silentCountRef.current = 0;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      activeRef.current = true;
      setState('listening');
      startSegment(stream);
      chunkTimerRef.current = setTimeout(processChunk, CHUNK_MS);
    } catch {
      setError('Could not access microphone. Check browser permissions.');
    }
  };

  const stop = () => {
    activeRef.current = false;
    clearTimer();
    liveTextRef.current = '';
    setLiveText('');
    const mr = mediaRecorderRef.current;
    mediaRecorderRef.current = null;
    if (mr?.state === 'recording') mr.stop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setState('idle');
  };

  return { state, liveText, error, start, stop };
}
