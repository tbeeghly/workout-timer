import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RuntimeSegment } from './types';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'done';

export type TimerEvents = {
  onSegmentStart?: (segment: RuntimeSegment, index: number) => void;
  onCountdownTick?: (secondsLeft: number, segment: RuntimeSegment) => void;
  onComplete?: () => void;
};

export type TimerEngine = {
  status: TimerStatus;
  currentIndex: number;
  remainingMs: number;
  totalRemainingMs: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  end: () => void;
};

const now = (): number =>
  typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();

/**
 * RAF-driven timer that advances through a list of RuntimeSegments using a
 * target-end-timestamp model so background-tab throttling and brief jitters
 * self-correct rather than accumulating drift.
 */
export function useTimerEngine(segments: RuntimeSegment[], events: TimerEvents = {}): TimerEngine {
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState(
    segments[0] ? segments[0].durationSec * 1000 : 0,
  );

  // Refs are used for any value the RAF loop needs to read without re-binding.
  const segmentsRef = useRef(segments);
  const indexRef = useRef(0);
  const endAtRef = useRef<number | null>(null);
  const pausedRemainingRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastCountdownTickRef = useRef<number>(-1);
  const eventsRef = useRef(events);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    segmentsRef.current = segments;
    // If segment list changes while idle, reset display to the new first segment.
    if (status === 'idle') {
      indexRef.current = 0;
      setCurrentIndex(0);
      setRemainingMs(segments[0] ? segments[0].durationSec * 1000 : 0);
    }
  }, [segments, status]);

  const totalRemainingMs = useMemo(() => {
    const segs = segmentsRef.current;
    let total = remainingMs;
    for (let i = currentIndex + 1; i < segs.length; i++) {
      total += segs[i].durationSec * 1000;
    }
    return total;
  }, [currentIndex, remainingMs]);

  const stopRaf = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const advance = useCallback(() => {
    const segs = segmentsRef.current;
    const nextIdx = indexRef.current + 1;
    if (nextIdx >= segs.length) {
      indexRef.current = segs.length;
      setCurrentIndex(segs.length);
      setRemainingMs(0);
      setStatus('done');
      endAtRef.current = null;
      stopRaf();
      eventsRef.current.onComplete?.();
      return;
    }
    indexRef.current = nextIdx;
    setCurrentIndex(nextIdx);
    const seg = segs[nextIdx];
    const durMs = seg.durationSec * 1000;
    endAtRef.current = now() + durMs;
    setRemainingMs(durMs);
    lastCountdownTickRef.current = -1;
    eventsRef.current.onSegmentStart?.(seg, nextIdx);
  }, [stopRaf]);

  const tick = useCallback(() => {
    if (endAtRef.current == null) return;
    let remaining = endAtRef.current - now();
    // Advance through any segments whose end-time has passed.
    while (remaining <= 0) {
      const segs = segmentsRef.current;
      const nextIdx = indexRef.current + 1;
      if (nextIdx >= segs.length) {
        // Complete.
        indexRef.current = segs.length;
        setCurrentIndex(segs.length);
        setRemainingMs(0);
        setStatus('done');
        endAtRef.current = null;
        stopRaf();
        eventsRef.current.onComplete?.();
        return;
      }
      indexRef.current = nextIdx;
      const seg = segs[nextIdx];
      const overshoot = -remaining;
      const durMs = seg.durationSec * 1000;
      // Roll overshoot into the next segment to preserve cumulative timing.
      endAtRef.current = now() + Math.max(0, durMs - overshoot);
      remaining = endAtRef.current - now();
      setCurrentIndex(nextIdx);
      lastCountdownTickRef.current = -1;
      eventsRef.current.onSegmentStart?.(seg, nextIdx);
    }

    setRemainingMs(remaining);

    // Countdown tick events at 3, 2, 1 seconds remaining (only once per integer).
    const secondsLeft = Math.ceil(remaining / 1000);
    if (secondsLeft <= 3 && secondsLeft >= 1 && secondsLeft !== lastCountdownTickRef.current) {
      lastCountdownTickRef.current = secondsLeft;
      const segs = segmentsRef.current;
      const seg = segs[indexRef.current];
      if (seg) eventsRef.current.onCountdownTick?.(secondsLeft, seg);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [stopRaf]);

  const start = useCallback(() => {
    if (status === 'running') return;
    const segs = segmentsRef.current;
    if (segs.length === 0) return;
    indexRef.current = 0;
    setCurrentIndex(0);
    lastCountdownTickRef.current = -1;
    const durMs = segs[0].durationSec * 1000;
    endAtRef.current = now() + durMs;
    setRemainingMs(durMs);
    setStatus('running');
    eventsRef.current.onSegmentStart?.(segs[0], 0);
    stopRaf();
    rafRef.current = requestAnimationFrame(tick);
  }, [status, stopRaf, tick]);

  const pause = useCallback(() => {
    if (status !== 'running' || endAtRef.current == null) return;
    pausedRemainingRef.current = Math.max(0, endAtRef.current - now());
    setRemainingMs(pausedRemainingRef.current);
    endAtRef.current = null;
    setStatus('paused');
    stopRaf();
  }, [status, stopRaf]);

  const resume = useCallback(() => {
    if (status !== 'paused') return;
    const rem = pausedRemainingRef.current ?? 0;
    endAtRef.current = now() + rem;
    pausedRemainingRef.current = null;
    setStatus('running');
    stopRaf();
    rafRef.current = requestAnimationFrame(tick);
  }, [status, stopRaf, tick]);

  const skip = useCallback(() => {
    if (status === 'idle' || status === 'done') return;
    const wasRunning = status === 'running';
    stopRaf();
    advance();
    if (wasRunning && indexRef.current < segmentsRef.current.length) {
      // advance() has already set endAtRef for the next segment when running was true,
      // but for the paused-skip case we need to align.
      const seg = segmentsRef.current[indexRef.current];
      const durMs = seg.durationSec * 1000;
      if (wasRunning) {
        endAtRef.current = now() + durMs;
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // paused: keep paused, just stash remaining
        pausedRemainingRef.current = durMs;
        setRemainingMs(durMs);
      }
    }
  }, [advance, status, stopRaf, tick]);

  const end = useCallback(() => {
    stopRaf();
    endAtRef.current = null;
    pausedRemainingRef.current = null;
    setStatus('done');
    setRemainingMs(0);
    const segs = segmentsRef.current;
    indexRef.current = segs.length;
    setCurrentIndex(segs.length);
  }, [stopRaf]);

  useEffect(() => () => stopRaf(), [stopRaf]);

  return {
    status,
    currentIndex,
    remainingMs,
    totalRemainingMs,
    start,
    pause,
    resume,
    skip,
    end,
  };
}
