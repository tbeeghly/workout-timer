import { View, Text, Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { typography } from '../theme/typography';
import { colors } from '../theme/colors';
import { useTheme } from '../theme/useTheme';
import { formatTotal } from '../src/format';

type Props = {
  name: string;
  exerciseCount: number;
  totalDurationSec: number;
  onPress: () => void;
  onMore?: () => void;
};

/** Apple Music's TrackRow pattern, adapted: a colored square (in place of
 *  album art) + name + "{N exercises · M:SS}" subtitle. */
export function WorkoutRow({ name, exerciseCount, totalDurationSec, onPress, onMore }: Props) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: t.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
      ]}
    >
      <View style={[styles.thumb, { backgroundColor: colors.red }]}>
        <Ionicons name="flame" size={24} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[typography.body, { color: t.labelPrimary, fontWeight: '500' }]}
          numberOfLines={1}
        >
          {name || 'Untitled workout'}
        </Text>
        <Text
          style={[typography.subheadline, { color: t.labelSecondary }]}
          numberOfLines={1}
        >
          {exerciseCount} exercise{exerciseCount === 1 ? '' : 's'} · {formatTotal(totalDurationSec)}
        </Text>
      </View>
      <Pressable
        onPress={onMore}
        hitSlop={10}
        accessibilityLabel={`More options for ${name || 'workout'}`}
        style={({ pressed }) => [styles.moreBtn, { opacity: pressed ? 0.5 : 1 }]}
      >
        <Ionicons name="ellipsis-horizontal" size={22} color={t.labelSecondary} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    height: 64,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreBtn: {
    width: 32,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
