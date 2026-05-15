import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/** No-op on web; expo-haptics has a web shim but native is where this matters. */

export function tapStart(): void {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
}

export function tapSelection(): void {
  if (Platform.OS === 'web') return;
  void Haptics.selectionAsync();
}

export function tapSuccess(): void {
  if (Platform.OS === 'web') return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
