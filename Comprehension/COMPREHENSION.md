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
- `#F2F2F7` background
- Logo: 60×60 black rounded square with white "C" lettermark + "CallCopilot" wordmark below
- Segmented control: `rgba(120,120,128,0.12)` bg, white active tab with subtle shadow — iOS-native feel
- Fields: single white rounded card (`borderRadius: 12`), Email and Password rows separated by `#E5E5EA` hairline. No field labels — placeholders only
- Error/notice: inline colored text below the field card, no box
- Solid `#007AFF` CTA button, `borderRadius: 12`, 17px semibold
- On wide screens: inner content constrained to `maxWidth: 400`, centered
- On sign-up success: sets `callcopilot_needs_onboarding = 'true'`, shows green notice text inline

---

### Onboarding Screen — `app/onboarding.tsx`

4 steps, 2px progress bar at top (`#007AFF` fill on `#E5E5EA` track), skippable at every step.

| Step | Content |
|---|---|
| 0 — Welcome | `#F2F2F7` bg. Black "C" logo mark, 34px bold title, body text, 3-item feature list (dot + title + desc). Solid `#007AFF` "Get Started" button pinned to bottom |
| 1 — Name | Large 34px title, white field card with single `TextInput`, Continue + Skip buttons |
| 2 — Language | 2×4 grid of white tiles (`borderRadius: 14`). Active tile: `#007AFF` border + `rgba(0,122,255,0.06)` fill + blue label text. No checkmark badge |
| 3 — Use Case | White grouped card, 5 rows with label + sub text + radio circle. Rows separated by hairline dividers. Radio: `#007AFF` when active |

**Removed from onboarding:** gradient welcome header, emoji icons on use-case rows, "Step N of 3" eyebrow text (replaced by progress bar), checkmark badge on language tiles.

On completion: saves `callcopilot_name`, `callcopilot_language`, `callcopilot_use_case`, `callcopilot_needs_onboarding = 'false'` → navigates to `/`.

---

### Goal Setup Screen — `app/(tabs)/index.tsx`

All UI text is driven by `t(language)` from `constants/i18n.ts`.

**Mobile layout (top to bottom):**
1. **Header** — "CallCopilot" wordmark (20px bold) + "Sign Out" text button in `#FF3B30`
2. **Hero** — 34px bold language-specific title + personalized subtitle in `#6E6E73`
3. **Language selector** — section label + horizontal-scroll pill chips. Inactive: white pill. Active: `#007AFF` border + blue tinted fill + blue text
4. **Goal input** — white rounded card (`borderRadius: 14`) with a plain `TextInput`, no title above
5. **Common tasks** — section label + horizontal-scroll preset pills. Active: solid `#007AFF` fill + white text
6. **Start Call** — full-width solid `#007AFF` button, `borderRadius: 14`, 17px semibold

**Removed:** gradient start card, `📞` emoji icon box, `👤` profile button, "tip" text at bottom.

**Wide layout (tablet/desktop):**
- Mobile header hidden; wordmark lives in `SideNav`
- Content constrained to `maxWidth: 680`, centered
- Language chips and preset chips switch from horizontal scroll → `flexWrap: 'wrap'` grid
- Hero title scales to `fontSize: 44` on desktop (≥ 1024px)

---

### Call Screen — `app/call.tsx`

Route params: `goal` (string) + `language` (string).

**Layout:**
1. **Header** — "End" pill button in `#FF3B30` (left, replaces hardcoded "结束"); goal text in `#6E6E73` (center); language badge in `rgba(120,120,128,0.12)` fill (right). Hairline bottom border
2. **ScrollView** — `#F2F2F7` bg, conversation entries, auto-scroll to bottom
3. **Recording banner** — `rgba(255,59,48,0.06)` bg + `#FF3B30` dot + text when recording
4. **Input bar** — mic button (gray fill, red tint when recording) + white rounded `TextInput` + solid `#007AFF` send pill

**End button:** was hardcoded `"结束"` (Chinese) — now shows `"End"` in English for all users.

On wide screens: entire screen constrained to `maxWidth: 800`, centered.

