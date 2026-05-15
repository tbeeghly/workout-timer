import { Modal, View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/useTheme';
import { usePalette } from '../theme/PaletteContext';

export type ActionSheetItem = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  onPress: () => void;
};

type Props = {
  visible: boolean;
  title?: string;
  items: ActionSheetItem[];
  onClose: () => void;
};

export function ActionSheet({ visible, title, items, onClose }: Props) {
  const t = useTheme();
  const { palette } = usePalette();
  return (
    <Modal
      visible={visible}
      transparent
      animationType={Platform.OS === 'web' ? 'fade' : 'slide'}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          // Stop taps inside the sheet from closing it.
          onPress={() => {}}
          style={[
            styles.sheet,
            {
              backgroundColor: t.isDark ? '#1C1C1E' : '#FFFFFF',
            },
          ]}
        >
          {title ? (
            <View style={styles.titleWrap}>
              <Text
                style={[typography.footnote, { color: t.labelSecondary, textAlign: 'center' }]}
                numberOfLines={2}
              >
                {title}
              </Text>
            </View>
          ) : null}
          {items.map((item, idx) => (
            <Pressable
              key={item.label}
              onPress={() => {
                onClose();
                // Defer so the close animation can start.
                setTimeout(item.onPress, 0);
              }}
              style={({ pressed }) => [
                styles.item,
                idx > 0 && {
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: t.divider,
                },
                pressed && {
                  backgroundColor: t.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                },
              ]}
            >
              {item.icon ? (
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={item.destructive ? palette.danger : t.labelPrimary}
                  style={{ marginRight: 12 }}
                />
              ) : null}
              <Text
                style={[
                  typography.body,
                  { color: item.destructive ? palette.danger : t.labelPrimary },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.item,
              styles.cancel,
              {
                borderTopColor: t.divider,
                backgroundColor: pressed
                  ? t.isDark
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,0,0,0.05)'
                  : 'transparent',
              },
            ]}
          >
            <Text style={[typography.body, { color: t.labelSecondary, fontWeight: '600' }]}>
              Cancel
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  sheet: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
  },
  titleWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60,60,67,0.2)',
  },
  item: {
    minHeight: 52,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancel: {
    justifyContent: 'center',
    borderTopWidth: 6,
    borderTopColor: 'transparent',
  },
});
