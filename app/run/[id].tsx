import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, Text, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SegmentStack } from '../../components/SegmentStack';
import { RunnerHeader } from '../../components/RunnerHeader';
import { RunnerControls } from '../../components/RunnerControls';
import { PillButton } from '../../components/PillButton';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';
import { getWorkout } from '../../src/storage';
import { expandWorkout } from '../../src/expandWorkout';
import { useTimerEngine } from '../../src/useTimerEngine';
import { primeAudio, playCountdownTick, playTransition } from '../../src/audio';
import { tapSelection, tapSuccess } from '../../src/haptics';
import { acquireWakeLock, releaseWakeLock } from '../../src/wakeLock';
import type { RuntimeSegment, Workout } from '../../src/types';

export default function RunWorkoutScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    if (!id) return;
    getWorkout(id).then((w) => setWorkout(w ?? null));
  }, [id]);

  const segments: RuntimeSegment[] = useMemo(
    () => (workout ? expandWorkout(workout) : []),
    [workout],
  );

  const onSegmentStart = useCallback((seg: RuntimeSegment) => {
    playTransition(seg.kind);
    tapSelection();
  }, []);

  const onCountdownTick = useCallback(() => {
    playCountdownTick();
  }, []);

  const onComplete = useCallback(() => {
    tapSuccess();
    playTransition('done');
    void releaseWakeLock();
  }, []);

  const engine = useTimerEngine(segments, {
    onSegmentStart,
    onCountdownTick,
    onComplete,
  });

  // Acquire / release wake lock around active runs.
  useEffect(() => {
    if (engine.status === 'running') {
      void acquireWakeLock();
    } else if (engine.status === 'done' || engine.status === 'idle') {
      void releaseWakeLock();
    }
    return () => {
      void releaseWakeLock();
    };
  }, [engine.status]);

  const handlePlayPause = async () => {
    if (engine.status === 'idle' || engine.status === 'done') {
      await primeAudio();
      engine.start();
    } else if (engine.status === 'running') {
      engine.pause();
    } else if (engine.status === 'paused') {
      engine.resume();
    }
  };

  const handleEnd = () => {
    const confirm = () => {
      engine.end();
      router.back();
    };
    if (Platform.OS === 'web') {
      const ok = (globalThis as any).confirm?.('End workout?');
      if (ok) confirm();
      return;
    }
    Alert.alert('End workout?', 'Your current run will be discarded.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End', style: 'destructive', onPress: confirm },
    ]);
  };

  if (!workout) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.canvasDark }]}>
        <Text style={[typography.body, { color: colors.labelPrimaryDark, padding: 24 }]}>
          Loading…
        </Text>
      </SafeAreaView>
    );
  }

  const isDone = engine.status === 'done';

  return (
    <View style={[styles.container, { backgroundColor: colors.canvasDark }]}>
      {/* Close button */}
      <SafeAreaView style={styles.topBar} edges={['top']} pointerEvents="box-none">
        <Pressable
          onPress={handleEnd}
          hitSlop={10}
          accessibilityLabel="Close runner"
          style={({ pressed }) => [
            styles.closeBtn,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
        </Pressable>
      </SafeAreaView>

      <SegmentStack
        segments={segments}
        currentIndex={engine.currentIndex}
        remainingMs={engine.remainingMs}
        isActive={engine.status === 'running'}
      />

      <View style={styles.headerWrap} pointerEvents="box-none">
        <RunnerHeader
          remainingMs={engine.remainingMs}
          totalRemainingMs={engine.totalRemainingMs}
        />
      </View>

      {isDone ? (
        <SafeAreaView style={styles.doneOverlay} edges={['bottom']}>
          <View style={styles.donePanel}>
            <Text style={[typography.title1, { color: '#FFFFFF', textAlign: 'center' }]}>
              Workout complete
            </Text>
            <Text
              style={[typography.subheadline, { color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: 6 }]}
            >
              {workout.name || 'Untitled workout'}
            </Text>
            <View style={{ marginTop: 24, flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
              <PillButton title="Done" icon="checkmark" onPress={() => router.replace('/')} />
              <PillButton title="Repeat" icon="refresh" onPress={async () => { await primeAudio(); engine.start(); }} />
            </View>
          </View>
        </SafeAreaView>
      ) : (
        <SafeAreaView style={styles.controlsWrap} edges={['bottom']} pointerEvents="box-none">
          <RunnerControls
            isRunning={engine.status === 'running'}
            canStart={segments.length > 0}
            onPlayPause={handlePlayPause}
            onSkip={engine.skip}
          />
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    paddingHorizontal: 8,
    paddingTop: 4,
    alignItems: 'flex-start',
  },
  closeBtn: { padding: 8 },
  headerWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 },
  controlsWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20 },
  doneOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 25,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 32,
  },
  donePanel: { paddingHorizontal: 24 },
});
