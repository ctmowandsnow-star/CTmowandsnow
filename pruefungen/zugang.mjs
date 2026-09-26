/**
 * Gemeinsamer Zugang fuer alle Pruefstaende.
 *
 * WARUM: Als die Vorschau eine Passwortschranke bekam, wurden vier von sieben
 * Pruefstaenden schlagartig rot - nicht weil das Produkt kaputt war, sondern
 * weil sie den Schalter nicht kannten. Das ist dieselbe Falle wie ein
 * vergessenes ROBAWS_MOCK: ein Pruefstand, der einen Betriebsschalter nicht
 * uebernimmt, misst etwas anderes als das Produkt.
 *
 * Deshalb liest JEDER Pruefstand die Zugangsdaten aus derselben Datei wie die
 * Middleware. Gibt es keine, laeuft alles wie vorher.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function lies() {
  try {
    const env = readFileSync(path.join(WURZEL, '.env.local'), 'utf8');
    const b = env.match(/VORSCHAU_BENUTZER=(.*)/)?.[1]?.trim();
    const p = env.match(/VORSCHAU_PASSWORT=(.*)/)?.[1]?.trim();
    if (b && p) return { username: b, password: p };
  } catch { /* keine Schranke */ }
  return null;
}

export const ZUGANG = lies();

/** Kopfzeilen fuer fetch. Leer, wenn keine Schranke gesetzt ist. */
export const KOPF = ZUGANG
  ? { authorization: 'Basic ' + Buffer.from(`${ZUGANG.username}:${ZUGANG.password}`).toString('base64') }
  : {};

/**
 * fetch mit Zugang. Ersetzt das globale fetch in den Pruefstaenden, damit
 * nicht jeder Aufruf einzeln angefasst werden muss.
 */
export function setzeGlobalenZugang() {
  if (!ZUGANG) return false;
  const echt = globalThis.fetch;
  globalThis.fetch = (url, opt = {}) =>
    echt(url, { ...opt, headers: { ...KOPF, ...(opt.headers || {}) } });
  return true;
}

/**
 * Adressen der laufenden Vorschau.
 *
 * Haengt die Seite hinter einem Proxy unter einem Unterpfad (NEXT_BASE_PATH,
 * auf dem Entwicklungsserver `/ct`), gibt es ZWEI
 * Sorten Pfade, und sie zu verwechseln kostet eine Stunde:
 *
 *   - Links im HTML tragen das Praefix bereits ("/ct/services").
 *   - Pfade aus der Sitemap tragen es NICHT ("/services"), weil dort die
 *     oeffentliche Adresse steht, die spaeter ohne Unterpfad laeuft.
 *
 * Ein naives `BASIS + pfad` ergibt deshalb mal die richtige Adresse und mal
 * `/ct/ct/services`. `abs()` entscheidet das anhand des Pfades selbst.
 */
export const HOST = process.env.HOST_BASIS || 'http://127.0.0.1:3210';
export const PRAEFIX = process.env.NEXT_BASE_PATH ?? '/ct';
export const BASIS = HOST + PRAEFIX;

/** Macht aus einem Pfad (mit oder ohne Praefix) eine vollstaendige Adresse. */
export function abs(pfad) {
  if (/^https?:\/\//.test(pfad)) return pfad;
  if (PRAEFIX && pfad.startsWith(PRAEFIX + '/')) return HOST + pfad;
  if (PRAEFIX && pfad === PRAEFIX) return HOST + pfad;
  return BASIS + (pfad.startsWith('/') ? pfad : '/' + pfad);
}
