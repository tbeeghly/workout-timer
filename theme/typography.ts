// Typography tokens from DESIGN.md / DESIGN-expo.md.
// Plus a workout-timer-specific "display" style for the giant MM:SS countdown.

import type { TextStyle } from 'react-native';

export const typography = {
  largeTitle: { fontSize: 34, lineHeight: 37, fontWeight: '700' as const, letterSpacing: 0.37 },
  title1: { fontSize: 28, lineHeight: 32, fontWeight: '700' as const, letterSpacing: 0.36 },
  heroListen: { fontSize: 24, lineHeight: 29, fontWeight: '700' as const, letterSpacing: -0.2 },
  title2: { fontSize: 22, lineHeight: 26, fontWeight: '700' as const, letterSpacing: -0.26 },
  title3: { fontSize: 20, lineHeight: 24, fontWeight: '600' as const, letterSpacing: -0.15 },
  nowPlaying: { fontSize: 18, lineHeight: 22, fontWeight: '600' as const, letterSpacing: -0.1 },
  headline: { fontSize: 17, lineHeight: 21, fontWeight: '600' as const, letterSpacing: -0.43 },
  body: { fontSize: 17, lineHeight: 25, fontWeight: '400' as const, letterSpacing: -0.43 },
  callout: { fontSize: 16, lineHeight: 20, fontWeight: '400' as const, letterSpacing: -0.32 },
  subheadline: { fontSize: 15, lineHeight: 20, fontWeight: '400' as const, letterSpacing: -0.24 },
  footnote: { fontSize: 13, lineHeight: 17, fontWeight: '400' as const, letterSpacing: -0.08 },
  caption1: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  caption2: { fontSize: 11, lineHeight: 13, fontWeight: '400' as const, letterSpacing: 0.07 },

  button: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const, letterSpacing: -0.43 },
  tabLabel: { fontSize: 10, lineHeight: 12, fontWeight: '500' as const, letterSpacing: -0.24 },

  // Workout-timer addition: the giant MM:SS countdown in the runner header.
  display: { fontSize: 72, lineHeight: 76, fontWeight: '700' as const, letterSpacing: -2 },
  displaySm: { fontSize: 44, lineHeight: 48, fontWeight: '700' as const, letterSpacing: -1 },
} satisfies Record<string, TextStyle>;
