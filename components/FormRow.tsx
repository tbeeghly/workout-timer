import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/useTheme';

type BaseProps = {
  label: string;
  /** When true, render a divider underneath. Use `false` on the last row of a group. */
  divider?: boolean;
};

type TextFieldProps = BaseProps & {
  variant: 'text';
  value: string;
  placeholder?: string;
  onChangeText: (v: string) => void;
};

type NumberFieldProps = BaseProps & {
  variant: 'number';
  value: number;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  onChange: (n: number) => void;
};

type StaticProps = BaseProps & {
  variant: 'static';
  value: string;
};

type Props = TextFieldProps | NumberFieldProps | StaticProps;

export function FormRow(props: Props) {
  const t = useTheme();

  return (
    <View>
      <View style={styles.row}>
        <Text style={[typography.body, { color: t.labelPrimary, flexShrink: 0, minWidth: 120 }]}>
          {props.label}
        </Text>
        <View style={styles.valueWrap}>
          {props.variant === 'text' && (
            <TextInput
              style={[typography.body, styles.input, { color: t.labelPrimary }]}
              placeholder={props.placeholder}
              placeholderTextColor={t.labelTertiary}
              value={props.value}
              onChangeText={props.onChangeText}
              returnKeyType="done"
            />
          )}
          {props.variant === 'number' && (
            <NumberStepper
              value={props.value}
              min={props.min ?? 0}
              max={props.max ?? 9999}
              step={props.step ?? 1}
              suffix={props.suffix}
              onChange={props.onChange}
            />
          )}
          {props.variant === 'static' && (
            <Text style={[typography.body, { color: t.labelSecondary }]}>{props.value}</Text>
          )}
        </View>
      </View>
      {props.divider !== false ? (
        <View style={[styles.divider, { backgroundColor: t.divider }]} />
      ) : null}
    </View>
  );
}

function NumberStepper({
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (n: number) => void;
}) {
  const t = useTheme();
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={() => onChange(clamp(value - step))}
        hitSlop={6}
        style={({ pressed }) => [
          styles.stepBtn,
          { backgroundColor: t.surface3, opacity: pressed ? 0.6 : 1 },
        ]}
      >
        <Text style={[typography.headline, { color: t.labelPrimary }]}>−</Text>
      </Pressable>
      <TextInput
        keyboardType="numeric"
        value={String(value)}
        onChangeText={(text) => {
          const n = parseInt(text.replace(/[^0-9]/g, ''), 10);
          onChange(clamp(Number.isFinite(n) ? n : 0));
        }}
        style={[typography.body, styles.numberInput, { color: t.labelPrimary }]}
      />
      {suffix ? (
        <Text style={[typography.footnote, { color: t.labelSecondary, marginHorizontal: 4 }]}>
          {suffix}
        </Text>
      ) : null}
      <Pressable
        onPress={() => onChange(clamp(value + step))}
        hitSlop={6}
        style={({ pressed }) => [
          styles.stepBtn,
          { backgroundColor: t.surface3, opacity: pressed ? 0.6 : 1 },
        ]}
      >
        <Text style={[typography.headline, { color: t.labelPrimary }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 48,
    gap: 12,
  },
  valueWrap: { flex: 1, alignItems: 'flex-end' },
  input: { flex: 1, textAlign: 'right', paddingVertical: 8 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberInput: { width: 44, textAlign: 'center', paddingVertical: 4 },
});
