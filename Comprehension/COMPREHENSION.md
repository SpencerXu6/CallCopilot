# CallCopilot — Complete Project Comprehension

## What This Project Is

**CallCopilot** is a React Native / Expo mobile app for Chinese-speaking users making English phone calls in the United States. The user enters their goal (in Chinese or English), then either **types** or **records** what the customer service agent says. The AI responds instantly with a structured 5-section breakdown: plain Chinese understanding, Chinese translation, what to do next, an English reply they can read aloud, and optional notes.

The app is **fully built and working** with a polished UI design system applied. Core feature (text input + AI response) and microphone recording + Whisper transcription are both implemented and running.

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
| Gradients | expo-linear-gradient | SDK 54 compatible |
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

## Design System

The app uses a custom design system established in session 2. All styling lives in per-file `StyleSheet.create()` — there is no global CSS or NativeWind.

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| Background | `#FFFFFF` | All screen backgrounds |
| Slate-900 | `#0F172A` | Primary text, logo box |
| Slate-700 | `#1E293B` | Body text in cards |
| Slate-500 | `#64748B` | Secondary / subtitle text |
| Slate-400 | `#94A3B8` | Placeholder, muted text |
| Slate-100 | `#F1F5F9` | Borders |
| Slate-50 | `#F8FAFC` | Input backgrounds, card fills |
| Sky gradient | `#0EA5E9 → #0284C7` | Primary CTA, mic button, send button |
| Orange gradient | `#FB923C → #F97316` | "结束 / End" button |
| Red | `#EF4444` | Recording active mic button |

### Gradients (expo-linear-gradient)
- **Sky (primary action)**: `colors={['#0EA5E9', '#0284C7']}` `start={{ x:0, y:0 }}` `end={{ x:1, y:1 }}`
- **Orange (destructive/end)**: `colors={['#FB923C', '#F97316']}` same direction
- **Disabled state**: `colors={['#CBD5E1', '#CBD5E1']}` (flat gray)

### Typography
System fonts (SF Pro on iOS). No custom fonts installed yet.
- Headings: `fontWeight: '600'`, `letterSpacing: -0.3` to `-0.8`
- Body: `fontWeight: '400'`, `lineHeight: 22`
- Labels / caps: `fontWeight: '700'`, `textTransform: 'uppercase'`, `letterSpacing: 0.8`

### Shape & Shadow
- Large cards: `borderRadius: 24–32`
- Section cards: `borderRadius: 14`
- Small buttons / chips: `borderRadius: 12–20`
- Shadow spec: `shadowColor: '#000'`, `shadowOffset: {width:0, height:4}`, `shadowOpacity: 0.04`, `shadowRadius: 20`

### Micro-interactions
All tappable elements use `Pressable` with a functional style:
```tsx
style={({ pressed }) => [styles.base, pressed && styles.pressed]}
// pressed style:
pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] }
```

### Gradient Button Pattern
Gradient buttons always wrap `LinearGradient` inside `Pressable`. The outer `Pressable` or a wrapper `View` carries `borderRadius` + `overflow: 'hidden'` so the gradient clips correctly on Android.
```tsx
<Pressable onPress={...} style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}>
  <LinearGradient colors={['#0EA5E9','#0284C7']} style={styles.gradientInner}>
    <Text>Label</Text>
  </LinearGradient>
</Pressable>
// wrapper must have: borderRadius, overflow: 'hidden'
```

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
  theme.ts             ← Colors + Fonts constants (original scaffold, not used by redesigned screens)

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
2. User types goal OR taps a preset chip → taps the sky-blue "开始通话 / Start Call" gradient card
3. Navigates to `/call?goal=...`
4. User taps 🎙️ mic button (records agent speech) OR types manually → taps 发送
5. AI responds with 5-section structured guidance
6. User taps orange "结束" button → back to Goal Setup

---

## Screen-by-Screen Walkthrough

### Goal Setup Screen — `app/(tabs)/index.tsx`

**Layout (top to bottom):**
1. **Header row** — left: 36×36 Slate-900 rounded square logo box with 📞 + "CallCopilot" 20px semibold; right: 40×40 rounded-full settings button (Slate-50 bg, Slate-100 border)
2. **Hero section** — 36px tight headline "打好每一个英文电话" (Slate-900) + 17px Slate-500 subtitle, `paddingHorizontal: 28`
3. **Goal input card** — white card, `borderRadius: 24`, Slate-100 border, 0.04 shadow; title + subtitle + `TextInput` with Slate-50 background
4. **Presets label** — "常见任务" 18px semibold
5. **Horizontal-scrolling preset chips** — `ScrollView horizontal`, each chip is 140px min-width, Slate-50 bg, Slate-100 border, `borderRadius: 20`; active state: EFF6FF bg + `#0EA5E9` border
6. **Start Call gradient card** — full-width sky-blue `LinearGradient` inside `Pressable`; `borderRadius: 32`; left stack with label + 24px title; right: 48×48 glassmorphic icon box (`rgba(255,255,255,0.15)`, `borderRadius: 16`); disabled at `opacity: 0.35`
7. **Tip text** — Slate-400, centered

