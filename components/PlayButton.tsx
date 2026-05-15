import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { usePalette } from '../theme/PaletteContext';
import { tapStart } from '../src/haptics';

type Props = {
  isPlaying: boolean;
  size?: number;
  onPress: () => void;
};

/** Apple Music's signature red circle Play / Pause. */
export function PlayButton({ isPlaying, size = 64, onPress }: Props) {
  const { palette } = usePalette();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
      onPressIn={() => (scale.value = withSpring(0.92, { damping: 14 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 14 }))}
      onPress={() => {
        tapStart();
        onPress();
      }}
    >
      <Animated.View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: palette.primary },
          animatedStyle,
        ]}
      >
        <View style={{ marginLeft: isPlaying ? 0 : size * 0.04 }}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={size * 0.44} color={palette.onPrimary} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
