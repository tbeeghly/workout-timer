import { useColorScheme } from 'react-native';
import { colors } from './colors';

export type Theme = {
  isDark: boolean;
  canvas: string;
  surface1: string;
  surface2: string;
  surface3: string;
  divider: string;
  labelPrimary: string;
  labelSecondary: string;
  labelTertiary: string;
  labelQuaternary: string;
};

export function useTheme(): Theme {
  const scheme = useColorScheme() ?? 'dark';
  const dark = scheme === 'dark';
  return {
    isDark: dark,
    canvas: dark ? colors.canvasDark : colors.canvas,
    surface1: dark ? colors.surface1Dark : colors.surface1,
    surface2: dark ? colors.surface2Dark : colors.surface2,
    surface3: dark ? colors.surface3Dark : colors.surface3,
    divider: dark ? colors.dividerDark : colors.divider,
    labelPrimary: dark ? colors.labelPrimaryDark : colors.labelPrimary,
    labelSecondary: dark ? colors.labelSecondaryDark : colors.labelSecondary,
    labelTertiary: dark ? colors.labelTertiaryDark : colors.labelTertiary,
    labelQuaternary: dark ? colors.labelQuaternaryDark : colors.labelQuaternary,
  };
}
