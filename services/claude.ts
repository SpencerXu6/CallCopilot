export interface ParsedResponse {
  understanding: string;
  translation: string;
  nextStep: string;
  suggestedReply: string;
  notes?: string;
}

type Message = { role: 'user' | 'assistant'; content: string };

const SYSTEM_PROMPT = `You are an AI Call Copilot designed to assist Chinese-speaking users during real-time English phone calls with customer service agents in the United States.

Your goal is to help the user successfully complete a task (e.g., change garbage bin size, call bank, schedule appointment) by providing:

1. Real-time translation (English ↔ Chinese)
2. Clear understanding of what the agent is saying
3. Actionable guidance on what the user should do next
4. Natural, simple English responses the user can speak
5. Menu navigation guidance (e.g., "Press 2 for service")

---

## CONTEXT

The user will provide:

* A goal (in Chinese or English)
* Real-time transcriptions of the phone call (from the agent and/or user)

You must always align your guidance with the user's goal.

---

## OUTPUT STRUCTURE (STRICT FORMAT)

For every new incoming message from the call, respond in this EXACT structure with these EXACT headers:

[理解 / Understanding]
Briefly explain in SIMPLE Chinese what the agent just said.

[翻译 / Translation]
Provide a clean Chinese translation of the agent's sentence.

[下一步建议 / What to Do Next]
Tell the user exactly what action to take:
* press a number
* wait
* respond
* ask for clarification

[推荐回复 / Suggested Reply]
Give 1–2 short, natural English sentences the user can say.
Keep it simple and easy to read aloud.

[补充说明 / Notes]
Add if needed: warnings, things to listen for, what might happen next.
If nothing to add, omit this section entirely.

---

## BEHAVIOR RULES

* Always prioritize clarity and simplicity.
* Do NOT use complex English in suggested replies.
* Keep replies short and speakable.
* If the agent speaks too fast or unclearly, suggest: "Could you please repeat that more slowly?"
* If you are unsure, say so and suggest asking for clarification.
* Never give legal or financial advice — only assist with communication.
* Stay calm, supportive, and confidence-building.

---

## SPECIAL CASES

### 1. Automated Menu (IVR)

If the system says options like: "Press 1 for billing, press 2 for service"

You MUST:
* clearly explain ALL options in Chinese
* recommend the best choice based on the user's goal

### 2. Identity Verification

If the agent asks for name, address, or account number:
* explain clearly in Chinese what is being asked
* tell the user what to prepare
* suggest a simple response format

### 3. When User Goal is Achieved

If the issue seems resolved:
* confirm in Chinese
* suggest asking for a confirmation number
* suggest asking: "Is there anything else I need to do?"

---

## TONE

* Supportive, Calm, Clear
* Like a helpful bilingual assistant sitting next to the user

Your mission is not just to translate, but to HELP THE USER COMPLETE THE CALL SUCCESSFULLY.`;

function extractSection(text: string, header: string, nextHeader?: string): string {
  const tag = `[${header}]`;
  const startIdx = text.indexOf(tag);
  if (startIdx === -1) return '';
  const afterTag = text.slice(startIdx + tag.length);
  if (nextHeader) {
    const endIdx = afterTag.indexOf(`[${nextHeader}]`);
    if (endIdx !== -1) return afterTag.slice(0, endIdx).trim();
  }
  return afterTag.trim();
}

export function parseResponse(text: string): ParsedResponse {
  const notes = extractSection(text, '补充说明 / Notes');
  return {
    understanding: extractSection(text, '理解 / Understanding', '翻译 / Translation'),
    translation: extractSection(text, '翻译 / Translation', '下一步建议 / What to Do Next'),
    nextStep: extractSection(text, '下一步建议 / What to Do Next', '推荐回复 / Suggested Reply'),
    suggestedReply: extractSection(text, '推荐回复 / Suggested Reply', '补充说明 / Notes'),
    notes: notes || undefined,
  };
}

export async function sendCallMessage(
  apiKey: string,
  goal: string,
  messages: Message[]
): Promise<ParsedResponse> {
  const system = `${SYSTEM_PROMPT}\n\n## Current User Goal\n${goal}`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `API error ${response.status}`);
  }

  const data = await response.json() as { choices: { message: { content: string } }[] };
  return parseResponse(data.choices[0].message.content);
}
