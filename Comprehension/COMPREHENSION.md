# CallCopilot — Complete Project Comprehension

## What This Project Is

**CallCopilot** is a React Native / Expo mobile app. As of the time of this document, it is in its **initial scaffold state** — the Expo template has been set up and customized with theming/fonts, but the actual "CallCopilot" product feature has not been implemented yet. `Plan/PLAN.md` and this file exist as placeholders awaiting content.

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
| Animation Workers | react-native-worklets | 0.5.1 |
| Icons (iOS) | expo-symbols (native SF Symbols) | ~1.0.8 |
| Icons (Android/Web) | @expo/vector-icons (MaterialIcons) | ^15.0.3 |
| Language | TypeScript | ~5.9.2 |
| Linting | ESLint + eslint-config-expo | ^9 / ~10 |

**Architecture flags:**
- `newArchEnabled: true` — React Native New Architecture (JSI, no bridge)
- `experiments.reactCompiler: true` — React Compiler auto-memoization
- `experiments.typedRoutes: true` — Type-safe routing via generated `.expo/types/router.d.ts`

---

## app.json — Configuration

```
name/slug: CallCopilot
version: 1.0.0
orientation: portrait
scheme: callcopilot          ← deep link URL scheme: callcopilot://
userInterfaceStyle: automatic  ← supports light + dark
```

**iOS**: `supportsTablet: true`

**Android**:
- `edgeToEdgeEnabled: true` — content renders behind system bars
- `predictiveBackGestureEnabled: false`
- Adaptive icon: separate foreground / background / monochrome images; background color `#E6F4FE`

**Web**: `output: "static"` — generates static HTML (suitable for CDN deployment)

**Plugins**: `expo-router`, `expo-splash-screen` (white bg light / black bg dark, splash image 200px wide)

---

## File Structure

```
app/
  _layout.tsx          ← Root Stack navigator + ThemeProvider
  modal.tsx            ← /modal route (modal presentation)
  (tabs)/
    _layout.tsx        ← Tab bar navigator
    index.tsx          ← / (Home tab)
    explore.tsx        ← /explore (Explore tab)

components/
  parallax-scroll-view.tsx   ← Animated scrollview with parallax header
  themed-text.tsx            ← Theme-aware Text wrapper
  themed-view.tsx            ← Theme-aware View wrapper
  haptic-tab.tsx             ← Tab bar button with iOS haptic feedback
  hello-wave.tsx             ← Animated waving hand emoji
  external-link.tsx          ← Link that opens in-app browser on native
  ui/
    collapsible.tsx            ← Expand/collapse accordion component
    icon-symbol.ios.tsx        ← SF Symbols (iOS only)
    icon-symbol.tsx            ← MaterialIcons fallback (Android/Web)

constants/
  theme.ts             ← Colors + Fonts constants

hooks/
  use-color-scheme.ts         ← Re-exports useColorScheme from react-native (native)
  use-color-scheme.web.ts     ← SSR-safe useColorScheme for web (web platform override)
  use-theme-color.ts          ← Resolves a named color from the current theme

Comprehension/
  COMPREHENSION.md     ← This file

Plan/
  PLAN.md              ← Planning document (empty placeholder)
```

---

## Routing Architecture

expo-router maps the filesystem directly to URL routes. The `.expo/types/router.d.ts` file (auto-generated) provides type-safe `href` values for all routes.

**Defined routes:**
| File | Route |
|---|---|
| `app/(tabs)/index.tsx` | `/` or `/(tabs)` |
| `app/(tabs)/explore.tsx` | `/explore` or `/(tabs)/explore` |
| `app/modal.tsx` | `/modal` |
| *(auto)* | `/_sitemap` |

---

## Screen-by-Screen Walkthrough

### Root Layout — `app/_layout.tsx`

```tsx
export const unstable_settings = { anchor: '(tabs)' };
```
This tells expo-router that `(tabs)` is the default group when navigating to `/`.

