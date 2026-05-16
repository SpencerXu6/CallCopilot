# LingoLine — Complete Project Comprehension

## What This Project Is

**LingoLine** (formerly CallCopilot) is a React Native / Expo mobile app that helps non-native English speakers make English phone calls in the United States. The user enters their goal, then either **records** or **types** what the customer service agent says. The AI responds instantly with a structured 5-section breakdown: understanding, translation, what to do next, a ready-to-speak English reply, and optional notes — all in the user's chosen language.

The app is **fully built and production-ready** with auth, multi-language support, session history, onboarding, and a tutorial. It also runs as a **responsive web app** (laptop, iPad, mobile browser) with a sidebar navigation and adaptive layouts.

---

## Project Location & Repository

- **Canonical working directory**: `/Users/spencerxu/Desktop/School/Cseed Project/CallCopilot`
- **GitHub**: `https://github.com/SpencerXu6/CallCopilot` (branch: `main`)
- **Landing page**: `landing/index.html` — standalone HTML, deployable to Netlify drag-and-drop

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
| Gradients | expo-linear-gradient | ~15.0.8 |
| Icons | @expo/vector-icons (Ionicons) | bundled with Expo |
| Secure storage | expo-secure-store | SDK 54 compatible (native only) |
| Async storage | @react-native-async-storage/async-storage | latest |
| Backend / Auth | Supabase (`@supabase/supabase-js`) | latest |
| Language | TypeScript | ~5.9.2 |
| AI (chat) | Groq API — `llama-3.3-70b-versatile` | direct fetch, no SDK |
| AI (transcription) | Groq Whisper — `whisper-large-v3-turbo` | direct fetch, no SDK |
| TTS | expo-speech | SDK 54 compatible |

**Architecture flags:**
- `newArchEnabled: true` — React Native New Architecture (JSI, no bridge)
- `experiments.reactCompiler: true` — React Compiler auto-memoization
- `experiments.typedRoutes: true` — Type-safe routing (causes typed route errors for new routes until cache refreshes — cast with `as never`)
- `web.output: "single"` — SPA mode (no SSR). Changed from `"static"` because SSR crashes on `window`-dependent code (auth storage).

---

## Environment Variables

**`.env.local`** (gitignored via `.env*.local`):
```
EXPO_PUBLIC_GROQ_API_KEY=gsk_...
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```
All three are required. Restart Expo after any change (`Ctrl+C` then `npx expo start`).

---

## Supabase Setup

### Database Table (run once in SQL Editor)
```sql
create table public.call_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  goal text not null,
  language text not null,
  entries jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.call_sessions enable row level security;

create policy "Users manage own sessions"
  on public.call_sessions for all
  using (auth.uid() = user_id);
```

### Auth Settings
- Email/password auth is used. For testing, disable email confirmation in Supabase → Authentication → Providers → Email.
- Session tokens are persisted via `expo-secure-store` on native, and `localStorage` on web.
- **Web users are guests by default** — they can use the full call feature but history does not save (no user ID). Auth is also available on web.

---

## AsyncStorage Keys

All stored on device, no server sync:

| Key | Type | Purpose |
|---|---|---|
| `callcopilot_language` | string | User's selected language (default: `'Chinese'`) |
| `callcopilot_name` | string | User's first name from onboarding |
| `callcopilot_use_case` | string | Use case selected during onboarding |
| `callcopilot_needs_onboarding` | `'true'` / `'false'` | Whether to redirect to `/onboarding` after sign-in |
| `callcopilot_tutorial_done` | `'true'` | Whether to suppress the tutorial overlay |
| `callcopilot_guest` | `'true'` / `'false'` | Whether user chose guest mode. `'true'` bypasses AuthGuard redirects. Cleared to `'false'` on sign-up, removed on sign-in. |
| `callcopilot_voice` | `'auto'` or voice identifier string | TTS voice preference (default: `'auto'`). `'auto'` picks the first Enhanced English voice. Any other value is treated as a voice identifier returned by `expo-speech`. Legacy `'female'`/`'male'` values silently migrate to `'auto'` on next load. |

---

## Supported Languages

8 languages supported end-to-end (UI text + AI responses):

