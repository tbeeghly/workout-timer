import { WORKOUT_SCHEMA_VERSION, type Workout } from './types';

/**
 * Workouts seeded into local storage on first launch. Keep ids stable so the
 * one-time seed flag check works correctly across reinstalls — the seed is
 * gated by a separate flag in storage.ts, not by id collision.
 *
 * Total: ~9:15 work / 4:15 rest / ~13:40 wall-clock.
 */
export const DEFAULT_WORKOUTS: Workout[] = [
  {
    id: 'seed-jump-rope-progression',
    name: 'Jump Rope Progression',
    prepSeconds: 10,
    rounds: 1,
    restBetweenRoundsSeconds: 0,
    exercises: [
      { id: 'seed-jrp-1', name: 'Jump rope', workSeconds: 45, restAfterSeconds: 30 },
      { id: 'seed-jrp-2', name: 'Jump rope', workSeconds: 60, restAfterSeconds: 30 },
      { id: 'seed-jrp-3', name: 'Jump rope', workSeconds: 75, restAfterSeconds: 45 },
      { id: 'seed-jrp-4', name: 'Jump rope', workSeconds: 90, restAfterSeconds: 45 },
      { id: 'seed-jrp-5', name: 'Jump rope', workSeconds: 90, restAfterSeconds: 45 },
      { id: 'seed-jrp-6', name: 'Jump rope', workSeconds: 75, restAfterSeconds: 30 },
      { id: 'seed-jrp-7', name: 'Jump rope', workSeconds: 60, restAfterSeconds: 30 },
      { id: 'seed-jrp-8', name: 'Jump rope', workSeconds: 60, restAfterSeconds: 0 },
    ],
    updatedAt: Date.now(),
    version: WORKOUT_SCHEMA_VERSION,
  },
];