---

### History Screen — `app/(tabs)/history.tsx`

- `#F2F2F7` background
- 34px bold "History" large title + session count in `#AEAEB2` at top right
- Loads sessions on tab focus via `useFocusEffect`
- Pull-to-refresh supported
- Each `SessionCard`: white rounded card (`borderRadius: 14`), flag + goal + date/exchange count meta. Delete text button in `#FF3B30` + `›` chevron disclosure indicator
- Tap card to expand → shows full `EntryView` conversation inline, separated by hairline
- Delete → confirmation alert → `deleteCallSession(id)` → removes from list
- Empty state: white circle + 📋 emoji + plain instructions (references "End" not "结束")
- On wide screens: sidebar shown, list constrained to `maxWidth: 720`, centered
- Web guests (no session): `fetchSessions` returns early, empty state shown

---

## Design System

All styling in per-file `StyleSheet.create()`. No NativeWind or global CSS.
Apple Human Interface Guidelines–inspired. Zero gradients, zero emoji chrome.

### Colors
| Token | Hex | Usage |
|---|---|---|
| System BG | `#F2F2F7` | All screen backgrounds |
| Card | `#FFFFFF` | All card/surface backgrounds |
| Accent | `#007AFF` | Primary buttons, active states, links |
| Accent light | `rgba(0,122,255,0.08)` | Active chip/tile fill |
| Text primary | `#000000` | Headings, body |
| Text secondary | `#6E6E73` | Sub-labels, descriptions |
| Text tertiary | `#AEAEB2` | Placeholders, metadata, muted |
| Separator | `#E5E5EA` | Hairline dividers between list rows |
| Fill | `rgba(120,120,128,0.12)` | Segmented control bg, mic button |
| Danger | `#FF3B30` | End call, delete, sign out, errors |
| Success | `#34C759` | Auth notice / confirmation |
| Recording tint | `rgba(255,59,48,0.06)` | Recording banner bg |

### Button Pattern (solid, no gradients)
```tsx
<Pressable
  style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
  <Text style={styles.btnText}>Label</Text>
</Pressable>

btn: { backgroundColor: '#007AFF', borderRadius: 14, paddingVertical: 16, alignItems: 'center' }
btnText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' }
pressed: { opacity: 0.7 }
```

### Press Micro-interaction (all tappable elements)
```tsx
pressed: { opacity: 0.7 }
```
No scale transform — Apple's own controls use opacity only.

### Shape
- Screen cards / grouped forms: `borderRadius: 12–14`
- Large content cards: `borderRadius: 16`
- Pills / chips: `borderRadius: 999`
- Language tiles: `borderRadius: 14`
- No box shadows — depth comes from `#FFFFFF` cards on `#F2F2F7` background

### Segmented Control Pattern (auth screen, iOS-native feel)
```tsx
segmentedRow: { backgroundColor: 'rgba(120,120,128,0.12)', borderRadius: 11, padding: 2 }
segment: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' }
segmentActive: { backgroundColor: '#FFFFFF', shadowOpacity: 0.06, shadowRadius: 4 }
```

### Grouped List Row Pattern (onboarding use-cases, auth fields)
```tsx
// White card, rows separated by hairline dividers starting at 16px left indent
fieldCard: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }
fieldSep: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E5EA', marginLeft: 16 }
```

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
Exports `EntryView`. Used by both `call.tsx` and `history.tsx`.

Structure per entry:
1. **Agent bubble** — `#E5E5EA` gray rounded bubble (`borderRadius: 18`, `borderBottomLeftRadius: 4`), left-aligned, max 86% width. iMessage-style received message.
2. **Response card** — single white card (`borderRadius: 16`) with 4–5 sections separated by `#E5E5EA` hairline dividers:
   - `UNDERSTANDING` — body text `#000000`
   - `TRANSLATION` — body text `#000000`
   - `WHAT TO DO NEXT` — body text `#000000`
   - `SUGGESTED REPLY` — **`#007AFF` bold 16px** — visually dominant as the primary action
   - `NOTES` (optional) — `#6E6E73` muted text

