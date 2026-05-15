// Color tokens from DESIGN.md / DESIGN-expo.md (Apple Music visual language).
// Includes a few workout-timer-specific kind colors layered on top.

export const colors = {
  // Brand
  red: '#FA2D48',
  coral: '#FC3C44',
  redPressed: '#D4213B',

  // Canvas
  canvas: '#FFFFFF',
  canvasDark: '#000000',

  // Surfaces (light)
  surface1: '#F2F2F7',
  surface2: '#FFFFFF',
  surface3: '#E5E5EA',
  divider: '#C6C6C8',

  // Surfaces (dark)
  surface1Dark: '#1C1C1E',
  surface2Dark: '#2C2C2E',
  surface3Dark: '#3A3A3C',
  dividerDark: '#38383A',

  // Text (light)
  labelPrimary: '#000000',
  labelSecondary: 'rgba(60,60,67,0.60)',
  labelTertiary: 'rgba(60,60,67,0.30)',
  labelQuaternary: 'rgba(60,60,67,0.18)',

  // Text (dark)
  labelPrimaryDark: '#FFFFFF',
  labelSecondaryDark: 'rgba(235,235,245,0.60)',
  labelTertiaryDark: 'rgba(235,235,245,0.30)',
  labelQuaternaryDark: 'rgba(235,235,245,0.18)',

  // Badges
  atmosGold: '#D4A857',
  losslessSilver: '#8E8E93',

  // iOS system
  systemBlue: '#83AF9B',
  systemGreen: '#83AF9B',
  systemRed: '#FC9D9A',
  systemOrange: '#F9CDAD',
} as const;

// Workout-timer segment-kind colors. Kept as a separate map so we can tune
// them independently of the canonical Apple Music token set.
export type SegmentKind = 'prep' | 'work' | 'rest' | 'roundRest' | 'done';

export const segmentColors: Record<SegmentKind, string> = {
  prep: colors.systemBlue,
  work: colors.systemRed,
  rest: colors.systemGreen,
  roundRest: colors.atmosGold,
  done: colors.surface3Dark,
};
