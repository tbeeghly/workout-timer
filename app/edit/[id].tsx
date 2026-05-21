import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormRow } from '../../components/FormRow';
import { PillButton } from '../../components/PillButton';
import { typography } from '../../theme/typography';
import { useTheme } from '../../theme/useTheme';
import { usePalette } from '../../theme/PaletteContext';
import { getWorkout, newId, saveWorkout } from '../../src/storage';
import type { Exercise, Workout } from '../../src/types';
import { workoutDurationSec } from '../../src/expandWorkout';
import { formatTotal } from '../../src/format';

export default function EditWorkoutScreen() {
  const t = useTheme();
  const { palette } = usePalette();
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  // Snapshot of the workout as last persisted, used to detect unsaved changes.
  const originalRef = useRef<string | null>(null);
  // When true, the next beforeRemove event is allowed through without prompt
  // (set right before we navigate ourselves after Save or explicit Discard).
  const allowLeaveRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    getWorkout(id).then((w) => {
      if (w) {
        setWorkout(w);
        originalRef.current = JSON.stringify(w);
      }
    });
  }, [id]);

  const isDirty = useCallback(() => {
    if (!workout || originalRef.current == null) return false;
    return JSON.stringify(workout) !== originalRef.current;
  }, [workout]);

  // Intercept hardware/system back navigation when there are unsaved changes.
  useEffect(() => {
    const sub = navigation.addListener('beforeRemove', (e: any) => {
      if (allowLeaveRef.current || !isDirty()) return;
      e.preventDefault();
      const proceed = () => {
        allowLeaveRef.current = true;
        navigation.dispatch(e.data.action);
      };
      const save = async () => {
        if (!workout) return proceed();
        if (!workout.name.trim()) {
          const msg = 'Please enter a workout name before saving.';
          if (Platform.OS === 'web') (globalThis as any).alert?.(msg);
          else Alert.alert('Missing name', msg);
          return;
        }
        await saveWorkout(workout);
        proceed();
      };
      if (Platform.OS === 'web') {
        // Window.confirm is the only blocking dialog available on web. Offer
        // a two-step flow: confirm discard, else give a save opportunity.
        const discard = (globalThis as any).confirm?.(
          'You have unsaved changes. Discard them?\n\nOK = discard, Cancel = keep editing (you can then tap Save).',
        );
        if (discard) proceed();
        return;
      }
      Alert.alert(
        'Unsaved changes',
        'You have unsaved changes to this workout. Save them before leaving?',
        [
          { text: 'Keep editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: proceed },
          { text: 'Save', onPress: save },
        ],
      );
    });
    return sub;
  }, [navigation, isDirty, workout]);

  // Browser-level guard: warn before refresh/close on web when dirty.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty()) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const update = useCallback(<K extends keyof Workout>(key: K, value: Workout[K]) => {
    setWorkout((prev) => (prev ? { ...prev, [key]: value } : prev));
  }, []);

  const updateExercise = useCallback(
    (idx: number, patch: Partial<Exercise>) => {
      setWorkout((prev) => {
        if (!prev) return prev;
        const next = [...prev.exercises];
        next[idx] = { ...next[idx], ...patch };
        return { ...prev, exercises: next };
      });
    },
    [],
  );

  const addExercise = useCallback(() => {
    setWorkout((prev) => {
      if (!prev) return prev;
      const last = prev.exercises[prev.exercises.length - 1];
      const newEx: Exercise = {
        id: newId(),
        name: `Exercise ${prev.exercises.length + 1}`,
        workSeconds: last?.workSeconds ?? 30,
        restAfterSeconds: last?.restAfterSeconds ?? 15,
      };
      return { ...prev, exercises: [...prev.exercises, newEx] };
    });
  }, []);

  const removeExercise = useCallback((idx: number) => {
    setWorkout((prev) => {
      if (!prev) return prev;
      return { ...prev, exercises: prev.exercises.filter((_, i) => i !== idx) };
    });
  }, []);

  const moveExercise = useCallback((idx: number, dir: -1 | 1) => {
    setWorkout((prev) => {
      if (!prev) return prev;
      const next = [...prev.exercises];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...prev, exercises: next };
    });
  }, []);

  const handleSave = async () => {
    if (!workout) return;
    if (!workout.name.trim()) {
      const msg = 'Please enter a workout name.';
      if (Platform.OS === 'web') (globalThis as any).alert?.(msg);
      else Alert.alert('Missing name', msg);
      return;
    }
    await saveWorkout(workout);
    // Refresh snapshot so the beforeRemove listener doesn't re-prompt.
    originalRef.current = JSON.stringify(workout);
    allowLeaveRef.current = true;
    router.back();
  };

  if (!workout) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: t.canvas }]}>
        <Text style={[typography.body, { color: t.labelSecondary, padding: 24 }]}>Loading…</Text>
      </SafeAreaView>
    );
  }

  const totalSec = workoutDurationSec(workout);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.canvas }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <SectionTitle>Workout</SectionTitle>
        <View style={[styles.group, { backgroundColor: t.surface1 }]}>
          <FormRow
            variant="text"
            label="Name"
            value={workout.name}
            placeholder="e.g. Morning HIIT"
            onChangeText={(v) => update('name', v)}
          />
          <FormRow
            variant="number"
            label="Prep"
            value={workout.prepSeconds}
            suffix="sec"
            onChange={(n) => update('prepSeconds', n)}
            min={0}
            max={600}
            step={5}
          />
          <FormRow
            variant="number"
            label="Rounds"
            value={workout.rounds}
            onChange={(n) => update('rounds', Math.max(1, n))}
            min={1}
            max={99}
          />
          <FormRow
            variant="number"
            label="Round rest"
            value={workout.restBetweenRoundsSeconds}
            suffix="sec"
            onChange={(n) => update('restBetweenRoundsSeconds', n)}
            min={0}
            max={600}
            step={5}
            divider={false}
          />
        </View>

        <SectionTitle>Exercises</SectionTitle>
        {workout.exercises.map((ex, idx) => (
          <ExerciseGroup
            key={ex.id}
            exercise={ex}
            index={idx}
            count={workout.exercises.length}
            onChange={(patch) => updateExercise(idx, patch)}
            onRemove={() => removeExercise(idx)}
            onMove={(dir) => moveExercise(idx, dir)}
          />
        ))}

        <Pressable
          onPress={addExercise}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: t.surface1, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="add-circle" size={22} color={palette.primary} />
          <Text style={[typography.body, { color: palette.primary, fontWeight: '500' }]}>
            Add exercise
          </Text>
        </Pressable>

        <View style={styles.summary}>
          <Text style={[typography.footnote, { color: t.labelSecondary }]}>
            Total duration {formatTotal(totalSec)}
          </Text>
        </View>
      </ScrollView>

      {/* Sticky save bar — hairline divider on top, sits above the home
          indicator via SafeAreaView's bottom edge. */}
      <View
        style={[
          styles.stickyBar,
          { backgroundColor: t.canvas, borderTopColor: t.divider },
        ]}
      >
        <PillButton
          title={isDirty() ? 'Save changes' : 'Save workout'}
          icon="checkmark"
          onPress={handleSave}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