**Preset goals (stored as English, displayed in Chinese):**
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

**Layout (top to bottom):**
1. **Header** — orange gradient "结束" pill (left), goal text truncated (center), placeholder `View` (right, `width: 60` to balance layout)
2. **ScrollView** — auto-scrolls to bottom on new entry or loading
3. **Recording banner** — red bar (`#FEF2F2` bg, `#FECACA` border) shown only while recording: pulsing dot + Chinese/English label
4. **Input bar** — mic button + TextInput + send button

**Empty state:** 80×80 Slate-50 circle with 👂 + "准备好了 / Ready" headline + instruction text

**Each conversation entry (`EntryView`):**
- Agent bubble (white card, `borderRadius: 20`, Slate-100 border, 0.04 shadow): uppercase "客服说 / AGENT SAID" label + the typed/transcribed text
- 5 response section cards stacked below with `gap: 6`

**Response section cards (`SectionCard`):**

| Section | Background | Left border accent | Bold? |
|---|---|---|---|
| 理解 / Understanding | `#EFF6FF` | `#3B82F6` blue | No |
| 翻译 / Translation | `#F0FDF4` | `#22C55E` green | No |
| 下一步建议 / What to Do Next | `#FFF7ED` | `#F97316` orange | No |
| 推荐回复 / Suggested Reply | `#F0FDFA` | `#14B8A6` teal | Yes (16px 600) |
| 补充说明 / Notes | `#F9FAFB` | `#6B7280` gray | No |

Notes section only renders if `entry.response.notes` is non-empty. All section cards use `borderRadius: 14`.

**Input bar:**
- 🎙️ mic button (48×48, sky-blue `LinearGradient` circle) → tap to start, turns red (`#EF4444`) while recording, shows spinner while transcribing
- TextInput — Slate-50 bg, Slate-100 border, `borderRadius: 20`, disabled while mic is busy
- 发送 send button — sky-blue gradient pill; grays out (`#CBD5E1`) when disabled

**Loading states:**
- "正在转录… Transcribing…" after mic stop
- "正在分析… Analyzing…" while waiting for AI

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

## Current State (end of session 2)

**Working:**
- ✅ Goal Setup screen — goal input, horizontal-scroll preset chips, gradient start card
- ✅ Call screen — full AI response with 5 colored section cards
- ✅ Conversation context — full message history maintained across the session
- ✅ Microphone recording — tap to record, tap to stop, auto-transcribes via Groq Whisper, auto-sends
- ✅ Recording UI — red banner, red mic button, transcribing spinner, separate loading labels
- ✅ Error handling — API errors and mic permission errors shown in red banner
- ✅ Text input fallback — user can always type manually if mic quality is poor
- ✅ Design system — white/Slate palette, sky-blue + orange gradients, 0.04 shadow, `borderRadius: 14–32`, press micro-interactions

**Known limitations:**
- iOS cannot access phone call audio directly — user must put call on speaker for mic to pick it up
- No session persistence — history resets when app closes
- No in-app API key settings — key lives in `.env.local` only
- Light mode only — dark mode not implemented
- System fonts only — General Sans / Satoshi not yet installed

---

## Future Features (next session priorities)

1. **Copy to clipboard** on the "Suggested Reply" card — use `expo-clipboard`
2. **Custom fonts** — install `@expo-google-fonts/plus-jakarta-sans` (General Sans equivalent) and `@expo-google-fonts/inter` (Satoshi equivalent); load in `app/_layout.tsx` with `useFonts`
3. **Android continuous listen mode** — auto-loop recording in chunks without tapping each time
4. **Haptic feedback** when AI response arrives — use `expo-haptics`
5. **Session history** — save past calls, view them later
6. **In-app API key settings screen** — so user doesn't need to edit `.env.local`
7. **Dark mode** support
8. **Onboarding flow** — first-launch explanation of how to use the app (speaker mode tip etc.)

---

## Claude Code Slash Commands

| Command | Purpose |
|---|---|
| `/research` | Reads this COMPREHENSION.md in full and summarizes current project state. Use at the start of every new session. |
| `/wipe-plan` | Clears `Plan/PLAN.md` completely. Use when starting a fresh planning cycle. |
