import { WORKOUT_SCHEMA_VERSION, type Workout } from './types';

/**
 * Workouts seeded into local storage on first launch. Keep ids stable so the
 * one-time seed flag check works correctly across reinstalls — the seed is
 * gated by a separate flag in storage.ts, not by id collision.
 *
 * A multi-workout jump rope cardio progression. Starting baseline assumes the
 * athlete can already do 8 × 60s work / 45s rest. Each subsequent workout
 * either lengthens the work interval or tightens the work:rest ratio:
 *   1. 60s × 8 / 45s rest — baseline aerobic
 *   2. 75s × 8 / 45s rest — +duration
 *   3. 90s × 8 / 45s rest — +duration (2:1 ratio)
 *   4. 90s × 8 / 30s rest — same work, shorter recovery (3:1)
 *   5. 120s × 6 / 45s rest — longer continuous bouts
 *   6. 150s × 6 / 60s rest — peak: longest sustained effort
 *
 * Each workout uses a single "Jump rope" exercise repeated via `rounds`, with
 * the inter-round gap handled by `restBetweenRoundsSeconds` (skipped after
 * the final round, so there's no trailing rest).
 */
const seededAt = Date.now();

const jumpRopeWorkout = (
  id: string,
  name: string,
  workSeconds: number,
  restSeconds: number,
  rounds: number,
): Workout => ({
  id,
  name,
  prepSeconds: 10,
  rounds,
  restBetweenRoundsSeconds: restSeconds,
  exercises: [
    { id: `${id}-ex`, name: 'Jump rope', workSeconds, restAfterSeconds: 0 },
  ],
  updatedAt: seededAt,
  version: WORKOUT_SCHEMA_VERSION,
});

export const DEFAULT_WORKOUTS: Workout[] = [
  jumpRopeWorkout('seed-jr-1', 'Jump Rope 60s × 8', 60, 45, 8),
  jumpRopeWorkout('seed-jr-2', 'Jump Rope 75s × 8', 75, 45, 8),
  jumpRopeWorkout('seed-jr-3', 'Jump Rope 90s × 8', 90, 45, 8),
  jumpRopeWorkout('seed-jr-4', 'Jump Rope 90s × 8 (short rest)', 90, 30, 8),
  jumpRopeWorkout('seed-jr-5', 'Jump Rope 120s × 6', 120, 45, 6),
  jumpRopeWorkout('seed-jr-6', 'Jump Rope 150s × 6', 150, 60, 6),
];
