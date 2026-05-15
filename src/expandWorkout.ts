import type { RuntimeSegment, Workout } from './types';

/**
 * Pure expansion of a Workout into a flat ordered list of timed segments.
 *
 * Layout:
 *   [prep?] -> for each round r in 1..N:
 *               for each exercise e:
 *                  work(e), rest(e) if restAfterSeconds > 0
 *               if r < N and restBetweenRoundsSeconds > 0: roundRest
 *
 * Zero-duration segments are omitted (a 0s rest is just no rest).
 */
export function expandWorkout(workout: Workout): RuntimeSegment[] {
  const out: RuntimeSegment[] = [];
  const totalRounds = Math.max(1, Math.floor(workout.rounds));
  // With a single exercise, per-exercise rest is redundant with the
  // between-rounds rest, so we suppress it.
  const includePerExerciseRest = workout.exercises.length > 1;

  if (workout.prepSeconds > 0) {
    out.push({
      kind: 'prep',
      name: 'Get ready',
      durationSec: workout.prepSeconds,
      totalRounds,
    });
  }

  for (let r = 1; r <= totalRounds; r++) {
    workout.exercises.forEach((ex, exIdx) => {
      if (ex.workSeconds > 0) {
        out.push({
          kind: 'work',
          name: ex.name || `Exercise ${exIdx + 1}`,
          durationSec: ex.workSeconds,
          roundIndex: r,
          totalRounds,
          exerciseIndex: exIdx,
        });
      }
      if (includePerExerciseRest && ex.restAfterSeconds > 0) {
        out.push({
          kind: 'rest',
          name: 'Rest',
          durationSec: ex.restAfterSeconds,
          roundIndex: r,
          totalRounds,
          exerciseIndex: exIdx,
        });
      }
    });

    if (r < totalRounds && workout.restBetweenRoundsSeconds > 0) {
      out.push({
        kind: 'roundRest',
        name: 'Round break',
        durationSec: workout.restBetweenRoundsSeconds,
        roundIndex: r,
        totalRounds,
      });
    }
  }

  return out;
}

/** Total duration (seconds) of an expanded segment list. */
export function totalDuration(segments: RuntimeSegment[]): number {
  let total = 0;
  for (const s of segments) total += s.durationSec;
  return total;
}

/** Convenience: total duration for a workout without going through the runner. */
export function workoutDurationSec(workout: Workout): number {
  return totalDuration(expandWorkout(workout));
}
