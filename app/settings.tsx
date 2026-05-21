import { ScrollView, View, Text, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePalette } from '../theme/PaletteContext';
import { useTheme } from '../theme/useTheme';
import { typography } from '../theme/typography';
import type { Palette } from '../theme/colors';
import { restoreDefaultWorkouts } from '../src/storage';

export default function SettingsScreen() {
  const t = useTheme();
  const { id, palette, setPaletteId, available } = usePalette();

  const handleRestore = async () => {
    const { added } = await restoreDefaultWorkouts();
    const msg =
      added === 0
        ? 'All default workouts are already in your list.'
        : `Added ${added} default workout${added === 1 ? '' : 's'} to your list.`;
    if (Platform.OS === 'web') (globalThis as any).alert?.(msg);
    else Alert.alert('Restore defaults', msg);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.canvas }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text
          style={[
            typography.footnote,
            styles.sectionLabel,
            { color: t.labelSecondary },
          ]}
        >
          PALETTE
        </Text>
        <View
          style={[
            styles.group,
            { backgroundColor: t.surface2, borderColor: t.divider },
          ]}
        >
          {available.map((p, i) => (
            <PaletteRow
              key={p.id}
              palette={p}
              selected={p.id === id}
              labelPrimary={t.labelPrimary}
              labelSecondary={t.labelSecondary}
              divider={t.divider}
              accent={palette.primary}
              isLast={i === available.length - 1}
              onPress={() => setPaletteId(p.id)}
            />
          ))}
        </View>
        <Text style={[typography.footnote, styles.hint, { color: t.labelTertiary }]}>
          Palette applies across the app, including workout segments.
        </Text>

        <Text
          style={[
            typography.footnote,
            styles.sectionLabel,
            { color: t.labelSecondary, marginTop: 28 },
          ]}
        >
          WORKOUTS
        </Text>
        <View
          style={[
            styles.group,
            { backgroundColor: t.surface2, borderColor: t.divider },
          ]}
        >
          <Pressable
            onPress={handleRestore}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="refresh" size={20} color={palette.primary} style={{ marginLeft: 4 }} />
            <View style={styles.rowText}>
              <Text style={[typography.body, { color: t.labelPrimary }]} numberOfLines={1}>
                Restore default workouts
              </Text>
              <Text
                style={[typography.footnote, { color: t.labelSecondary, marginTop: 2 }]}
                numberOfLines={2}
              >
                Adds any preloaded workouts that aren't already in your list. Your custom workouts are untouched.
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface PaletteRowProps {
  palette: Palette;
  selected: boolean;
  labelPrimary: string;
  labelSecondary: string;
  divider: string;
  accent: string;
  isLast: boolean;
  onPress: () => void;
}

function PaletteRow({
  palette,
  selected,
  labelPrimary,
  labelSecondary,
  divider,
  accent,
  isLast,
  onPress,
}: PaletteRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.row,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: divider },
        pressed && { opacity: 0.6 },
      ]}
    >
      <View style={styles.swatchRow}>
        {palette.swatches.map((hex, i) => (
          <View
            key={`${palette.id}-${i}`}
            style={[styles.swatch, { backgroundColor: hex }]}
          />
        ))}
      </View>
      <View style={styles.rowText}>
        <Text style={[typography.body, { color: labelPrimary }]} numberOfLines={1}>
          {palette.name}
        </Text>
        <Text
          style={[typography.footnote, { color: labelSecondary, marginTop: 2 }]}
          numberOfLines={1}
        >
          {palette.credit}
        </Text>
      </View>
      {selected ? (
        <Ionicons name="checkmark" size={22} color={accent} />
      ) : (
        <View style={styles.checkPlaceholder} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingTop: 16, paddingBottom: 32 },
  sectionLabel: {
    paddingHorizontal: 16,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  group: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  hint: { paddingHorizontal: 16, marginTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swatch: {
    width: 18,
    height: 28,
    marginRight: -4,
    borderRadius: 4,
  },
  rowText: {
    flex: 1,
    marginLeft: 8,
  },
  checkPlaceholder: { width: 22, height: 22 },
});
