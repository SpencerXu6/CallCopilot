# CallCopilot — Plan

## Current Status

Session 1 complete. Core app is fully built and working. See `Comprehension/COMPREHENSION.md` for the full technical reference.

**What's done:**
- Goal Setup screen (preset chips, text input, navigation)
- Call screen (5-section AI response cards, conversation history)
- Groq chat API integration (llama-3.3-70b-versatile)
- Microphone recording + Groq Whisper transcription (auto-sends on stop)
- Full error handling for API failures and mic permission denial

---

## Next Session — Priorities

Pick from this list at the start of the next session based on what the user wants to build.

### 1. Android Continuous Listen Mode
**What:** On Android, add an "Auto" toggle in the input bar that loops recording automatically — records a chunk, transcribes, sends, immediately starts recording again. User never has to tap.
**Why:** Android mic recording during calls is more reliable than iOS. This makes the app much more hands-free on Android.
**Files to touch:** `hooks/use-audio-recorder.ts`, `app/call.tsx`

---

### 2. Copy-to-Clipboard on Suggested Reply
**What:** Add a "复制 / Copy" button on the teal "推荐回复 / Suggested Reply" card. Tapping it copies the English text to clipboard and briefly shows "已复制 / Copied!"
**Why:** User needs to be able to quickly grab the suggested reply without retyping it.
**Package needed:** `npx expo install expo-clipboard`
**Files to touch:** `app/call.tsx`

---

### 3. Haptic Feedback on AI Response
**What:** When a new AI response card appears, fire a light haptic. When recording starts/stops, fire a selection haptic.
**Why:** Makes the app feel more polished and gives tactile confirmation during a call when the user can't look at the screen.
**Package:** `expo-haptics` — already installed
**Files to touch:** `hooks/use-call-session.ts`, `hooks/use-audio-recorder.ts`

---

### 4. Onboarding Screen (First Launch)
**What:** A one-time screen shown on first launch that explains: (1) put your call on speaker, (2) tap the mic when the agent speaks, (3) read the green suggested reply. Show once, store with `expo-secure-store` or `AsyncStorage`.
**Why:** Without this, new users won't know they need speaker mode for the mic to work.
**Package needed:** `npx expo install @react-native-async-storage/async-storage`
**Files to create:** `app/onboarding.tsx`
**Files to touch:** `app/_layout.tsx` (redirect on first launch)

---

### 5. In-App API Key Settings Screen
**What:** A settings screen (accessible from the Goal Setup screen via a gear icon) where the user can paste their Groq API key. Stored securely with `expo-secure-store`. Replaces the need to edit `.env.local`.
**Why:** Makes the app self-contained — anyone can install and run it without touching config files.
**Package needed:** `npx expo install expo-secure-store`
**Files to create:** `app/settings.tsx`
**Files to touch:** `app/(tabs)/index.tsx` (gear icon), `hooks/use-call-session.ts` (read from secure store), `hooks/use-audio-recorder.ts` (same)

---

### 6. Session History
**What:** Save each completed call session (goal + all entries) to local storage. Add a "History" tab or screen where past sessions can be reviewed.
**Why:** Users may want to reference what was said in a previous call.
**Package needed:** `npx expo install @react-native-async-storage/async-storage`
**Files to create:** `app/history.tsx`, `hooks/use-session-history.ts`

---

### 7. Dark Mode
**What:** All screens currently use hardcoded light-mode colors. Wire up `useColorScheme()` and add dark variants for all color values.
**Why:** Looks bad in dark mode on devices that use it automatically.
**Files to touch:** `app/(tabs)/index.tsx`, `app/call.tsx`

---

## Suggested Next Session Order

If starting fresh with a new agent, recommended build order:

1. **Copy to clipboard** — tiny, high value, one file
2. **Haptic feedback** — tiny, package already installed
3. **Onboarding screen** — medium, high user impact
4. **In-app API key settings** — medium, makes app shareable
5. **Android continuous listen** — medium-large, good Android UX
6. **Session history** — large feature, lower priority
7. **Dark mode** — polish pass, do last