| Language | Code | Flag |
|---|---|---|
| Chinese (Simplified) | `'Chinese'` | 🇨🇳 |
| Spanish | `'Spanish'` | 🇪🇸 |
| French | `'French'` | 🇫🇷 |
| Korean | `'Korean'` | 🇰🇷 |
| Japanese | `'Japanese'` | 🇯🇵 |
| Portuguese | `'Portuguese'` | 🇧🇷 |
| Vietnamese | `'Vietnamese'` | 🇻🇳 |
| Hindi | `'Hindi'` | 🇮🇳 |

---

## File Structure

```
app/
  _layout.tsx          ← Root Stack + AuthGuard (re-reads callcopilot_guest on every nav event)
  auth.tsx             ← /auth — Sign Up / Log In screen (native + web)
  onboarding.tsx       ← /onboarding — 4-step first-run survey (name, language, use case)
  call.tsx             ← /call?goal=...&language=... — Call Assistance screen (MAIN FEATURE)
  modal.tsx            ← /modal — unused scaffold
  (tabs)/
    _layout.tsx        ← Tab group: bottom nav on mobile (4 tabs with Ionicons), hidden on wide (≥768px)
    index.tsx          ← / — Goal Setup screen (responsive)
    history.tsx        ← /history — Saved call sessions (responsive)
    profile.tsx        ← /profile — Edit name, language, use case (responsive)
    settings.tsx       ← /settings — Voice picker, account info, app version (responsive)
    explore.tsx        ← /explore — UNUSED scaffold (hidden via href: null)

services/
  supabase.ts          ← Supabase client; uses localStorage on web, expo-secure-store on native
  claude.ts            ← Groq chat API: sendCallMessage(apiKey, goal, messages, language) → ParsedResponse | null
                           Returns null when AI responds "SKIP" (user speech detected). SPEAKER DETECTION section in
                           system prompt instructs AI to identify speaker first; user speech → SKIP only; agent/uncertain
                           → full structured analysis. Parser uses sectionRegex() — matches \[[^\]]*\/\s*EnglishLabel\]
                           so it tolerates translated prefixes (Korean, Spanish, etc.), whitespace around /, markdown bold,
                           and English-only headers. parseResponse() matches on English labels only.
  whisper.ts           ← Groq Whisper API: transcribeAudio(apiKey, source, language?, prompt?)
                           source: string (native file URI) or Blob (web). Always sends temperature=0. Sends prompt only
                           when non-empty (VAD passes accumulated liveText). No default prompt — an empty default causes
                           Whisper to hallucinate continuations of it.
  translate.ts         ← Groq translate-only: translateToEnglish(apiKey, text, language)
  tts.ts               ← expo-speech wrappers: speak(text, onDone?), stopSpeaking(), getEnglishVoices()
  history.ts           ← Supabase CRUD: saveCallSession(), loadCallSessions(), deleteCallSession()

hooks/
  use-auth.ts              ← useAuth() → { session, user, loading, signIn, signUp, signOut }
  use-call-session.ts      ← useCallSession(goal, language) → { entries, isLoading, error, send, recordCustomerReply }
                               send() is non-blocking: if isLoadingRef.current, transcript is pushed onto pendingRef queue.
                               sendOne() does the actual API call; drains queue in finally without dropping isLoading.
                               null response (SKIP) → silently pops history entry, no entry card created.
  use-audio-recorder.ts    ← useAudioRecorder(apiKey, onTranscript) → { state, error, toggle } (native: expo-av)
  use-audio-recorder.web.ts← Web version — uses browser MediaRecorder API instead of expo-av
  use-speak-for-me.ts      ← useSpeakForMe(apiKey, language, onSpoken?) → { state, error, lastSpoken, toggle, cancel } (native)
  use-speak-for-me.web.ts  ← Web version — uses browser MediaRecorder API instead of expo-av
  use-vad-recorder.ts      ← useVadRecorder(apiKey, onTranscript) → { state, liveText, error, start, stop } (native)
                               Chunked auto-listen: records 1.5s segments, sends each to Whisper, accumulates liveText.
                               Whisper called with temperature=0 and accumulated liveText as prompt (empty → no prompt).
                               HALLUCINATIONS Set + isHallucination() filter known Whisper silence hallucinations.
                               2 consecutive empty/hallucinated chunks (≈3s silence) → fires onTranscript(liveText).
                               VadState: 'idle' | 'listening'
  use-vad-recorder.web.ts  ← Web version — same chunked logic using browser MediaRecorder instead of expo-av
  use-breakpoint.ts        ← useBreakpoint() → { bp, isMobile, isTablet, isDesktop, isWide, width }
  use-color-scheme.ts      ← Re-exports useColorScheme (native)
  use-color-scheme.web.ts  ← SSR-safe useColorScheme (web)
  use-theme-color.ts       ← Resolves named color from theme

components/
  call-entry.tsx       ← Shared EntryView + SectionCard (used by call.tsx and history.tsx)
  side-nav.tsx         ← Desktop/tablet sidebar: logo + wordmark, user avatar card, nav with Ionicons, Settings link, version
  tutorial.tsx         ← TutorialOverlay — animated bottom-sheet tutorial with skip
  (Expo scaffold components — unused)

constants/
  i18n.ts              ← UI text translations for all 8 languages; t(language) helper; PRESET_EN[6] (generic fallback); PRESETS_BY_USE_CASE (4 use-case sets × 6 presets, each with en + 8 language display labels)
  theme.ts             ← Original scaffold colors (not used by redesigned screens)

assets/
  images/
    logo.png           ← App logo: blue rounded square, globe + speech bubbles (Hi / 你好)
    icon.png           ← App icon (same as logo.png)
    splash-icon.png    ← Splash screen icon (same as logo.png)
    favicon.png        ← Web favicon (same as logo.png)

landing/
  index.html           ← Standalone marketing landing page (no build step needed)

Comprehension/
  COMPREHENSION.md     ← This file

Plan/
  PLAN.md              ← Product + technical plan

.claude/
  commands/
    research.md        ← /research slash command
    wipe-plan.md       ← /wipe-plan slash command
```

