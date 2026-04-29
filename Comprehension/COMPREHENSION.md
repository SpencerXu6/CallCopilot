# CallCopilot — Complete Project Comprehension

## What This Project Is

**CallCopilot** is a React Native / Expo mobile app for Chinese-speaking users making English phone calls in the United States. The user enters their goal (in Chinese or English), then either **types** or **records** what the customer service agent says. The AI responds instantly with a structured 5-section breakdown: plain Chinese understanding, Chinese translation, what to do next, an English reply they can read aloud, and optional notes.

The app is **fully built and working** as of the end of the first build session. Core feature (text input + AI response) and microphone recording + Whisper transcription are both implemented and running.

---

## Project Location & Repository

- **Canonical working directory**: `/Users/spencerxu/Desktop/School/Cseed Project/CallCopilot`
- **GitHub**: `https://github.com/SpencerXu6/CallCopilot` (branch: `main`)
- **Stale copy** at `/Users/spencerxu/CallCopilot` — was deleted. All work is in the Cseed Project directory.

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Expo | ~54.0.33 |
| UI | React Native | 0.81.5 |
| JS Library | React | 19.1.0 |
| Routing | expo-router | ~6.0.23 |
| Navigation | @react-navigation/native + bottom-tabs | ^7 |
| Animations | react-native-reanimated | ~4.1.1 |
| Audio recording | expo-av | SDK 54 compatible |
| Icons (iOS) | expo-symbols (SF Symbols) | ~1.0.8 |
| Icons (Android/Web) | @expo/vector-icons (MaterialIcons) | ^15.0.3 |
| Language | TypeScript | ~5.9.2 |
| AI (chat) | Groq API — `llama-3.3-70b-versatile` | direct fetch, no SDK |
| AI (transcription) | Groq Whisper — `whisper-large-v3-turbo` | direct fetch, no SDK |
| API Key | `EXPO_PUBLIC_GROQ_API_KEY` in `.env.local` | gitignored (`.env*.local`) |

**Architecture flags:**
- `newArchEnabled: true` — React Native New Architecture (JSI, no bridge)
- `experiments.reactCompiler: true` — React Compiler auto-memoization
- `experiments.typedRoutes: true` — Type-safe routing

**Why Groq instead of Anthropic:**
- Groq has a generous free tier (no credit card required) — ideal for testing
- Same quality for translation/guidance tasks using Llama 3.3 70B
- Whisper transcription is also free on Groq's tier
- Switch back to Anthropic by changing the URL, auth header, and model name in `services/claude.ts`

---

## File Structure

```
app/
  _layout.tsx          ← Root Stack navigator (registers tabs + call + modal)
  modal.tsx            ← /modal route (unused, kept from scaffold)
  call.tsx             ← /call route — Call Assistance screen (MAIN FEATURE)
  (tabs)/
    _layout.tsx        ← Tab group, single Home tab, tab bar hidden
    index.tsx          ← / — Goal Setup screen
    explore.tsx        ← /explore — UNUSED (kept from scaffold)

services/
  claude.ts            ← Groq chat API: system prompt, sendCallMessage(), parseResponse()
  whisper.ts           ← Groq Whisper API: transcribeAudio()

hooks/
  use-call-session.ts  ← useCallSession(goal) — manages message history + AI calls
  use-audio-recorder.ts← useAudioRecorder(apiKey, onTranscript) — mic recording state
  use-color-scheme.ts  ← Re-exports useColorScheme from react-native (native)
  use-color-scheme.web.ts ← SSR-safe useColorScheme for web
  use-theme-color.ts   ← Resolves named color from current theme

components/
  (all original Expo scaffold components — unused by app screens, kept for future use)

constants/
  theme.ts             ← Colors + Fonts constants (still referenced)

Comprehension/
  COMPREHENSION.md     ← This file

Plan/
  PLAN.md              ← Full product + technical plan

.claude/
  commands/
    research.md        ← /research slash command
    wipe-plan.md       ← /wipe-plan slash command

.env.local             ← EXPO_PUBLIC_GROQ_API_KEY=gsk_... (gitignored, user fills in)
```

---

