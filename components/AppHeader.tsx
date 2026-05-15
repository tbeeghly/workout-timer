import { View, Text, StyleSheet } from 'react-native';
import { ReactNode } from 'react';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/useTheme';

type Props = {
  title: string;
  /** When set, renders a large title; otherwise centered small title. */
  large?: boolean;
  trailing?: ReactNode;
  leading?: ReactNode;
};

export function AppHeader({ title, large, trailing, leading }: Props) {
  const t = useTheme();
  return (
    <View style={[styles.bar, large && styles.barLarge]}>
      <View style={styles.side}>{leading}</View>
      {!large && (
        <Text
          style={[typography.headline, { color: t.labelPrimary }]}
          numberOfLines={1}
        >
          {title}
        </Text>
      )}
      <View style={[styles.side, { alignItems: 'flex-end' }]}>{trailing}</View>
      {large && (
        <Text
          style={[
            typography.largeTitle,
            styles.largeTitle,
            { color: t.labelPrimary },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    paddingHorizontal: 16,
  },
  barLarge: {
    flexDirection: 'column',
    alignItems: 'stretch',
    height: 'auto',
    minHeight: 96,
    paddingTop: 8,
    paddingBottom: 8,
  },
  side: { minWidth: 44, flexDirection: 'row', alignItems: 'center' },
  largeTitle: { paddingHorizontal: 16, marginTop: 8 },
});
