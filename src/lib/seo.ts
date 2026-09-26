import type { Metadata } from 'next';
import { BUSINESS } from '@/config/business';
import { REGION, TOWNS } from '@/config/towns';

/**
 * Solange die Seite ein Entwurf mit Platzhalter-Stammdaten ist, darf sie nicht
 * in einen Index rutschen. Ein halbfertiger Eintrag mit falschem Firmennamen
 * ist spaeter schwerer loszuwerden als gar keiner.
 */
export const ROBOTS: Metadata['robots'] = BUSINESS.istEntwurf
  ? { index: false, follow: false }
  : { index: true, follow: true };

export function canonical(path: string): Metadata['alternates'] {
  return { canonical: `${BUSINESS.url}${path}` };
}

/**
 * Laengengrenzen fuer Titel und Kurzbeschreibung.
 *
 * Google schneidet Titel ab etwa 60 Zeichen ab und Beschreibungen ab etwa
 * 160. Was abgeschnitten wird, landet weder im Suchergebnis noch in dem Satz,
 * den ein KI-System ueber den Betrieb wiedergibt. Gemessen am 26.09.2026:
 * 16 von 98 Titeln und 86 von 98 Beschreibungen lagen darueber, die der
 * Startseite bei 222 Zeichen. pruefungen/geo.mjs haelt beide Grenzen fuer
 * jede Seite aus der Sitemap fest.
 */
export const TITEL_MAX = 60;
export const BESCHREIBUNG_MAX = 160;

/** Seitentitel mit Firmenname, wenn beides zusammen passt - sonst ohne. */
export function titel(kern: string): Metadata['title'] {
  const mitMarke = `${kern} — ${BUSINESS.name}`;
  return { absolute: mitMarke.length <= TITEL_MAX ? mitMarke : kern };
}

/**
 * Nimmt den ersten Kandidaten, der in BESCHREIBUNG_MAX passt. Die Kandidaten
 * stehen vom ausfuehrlichsten zum knappsten. Passt keiner, wird der letzte an
 * einer Wortgrenze gekuerzt - nie mitten im Wort.
 */
export function beschreibung(...kandidaten: string[]): string {
  const sauber = kandidaten.map((k) => k.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const passend = sauber.find((k) => k.length <= BESCHREIBUNG_MAX);
  if (passend) return passend;
  const letzter = sauber[sauber.length - 1] ?? '';
  const schnitt = letzter.slice(0, BESCHREIBUNG_MAX - 1);
  return `${schnitt.slice(0, schnitt.lastIndexOf(' ')).replace(/[,;:\s—-]+$/, '')}…`;
}

/** "A, B and C" */
export function aufzaehlung(namen: string[]): string {
  return namen.length < 2 ? namen.join('') : `${namen.slice(0, -1).join(', ')} and ${namen[namen.length - 1]}`;
}

/**
 * Die ersten Orte der Route - fuer Beschreibungen, in denen nicht alle sieben
 * Platz haben. Nur mit Kommas: dahinter folgt immer "and nearby towns", sonst
 * steht "Farmington and Bristol and nearby towns" da.
 */
export const ORTE_KURZ = TOWNS.slice(0, 3).map((t) => t.name).join(', ');

/** Startseite: Titel und Beschreibung stehen hier, weil Layout UND Seitenknoten sie brauchen. */
export const START_TITEL = `${BUSINESS.name} — Lawn Care & Snow Removal in Central CT`;
export const START_BESCHREIBUNG = beschreibung(
  `Lawn mowing, mulch, cleanups and bush work spring through fall; driveway plowing, walkways and ice `
    + `control all winter. Serving ${ORTE_KURZ} and nearby towns.`,
  `Lawn care spring through fall, snow plowing and ice control all winter. Serving ${ORTE_KURZ} and `
    + `nearby towns in ${REGION}.`,
);

/**
 * Wer die Inhalte verantwortet. Next rendert daraus <meta name="author"> und
 * <link rel="author">. Steht im Layout und gilt damit fuer jede Seite.
 */
export const AUTOREN: Metadata['authors'] = [{ name: BUSINESS.name, url: `${BUSINESS.url}/about` }];
