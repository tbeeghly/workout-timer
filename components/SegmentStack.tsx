import { useEffect, useMemo, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { segmentColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useTheme } from '../theme/useTheme';
import type { RuntimeSegment } from '../src/types';
import { formatMMSSCeil, formatMMSS } from '../src/format';

/**
 * The signature runner view: vertical stack of segment blocks whose heights
 * are proportional to their durations (clamped), with the active block
 * auto-scrolled into a near-top "playhead" position.
 */

export const PX_PER_SEC = 4;
export const MIN_H = 56;
export const MAX_H = 280;

export function segmentHeight(durationSec: number): number {
  return Math.max(MIN_H, Math.min(MAX_H, durationSec * PX_PER_SEC));
}

type Props = {
  segments: RuntimeSegment[];
  currentIndex: number;
  remainingMs: number;
  /** Whether the runner is actively running (vs paused / idle / done). */
  isActive: boolean;
};

const CONTENT_PADDING_TOP = 160;

/** Scroll position that vertically centers row `i` in the viewport. */
function centerY(
  offsets: number[],
  heights: number[],
  i: number,
  viewportH: number,
): number {
  return Math.max(
    0,
    CONTENT_PADDING_TOP + offsets[i] + heights[i] / 2 - viewportH / 2,
  );
}

export function SegmentStack({ segments, currentIndex, remainingMs, isActive }: Props) {
  const t = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const userScrolledAtRef = useRef<number>(0);
  const viewportHRef = useRef<number>(
    typeof Dimensions !== 'undefined' ? Dimensions.get('window').height : 800,
  );

  // Precompute heights + cumulative offsets so we can scroll to any index in O(1).
  const { heights, offsets } = useMemo(() => {
    const hs: number[] = new Array(segments.length);
    const os: number[] = new Array(segments.length);
    let acc = 0;
    for (let i = 0; i < segments.length; i++) {
      hs[i] = segmentHeight(segments[i].durationSec);
      os[i] = acc;
      acc += hs[i];
    }
    return { heights: hs, offsets: os };
  }, [segments]);

  // Auto-scroll when currentIndex changes — unless the user scrolled in the
  // last 4s, in which case we let them be.
  useEffect(() => {
    if (currentIndex < 0 || currentIndex >= segments.length) return;
    const sinceUser = Date.now() - userScrolledAtRef.current;
    if (sinceUser < 4000) return;
    const targetY = centerY(offsets, heights, currentIndex, viewportHRef.current);
    scrollRef.current?.scrollTo({ y: targetY, animated: true });
  }, [currentIndex, offsets, heights, segments.length]);

  // Periodic re-snap so that if the user scrolled then stopped, the active
  // segment is recentered after the cooldown.
  useEffect(() => {
    if (!isActive) return;
    const t = setInterval(() => {
      if (currentIndex < 0 || currentIndex >= segments.length) return;
      const sinceUser = Date.now() - userScrolledAtRef.current;
      if (sinceUser < 4000) return;
      const targetY = centerY(offsets, heights, currentIndex, viewportHRef.current);
      scrollRef.current?.scrollTo({ y: targetY, animated: true });
    }, 2000);
    return () => clearInterval(t);
  }, [currentIndex, isActive, offsets, heights, segments.length]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      contentContainerStyle={styles.content}
      onScrollBeginDrag={() => {
        userScrolledAtRef.current = Date.now();
      }}
      onLayout={(e) => {
        viewportHRef.current = e.nativeEvent.layout.height;
      }}
      scrollEventThrottle={32}
      showsVerticalScrollIndicator={false}
    >
      {segments.map((seg, i) => {
        const isPast = i < currentIndex;
        const isActiveRow = i === currentIndex && currentIndex < segments.length;
        return (
          <SegmentRow
            key={`${i}-${seg.kind}-${seg.name}`}
            segment={seg}
            height={heights[i]}
            isPast={isPast}
            isActive={isActiveRow}
            remainingMs={isActiveRow ? remainingMs : null}
            labelColor={t.labelPrimaryDark}
          />
        );
      })}
      <View style={{ height: 240 }} />
    </ScrollView>
  );
}

type RowProps = {
  segment: RuntimeSegment;
  height: number;
  isPast: boolean;
  isActive: boolean;
  remainingMs: number | null;
  labelColor: string;
};

function SegmentRow({ segment, height, isPast, isActive, remainingMs }: RowProps) {
  const bg = segmentColors[segment.kind] ?? '#666';
  // Past rows are visually dimmed; active rows pop; future rows sit at normal.
  const opacity = isPast ? 0.28 : isActive ? 1 : 0.85;
  return (
    <View style={[styles.row, { height, opacity }]}>
      {/* Left accent bar — thicker on active */}
      <View
        style={[
          styles.accent,
          {
            backgroundColor: bg,
            width: isActive ? 8 : 4,
          },
        ]}
      />
      {/* Block background with a subtle gradient */}
      <LinearGradient
        colors={[bg, withAlpha(bg, 0.7)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.rowContent}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text
            style={[
              isActive ? typography.title2 : typography.title3,
              { color: '#FFFFFF' },
            ]}
            numberOfLines={2}
          >
            {segment.name}
          </Text>
          {segment.roundIndex && segment.totalRounds ? (
            <Text
              style={[
                typography.caption1,
                { color: 'rgba(255,255,255,0.75)', marginTop: 2 },
              ]}
            >
              Round {segment.roundIndex} / {segment.totalRounds}
            </Text>
          ) : null}
        </View>
        <View style={styles.rowDuration}>
          <Text
            style={[
              isActive ? typography.displaySm : typography.title3,
              { color: '#FFFFFF', fontVariant: ['tabular-nums'] },
            ]}
          >
            {isActive && remainingMs != null
              ? formatMMSSCeil(remainingMs)
              : formatMMSS(segment.durationSec)}
          </Text>
        </View>
      </View>
    </View>
  );
}

/** Mix a hex/rgb color towards transparent for a soft gradient end. */
function withAlpha(color: string, alpha: number): string {
  // Quick handler for `#RRGGBB` and `rgba(...)` only — sufficient for our tokens.
  if (color.startsWith('#') && color.length === 7) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return color;
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: CONTENT_PADDING_TOP, paddingBottom: 0 },
  row: {
    flexDirection: 'row',
    overflow: 'hidden',
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 14,
    backgroundColor: '#222',
  },
  accent: { height: '100%' },
  rowContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  rowDuration: { alignItems: 'flex-end' },
});