The component:
1. Reads `colorScheme` with `useColorScheme()`
2. Wraps everything in `<ThemeProvider>` — toggles between `DarkTheme` / `DefaultTheme` from @react-navigation
3. Creates a `<Stack>` with two screens:
   - `(tabs)`: header hidden (tabs have their own chrome)
   - `modal`: `presentation: 'modal'`, title "Modal"
4. Renders `<StatusBar style="auto">` (adapts automatically)
5. Side-effect import of `react-native-reanimated` is required for reanimated to initialize

---

### Tab Layout — `app/(tabs)/_layout.tsx`

Creates a bottom tab navigator with:
- `tabBarActiveTintColor`: from `Colors[colorScheme].tint`
- `headerShown: false`
- `tabBarButton: HapticTab` — replaces all tab buttons with the haptic-feedback version

Two tabs:
1. **Home** (`index`) — icon `house.fill`
2. **Explore** (`explore`) — icon `paperplane.fill`

---

### Home Screen — `app/(tabs)/index.tsx`

Renders a `ParallaxScrollView` with the React logo image as the header (light `#A1CEDC`, dark `#1D3D47`).

Content sections:
1. `ThemedText type="title"` "Welcome!" + `HelloWave` component side by side
2. A `Link href="/modal"` with a context menu:
   - `Link.Trigger` wraps the "Step 2: Explore" subtitle — tap opens modal, long-press shows menu
   - `Link.Menu` contains actions: "Action", "Share", and a nested "More" submenu with destructive "Delete"
3. Step 3 text explaining `npm run reset-project`

Developer tools key hint is `Platform.select`-driven: `cmd+d` iOS, `cmd+m` Android, `F12` web.

---

### Explore Screen — `app/(tabs)/explore.tsx`

Renders a `ParallaxScrollView` with a large `IconSymbol` (`chevron.left.forwardslash.chevron.right`, size 310, gray `#808080`) as the header (light `#D0D0D0`, dark `#353636`).

Title "Explore" uses `fontFamily: Fonts.rounded`.

Five `Collapsible` sections:
1. **File-based routing** — points to the two files and layout; links to expo-router docs
2. **Android, iOS, and web support** — how to open web (press `w`)
3. **Images** — `@2x`/`@3x` density suffixes; shows react-logo.png; links to RN images docs
4. **Light and dark mode components** — explains `useColorScheme()`; links to expo color themes docs
5. **Animations** — mentions `HelloWave` and reanimated; iOS-only text about parallax scroll view

---

### Modal Screen — `app/modal.tsx`

Simple centered screen:
- `ThemedText type="title"` "This is a modal"
- `Link href="/" dismissTo` — navigates home AND dismisses the modal

---

## Component Reference

### `ParallaxScrollView` — `components/parallax-scroll-view.tsx`

**Props**: `children`, `headerImage: ReactElement`, `headerBackgroundColor: { dark: string; light: string }`

```
HEADER_HEIGHT = 250
```

Uses `useAnimatedRef<Animated.ScrollView>()` + `useScrollOffset(scrollRef)` to track scroll position in a shared value (runs on UI thread via reanimated).

`useAnimatedStyle` computes the header's transform at every scroll tick:
- `translateY`: interpolates scroll `[-250, 0, 250]` → `[-125, 0, 187.5]`
  - Pulling down (negative scroll): header moves up by half the pull distance
  - Scrolling up (positive scroll): header moves down 75% of scroll distance
- `scale`: interpolates `[-250, 0, 250]` → `[2, 1, 1]`
  - Pulling down zooms the header in (scale 2x at max pull)

The `Animated.ScrollView` uses `scrollEventThrottle={16}` (~60fps updates).

---

### `ThemedText` — `components/themed-text.tsx`

Thin wrapper around RN `Text`. Resolves color via `useThemeColor` using `lightColor`/`darkColor` props (if provided) or falls back to `Colors[theme].text`.

**`type` prop styles:**

