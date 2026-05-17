import { Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography } from '../theme/typography';
import { formatMMSSCeil, formatTotal } from '../src/format';

type Props = {
  remainingMs: number;
  totalRemainingMs: number;
};

export function RunnerHeader({ remainingMs, totalRemainingMs }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <BlurView
      intensity={Platform.OS === 'web' ? 60 : 80}
      tint="dark"
      // paddingTop has to come from the safe-area inset directly so the timer
      // clears the Dynamic Island / notch. Putting this view inside a
      // SafeAreaView doesn't help because callers wrap it in an absolutely
      // positioned container, and absolutely-positioned children of a
      // SafeAreaView escape its inset padding.
      style={[styles.wrap, { paddingTop: insets.top + 14 }]}
    >
      <Text
        style={[typography.display, styles.timer]}
        numberOfLines={1}
        allowFontScaling={false}
      >
        {formatMMSSCeil(remainingMs)}
      </Text>
      <Text style={[typography.footnote, styles.muted]}>
        Total remaining {formatTotal(Math.ceil(totalRemainingMs / 1000))}
      </Text>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    overflow: 'hidden',
    // backdrop-filter shim for web is mostly handled by expo-blur; keep
    // a translucent fallback for older browsers.
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  muted: { color: 'rgba(255,255,255,0.7)' },
  timer: {
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
});
