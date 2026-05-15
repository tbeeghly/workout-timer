import { Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  hitSlop?: number;
  accessibilityLabel?: string;
  onPress: () => void;
};

export function IconButton({
  name,
  size = 24,
  color = '#FFFFFF',
  hitSlop = 10,
  accessibilityLabel,
  onPress,
}: Props) {
  return (
    <Pressable
      hitSlop={hitSlop}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? String(name)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.6 : 1,
        transform: [{ scale: pressed ? 0.9 : 1 }],
        padding: 4,
      })}
    >
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}
