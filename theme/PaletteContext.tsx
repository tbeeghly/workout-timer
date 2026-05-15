import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultPaletteId, palettes, type Palette, type PaletteId } from './colors';

const STORAGE_KEY = 'workout-timer:palette:v1';

interface PaletteContextValue {
  id: PaletteId;
  palette: Palette;
  setPaletteId: (id: PaletteId) => void;
  available: Palette[];
}

const PaletteContext = createContext<PaletteContextValue>({
  id: defaultPaletteId,
  palette: palettes[defaultPaletteId],
  setPaletteId: () => {},
  available: Object.values(palettes),
});

export function PaletteProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<PaletteId>(defaultPaletteId);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!alive || !raw) return;
        if (raw in palettes) setId(raw as PaletteId);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo<PaletteContextValue>(
    () => ({
      id,
      palette: palettes[id],
      setPaletteId: (next) => {
        setId(next);
        AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      },
      available: Object.values(palettes),
    }),
    [id],
  );

  return <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>;
}

export function usePalette(): PaletteContextValue {
  return useContext(PaletteContext);
}
