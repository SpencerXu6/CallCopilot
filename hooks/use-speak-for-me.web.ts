import { useRef, useState } from 'react';
import { transcribeAudio } from '@/services/whisper';
import { translateToEnglish } from '@/services/translate';
import { speak, stopSpeaking } from '@/services/tts';

export type SpeakForMeState = 'idle' | 'recording' | 'processing' | 'speaking';

export function useSpeakForMe(apiKey: string, language: string, onSpoken?: (text: string) => void) {
  const [state, setState] = useState<SpeakForMeState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastSpoken, setLastSpoken] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        try {
          const mimeType = mediaRecorder.mimeType || 'audio/webm';
          const blob = new Blob(chunksRef.current, { type: mimeType });

          // transcribe with no language hint so Whisper auto-detects the native language
          const transcript = await transcribeAudio(apiKey, blob);
          if (!transcript) { setState('idle'); return; }

          const english = await translateToEnglish(apiKey, transcript, language);
          if (!english) { setState('idle'); return; }

          setLastSpoken(english);
          onSpoken?.(english);
          setState('speaking');
          speak(english, () => setState('idle')).catch(() => setState('idle'));
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Could not process audio.';
          setError(msg);
          setState('idle');
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setState('recording');
    } catch {
      setError('Could not access microphone. Check browser permissions.');
    }
  };

  const stop = () => {
    if (!mediaRecorderRef.current) return;
    setState('processing');
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
  };

  const cancel = () => {
    if (state === 'speaking') {
      stopSpeaking();
      setState('idle');
    }
  };

  const toggle = () => {
    if (state === 'recording') stop();
    else if (state === 'idle') start();
  };

  return { state, error, lastSpoken, toggle, cancel };
}
