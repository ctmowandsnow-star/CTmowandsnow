import { BUSINESS, OFFENE_FELDER } from '@/config/business';

/**
 * Sichtbares Band, solange Platzhalter in den Stammdaten stehen.
 *
 * Absicht: Niemand soll diesen Entwurf fuer fertig halten und ihn mit einem
 * erfundenen Firmennamen herumzeigen. Das Band verschwindet von selbst,
 * sobald `istEntwurf` in business.ts auf false steht.
 *
 * Es ist `fixed` mit FESTER Hoehe (36px), und der Header setzt sich darunter.
 * Im ersten Anlauf lag es im normalen Fluss - der fixierte Header legte sich
 * darueber und Navigation und Bandtext schrieben sich gegenseitig zu. Im
 * Screenshot sofort zu sehen, in keiner Textpruefung. Die Hoehe steht deshalb
 * an EINER Stelle (--draft-h in globals.css) und wird von Band, Header und
 * Seitenabstand gemeinsam benutzt.
 */
export function DraftBanner() {
  if (!BUSINESS.istEntwurf) return null;
  return (
    <div
      className="fixed inset-x-0 top-0 z-[70] flex h-[var(--draft-h)] items-center justify-center gap-2
                 overflow-hidden border-b border-amber-400/30 bg-amber-950/95 px-4 backdrop-blur"
    >
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-[.14em] text-amber-300">
        Draft
      </span>
      <span className="truncate text-[11px] text-amber-100/75">
        Placeholder details — still missing: {OFFENE_FELDER.map((f) => f.feld).join(', ')}
      </span>
    </div>
  );
}
