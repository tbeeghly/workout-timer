import { useCallback, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormRow } from '../../components/FormRow';
import { PillButton } from '../../components/PillButton';
import { typography } from '../../theme/typography';
import { useTheme } from '../../theme/useTheme';
import { colors } from '../../theme/colors';
import { getWorkout, newId, saveWorkout } from '../../src/storage';
import type { Exercise, Workout } from '../../src/types';
import { workoutDurationSec } from '../../src/expandWorkout';
import { formatTotal } from '../../src/format';

export default function EditWorkoutScreen() {
  const t = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    if (!id) return;
    getWorkout(id).then((w) => {
      if (w) setWorkout(w);
    });
  }, [id]);

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
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
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
          <Ionicons name="add-circle" size={22} color={colors.red} />
          <Text style={[typography.body, { color: colors.red, fontWeight: '500' }]}>
            Add exercise
          </Text>
        </Pressable>

        <View style={styles.summary}>
          <Text style={[typography.footnote, { color: t.labelSecondary }]}>
            Total duration {formatTotal(totalSec)}
          </Text>
        </View>

        <View style={styles.actions}>
          <PillButton title="Save workout" icon="checkmark" onPress={handleSave} fullWidth />
        </View>
      </ScrollView>
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
          <IconHeaderBtn name="trash" onPress={onRemove} color={colors.systemRed} />
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
        suffix="sec"
        onChange={(n) => onChange({ restAfterSeconds: n })}
        min={0}
        max={3600}
        step={5}
        divider={false}
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
});