## Routing Architecture

```
Stack (app/_layout.tsx)
├── (tabs)             ← tab bar hidden, single screen group
│   └── index.tsx      ← route: /  (Goal Setup)
└── call.tsx           ← route: /call?goal=...  (Call Assistance)
```

**User flow:**
1. App opens → Goal Setup screen (`/`)
2. User types goal OR taps a preset chip → taps "开始通话 / Start Call"
3. Navigates to `/call?goal=...`
4. User taps 🎙️ mic button (records agent speech) OR types manually → taps 发送
5. AI responds with 5-section structured guidance
6. User taps "结束" → back to Goal Setup

---

## Screen-by-Screen Walkthrough

### Goal Setup Screen — `app/(tabs)/index.tsx`

- `SafeAreaView` + `KeyboardAvoidingView` + `ScrollView`
- Logo: phone emoji in a teal circle (`#E0F7FA`), 80×80
- Title: "CallCopilot" (30px bold) + subtitle "通话助手 · Your Call Assistant" (14px gray)
- White card with shadow containing a multiline `TextInput` for the goal
- 6 preset chips in a 2-column flex-wrap grid — tap fills the input
- "开始通话 / Start Call" button — disabled (opacity 0.35) until input is non-empty
- Tip text at bottom explaining the app
- On press: `router.push({ pathname: '/call', params: { goal } })`

**Preset goals:**
| Chinese | English (stored as goal) |
|---|---|
| 更改垃圾桶大小 | I want to change my garbage bin size. |
| 银行账户问题 | I have a question about my bank account. |
| 预约医生 | I want to schedule a doctor appointment. |
| 账单问题 | I have a question about my bill. |
| 更改地址 | I need to update my address. |
| 取消服务 | I want to cancel my service. |

---

### Call Screen — `app/call.tsx`

The main screen. All live interaction happens here.

**Layout (top to bottom):**
1. **Header** — red "结束" button (left), goal text truncated (center), placeholder view (right, for balance)
2. **ScrollView** — auto-scrolls to bottom on new entry or loading
3. **Recording banner** — red bar shown only while recording: pulsing dot + "正在录音… Recording"
4. **Input bar** — mic button + TextInput + send button

**Empty state:** ear emoji 👂 + "准备好了 / Ready" + instructions in Chinese and English

**Each conversation entry (`EntryView`):**
- Agent bubble (white card, gray border): "📞 客服说 / Agent said:" label + the typed/transcribed text
- 5 response section cards stacked below

**Response section cards (`SectionCard`):**

| Section | Background | Left border accent | Bold text? |
|---|---|---|---|
| 理解 / Understanding | `#EFF6FF` | `#3B82F6` blue | No |
| 翻译 / Translation | `#F0FDF4` | `#22C55E` green | No |
| 下一步建议 / What to Do Next | `#FFF7ED` | `#F97316` orange | No |
| 推荐回复 / Suggested Reply | `#F0FDFA` | `#14B8A6` teal | Yes (16px 600) |
| 补充说明 / Notes | `#F9FAFB` | `#6B7280` gray | No |

Notes section only renders if `entry.response.notes` is non-empty.

**Input bar:**
- 🎙️ mic button (teal circle) → tap to start recording, turns red while recording
- ⏹ stop icon shown while recording; spinner shown while transcribing
- TextInput — disabled while mic is busy
- 发送 send button — disabled while loading or recording

**Loading states shown in scroll area:**
- "正在转录… Transcribing…" (after mic stopped, before transcript arrives)
- "正在分析… Analyzing…" (after text sent, waiting for AI)

---

## Service Layer

### `services/claude.ts`

**Exports:**
- `ParsedResponse` — interface `{ understanding, translation, nextStep, suggestedReply, notes? }`
- `parseResponse(text: string): ParsedResponse` — extracts sections using bracket-header `indexOf` parsing
- `sendCallMessage(apiKey, goal, messages): Promise<ParsedResponse>` — calls Groq chat API

**API details:**
- URL: `https://api.groq.com/openai/v1/chat/completions`
- Auth: `Authorization: Bearer ${apiKey}`
- Model: `llama-3.3-70b-versatile`
- System prompt injected as `{ role: 'system', content: system }` prepended to messages array
- Response path: `data.choices[0].message.content`

