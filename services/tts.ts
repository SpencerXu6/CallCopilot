import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const VOICE_KEY = 'callcopilot_voice';
export type VoicePreference = 'auto' | 'female' | 'male';

let voiceCache: Speech.Voice[] | null = null;

const FEMALE_NAMES = ['samantha', 'allison', 'susan', 'victoria', 'karen', 'nicky', 'ava', 'fiona', 'moira', 'tessa'];
const MALE_NAMES = ['alex', 'tom', 'fred', 'daniel', 'oliver', 'rishi', 'aaron', 'arthur', 'xander'];

async function pickVoice(pref: VoicePreference): Promise<string | undefined> {
  try {
    if (!voiceCache) {
      voiceCache = await Speech.getAvailableVoicesAsync();
    }
    const en = voiceCache.filter(v => v.language?.startsWith('en'));
    if (!en.length) return undefined;

    // Always prefer Enhanced quality — sounds dramatically more natural
    const enhanced = en.filter(v => v.quality === 'Enhanced');
    const pool = enhanced.length ? enhanced : en;

    if (pref === 'auto') return pool[0]?.identifier;

    const names = pref === 'female' ? FEMALE_NAMES : MALE_NAMES;
    const match = pool.find(v => names.some(n => v.name.toLowerCase().includes(n)));
    return match?.identifier ?? pool[0]?.identifier;
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
    // fallback: speak with system defaults
    Speech.speak(text, { language: 'en-US', rate: 0.92, onDone });
  }
}

export function stopSpeaking() {
  Speech.stop();
}