---

## Routing Architecture

```
Stack (app/_layout.tsx)
├── auth.tsx           ← /auth
├── onboarding.tsx     ← /onboarding  (gesture back disabled)
├── (tabs)/
│   ├── index.tsx      ← /  (Goal Setup)
│   ├── history.tsx    ← /history  (Saved Sessions)
│   ├── profile.tsx    ← /profile  (Edit name, language, use case)
│   └── settings.tsx   ← /settings  (Voice, Account, About)
└── call.tsx           ← /call?goal=...&language=...
```

### Auth Guard Logic (`app/_layout.tsx` → `AuthGuard` component)
```
On every navigation event: re-reads callcopilot_guest from AsyncStorage (NOT cached in state)
Waits for session loading before any redirect

guestMode === 'true'     → skip all redirects (guest access, no session needed)
No session + not on /auth → redirect to /auth
Session + on /auth        → check callcopilot_needs_onboarding
  → 'true'               → redirect to /onboarding
  → else                 → redirect to /
Session + not onboarding  → check callcopilot_needs_onboarding
  → 'true'               → redirect to /onboarding
```

**Critical bug fixed (session 9):** The original `AuthGuard` read `callcopilot_guest` once on mount and cached it in state. When the user tapped "Continue as Guest", the flag was written to AsyncStorage and navigation fired — but the guard still saw the stale `false` value and redirected back to `/auth`. Fix: the routing `useEffect` now re-reads `callcopilot_guest` from AsyncStorage every time it runs (no cached state), so the flag is always fresh.

---

## Responsive Web Layout

### Breakpoints — `hooks/use-breakpoint.ts`
```ts
useBreakpoint() → { bp, isMobile, isTablet, isDesktop, isWide, width }
// sm: < 768px | md: 768–1023px | lg: ≥ 1024px
// isWide = isTablet || isDesktop
```

### Layout rules per breakpoint

| | Mobile (< 768) | Tablet (768–1023) | Desktop (≥ 1024) |
|---|---|---|---|
| Navigation | Bottom tab bar (4 tabs + icons) | Sidebar (260px) | Sidebar (260px) |
| Language chips | Horizontal scroll | Wrap grid | Wrap grid |
| Preset cards | Horizontal scroll | Wrap grid | Wrap grid |
| Hero font | 34px | 34px | 44px |
| Content max-width | Full | 800px centered | 800px centered |
| Call screen max-width | Full | 800px centered | 800px centered |
| Auth card max-width | Full | 440px centered card | 440px centered card |

