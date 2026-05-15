import { View, StyleSheet, Platform, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PlayButton } from './PlayButton';

type Props = {
  isRunning: boolean;
  canStart: boolean;
  onPlayPause: () => void;
  onSkip: () => void;
  onSkipBack?: () => void;
};

export function RunnerControls({ isRunning, canStart, onPlayPause, onSkip, onSkipBack }: Props) {
  return (
    <BlurView intensity={Platform.OS === 'web' ? 60 : 80} tint="dark" style={styles.wrap}>
      <View style={styles.row}>
        <RoundIconButton name="play-skip-back" onPress={onSkipBack ?? (() => {})} disabled={!onSkipBack} />
        <PlayButton isPlaying={isRunning} size={72} onPress={onPlayPause} />
        <RoundIconButton name="play-skip-forward" onPress={onSkip} disabled={!canStart} />
      </View>
    </BlurView>
  );
}

function RoundIconButton({
  name,
  onPress,
  disabled,
}: {
  name: 'play-skip-back' | 'play-skip-forward';
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconBtn,
        { opacity: disabled ? 0.3 : pressed ? 0.6 : 1 },
      ]}
    >
      <Ionicons name={name} size={32} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 32,
    paddingHorizontal: 24,
  },
  iconBtn: { padding: 8 },
});
