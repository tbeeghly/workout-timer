// Semantic color tokens for the workout timer.
//
// Two layers:
//   `colors` — palette-agnostic neutrals (canvas, surfaces, text). Static.
//   `palettes` — accent + workout-kind colors keyed by PaletteId. Switchable
//                at runtime via `theme/PaletteContext`.
//
// Palette sources (COLOURlovers, attribution preserved in palette `credit`).

export type SegmentKind = 'prep' | 'work' | 'rest' | 'roundRest' | 'done';

export interface Palette {
  id: PaletteId;
  name: string;
  credit: string;
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  danger: string;
  success: string;
  workout: Record<SegmentKind, string>;
  /** Ordered swatch list for picker previews. */
  swatches: string[];
}

export type PaletteId = 'sugar' | 'emoKid' | 'melonBall';

// Raw hex named after each source palette swatch. Useful when authoring or
// debugging — not consumed directly by UI code.
const sugarHex = {
  sugarHeartsYou:   '#FE4365',
  partyConfetti:    '#FC9D9A',
  sugarChampagne:   '#F9CDAD',
  burstsOfEuphoria: '#C8C8A9',
  happyBalloons:    '#83AF9B',
} as const;

const emoKidHex = {
  mightySlate:    '#556270',
  pacifica:       '#4ECDC4',
  appleChic:      '#C7F464',
  cheeryPink:     '#FF6B6B',
  grandmasPillow: '#C44D58',
} as const;

const melonBallHex = {
  splashOfLime:   '#D1F2A5',
  honeyDo:        '#EFFAB4',
  orangeSherbert: '#FFC48C',
  feelingOrange:  '#FF9F80',
  watermillion:   '#F56991',
} as const;

export const palettes: Record<PaletteId, Palette> = {
  sugar: {
    id: 'sugar',
    name: 'Sugar',
    credit: 'COLOURlovers “()” by sugar!',
    primary:        sugarHex.sugarHeartsYou,
    primaryPressed: '#D4213B',
    onPrimary:      '#FFFFFF',
    danger:         sugarHex.sugarHeartsYou,
    success:        sugarHex.happyBalloons,
    workout: {
      prep:      sugarHex.partyConfetti,
      work:      sugarHex.sugarHeartsYou,
      rest:      sugarHex.happyBalloons,
      roundRest: sugarHex.sugarChampagne,
      done:      sugarHex.burstsOfEuphoria,
    },
    swatches: [
      sugarHex.sugarHeartsYou,
      sugarHex.partyConfetti,
      sugarHex.sugarChampagne,
      sugarHex.burstsOfEuphoria,
      sugarHex.happyBalloons,
    ],
  },
  emoKid: {
    id: 'emoKid',
    name: 'Cheer Up Emo Kid',
    credit: 'COLOURlovers “cheer up emo kid” by electrikmonk',
    primary:        emoKidHex.cheeryPink,
    primaryPressed: emoKidHex.grandmasPillow,
    onPrimary:      '#FFFFFF',
    danger:         emoKidHex.grandmasPillow,
    success:        emoKidHex.pacifica,
    workout: {
      prep:      emoKidHex.appleChic,
      work:      emoKidHex.cheeryPink,
      rest:      emoKidHex.mightySlate,
      roundRest: emoKidHex.pacifica,
      done:      emoKidHex.grandmasPillow,
    },
    swatches: [
      emoKidHex.mightySlate,
      emoKidHex.pacifica,
      emoKidHex.appleChic,
      emoKidHex.cheeryPink,
      emoKidHex.grandmasPillow,
    ],
  },
  melonBall: {
    id: 'melonBall',
    name: 'Melon Ball Surprise',
    credit: 'COLOURlovers “Melon Ball Surprise” by Skyblue2u',
    primary:        melonBallHex.watermillion,
    primaryPressed: '#D14E76',
    onPrimary:      '#FFFFFF',
    danger:         melonBallHex.watermillion,
    success:        melonBallHex.splashOfLime,
    workout: {
      prep:      melonBallHex.feelingOrange,
      work:      melonBallHex.watermillion,
      rest:      melonBallHex.splashOfLime,
      roundRest: melonBallHex.honeyDo,
      done:      melonBallHex.orangeSherbert,
    },
    swatches: [
      melonBallHex.splashOfLime,
      melonBallHex.honeyDo,
      melonBallHex.orangeSherbert,
      melonBallHex.feelingOrange,
      melonBallHex.watermillion,
    ],
  },
};

export const defaultPaletteId: PaletteId = 'sugar';

export const colors = {
  // Canvas
  canvas:     '#FFFFFF',
  canvasDark: '#000000',

  // Surfaces (light)
  surface1: '#F2F2F7',
  surface2: '#FFFFFF',
  surface3: '#E5E5EA',
  divider:  '#C6C6C8',

  // Surfaces (dark)
  surface1Dark: '#1C1C1E',
  surface2Dark: '#2C2C2E',
  surface3Dark: '#3A3A3C',
  dividerDark:  '#38383A',

  // Text (light)
  labelPrimary:    '#000000',
  labelSecondary:  'rgba(60,60,67,0.60)',
  labelTertiary:   'rgba(60,60,67,0.30)',
  labelQuaternary: 'rgba(60,60,67,0.18)',

  // Text (dark)
  labelPrimaryDark:    '#FFFFFF',
  labelSecondaryDark:  'rgba(235,235,245,0.60)',
  labelTertiaryDark:   'rgba(235,235,245,0.30)',
  labelQuaternaryDark: 'rgba(235,235,245,0.18)',
} as const;