### Sidebar — `components/side-nav.tsx`
- Rendered inside `index.tsx`, `history.tsx`, `profile.tsx`, and `settings.tsx` when `isWide` is true
- Width: **260px** (increased from 200px)
- Background: `#FAFAFA`, hairline right border `#E5E5EA`
- **Brand row**: `logo.png` (32×32, borderRadius 8) + "LingoLine" wordmark
- **User info card**: blue avatar circle with email initial + email address + "Signed in" label. Guest shows gray avatar + "Guest / No account".
- **Divider**: hairline `#E5E5EA`
- **Nav items**: Home, History, Profile, Settings — each with an Ionicons icon (outline when inactive, filled when active). Active item: `rgba(0,122,255,0.1)` background + `#007AFF` text + filled icon.
- **Bottom**: version string "LingoLine · v1.0" in `#C7C7CC`
- Bottom tab bar is hidden on wide screens via `tabBarStyle: { display: 'none' }` in `app/(tabs)/_layout.tsx`
- Uses `usePathname()` to highlight the active route

---

## Screen-by-Screen Walkthrough

### Auth Screen — `app/auth.tsx`

**Mobile layout:**
- Full-screen `LinearGradient` background (`#007AFF` → `#0052CC`)
- Top brand area: logo image (80×80, borderRadius 18) + "LingoLine" in white + tagline in `rgba(255,255,255,0.8)`
- White form card slides up from bottom with `borderTopLeftRadius: 28`, `borderTopRightRadius: 28`
- Form content: segmented Log In / Sign Up control, field card in `#F2F2F7`, CTA button with blue colored shadow (`shadowColor: '#007AFF'`, `shadowOpacity: 0.35`)
- "Continue as Guest" text link in `#6E6E73` below the CTA

**Wide layout (tablet/desktop):**
- `#F2F2F7` background
- Centered card (maxWidth 440, `borderRadius: 20`, subtle shadow) with:
  - Top: `LinearGradient` brand header (logo + name + tagline in white)
  - Bottom: white form area

**Key behavior:** "Continue as Guest" sets `callcopilot_guest = 'true'` then navigates to `/`. AuthGuard re-reads the flag and allows it through.

---

### Onboarding Screen — `app/onboarding.tsx`

4 steps, 2px progress bar at top (`#007AFF` fill on `#E5E5EA` track), skippable at every step.

| Step | Content |
|---|---|
| 0 — Welcome | Logo image (80×80, borderRadius 18), 34px bold title, body text, 3-item feature list |
| 1 — Name | Large title, white field card with TextInput, Continue + Skip |
| 2 — Language | 2×4 grid of white tiles. Active: `#007AFF` border + blue fill |
| 3 — Use Case | White grouped card, 5 rows with radio circles |

On completion: saves `callcopilot_name`, `callcopilot_language`, `callcopilot_use_case`, `callcopilot_needs_onboarding = 'false'` → navigates to `/`.

---

### Goal Setup Screen — `app/(tabs)/index.tsx`

**Mobile layout (top to bottom):**
1. **Hero gradient section** — `LinearGradient` (`#EBF4FF` → `#F2F2F7`), contains:
   - Header: "LingoLine" wordmark (20px bold) + "Sign Out" / "Sign In" button
   - Hero title (34px bold, language-specific) + personalized subtitle
2. **Language selector** — section label + horizontal-scroll pill chips. Active: `#007AFF` border + blue tinted fill. **The user's saved language is always rendered first**; the remaining 7 follow in their original order.
3. **Goal input** — white rounded card (`borderRadius: 14`) with subtle shadow (`shadowOpacity: 0.06`), plain `TextInput`
4. **Common tasks** — section label + horizontal-scroll preset pills. **If the user selected a use case in Profile (Healthcare / Banking & Finance / Utilities & Home / Customer Service), the 6 presets shown are specific to that category (from `PRESETS_BY_USE_CASE`)**; "Other" or no selection falls back to the generic `PRESET_EN` 6.
5. **Start Call** — full-width `#007AFF` button with colored shadow (`shadowColor: '#007AFF'`, `shadowOpacity: 0.4`)

**Voice selector removed** — moved to Settings screen.

**Wide layout:** sidebar shown, content max-width **800px** centered, chips switch to wrap grid, hero scales to 44px font.

---

### Call Screen — `app/call.tsx`

Route params: `goal` (string) + `language` (string).

