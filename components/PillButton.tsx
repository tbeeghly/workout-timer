import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { usePalette } from '../theme/PaletteContext';
import { typography } from '../theme/typography';

type Props = {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  textColor?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  /** `'solid'` (default) = filled brand color; `'outline'` = transparent fill with colored border. */
  variant?: 'solid' | 'outline';
  onPress: () => void;
};

/** Apple Music–style rounded-rect 8pt pill (used for Start, Save, etc.). */
export function PillButton({
  title,
  icon,
  color,
  textColor,
  fullWidth,
  disabled,
  variant = 'solid',
  onPress,
}: Props) {
  const { palette } = usePalette();
  const resolvedColor = color ?? palette.primary;
  const isOutline = variant === 'outline';
  const resolvedText = textColor ?? (isOutline ? resolvedColor : palette.onPrimary);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: isOutline
          ? 'transparent'
          : disabled
            ? colors.surface3Dark
            : resolvedColor,
        borderWidth: isOutline ? 1.5 : 0,
        borderColor: isOutline ? resolvedColor : 'transparent',
        opacity: disabled ? 0.6 : 1,
        borderRadius: 10,
        alignSelf: fullWidth ? 'stretch' : 'flex-start',
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      {icon ? <Ionicons name={icon} size={17} color={resolvedText} /> : null}
      <Text style={[typography.button, { color: resolvedText }]}>{title}</Text>
    </Pressable>
  );
}

/** Secondary button with surface background (used for Shuffle / Edit etc.). */
export function SecondaryButton({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: colors.surface2Dark,
        borderRadius: 8,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      {icon ? <Ionicons name={icon} size={15} color={colors.labelPrimaryDark} /> : null}
      <View>
        <Text style={[typography.subheadline, { color: colors.labelPrimaryDark, fontWeight: '500' }]}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}
