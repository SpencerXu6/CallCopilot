# CallCopilot — Complete Project Comprehension

## What This Project Is

**CallCopilot** is a React Native / Expo mobile app that helps non-native English speakers make English phone calls in the United States. The user enters their goal, then either **records** or **types** what the customer service agent says. The AI responds instantly with a structured 5-section breakdown: understanding, translation, what to do next, a ready-to-speak English reply, and optional notes — all in the user's chosen language.

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
| Gradients | expo-linear-gradient | SDK 54 compatible |
| Secure storage | expo-secure-store | SDK 54 compatible (native only) |
| Async storage | @react-native-async-storage/async-storage | latest |
| Backend / Auth | Supabase (`@supabase/supabase-js`) | latest |
| Language | TypeScript | ~5.9.2 |
| AI (chat) | Groq API — `llama-3.3-70b-versatile` | direct fetch, no SDK |
| AI (transcription) | Groq Whisper — `whisper-large-v3-turbo` | direct fetch, no SDK |

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
- **Web users are guests** — auth is bypassed on web (`Platform.OS === 'web'` check in AuthGuard). They can use the full call feature but history does not save (no user ID).

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

The selected language is passed to:
1. `constants/i18n.ts` → UI text (headings, labels, buttons, presets, dialogs)
2. `services/claude.ts` → AI system prompt (AI responds in the user's language; Suggested Reply is always English)
3. `services/history.ts` → saved with each call session
4. `app/call.tsx` → shown as a badge in the header

---

## File Structure

```
app/
  _layout.tsx          ← Root Stack + AuthGuard (skips auth on web; handles redirects on native)
  auth.tsx             ← /auth — Sign Up / Log In screen (native only, web bypasses this)
  onboarding.tsx       ← /onboarding — 4-step first-run survey (name, language, use case)
  call.tsx             ← /call?goal=...&language=... — Call Assistance screen (MAIN FEATURE)
  modal.tsx            ← /modal — unused scaffold
  (tabs)/
    _layout.tsx        ← Tab group: bottom nav on mobile, hidden on wide (≥768px)
    index.tsx          ← / — Goal Setup screen (responsive)
    history.tsx        ← /history — Saved call sessions (responsive)
    explore.tsx        ← /explore — UNUSED scaffold

services/
  supabase.ts          ← Supabase client; uses localStorage on web, expo-secure-store on native
  claude.ts            ← Groq chat API: sendCallMessage(apiKey, goal, messages, language)
  whisper.ts           ← Groq Whisper API: transcribeAudio(apiKey, uri)
  history.ts           ← Supabase CRUD: saveCallSession(), loadCallSessions(), deleteCallSession()

hooks/
  use-auth.ts          ← useAuth() → { session, user, loading, signIn, signUp, signOut }
  use-call-session.ts  ← useCallSession(goal, language) → { entries, isLoading, error, send }
  use-audio-recorder.ts← useAudioRecorder(apiKey, onTranscript) → { state, error, toggle }
  use-breakpoint.ts    ← useBreakpoint() → { bp, isMobile, isTablet, isDesktop, isWide, width }
  use-color-scheme.ts  ← Re-exports useColorScheme (native)
  use-color-scheme.web.ts ← SSR-safe useColorScheme (web)
  use-theme-color.ts   ← Resolves named color from theme

components/
  call-entry.tsx       ← Shared EntryView + SectionCard (used by call.tsx and history.tsx)
  side-nav.tsx         ← Desktop/tablet sidebar: logo, Home + History links, Sign Out (web only)
  tutorial.tsx         ← TutorialOverlay — animated bottom-sheet tutorial with skip
  (Expo scaffold components — unused)

constants/
  i18n.ts              ← UI text translations for all 8 languages; t(language) helper
  theme.ts             ← Original scaffold colors (not used by redesigned screens)

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
├── auth.tsx           ← /auth  (native only — web skips straight to tabs)
├── onboarding.tsx     ← /onboarding  (shown once after sign-up, gesture back disabled)
├── (tabs)/
│   ├── index.tsx      ← /  (Goal Setup)
│   └── history.tsx    ← /history  (Saved Sessions)
└── call.tsx           ← /call?goal=...&language=...
```

### Auth Guard Logic (`app/_layout.tsx` → `AuthGuard` component)
```
Platform.OS === 'web'  → skip all redirects (guest access)
No session + not on /auth → redirect to /auth
Session + on /auth       → check callcopilot_needs_onboarding
  → 'true'              → redirect to /onboarding
  → else                → redirect to /
Session + not onboarding → check callcopilot_needs_onboarding
  → 'true'              → redirect to /onboarding
```

### Full User Flow (native — first time)
1. App opens → `/auth` (sign up)
2. Sign up success → `callcopilot_needs_onboarding = 'true'`
3. Redirect → `/onboarding` (4-step survey: welcome → name → language → use case)
4. Onboarding complete → saves name + language to AsyncStorage, clears flag → `/`
5. Home screen shows tutorial overlay (5 steps, skippable)
6. Tutorial dismissed → `callcopilot_tutorial_done = 'true'` (never shows again)

### Full User Flow (web)
1. App opens → `/` directly (no auth required)
2. Tutorial overlay shows on first visit
3. User sets language, enters goal, starts call — fully functional
4. History tab shows empty (no user ID, sessions not saved)

---

## Responsive Web Layout

The app is fully responsive across mobile (< 768px), tablet (768–1023px), and desktop (≥ 1024px).

### Breakpoints — `hooks/use-breakpoint.ts`
```ts
useBreakpoint() → { bp, isMobile, isTablet, isDesktop, isWide, width }
// sm: < 768px | md: 768–1023px | lg: ≥ 1024px
// isWide = isTablet || isDesktop
```

### Layout rules per breakpoint

| | Mobile (< 768) | Tablet (768–1023) | Desktop (≥ 1024) |
|---|---|---|---|
| Navigation | Bottom tab bar | Sidebar (220px) | Sidebar (220px) |
| Language chips | Horizontal scroll | Wrap grid | Wrap grid |
| Preset cards | Horizontal scroll | Wrap grid | Wrap grid |
| Hero font | 36px | 36px | 46px |
| Content max-width | Full | 720px centered | 720px centered |
| Call screen max-width | Full | 800px centered | 800px centered |
| Auth card max-width | Full | 480px centered | 480px centered |

### Sidebar — `components/side-nav.tsx`
- Rendered inside `index.tsx` and `history.tsx` when `isWide` is true
- Contains: logo, Home nav item, History nav item, Sign Out button (hidden if no session)
- Bottom tab bar is hidden on wide screens via `tabBarStyle: { display: 'none' }` in `app/(tabs)/_layout.tsx`
- Uses `usePathname()` to highlight the active route

### Centering pattern (used across all wide-screen layouts)
```tsx
// Outer row container
<View style={{ flex: 1, flexDirection: isWide ? 'row' : 'column' }}>
  {isWide && <SideNav />}
  <SafeAreaView style={{ flex: 1 }} edges={isWide ? [] : ['top']}>
    <ScrollView>
      <View style={[styles.inner, isWide && styles.innerWide]}>
        {/* content */}
      </View>
    </ScrollView>
  </SafeAreaView>
</View>

// Styles
inner: { width: '100%' },
innerWide: { maxWidth: 720, alignSelf: 'center' },
```

---

## Web Storage — `services/supabase.ts`

`expo-secure-store` is native-only. On web, auth tokens are stored in `localStorage` directly.
`@react-native-async-storage/async-storage` is NOT used as the Supabase storage adapter on web — it crashes during SSR/module init because it references `window`.

```ts
const StorageAdapter = Platform.OS === 'web'
  ? {
      getItem:    (key) => Promise.resolve(typeof window !== 'undefined' ? localStorage.getItem(key) : null),
      setItem:    (key, value) => Promise.resolve(typeof window !== 'undefined' ? localStorage.setItem(key, value) : undefined),
      removeItem: (key) => Promise.resolve(typeof window !== 'undefined' ? localStorage.removeItem(key) : undefined),
    }
  : {
      getItem:    (key) => SecureStore.getItemAsync(key),
      setItem:    (key, value) => SecureStore.setItemAsync(key, value),
      removeItem: (key) => SecureStore.deleteItemAsync(key),
    };
```

---

## Screen-by-Screen Walkthrough

### Auth Screen — `app/auth.tsx`
- **Native only** — web bypasses this screen entirely
- White background, centered logo (64×64 dark rounded square)
- Segmented tab switcher: **Log In** | **Sign Up** (Slate-50 bg, active tab white with shadow)
- Fields: Email, Password, Confirm Password (sign-up only) — all Slate-50 bg, Slate-100 border, `borderRadius: 14`
- Error box (red) and notice box (green) for feedback
- Sky-blue gradient CTA button
- On wide screens: card centered at `maxWidth: 480`, vertically centered on page
- On sign-up success: sets `callcopilot_needs_onboarding = 'true'`, shows "check your email" notice

---

### Onboarding Screen — `app/onboarding.tsx`

4 steps, progress bar at top, skippable at every step.

| Step | Content |
|---|---|
| 0 — Welcome | Sky-blue gradient header with logo + tagline; feature list (record, understand, reply); "Get Started" button |
| 1 — Name | "What should we call you?" — large text input, skip link |
| 2 — Language | "What's your primary language?" — 2×4 grid of tiles with flag, label in native script, English name, checkmark when selected |
| 3 — Use Case | 5 options with radio buttons: Healthcare, Banking & Finance, Utilities & Home, Customer Service, Other |

On completion: saves `callcopilot_name`, `callcopilot_language`, `callcopilot_use_case`, `callcopilot_needs_onboarding = 'false'` → navigates to `/`.

---

### Goal Setup Screen — `app/(tabs)/index.tsx`

All UI text is driven by `t(language)` from `constants/i18n.ts`.

**Mobile layout (top to bottom):**
1. **Header** — logo box + "CallCopilot" wordmark; profile button (👤) → sign-out alert
2. **Hero** — language-specific headline + personalized subtitle
3. **Language selector** — horizontal-scroll pill chips
4. **Goal input card** — white card `borderRadius: 24`
5. **Common tasks** — horizontal-scroll preset chips
6. **Start Call gradient card** — sky-blue `LinearGradient`, `borderRadius: 32`
7. **Tip text**

**Wide layout (tablet/desktop):**
- Mobile header is hidden; logo lives in the sidebar
- Content constrained to `maxWidth: 720`, centered via `alignSelf: 'center'`
- Language chips and preset cards switch from horizontal scroll → `flexWrap: 'wrap'` grid
- Hero title scales to `fontSize: 46` on desktop (≥ 1024px)

---

### Call Screen — `app/call.tsx`

Route params: `goal` (string) + `language` (string).

**Layout:**
1. **Header** — orange gradient "结束" pill (left); goal text (center); language badge (right)
2. **ScrollView** — conversation entries, auto-scroll to bottom
3. **Recording banner** — red `#FEF2F2` bar while recording
4. **Input bar** — mic + text input + send

On wide screens: entire screen (header + chat + input bar) is constrained to `maxWidth: 800`, centered via `alignSelf: 'center'` inside the `SafeAreaView`.

---

### History Screen — `app/(tabs)/history.tsx`

- Loads sessions on tab focus via `useFocusEffect`
- Pull-to-refresh supported
- Each `SessionCard` shows: language flag, goal text, date, exchange count, language name
- Tap to expand → shows full `EntryView` conversation inline
- 🗑 delete button → confirmation alert → `deleteCallSession(id)` → removes from list
- Empty state: 📋 icon + instructions
- On wide screens: sidebar shown, list constrained to `maxWidth: 760`, centered
- Web guests (no session): `fetchSessions` returns early, empty state shown

---

## Design System

All styling in per-file `StyleSheet.create()`. No NativeWind or global CSS.

### Colors
| Token | Hex | Usage |
|---|---|---|
| Background | `#FFFFFF` | All screens |
| Slate-900 | `#0F172A` | Primary text, logo box |
| Slate-700 | `#1E293B` | Body text in cards |
| Slate-500 | `#64748B` | Secondary text |
| Slate-400 | `#94A3B8` | Placeholder, muted |
| Slate-100 | `#F1F5F9` | Borders |
| Slate-50 | `#F8FAFC` | Input bg, card fills |
| Sky gradient | `#0EA5E9 → #0284C7` | Primary CTA, mic, send |
| Orange gradient | `#FB923C → #F97316` | End call button |
| Red | `#EF4444` | Recording mic |
| Disabled | `#CBD5E1` | Disabled gradient |

### Gradient Button Pattern
```tsx
<Pressable style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}>
  <LinearGradient colors={['#0EA5E9','#0284C7']} style={styles.inner}>
    <Text>Label</Text>
  </LinearGradient>
</Pressable>
// wrapper needs: borderRadius + overflow: 'hidden' for Android clipping
```

### Press Micro-interaction (all tappable elements)
```tsx
pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] }
```

### Shape & Shadow
- Large cards: `borderRadius: 24–32`
- Section/response cards: `borderRadius: 14`
- Chips/pills: `borderRadius: 12–20` or `999`
- Shadow: `shadowOpacity: 0.04`, `shadowRadius: 20`, `shadowOffset: {width:0, height:4}`

---

## Service Layer

### `services/supabase.ts`
Creates the Supabase client. Uses `localStorage` on web, `expo-secure-store` on native. Both are guarded so neither crashes in non-browser environments. Reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

### `services/claude.ts`
`sendCallMessage(apiKey, goal, messages, language = 'Chinese')`
- Language-aware system prompt: all sections respond in user's language; Suggested Reply always English
- Bracket headers (`[理解 / Understanding]` etc.) are fixed for parsing — only content language changes
- `parseResponse(text)` uses `indexOf` on bracket headers to extract sections

### `services/whisper.ts`
`transcribeAudio(apiKey, uri)` — POSTs `audio/m4a` to Groq Whisper, returns transcript string.

### `services/history.ts`
- `saveCallSession(userId, goal, language, entries)` — inserts to `call_sessions` table
- `loadCallSessions(userId)` — fetches all sessions ordered by `created_at DESC`
- `deleteCallSession(sessionId)` — deletes by id

---

## Hooks

### `hooks/use-auth.ts`
```ts
useAuth() → { session, user, loading, signIn, signUp, signOut }
```
Listens to `supabase.auth.onAuthStateChange`. Exposes Supabase auth methods directly.

### `hooks/use-call-session.ts`
```ts
useCallSession(goal: string, language = 'Chinese') → { entries, isLoading, error, send }
```
Passes `language` to `sendCallMessage`. Maintains full conversation `history` ref across exchanges.

### `hooks/use-audio-recorder.ts`
```ts
useAudioRecorder(apiKey, onTranscript) → { state, error, toggle }
```
`state`: `'idle' | 'recording' | 'transcribing'`. On stop: calls Whisper → passes transcript to `onTranscript` → auto-sends to AI.

### `hooks/use-breakpoint.ts`
```ts
useBreakpoint() → { bp, isMobile, isTablet, isDesktop, isWide, width }
// bp: 'sm' | 'md' | 'lg'
// sm: width < 768 | md: 768–1023 | lg: ≥ 1024
// isWide = md || lg — used as the main conditional for sidebar + grid layouts
```
Based on `useWindowDimensions()`. Reactive — updates instantly on window resize.

---

## Shared Components

### `components/call-entry.tsx`
Exports `EntryView` (agent bubble + 5 section cards). Used by both `call.tsx` and `history.tsx`.

### `components/side-nav.tsx`
Desktop/tablet sidebar. Rendered inside `index.tsx` and `history.tsx` when `isWide` is true. Contains logo, nav links (Home, History), and Sign Out button (hidden when no session). Uses `usePathname()` to highlight the active tab.

### `components/tutorial.tsx`
`TutorialOverlay({ steps, currentStep, onNext, onSkip, visible })`
- Renders as a `Modal` with semi-transparent backdrop
- Bottom-sheet card with spring animation (`Animated.spring`)
- Animated progress dots (active dot expands to 20px width)
- "Skip tour" link + sky-blue "Next →" / "Get started ✓" gradient button

---

## i18n System — `constants/i18n.ts`

`UI` object maps language name → `LangStrings` (heroTitle, heroSub, myLanguage, goalTitle, goalSub, goalPlaceholder, commonTasks, ready, startCall, tip, signOutTitle, signOutMessage, signOutConfirm, cancel, presets[6]).

`PRESET_EN[]` — the 6 English goal strings sent to the AI (language-independent).

`t(language: string): LangStrings` — helper that falls back to Chinese if language not found.

---

## Bottom Navigation — `app/(tabs)/_layout.tsx`

Two tabs:
- **HOME** 🏠 — `app/(tabs)/index.tsx`
- **HISTORY** 🕐 — `app/(tabs)/history.tsx`

Tab bar: `rgba(255,255,255,0.98)` bg, Slate-100 top border, active tint `#0F172A`, inactive `#94A3B8`, label `fontSize: 10`, `fontWeight: '700'`, `letterSpacing: 1.2`, uppercase via `textTransform`. Height: 84px iOS / 64px Android with safe-area padding.

**On wide screens (≥ 768px):** tab bar is hidden via `tabBarStyle: { display: 'none' }`. Navigation is handled by `SideNav` rendered inside each tab screen.

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

## Current State (end of session 4)

**Working:**
- ✅ Sign up / log in with Supabase email auth (native only)
- ✅ First-run onboarding survey (welcome, name, language, use case)
- ✅ Skippable 5-step tutorial overlay with spring animation
- ✅ Full UI localization for 8 languages (all screen text, presets, dialogs)
- ✅ AI responds in selected language (Suggested Reply always English)
- ✅ Language persisted to device, loads instantly on app open
- ✅ Goal Setup screen — language selector, preset chips, gradient start card
- ✅ Call screen — mic recording, Whisper transcription, AI 5-section response
- ✅ Session auto-saved to Supabase on call end (best-effort, native only)
- ✅ History tab — browse, expand, and delete past call sessions
- ✅ Bottom navigation — HOME + HISTORY tabs
- ✅ Sign out with confirmation in user's language
- ✅ Landing page (`landing/index.html`) — deploy via Netlify drag-and-drop
- ✅ **Responsive web app** — works on laptop, iPad, and mobile browser
- ✅ **Sidebar navigation** on tablet/desktop (≥ 768px), replaces bottom tabs
- ✅ **Adaptive layouts** — language + preset chips switch from horizontal scroll to wrap grid on wide screens
- ✅ **Web guest mode** — no sign-in required on web; full call feature works; history empty for guests
- ✅ **Web-safe auth storage** — `localStorage` on web, `expo-secure-store` on native
- ✅ **SPA web output** — `app.json` `web.output: "single"` prevents SSR crashes

**Known limitations:**
- iOS cannot capture live call audio — user must use speaker mode
- Android live call audio also blocked on Android 10+ (OS restriction, not a bug)
- No in-app API key settings — keys live in `.env.local` only
- Light mode only — dark mode not implemented
- System fonts only — General Sans / Satoshi not installed
- No push notifications
- No Google / Apple social sign-in
- Web guests cannot save history (no Supabase session); auth on web not wired up yet
- API keys exposed in client bundle — need a backend proxy before public launch

---

## Future Features

1. **Web auth** — wire up Supabase email sign-in for web users (sign-up flow currently bypassed)
2. **Copy to clipboard** — "Suggested Reply" card copy button (`expo-clipboard`)
3. **Custom fonts** — `@expo-google-fonts/plus-jakarta-sans` + `@expo-google-fonts/inter` loaded in `_layout.tsx`
4. **Haptic feedback** on AI response arrival (`expo-haptics`)
5. **Social auth** — Google / Apple sign-in via Supabase OAuth
6. **In-app API key settings screen**
7. **Dark mode**
8. **Android continuous listen mode** — auto-loop recording in chunks
9. **Profile screen** — edit name, language, use case; view account info
10. **Backend API proxy** — move Groq key server-side before public launch

---

## Claude Code Slash Commands

| Command | Purpose |
|---|---|
| `/research` | Reads this file in full and summarizes current project state. Run at the start of every session. |
| `/wipe-plan` | Clears `Plan/PLAN.md`. Use when starting a fresh planning cycle. |
