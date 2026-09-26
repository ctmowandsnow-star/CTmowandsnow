'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Season } from '@/config/services';

type Ctx = { season: Season; setSeason: (s: Season) => void; toggle: () => void };
const SeasonCtx = createContext<Ctx | null>(null);

/** Nordhalbkugel, Neuengland: Dez-Maerz ist Schneegeschaeft. */
function seasonNow(): Season {
  const m = new Date().getMonth(); // 0 = Januar
  return m === 11 || m <= 2 ? 'snow' : 'green';
}

const PALETTE: Record<Season, { accent: string; soft: string; deep: string }> = {
  green: { accent: '82 138 61', soft: '155 197 136', deep: '35 59 30' },
  snow: { accent: '62 140 184', soft: '148 199 224', deep: '35 66 89' },
};

export function SeasonProvider({ children }: { children: React.ReactNode }) {
  // Beim ersten Rendern auf dem Server IMMER 'green', sonst weicht das
  // Server-HTML vom Client ab und React meckert ueber Hydration. Die echte
  // Jahreszeit wird erst im Effekt gesetzt.
  const [season, setSeason] = useState<Season>('green');

  useEffect(() => { setSeason(seasonNow()); }, []);

  useEffect(() => {
    const p = PALETTE[season];
    const root = document.documentElement;
    root.style.setProperty('--accent', p.accent);
    root.style.setProperty('--accent-soft', p.soft);
    root.style.setProperty('--accent-deep', p.deep);
    root.dataset.season = season;
  }, [season]);

  const toggle = useCallback(
    () => setSeason((s) => (s === 'green' ? 'snow' : 'green')),
    [],
  );
  const value = useMemo(() => ({ season, setSeason, toggle }), [season, toggle]);
  return <SeasonCtx.Provider value={value}>{children}</SeasonCtx.Provider>;
}

export function useSeason(): Ctx {
  const c = useContext(SeasonCtx);
  if (!c) throw new Error('useSeason muss innerhalb von SeasonProvider stehen');
  return c;
}
