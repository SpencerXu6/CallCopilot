import { useRef, useState } from 'react';
import { transcribeAudio } from '@/services/whisper';

export type RecorderState = 'idle' | 'recording' | 'transcribing';

export function useAudioRecorder(apiKey: string, onTranscript: (text: string) => void) {
  const [state, setState] = useState<RecorderState>('idle');
  const [error, setError] = useState<string | null>(null);
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
          const transcript = await transcribeAudio(apiKey, blob, 'en');
          if (transcript) onTranscript(transcript);
        } catch {
          setError('Could not transcribe audio.');
        } finally {
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
    setState('transcribing');
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
  };

  const toggle = () => {
    if (state === 'recording') stop();
    else if (state === 'idle') start();
  };

  return { state, error, toggle };
}