| type | fontSize | lineHeight | fontWeight | color |
|---|---|---|---|---|
| `default` | 16 | 24 | — | theme text |
| `defaultSemiBold` | 16 | 24 | 600 | theme text |
| `title` | 32 | 32 | bold | theme text |
| `subtitle` | 20 | — | bold | theme text |
| `link` | 16 | 30 | — | `#0a7ea4` hardcoded |

---

### `ThemedView` — `components/themed-view.tsx`

Thin wrapper around RN `View`. Sets `backgroundColor` from `useThemeColor` (falls back to `Colors[theme].background`). Accepts optional `lightColor`/`darkColor` overrides.

---

### `HapticTab` — `components/haptic-tab.tsx`

Replaces the default tab bar button. Wraps `PlatformPressable` from `@react-navigation/elements`. On `onPressIn`, if `process.env.EXPO_OS === 'ios'`, fires `Haptics.impactAsync(ImpactFeedbackStyle.Light)`. Then calls the original `props.onPressIn`. All other props are passed through.

---

### `HelloWave` — `components/hello-wave.tsx`

An `Animated.Text` that renders 👋 with an auto-playing CSS-like animation using reanimated v4's `animationName` API:
```js
animationName: { '50%': { transform: [{ rotate: '25deg' }] } },
animationIterationCount: 4,
animationDuration: '300ms',
```
The emoji rotates 25° at the midpoint, 4 times, each cycle 300ms. Plays on mount, no interactivity.

---

### `ExternalLink` — `components/external-link.tsx`

Wraps expo-router `Link` with `target="_blank"`. On native (`EXPO_OS !== 'web'`), intercepts `onPress`, prevents default behavior, and opens the URL in an in-app browser via `expo-web-browser`'s `openBrowserAsync` with `presentationStyle: AUTOMATIC`. On web, behaves like a normal `<a target="_blank">`.

---

### `Collapsible` — `components/ui/collapsible.tsx`

**Props**: `children`, `title: string`

Internal `isOpen` state, toggled via `TouchableOpacity`. Shows a `chevron.right` icon rotated 90° when open. Uses inline `transform: [{ rotate: isOpen ? '90deg' : '0deg' }]`. Children are conditionally rendered (not animated). Layout: `flexDirection: 'row'` for the heading; children indented `marginLeft: 24`.

---

### `IconSymbol` — platform-split component

**iOS** (`icon-symbol.ios.tsx`): Uses `SymbolView` from `expo-symbols` (native SF Symbols). Renders a view with `width/height = size`, `tintColor = color`, `resizeMode: "scaleAspectFit"`. Supports `weight` prop (`regular` by default).

**Android/Web** (`icon-symbol.tsx`): Uses `MaterialIcons` from `@expo/vector-icons`. Name is looked up in the `MAPPING` constant:

```ts
const MAPPING = {
  'house.fill':                          'home',
  'paperplane.fill':                     'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right':                       'chevron-right',
};
```

The `weight` prop is accepted in the type signature but ignored (no equivalent in MaterialIcons). Adding a new icon requires adding an entry to this mapping.

---

## Constants — `constants/theme.ts`

### `Colors`

```ts
Colors.light = { text: '#11181C', background: '#fff', tint: '#0a7ea4', icon: '#687076', tabIconDefault: '#687076', tabIconSelected: '#0a7ea4' }
Colors.dark  = { text: '#ECEDEE', background: '#151718', tint: '#fff', icon: '#9BA1A6', tabIconDefault: '#9BA1A6', tabIconSelected: '#fff' }
```

### `Fonts`

Platform-selected font family strings:

| key | iOS | Web | Android (default) |
|---|---|---|---|
| `sans` | `system-ui` | Full system-ui stack | `normal` |
| `serif` | `ui-serif` | Georgia stack | `serif` |
| `rounded` | `ui-rounded` | SF Pro Rounded stack | `normal` |
| `mono` | `ui-monospace` | SFMono-Regular stack | `monospace` |

`Fonts.rounded` is used in the Explore screen title to render in Apple's rounded system font on iOS.

