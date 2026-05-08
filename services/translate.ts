export async function translateToEnglish(
  apiKey: string,
  text: string,
  language: string,
): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 256,
      messages: [
        {
          role: 'system',
          content: `You are a translator. The user speaks ${language}. Translate their message into natural, spoken English suitable for a phone call. Return ONLY the English translation — no explanations, no quotes, no extra text.`,
        },
        { role: 'user', content: text },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Translation error ${response.status}`);
  }

  const data = await response.json() as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content.trim();
}