function SectionTitle({ children }: { children: string }) {
  const t = useTheme();
  return (
    <Text
      style={[
        typography.caption1,
        styles.sectionTitle,
        { color: t.labelSecondary, textTransform: 'uppercase' },
      ]}
    >
      {children}
    </Text>
  );
}

function ExerciseGroup({
  exercise,
  index,
  count,
  onChange,
  onRemove,
  onMove,
}: {
  exercise: Exercise;
  index: number;
  count: number;
  onChange: (patch: Partial<Exercise>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const t = useTheme();
  const { palette } = usePalette();
  return (
    <View style={[styles.group, { backgroundColor: t.surface1 }]}>
      <View style={styles.groupHeader}>
        <Text style={[typography.subheadline, { color: t.labelSecondary }]}>
          #{index + 1}
        </Text>
        <View style={styles.groupHeaderActions}>
          <IconHeaderBtn
            name="chevron-up"
            disabled={index === 0}
            onPress={() => onMove(-1)}
            color={t.labelPrimary}
          />
          <IconHeaderBtn
            name="chevron-down"
            disabled={index === count - 1}
            onPress={() => onMove(1)}
            color={t.labelPrimary}
          />
          <IconHeaderBtn name="trash" onPress={onRemove} color={palette.danger} />
        </View>
      </View>
      <FormRow
        variant="text"
        label="Name"
        value={exercise.name}
        placeholder="Push-ups"
        onChangeText={(v) => onChange({ name: v })}
      />
      <FormRow
        variant="number"
        label="Work"
        value={exercise.workSeconds}
        suffix="sec"
        onChange={(n) => onChange({ workSeconds: n })}
        min={1}
        max={3600}
        step={5}
      />
      <FormRow
        variant="number"
        label="Rest"
        value={exercise.restAfterSeconds}
        suffix={count === 1 ? 'use round rest' : 'sec'}
        onChange={(n) => onChange({ restAfterSeconds: n })}
        min={0}
        max={3600}
        step={5}
        divider={false}
        disabled={count === 1}
      />
    </View>
  );
}

function IconHeaderBtn({
  name,
  onPress,
  disabled,
  color,
}: {
  name: 'chevron-up' | 'chevron-down' | 'trash';
  onPress: () => void;
  disabled?: boolean;
  color: string;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      hitSlop={6}
      style={({ pressed }) => ({
        padding: 6,
        opacity: disabled ? 0.3 : pressed ? 0.6 : 1,
      })}
    >
      <Ionicons name={name} size={18} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 6 },
  group: {
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  groupHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 12,
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  summary: { paddingHorizontal: 24, paddingTop: 16 },
  actions: { paddingHorizontal: 16, paddingTop: 16 },
  stickyBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