1. **Header** — "End" pill in `#FF3B30` (left); goal text in `#6E6E73` (center); language badge (right).
2. **ScrollView** — conversation entries (`EntryView`), auto-scroll to bottom.
3. **Loading row** — "Transcribing…" / "Translating…" / "Analyzing…"
4. **Banners (top to bottom when active)**:
   - Red: manual agent recording ("Recording — tap mic to stop")
   - Green: auto-listen active — shows "Auto-listening…" or "Heard:" when liveText is present
   - Green live box: shows accumulated `liveText` from VAD chunks (green left border card)
   - Blue: speak-for-me recording
   - Blue: speak-for-me speaking (+ Stop pill)
5. **Input bar** — `🗣️` speak-for-me + `🎙️` agent mic + `👂` auto-listen toggle + white `TextInput` + `#007AFF` "Send" pill
   - `👂` is green-tinted when active; disables 🎙️ and 🗣️ while running
   - 🎙️ and 🗣️ disable 👂 while active

**Auto-listen (👂) flow:**
- Tap once → starts chunked recording loop (2.5s per chunk → Whisper → liveText updates → repeat)
- As each chunk transcribes, text accumulates in the green `vadLiveBox` visible to the user
- After 2 consecutive empty/silent chunks (~5s of silence), full accumulated text fires to AI automatically
- liveText clears after sending. Tap 👂 again to stop at any time.

On wide screens: constrained to `maxWidth: 800`.

---

### Profile Screen — `app/(tabs)/profile.tsx`

- `#F2F2F7` background, 34px "Profile" large title
- **NAME** section — white rounded card with TextInput
- **LANGUAGE** section — 2×4 wrap grid of language chips
- **COMMON USE** section — white grouped card, 5 rows with radio circles
- **Save Changes** button — solid `#007AFF`, shows "Saved ✓" for 2 seconds
- On wide: sidebar shown, content constrained to `maxWidth: 680`

---

### Settings Screen — `app/(tabs)/settings.tsx`

New screen added in session 9.

- `#F2F2F7` background, 34px "Settings" large title
- **VOICE section** — white card with title + subtitle, chip row for voice selection (`Auto` + all Enhanced English voices from device). Same chip style as the former home screen voice selector. Persists to `callcopilot_voice` in AsyncStorage.
- **Voice preview** — tapping any chip immediately stops current speech and plays `"Hello! This is how I sound."` using that voice's exact identifier (`voices[0]` for Auto). `previewing` state changes the subtitle to `"▶ Playing preview…"` (blue `#007AFF`) while playing; clears on `onDone`/`onStopped`/`onError`. Default subtitle: `"Tap a voice to hear a preview."`
- **ACCOUNT section** (shown only when signed in):
  - White list card showing user's email
  - "Sign Out" button in `#FF3B30` (triggers Alert confirmation)
- **ACCOUNT section** (guest): white list card showing "Guest / No account"
- **ABOUT section** — app name + version (1.0.0)
- On wide: sidebar shown, content constrained to `maxWidth: 780`

---

### History Screen — `app/(tabs)/history.tsx`

- `#F2F2F7` background, 34px "History" large title + session count
- Loads sessions on tab focus via `useFocusEffect`, pull-to-refresh supported
- Each `SessionCard`: white card, flag + goal + date/count meta. Delete + `›` disclosure
- Tap to expand → full `EntryView` inline
- On wide: sidebar shown, list constrained to `maxWidth: 720`
- Web guests: empty state shown (no user ID, sessions not saved)

---

## Design System

All styling in per-file `StyleSheet.create()`. No NativeWind or global CSS.
Apple Human Interface Guidelines–inspired. Zero emoji chrome.

### Colors
| Token | Hex | Usage |
|---|---|---|
| System BG | `#F2F2F7` | All screen backgrounds |
| Sidebar BG | `#FAFAFA` | Side nav background (slightly off-white) |
| Card | `#FFFFFF` | All card/surface backgrounds |
| Accent | `#007AFF` | Primary buttons, active states, links |
| Accent gradient | `#007AFF` → `#0052CC` | Auth screen gradient, onboarding logo area |
| Accent light | `rgba(0,122,255,0.08–0.10)` | Active chip/tile fill, active nav item bg |
| Hero gradient | `#EBF4FF` → `#F2F2F7` | Home screen hero section top-to-bottom |
| Text primary | `#000000` | Headings, body |
| Text secondary | `#6E6E73` | Sub-labels, descriptions |
| Text tertiary | `#AEAEB2` | Placeholders, metadata, muted |
| Separator | `#E5E5EA` | Hairline dividers between list rows |
| Fill | `rgba(120,120,128,0.12)` | Segmented control bg |
| Danger | `#FF3B30` | End call, delete, sign out, errors |
| Success | `#34C759` | Auth notice / confirmation |
| Recording tint | `rgba(255,59,48,0.06)` | Recording banner bg |

