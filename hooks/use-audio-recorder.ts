import { Audio } from 'expo-av';
import { useRef, useState } from 'react';
import { transcribeAudio } from '@/services/whisper';

export type RecorderState = 'idle' | 'recording' | 'transcribing';

export function useAudioRecorder(apiKey: string, onTranscript: (text: string) => void) {
  const [state, setState] = useState<RecorderState>('idle');
  const [error, setError] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const start = async () => {
    setError(null);
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        setError('Microphone permission denied.');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setState('recording');
    } catch {
      setError('Could not start recording.');
    }
  };

  const stop = async () => {
    if (!recordingRef.current) return;
    setState('transcribing');
    try {
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      if (uri) {
        const transcript = await transcribeAudio(apiKey, uri);
        if (transcript) onTranscript(transcript);
      }
    } catch {
      setError('Could not transcribe audio.');
    } finally {
      setState('idle');
    }
  };

  const toggle = () => {
    if (state === 'recording') stop();
    else if (state === 'idle') start();
  };

  return { state, error, toggle };
}
