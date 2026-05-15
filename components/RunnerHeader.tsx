import { Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { typography } from '../theme/typography';
import { formatMMSSCeil, formatTotal } from '../src/format';

type Props = {
  remainingMs: number;
  totalRemainingMs: number;
};

export function RunnerHeader({ remainingMs, totalRemainingMs }: Props) {
  return (
    <BlurView intensity={Platform.OS === 'web' ? 60 : 80} tint="dark" style={styles.wrap}>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 14,
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
