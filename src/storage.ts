import AsyncStorage from '@react-native-async-storage/async-storage';
import { WORKOUT_SCHEMA_VERSION, type Workout } from './types';

const STORAGE_KEY = 'workout-timer:workouts:v1';

type StorageEnvelope = {
  version: number;
  workouts: Workout[];
};

export async function loadWorkouts(): Promise<Workout[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StorageEnvelope;
    if (!parsed || !Array.isArray(parsed.workouts)) return [];
    // Future: migrate based on parsed.version.
    return parsed.workouts;
  } catch {
    return [];
  }
}

async function writeAll(workouts: Workout[]): Promise<void> {
  const envelope: StorageEnvelope = {
    version: WORKOUT_SCHEMA_VERSION,
    workouts,
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
}

export async function saveWorkout(workout: Workout): Promise<Workout[]> {
  const all = await loadWorkouts();
  const idx = all.findIndex((w) => w.id === workout.id);
  const stamped: Workout = { ...workout, updatedAt: Date.now(), version: WORKOUT_SCHEMA_VERSION };
  if (idx >= 0) all[idx] = stamped;
  else all.unshift(stamped);
  await writeAll(all);
  return all;
}

export async function deleteWorkout(id: string): Promise<Workout[]> {
  const all = await loadWorkouts();
  const next = all.filter((w) => w.id !== id);
  await writeAll(next);
  return next;
}

export async function getWorkout(id: string): Promise<Workout | undefined> {
  const all = await loadWorkouts();
  return all.find((w) => w.id === id);
}

/** Stable-ish id generator suitable for client-side records. */
export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