**System prompt** instructs the AI to:
- Act as a bilingual call copilot
- Always respond in the strict 5-section bracket format
- Handle IVR menus, identity verification, goal completion as special cases
- Keep suggested replies short and speakable
- Never give legal/financial advice

---

### `services/whisper.ts`

**Exports:**
- `transcribeAudio(apiKey, uri): Promise<string>` — sends audio file to Groq Whisper

**API details:**
- URL: `https://api.groq.com/openai/v1/audio/transcriptions`
- Method: POST multipart/form-data
- Model: `whisper-large-v3-turbo`
- Language: `en`
- File format: `audio/m4a` (expo-av default on iOS/Android)
- Response path: `data.text`

---

## Hooks

### `hooks/use-call-session.ts`

```ts
useCallSession(goal: string) → { entries, isLoading, error, send }
```

- `entries: CallEntry[]` — `{ id: string, agentText: string, response: ParsedResponse }`
- `send(agentText)` — pushes user message to history ref, calls `sendCallMessage`, updates entries
- `history` — `useRef<{role, content}[]>` — full conversation context sent on every API call
- On error: pops the failed user message from history, sets `error` string
- Reads `process.env.EXPO_PUBLIC_GROQ_API_KEY`

---

### `hooks/use-audio-recorder.ts`

```ts
useAudioRecorder(apiKey, onTranscript) → { state, error, toggle }
```

- `state: RecorderState` — `'idle' | 'recording' | 'transcribing'`
- `toggle()` — starts recording if idle, stops + transcribes if recording
- On stop: calls `transcribeAudio(apiKey, uri)`, passes result to `onTranscript` callback
- Requests mic permission on first record attempt
- Sets `allowsRecordingIOS: true` before recording, `false` after

**Used in call screen:** `onTranscript` is wired to `send()` from `useCallSession` — transcript auto-sends directly to AI.

---

## Environment Setup

**`.env.local`** (gitignored via `.env*.local` pattern):
```
EXPO_PUBLIC_GROQ_API_KEY=gsk_...
```

**To run:**
```bash
cd "/Users/spencerxu/Desktop/School/Cseed Project/CallCopilot"
npx expo start
```
Open on iPhone via Expo Go (scan QR) or press `i` for iOS Simulator.

**If you change `.env.local`:** stop Expo (`Ctrl+C`) and restart — env vars are baked in at startup.

---

## Current State (end of session 1)

**Working:**
- ✅ Goal Setup screen — goal input, preset chips, navigation to call screen
- ✅ Call screen — full AI response with 5 colored section cards
- ✅ Conversation context — full message history maintained across the session
- ✅ Microphone recording — tap to record, tap to stop, auto-transcribes via Groq Whisper, auto-sends
- ✅ Recording UI — red banner, red mic button, transcribing spinner, separate loading labels
- ✅ Error handling — API errors and mic permission errors shown in red banner
- ✅ Text input fallback — user can always type manually if mic quality is poor

**Known limitations:**
- iOS cannot access phone call audio directly — user must put call on speaker for mic to pick it up
- No session persistence — history resets when app closes
- No in-app API key settings — key lives in `.env.local` only
- Light mode only — dark mode not implemented

---

## Future Features (next session priorities)

1. **Android continuous listen mode** — auto-loop recording in chunks without tapping each time
2. **Copy to clipboard** on the "Suggested Reply" card so user can paste it somewhere
3. **Haptic feedback** when AI response arrives
4. **Session history** — save past calls, view them later
5. **In-app API key settings screen** — so user doesn't need to edit `.env.local`
6. **Dark mode** support
7. **Onboarding flow** — first-launch explanation of how to use the app (speaker mode tip etc.)

---

## Claude Code Slash Commands

| Command | Purpose |
|---|---|
| `/research` | Reads this COMPREHENSION.md in full and summarizes current project state. Use at the start of every new session. |
| `/wipe-plan` | Clears `Plan/PLAN.md` completely. Use when starting a fresh planning cycle. |