### Button Shadows (added in session 9)
- **CTA buttons** (Start Call, Log In): `shadowColor: '#007AFF'`, `shadowOffset: {0,4}`, `shadowOpacity: 0.35–0.40`, `shadowRadius: 10–12` — colored blue glow
- **Cards** (goal input, settings cards): `shadowColor: '#000'`, `shadowOffset: {0,1–2}`, `shadowOpacity: 0.05–0.06`, `shadowRadius: 4–8` — subtle depth

### Shape
- Screen cards / grouped forms: `borderRadius: 12–14`
- Large content cards: `borderRadius: 16`
- Auth form sheet: `borderTopLeftRadius: 28, borderTopRightRadius: 28`
- Wide auth card: `borderRadius: 20`
- Pills / chips: `borderRadius: 999`
- Language tiles: `borderRadius: 14`

---

## Bottom Navigation — `app/(tabs)/_layout.tsx`

Four tabs (mobile only, hidden on wide ≥ 768px):
- **Home** (`index.tsx`) — Ionicons `home` / `home-outline`
- **History** (`history.tsx`) — Ionicons `time` / `time-outline`
- **Profile** (`profile.tsx`) — Ionicons `person` / `person-outline`
- **Settings** (`settings.tsx`) — Ionicons `settings` / `settings-outline`

Icons switch between filled (active) and outline (inactive). `explore.tsx` is hidden via `href: null`.

Tab bar: `rgba(242,242,247,0.94)` translucent bg, `#C6C6C8` hairline top border. Active tint `#007AFF`, inactive `#8E8E93`. Label `fontSize: 10`, icon size 22. Height: 83px iOS / 64px Android.

---

## Service Layer

### `services/tts.ts`
`speak(text, onDone?)` — reads `callcopilot_voice` from AsyncStorage, picks voice, calls `Speech.speak()`. Rate: `0.92`.
`getEnglishVoices()` — returns Enhanced English voices (cached). Used by **Settings screen** to populate voice chips.
`stopSpeaking()` — calls `Speech.stop()`.
Exported: `VOICE_KEY = 'callcopilot_voice'`, `type VoicePreference = string`.

All other services unchanged from session 8.

---

## Presets — `constants/i18n.ts`

Two preset structures exist side-by-side:

### `PRESET_EN` — generic fallback (6 items)
Used when no use case is selected or use case is "Other". Sent directly to the AI as the goal (always English).

```ts
export const PRESET_EN = [
  'I want to dispute an incorrect charge on my bill.',
  'My internet has been out for days — I need it fixed urgently.',
  'I need to reschedule my upcoming doctor appointment.',
  'I want to cancel my subscription and request a full refund.',
  'I need to report a lost card and order a replacement.',
  'I want to escalate my issue and speak to a supervisor.',
];
```

Each language has matching display translations in `UI[lang].presets` (parallel array).

### `PRESETS_BY_USE_CASE` — use-case-specific presets
`Record<string, PresetEntry[]>` with 4 keys: `'Healthcare'`, `'Banking & Finance'`, `'Utilities & Home'`, `'Customer Service'`. Each has 6 `PresetEntry` objects:

```ts
interface PresetEntry {
  en: string;        // goal sent to AI — always English
  Chinese: string;   // display label in each language
  Spanish: string;
  French: string;
  Korean: string;
  Japanese: string;
  Portuguese: string;
  Vietnamese: string;
  Hindi: string;
}
```

The home screen picks `entry.en` as the goal and `entry[language]` as the chip label. If the language key is missing it falls back to `entry.en`.

**Use case → presets mapping:**
| Use Case | Sample presets |
|---|---|
| Healthcare | Reschedule doctor, verify insurance, request referral, prior auth status, procedure cost, medical records |
| Banking & Finance | Dispute charge, report lost card, dispute fraud, declined payment, increase credit limit, set up autopay |
| Utilities & Home | Internet outage, downgrade plan, schedule technician, electricity bill issue, trash schedule, transfer utilities |
| Customer Service | Cancel subscription, escalate to supervisor, return item, missing package, cheaper plan, dispute charge for credit |

