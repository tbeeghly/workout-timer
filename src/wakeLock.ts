/**
 * Cross-platform keep-screen-on helper.
 * - Native (iOS / Android): expo-keep-awake.
 * - Web: navigator.wakeLock (requires HTTPS / localhost + a user gesture
 *   to acquire reliably; we re-acquire on visibilitychange because the OS
 *   may release the lock when the page is backgrounded).
 */

import { Platform } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

const TAG = 'workout-timer-runner';

let webLock: WakeLockSentinel | null = null;
let webListenerAttached = false;

async function acquireWeb(): Promise<void> {
  const nav: any = typeof navigator !== 'undefined' ? navigator : undefined;
  if (!nav?.wakeLock?.request) return;
  try {
    webLock = await nav.wakeLock.request('screen');
    webLock?.addEventListener?.('release', () => {
      webLock = null;
    });
  } catch {
    webLock = null;
  }
  if (!webListenerAttached && typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && webLock === null) {
        void acquireWeb();
      }
    });
    webListenerAttached = true;
  }
}

export async function acquireWakeLock(): Promise<void> {
  if (Platform.OS === 'web') {
    await acquireWeb();
    return;
  }
  try {
    await activateKeepAwakeAsync(TAG);
  } catch {
    // ignore
  }
}

export async function releaseWakeLock(): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      await webLock?.release?.();
    } catch {
      // ignore
    }
    webLock = null;
    return;
  }
  try {
    deactivateKeepAwake(TAG);
  } catch {
    // ignore
  }
}

// Minimal ambient typing for WakeLockSentinel since lib.dom may not include it on
// older TS configs. Optional chaining above tolerates a missing API.
type WakeLockSentinel = {
  release?: () => Promise<void>;
  addEventListener?: (event: 'release', cb: () => void) => void;
};
