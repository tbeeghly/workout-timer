/** MM:SS formatting helpers. */

export function formatMMSS(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Like formatMMSS but rounded UP — used for live countdowns so the
 *  displayed digit ticks down exactly when each second ends. */
export function formatMMSSCeil(totalMs: number): string {
  return formatMMSS(Math.ceil(Math.max(0, totalMs) / 1000));
}

/** Human-readable total like "12:30" or "1:05:00" for >1h workouts. */
export function formatTotal(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}