---

## Hooks

### `use-color-scheme` (native) — `hooks/use-color-scheme.ts`

```ts
export { useColorScheme } from 'react-native';
```

Simple re-export. Returns `'light'`, `'dark'`, or `null`.

### `use-color-scheme.web` (web override) — `hooks/use-color-scheme.web.ts`

Expo loads `.web.ts` files on web instead of the base `.ts` file. This version guards against SSR hydration mismatches:
- `hasHydrated` starts as `false`; set to `true` on the first `useEffect` (client-only)
- Before hydration: returns `'light'` (safe default for static rendering)
- After hydration: returns the real `useRNColorScheme()` value

This is required for `web: { output: "static" }` builds.

### `use-theme-color` — `hooks/use-theme-color.ts`

```ts
useThemeColor(props: { light?: string; dark?: string }, colorName: keyof Colors.light) → string
```

Priority: `props[currentTheme]` (component override) → `Colors[currentTheme][colorName]` (global default).

---

## NPM Scripts

| Script | Command | Purpose |
|---|---|---|
| `start` | `expo start` | Start dev server (all platforms) |
| `ios` | `expo start --ios` | Start + open iOS simulator |
| `android` | `expo start --android` | Start + open Android emulator |
| `web` | `expo start --web` | Start + open browser |
| `lint` | `expo lint` | Run ESLint |
| `reset-project` | `node ./scripts/reset-project.js` | Move current `app/` to `app-example/`, create blank `app/` |

---

## TypeScript & Type Safety

- `expo-env.d.ts` — auto-generated Expo type reference (gitignored, do not edit)
- `.expo/types/router.d.ts` — auto-generated by `typedRoutes` experiment; augments `expo-router`'s `ExpoRouter.__routes` interface with the actual app routes, enabling type checking on `href` values at compile time

---

## VSCode Setup

- **`.vscode/settings.json`**: On save → auto-fix ESLint, organize imports, sort members
- **`.vscode/extensions.json`**: Recommends `expo.vscode-expo-tools` (Expo VSCode extension)

---

## Expo Dev Server Settings (`.expo/settings.json`)

```json
{ "hostType": "lan", "lanType": "ip", "dev": true, "minify": false, "urlRandomness": null, "https": false }
```

LAN mode with IP-based URLs; dev mode on; no minification; no HTTPS. These are local dev preferences, gitignored.

---

## Key Architectural Patterns

1. **Platform file splitting**: Expo resolves `.ios.tsx`, `.web.ts`, etc. at build time. Used for `IconSymbol` (native SF Symbols vs MaterialIcons) and `use-color-scheme` (SSR-safe web vs native).

2. **Theme propagation**: React Navigation `ThemeProvider` at the root drives `DarkTheme`/`DefaultTheme`. Components opt in via `useColorScheme()` → `useThemeColor()` → `Colors[theme][key]`.

3. **Reanimated v4 animation API**: `HelloWave` uses the declarative CSS-like `animationName` object syntax (new in reanimated v4). `ParallaxScrollView` uses the worklet-based `useAnimatedStyle` + `useScrollOffset` pattern (runs on UI thread).

4. **New Architecture + React Compiler**: Both enabled. This means no bridge, direct JS↔Native via JSI, and automatic memoization. Avoid manual `useMemo`/`useCallback` unless profiling shows a need.

5. **expo-router Link context menus**: `app/(tabs)/index.tsx` demonstrates the `Link.Trigger` / `Link.Preview` / `Link.Menu` / `Link.MenuAction` API for native context menus on long-press.

---

## Current State

This is a **fresh Expo scaffold**. No actual CallCopilot business logic exists yet. The screen content is all Expo template placeholder text ("Welcome!", "Step 1: Try it", etc.). The project is ready for feature development — the infrastructure (routing, theming, icons, animations) is fully set up.

To build the actual app, `app/(tabs)/index.tsx` and `app/(tabs)/explore.tsx` should be replaced with real screens, and additional routes/screens added as needed.
