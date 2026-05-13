import { Audio } from 'expo-av';
import { useRef, useState } from 'react';
import { transcribeAudio } from '@/services/whisper';
import { translateToEnglish } from '@/services/translate';
import { speak, stopSpeaking } from '@/services/tts';

export type SpeakForMeState = 'idle' | 'recording' | 'processing' | 'speaking';

export function useSpeakForMe(apiKey: string, language: string, onSpoken?: (text: string) => void) {
  const [state, setState] = useState<SpeakForMeState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastSpoken, setLastSpoken] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const start = async () => {
    setError(null);
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        setError('Microphone permission denied.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = recording;
      setState('recording');
    } catch {
      setError('Could not start recording.');
    }
  };

  const stop = async () => {
    if (!recordingRef.current) return;
    setState('processing');
    try {
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      if (!uri) { setState('idle'); return; }

      // transcribe in native language (no language hint → Whisper auto-detects)
      const transcript = await transcribeAudio(apiKey, uri);
      if (!transcript) { setState('idle'); return; }

      // translate to English via Groq
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
