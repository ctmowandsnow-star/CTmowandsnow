'use client';

import NextLink from 'next/link';
import type { ComponentProps } from 'react';

/**
 * Interner Verweis.
 *
 * Kapselt `next/link`, um im statischen Vorschau-Export das Vorausladen
 * abzuschalten. Next fordert dafuer Dateien wie `/pfad.txt?_rsc=…` an, die
 * es in einem statischen Export nicht gibt - jede Anfrage endet mit 404 in
 * der Entwicklerkonsole, und der Browser wartet vor jedem Seitenwechsel
 * unnoetig auf ihr Scheitern.
 *
 * Im normalen Serverbetrieb bleibt das Vorausladen an, weil es dort wirkt.
 */
const VORSCHAU = process.env.NEXT_PUBLIC_VORSCHAU === '1';

export function Verweis(props: ComponentProps<typeof NextLink>) {
  return <NextLink {...props} prefetch={VORSCHAU ? false : props.prefetch} />;
}
