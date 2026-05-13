export async function transcribeAudio(apiKey: string, source: string | Blob, language?: string): Promise<string> {
  const formData = new FormData();
  if (source instanceof Blob) {
    const ext = source.type.split('/')[1]?.split(';')[0] ?? 'webm';
    formData.append('file', source, `recording.${ext}`);
  } else {
    formData.append('file', {
      uri: source,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as unknown as Blob);
  }
  formData.append('model', 'whisper-large-v3-turbo');
  if (language) formData.append('language', language);

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Whisper error ${response.status}`);
  }

  const data = await response.json() as { text: string };
  return data.text.trim();
}
