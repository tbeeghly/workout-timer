/**
 * Cross-platform audio cues for the timer.
 * - Web: synthesized via Web Audio API (OscillatorNode + GainNode envelope).
 * - Native: synthesized too — we keep a Web Audio-only first cut to avoid
 *   bundling .wav assets. If Web Audio is unavailable (native), this becomes
 *   a no-op. A future pass can swap in expo-audio + pre-bundled wavs.
 *
 * IMPORTANT: AudioContext must be created/resumed inside a user gesture
 *  (iOS Safari requirement). Call `primeAudio()` from the Start tap handler.
 */

import { Platform } from 'react-native';

type Ctx = AudioContext;

let ctx: Ctx | null = null;
let unsupported = false;

function getCtx(): Ctx | null {
  if (unsupported) return null;
  if (ctx) return ctx;
  if (Platform.OS !== 'web') {
    // First cut: native silent. Could be wired to expo-audio later.
    unsupported = true;
    return null;
  }
  const W: any = typeof window !== 'undefined' ? window : undefined;
  const Ctor = W?.AudioContext ?? W?.webkitAudioContext;
  if (!Ctor) {
    unsupported = true;
    return null;
  }
  ctx = new Ctor();
  return ctx;
}

/** Call inside a user-gesture handler (e.g. the Start press) before playback. */
export function primeAudio(): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') {
    void c.resume();
  }
}

function beep(freq: number, durationSec: number, when: number, gain = 0.2): void {
  const c = getCtx();
  if (!c) return;
  const t = Math.max(when, c.currentTime);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  // Short attack/decay envelope to avoid clicks.
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.005);
  g.gain.linearRampToValueAtTime(gain, t + durationSec - 0.02);
  g.gain.linearRampToValueAtTime(0, t + durationSec);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(t);
  osc.stop(t + durationSec + 0.02);
}

/** Short tick used for the 3-2-1 countdown. */
export function playCountdownTick(): void {
  const c = getCtx();
  if (!c) return;
  beep(880, 0.12, c.currentTime);
}

/** Stronger beep on segment transitions. Higher pitch for work, lower for rest. */
export function playTransition(kind: 'work' | 'rest' | 'roundRest' | 'prep' | 'done'): void {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  switch (kind) {
    case 'work':
      beep(1200, 0.18, t, 0.25);
      break;
    case 'rest':
      beep(600, 0.18, t, 0.22);
      break;
    case 'roundRest':
      beep(500, 0.18, t, 0.22);
      beep(700, 0.18, t + 0.2, 0.22);
      break;
    case 'prep':
      beep(700, 0.15, t, 0.2);
      break;
    case 'done':
      playComplete();
      break;
  }
}

/** 3-note ascending arpeggio on workout completion. */
export function playComplete(): void {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  beep(660, 0.18, t, 0.25);
  beep(880, 0.18, t + 0.18, 0.25);
  beep(1320, 0.32, t + 0.36, 0.25);
}
