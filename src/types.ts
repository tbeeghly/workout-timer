import type { SegmentKind } from '../theme/colors';

/** Schema version of the persisted Workout payload. Bump on breaking changes. */
export const WORKOUT_SCHEMA_VERSION = 1;

export type Exercise = {
  /** Stable id; client-generated (timestamp + random). */
  id: string;
  /** User-facing name shown in editor + runner. */
  name: string;
  /** Active-effort seconds for this exercise. */
  workSeconds: number;
  /** Rest seconds immediately following this exercise (0 = back-to-back). */
  restAfterSeconds: number;
};

export type Workout = {
  id: string;
  name: string;
  /** Countdown shown before the first exercise on each Start. */
  prepSeconds: number;
  /** Number of times the exercise sequence repeats. >= 1. */
  rounds: number;
  /** Optional rest between rounds (skipped after final round). */
  restBetweenRoundsSeconds: number;
  exercises: Exercise[];
  /** ms since epoch — for sorting in the list. */
  updatedAt: number;
  /** Schema version of this record. */
  version: number;
};

/** A single timed step produced by expanding a Workout for the runner. */
export type RuntimeSegment = {
  kind: SegmentKind;
  /** Display name (exercise name, "Get ready", "Rest", "Round break", "Done"). */
  name: string;
  durationSec: number;
  /** 1-based round number (undefined for prep/done). */
  roundIndex?: number;
  /** Total number of rounds (for display "Round X / Y"). */
  totalRounds?: number;
  /** 0-based exercise index within the workout (undefined for prep/round-rest/done). */
  exerciseIndex?: number;
};

export { SegmentKind };
