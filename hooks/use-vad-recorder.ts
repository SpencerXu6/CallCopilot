import { Audio } from 'expo-av';
import { useRef, useState } from 'react';
import { transcribeAudio } from '@/services/whisper';

const CHUNK_MS = 1500;
const SILENCE_CHUNKS = 2;

// Whisper commonly hallucinates these phrases on silent/near-silent audio
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
  const liveTextRef = useRef('');
  const silentCountRef = useRef(0);
  const chunkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

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

  const startSegment = async (): Promise<boolean> => {
    if (!activeRef.current) return false;
    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = recording;
      return true;
    } catch {
      if (activeRef.current) setError('Could not start microphone.');
      activeRef.current = false;
      setState('idle');
      return false;
    }
  };

  const processChunk = async () => {
    if (!activeRef.current) return;

    const rec = recordingRef.current;
    recordingRef.current = null;

    let transcript = '';
    if (rec) {
      try {
        await rec.stopAndUnloadAsync();
        const uri = rec.getURI();
        if (uri) transcript = await transcribeAudio(apiKey, uri, 'en', liveTextRef.current || undefined);
      } catch {
        // best-effort
      }
    }

    if (!activeRef.current) return;

    processTranscript(transcript);

    const ok = await startSegment();
    if (ok) {
      chunkTimerRef.current = setTimeout(processChunk, CHUNK_MS);
    }
  };

  const start = async () => {
    setError(null);
    setLiveText('');
    liveTextRef.current = '';
    silentCountRef.current = 0;
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) { setError('Microphone permission denied.'); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      activeRef.current = true;
      setState('listening');
      const ok = await startSegment();
      if (ok) chunkTimerRef.current = setTimeout(processChunk, CHUNK_MS);
    } catch {
      setError('Could not start auto-listen.');
    }
  };

  const stop = async () => {
    activeRef.current = false;
    clearTimer();
    liveTextRef.current = '';
    setLiveText('');
    const rec = recordingRef.current;
    recordingRef.current = null;
    if (rec) {
      try {
        await rec.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      } catch {}
    }
    setState('idle');
  };

  return { state, liveText, error, start, stop };
}
