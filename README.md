# Workout Timer

Apple Music–styled interval / round-based workout timer. Ships as iOS / Android (Expo) and an installable PWA via Expo's static web export.

## Stack

- Expo SDK 51 + React Native 0.74 + TypeScript
- Expo Router (file-based routing)
- React Native Reanimated, expo-linear-gradient, expo-blur
- AsyncStorage for persistence
- Web Audio API for cue sounds (web)
- expo-keep-awake / `navigator.wakeLock` for screen-on during runs

## Develop

```pwsh
npm install
npm run web         # browser dev server
npm run ios         # iOS simulator (Mac only)
npm run android     # Android emulator
```

## Build the PWA

```pwsh
npm run build:web   # outputs to ./dist
```

Open `dist/index.html` via any static server.

## Deploy to GitHub Pages

A workflow at `.github/workflows/deploy-web.yml` builds and deploys `dist/` to
GitHub Pages on every push to `main`. The site lives at
`https://<user>.github.io/workout-timer/` — the base path is configured in
`app.json` under `experiments.baseUrl`.

To enable in your repo:
1. Settings → Pages → Source: **GitHub Actions**.
2. Push to `main`.

## Project layout

```
app/                Expo Router screens (index, edit/[id], run/[id])
components/         Reusable UI (SegmentStack, RunnerHeader, ...)
src/                Domain logic: types, storage, timer engine, audio, expand
theme/              Color tokens, typography, useTheme()
assets/             Placeholder icon/splash/favicon
```

## Features (v1)

- Build a workout: name, prep, rounds, round-rest, ordered exercises with work/rest seconds.
- Vertically-stacked segment runner with height proportional to duration.
- Live MM:SS countdown, total remaining, color per segment kind.
- Auto-scrolls past segments out of view; user can drag freely.
- Audio cues on transitions + 3/2/1 countdown ticks (web; native is a future pass).
- Haptics on native (tick / transition / completion).
- Wake lock keeps the screen on during a run.
- Workouts persist via AsyncStorage; installable as a PWA.