**Removed:** all colored section backgrounds (blue/green/orange/teal), left border accents, "AGENT SAID" label above bubble, separate card per section.

### `components/side-nav.tsx`
Desktop/tablet sidebar (`width: 200`). `#F2F2F7` bg, hairline right border.
- "CallCopilot" text wordmark only — no emoji logo box
- Nav links: text-only, active = `#007AFF` bold, inactive = `#6E6E73`
- "Sign Out" in `#FF3B30` pinned to bottom (hidden when no session)
- Uses `usePathname()` to highlight active route

### `components/tutorial.tsx`
`TutorialOverlay({ steps, currentStep, onNext, onSkip, visible })`
- `Modal` with `rgba(0,0,0,0.32)` backdrop
- Bottom-sheet white card (`borderTopRadius: 24`) with spring animation
- Gray drag handle at top
- Animated progress dots: active dot expands to 18px width in `#007AFF`
- "Skip" link in `#AEAEB2` + solid `#007AFF` "Next" / "Get started" button

---

## i18n System — `constants/i18n.ts`

`UI` object maps language name → `LangStrings` (heroTitle, heroSub, myLanguage, goalTitle, goalSub, goalPlaceholder, commonTasks, ready, startCall, tip, signOutTitle, signOutMessage, signOutConfirm, cancel, presets[6]).

`PRESET_EN[]` — the 6 English goal strings sent to the AI (language-independent).

`t(language: string): LangStrings` — helper that falls back to Chinese if language not found.

---

## Bottom Navigation — `app/(tabs)/_layout.tsx`

Two tabs:
- **Home** — `app/(tabs)/index.tsx`
- **History** — `app/(tabs)/history.tsx`

Tab bar: `rgba(242,242,247,0.94)` translucent bg, `#C6C6C8` hairline top border. Active tint `#007AFF`, inactive `#8E8E93`. Label `fontSize: 11`, `fontWeight: '500'`. No icons — labels only (`tabBarShowIcon: false`). Height: 83px iOS / 60px Android.

**On wide screens (≥ 768px):** tab bar is hidden. Navigation handled by `SideNav` rendered inside each tab screen.

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

## Current State (end of session 5)

**Working:**
- ✅ Sign up / log in with Supabase email auth (native only)
- ✅ First-run onboarding survey (welcome, name, language, use case)
- ✅ Skippable 5-step tutorial overlay with spring animation
- ✅ Full UI localization for 8 languages (all screen text, presets, dialogs)
- ✅ AI responds in selected language (Suggested Reply always English)
- ✅ Language persisted to device, loads instantly on app open
- ✅ Goal Setup screen — language selector, preset chips, solid blue start button
- ✅ Call screen — mic recording, Whisper transcription, AI 5-section response
- ✅ Session auto-saved to Supabase on call end (best-effort, native only)
- ✅ History tab — browse, expand, and delete past call sessions
- ✅ Bottom navigation — Home + History tabs
- ✅ Sign out with confirmation in user's language
- ✅ Landing page (`landing/index.html`) — deploy via Netlify drag-and-drop
- ✅ **Responsive web app** — works on laptop, iPad, and mobile browser
- ✅ **Sidebar navigation** on tablet/desktop (≥ 768px), replaces bottom tabs
- ✅ **Adaptive layouts** — language + preset chips switch from horizontal scroll to wrap grid on wide screens
- ✅ **Web guest mode** — no sign-in required on web; full call feature works; history empty for guests
- ✅ **Web-safe auth storage** — `localStorage` on web, `expo-secure-store` on native
- ✅ **SPA web output** — `app.json` `web.output: "single"` prevents SSR crashes
- ✅ **Apple-style UI redesign** — full redesign of all 9 screens/components (session 5)

**Known limitations:**
- iOS cannot capture live call audio — user must use speaker mode
- Android live call audio also blocked on Android 10+ (OS restriction, not a bug)
- No in-app API key settings — keys live in `.env.local` only
- Light mode only — dark mode not implemented
- System fonts only — custom font not installed
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
