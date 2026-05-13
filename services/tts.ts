import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const VOICE_KEY = 'callcopilot_voice';
export type VoicePreference = string; // 'auto' or a voice identifier

let voiceCache: Speech.Voice[] | null = null;

export async function getEnglishVoices(): Promise<Speech.Voice[]> {
  try {
    if (!voiceCache) {
      voiceCache = await Speech.getAvailableVoicesAsync();
    }
    const en = voiceCache.filter(v => v.language?.startsWith('en'));
    const enhanced = en.filter(v => v.quality === 'Enhanced');
    return enhanced.length ? enhanced : en;
  } catch {
    return [];
  }
}

async function pickVoice(pref: string): Promise<string | undefined> {
  try {
    const voices = await getEnglishVoices();
    if (!voices.length) return undefined;
    if (pref === 'auto') return voices[0]?.identifier;
    const found = voices.find(v => v.identifier === pref);
    return found?.identifier ?? voices[0]?.identifier;
  } catch {
    return undefined;
  }
}

export async function speak(text: string, onDone?: () => void) {
  try {
    const pref = ((await AsyncStorage.getItem(VOICE_KEY)) ?? 'auto') as VoicePreference;
    const voice = await pickVoice(pref);
    const options: Speech.SpeechOptions = { language: 'en-US', rate: 0.92, onDone };
    if (voice) options.voice = voice;
    Speech.speak(text, options);
  } catch {
    Speech.speak(text, { language: 'en-US', rate: 0.92, onDone });
  }
}

export function stopSpeaking() {
  Speech.stop();
}