---

## To Run

```bash
cd "/Users/spencerxu/Desktop/School/Cseed Project/CallCopilot"

# Mobile (Expo Go)
npx expo start
# Open on iPhone via Expo Go (scan QR) or press `i` for iOS Simulator

# Web
npx expo start --web
# Opens at http://localhost:8081
```

---

## Current State (end of session 13)

**Working:**
- ✅ Sign up / log in with Supabase email auth (native + web)
- ✅ First-run onboarding survey (welcome, name, language, use case)
- ✅ Skippable 5-step tutorial overlay with spring animation
- ✅ Full UI localization for 8 languages (all screen text, presets, dialogs)
- ✅ AI responds in selected language (Suggested Reply always English)
- ✅ Language persisted to device, loads instantly on app open
- ✅ Goal Setup screen — language selector, preset chips, solid blue start button
- ✅ Call screen — mic recording, Whisper transcription, AI 5-section response
- ✅ Session auto-saved to Supabase on call end (native only)
- ✅ History tab — browse, expand, and delete past call sessions
- ✅ Sign out with confirmation in user's language
- ✅ Landing page (`landing/index.html`) — deploy via Netlify drag-and-drop
- ✅ **Responsive web app** — works on laptop, iPad, and mobile browser
- ✅ **Sidebar navigation** on tablet/desktop (≥ 768px), replaces bottom tabs
- ✅ **Adaptive layouts** — chips switch from horizontal scroll to wrap grid on wide screens
- ✅ **Web guest mode** — no sign-in required; full call feature works; history empty for guests
- ✅ **TTS on Suggested Reply** — `▶ Speak` / `■ Stop` pill on every response card
- ✅ **Speak for Me** — records user's native language → Whisper → Groq translate → TTS in English
- ✅ **Haptic feedback** — fires on AI response (native only)
- ✅ **Profile screen** — edit name, language, use case
- ✅ **Guest mode** — "Continue as Guest" on auth screen; AuthGuard skips for guests
- ✅ **App renamed LingoLine** — all "CallCopilot" text replaced; `app.json` slug updated to "lingoline"
- ✅ **New logo** — `assets/images/logo.png`: blue globe + speech bubbles (Hi / 你好). Used in auth screen, onboarding, and as app icon/splash/favicon.
- ✅ **Auth screen redesign** — blue gradient top half (logo + name in white) + white form card sliding up from bottom. Wide: centered card with gradient header.
- ✅ **Home screen redesign** — blue-tinted gradient hero section, goal card shadow, colored blue shadow on Start Call button.
- ✅ **Voice selector moved to Settings** — no longer on home screen.
- ✅ **Settings screen** (`/settings`) — voice picker, account info (email + sign out), app version.
- ✅ **Tab bar with icons** — 4 tabs (Home/History/Profile/Settings), Ionicons filled/outline toggle on focus, `explore` hidden.
- ✅ **Richer sidebar** — 260px wide, logo image + wordmark, user info card with email initial avatar, nav items with Ionicons and active blue highlight, Settings link, version at bottom.
- ✅ **Better presets** — 6 realistic US call scenarios (dispute charge, internet outage, reschedule doctor, cancel subscription, lost card, escalate to supervisor).
- ✅ **AuthGuard guest bug fixed** — guard now re-reads `callcopilot_guest` from AsyncStorage on every navigation event; "Continue as Guest" button now works correctly.
- ✅ **Landing page rebranded** — all "CallCopilot" references replaced with "LingoLine"; 📞 emoji logo boxes replaced with the real `logo.png` image in nav and footer; copy updated to reflect 8-language support.
- ✅ **Web audio recording fixed** — `expo-av` Audio.Recording is native-only and silently fails on web. Created `use-audio-recorder.web.ts` and `use-speak-for-me.web.ts` using the browser `MediaRecorder` API (Expo auto-selects `.web.ts` on web). Updated `whisper.ts` to accept `string | Blob` so native passes a file URI and web passes a `Blob` directly.
- ✅ **AI memory of customer replies** — "Speak for Me" translated replies are now recorded into the conversation history. `useCallSession` exposes `recordCustomerReply(text)` which pushes `[Customer replied in English]: "..."` into `history.current`. `useSpeakForMe` (both native and web) accepts an `onSpoken` callback fired with the English text before TTS plays. `call.tsx` passes `recordCustomerReply` as the callback. The AI system prompt was updated to instruct the model to acknowledge previous customer replies and not re-suggest what was already said.
- ✅ **Saved language always first** — Home screen reads `callcopilot_language` from AsyncStorage and renders that language chip first; the other 7 follow in their original order. Applies on every app open and reflects changes saved from Profile.
- ✅ **Use-case-specific presets** — Home screen reads `callcopilot_use_case` and shows 6 presets relevant to the selected category via `PRESETS_BY_USE_CASE` in `constants/i18n.ts`. Healthcare, Banking & Finance, Utilities & Home, and Customer Service each have their own 6-item preset set (each with `en` goal + display label in all 8 languages). "Other" or no selection falls back to the original generic `PRESET_EN` 6.
- ✅ **Auto-listen (👂) feature** — `useVadRecorder` hook (native + web) records 1.5s chunks in a loop. Each chunk is sent to Whisper (temperature=0; prior liveText passed as prompt when non-empty). A `HALLUCINATIONS` blocklist filters known Whisper silence phrases. After 2 consecutive silent/hallucinated chunks (~3s silence), liveText is auto-sent to the AI. Green banner + live text box shows accumulated transcript in near-real-time.
- ✅ **Speaker detection** — System prompt instructs the AI to identify whether captured audio is from the phone agent or the user. User speech → AI responds `SKIP` → `sendCallMessage` returns `null` → entry silently discarded. Prevents accidental analysis of the user's own voice picked up by the mic.
- ✅ **Queue during analysis** — `useCallSession` uses `isLoadingRef` + `pendingRef` queue. Transcripts arriving while the AI is analyzing are buffered and processed sequentially when analysis completes. `isLoading` stays true between queued items — no words are dropped and the UI shows continuous loading.
- ✅ **Robust response parser** — `extractSection()` in `claude.ts` now uses a regex (`\[[^\]]*\/\s*EnglishLabel\]`) instead of exact `indexOf`. Tolerates translated Chinese prefixes for other languages, whitespace around `/`, markdown bold wrapping, and English-only headers. Fixes empty response boxes for non-Chinese languages.
- ✅ **Whisper temperature=0 + contextual prompt** — `transcribeAudio()` always sends `temperature=0` for deterministic output. Passes accumulated `liveText` as `prompt` (VAD only, when non-empty) for context continuity. No default prompt — a generic default causes Whisper to hallucinate continuations of it.
- ✅ **Voice preview in Settings** — Tapping a voice chip immediately plays `"Hello! This is how I sound."` using that voice. Subtitle shows `"▶ Playing preview…"` in blue while playing.

**Known limitations:**
- iOS cannot capture live call audio — user must use speaker mode
- Android live call audio blocked on Android 10+ (OS restriction)
- No in-app API key settings — keys live in `.env.local` only
- Light mode only — dark mode not implemented
- System fonts only — custom font not installed
- No push notifications
- No Google / Apple social sign-in
- API keys exposed in client bundle — need a backend proxy before public launch

---

## Future Features

1. **Backend API proxy** — move Groq key server-side before public launch (highest priority)
2. **Real-time transcription (Option A — planned)** — upgrade the current chunked Whisper approach to truly word-by-word real-time transcription. Two-track plan:
   - **Web**: Replace `useVadRecorder.web.ts` with the browser `SpeechRecognition` API (built-in, free, instant interim results). Show words as they appear.
   - **Native (iOS/Android)**: Add `@react-native-voice/voice` (requires Expo Dev Client, not Expo Go) to use the native OS speech recognizer. Alternatively use Deepgram or AssemblyAI streaming API.
   - Both tracks expose the same `{ state, liveText, error, start, stop }` interface as the current `useVadRecorder` — call.tsx needs no changes beyond swapping the hook.
3. **Dark mode** — full theme refactor across all screens
4. **Social auth** — Google / Apple sign-in via Supabase OAuth
5. **Custom fonts** — `@expo-google-fonts/plus-jakarta-sans` or Inter
6. **In-app API key settings screen**

---

## Claude Code Slash Commands

| Command | Purpose |
|---|---|
| `/research` | Reads this file in full and summarizes current project state. Run at the start of every session. |
| `/wipe-plan` | Clears `Plan/PLAN.md`. Use when starting a fresh planning cycle. |
