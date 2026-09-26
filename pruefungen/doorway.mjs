import { setzeGlobalenZugang, BASIS, abs } from './zugang.mjs';
// Die Vorschau haengt hinter einer Passwortschranke - ohne diese Zeile
// misst der Pruefstand nur 401-Antworten.
setzeGlobalenZugang();
/**
 * Doorway-Test: unterscheiden sich die Seiten WIRKLICH?
 *
 * Die Website hat 70 Leistung-Ort-Seiten und 7 Ortsseiten. Das ist genau die
 * Bauform, die Google und die KI-Systeme aussortieren, SOBALD die Seiten nur
 * eine Schablone mit ausgetauschtem Ortsnamen sind. Und man sieht es einer
 * einzelnen Seite nicht an - erst der Vergleich zweier Seiten zeigt es.
 *
 * Gemessen wird deshalb paarweise am AUSGELIEFERTEN HTML:
 *
 *   1. Ersetze in beiden Seiten alle Orts- und Leistungsnamen durch Platzhalter.
 *      Was danach noch identisch ist, ist echte Schablone.
 *   2. Jaccard-Aehnlichkeit ueber die Wortmengen.
 *
 * Schwelle 0.90: darueber sind zwei Seiten praktisch dasselbe Dokument.
 * Ein gewisser Sockel ist normal und richtig - Navigation, Fusszeile und die
 * Leistungsbeschreibung selbst SIND auf beiden Seiten gleich, und das ist kein
 * Fehler. Entscheidend ist, dass der ortsspezifische Teil wirklich existiert.
 */
// Adressen kommen aus zugang.mjs - dort steckt die Unterscheidung
// zwischen Pfaden MIT und OHNE /ct-Praefix.
const SCHWELLE = 0.90;

let rot = 0, gruen = 0;
const melde = (ok, text) => { ok ? gruen++ : rot++; console.log(`${ok ? ' ok ' : 'ROT '} ${text}`); };

async function sichtbar(pfad) {
  const r = await fetch(abs(pfad));
  if (!r.ok) return null;
  let h = await r.text();
  h = h.replace(/<script[\s\S]*?<\/script>/gi, ' ')
       .replace(/<style[\s\S]*?<\/style>/gi, ' ')
       .replace(/<[^>]+>/g, ' ')
       .replace(/&[a-z]+;|&#x?[0-9a-f]+;/gi, ' ');
  return h.replace(/\s+/g, ' ').trim();
}

const sm = await (await fetch(abs(`/sitemap.xml`))).text();
const pfade = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, '') || '/');
const orte = pfade.filter((p) => /^\/service-areas\/[a-z-]+$/.test(p) && !p.includes('/county'))
  .map((p) => p.split('/').pop());
const kombis = pfade.filter((p) => /^\/services\/[a-z-]+\/[a-z-]+$/.test(p));
melde(orte.length >= 5 && kombis.length >= 20,
  `Gefunden: ${orte.length} Ortsseiten, ${kombis.length} Leistung-Ort-Seiten`);

/** Orts- und Leistungsnamen neutralisieren - sonst misst man nur den Namen. */
const ortNamen = orte.map((s) => s.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '));
function neutral(text) {
  let s = text;
  for (const n of [...ortNamen, 'Unionville', 'West Hartford', 'New Britain']) {
    s = s.split(n).join('«ORT»');
  }
  return s.toLowerCase();
}
function aehnlich(a, b) {
  const A = new Set(neutral(a).split(/\W+/).filter((w) => w.length > 3));
  const B = new Set(neutral(b).split(/\W+/).filter((w) => w.length > 3));
  const schnitt = [...A].filter((w) => B.has(w)).length;
  return schnitt / (A.size + B.size - schnitt);
}

// --- Ortsseiten paarweise ---------------------------------------------------
{
  const texte = {};
  for (const o of orte) texte[o] = await sichtbar(`/service-areas/${o}`);
  let schlimmster = { wert: 0, paar: '' };
  for (let i = 0; i < orte.length; i++) {
    for (let j = i + 1; j < orte.length; j++) {
      const v = aehnlich(texte[orte[i]], texte[orte[j]]);
      if (v > schlimmster.wert) schlimmster = { wert: v, paar: `${orte[i]} / ${orte[j]}` };
    }
  }
  melde(schlimmster.wert < SCHWELLE,
    `Ortsseiten: aehnlichstes Paar ${schlimmster.paar} bei ${schlimmster.wert.toFixed(3)} (Grenze ${SCHWELLE})`);
}

// --- Dieselbe Leistung an verschiedenen Orten -------------------------------
// Das ist der kritische Fall: "snow plowing in X" gegen "snow plowing in Y".
{
  const jeLeistung = {};
  for (const k of kombis) {
    const [, , leistung] = k.split('/');
    (jeLeistung[leistung] ||= []).push(k);
  }
  let schlimmster = { wert: 0, paar: '' };
  for (const [leistung, liste] of Object.entries(jeLeistung)) {
    const texte = {};
    for (const p of liste) texte[p] = await sichtbar(p);
    for (let i = 0; i < liste.length; i++) {
      for (let j = i + 1; j < liste.length; j++) {
        const v = aehnlich(texte[liste[i]], texte[liste[j]]);
        if (v > schlimmster.wert) schlimmster = { wert: v, paar: `${liste[i]} / ${liste[j]}` };
      }
    }
  }
  melde(schlimmster.wert < SCHWELLE,
    `Leistung x Ort: aehnlichstes Paar ${schlimmster.paar} bei ${schlimmster.wert.toFixed(3)} (Grenze ${SCHWELLE})`);
}

// --- Gegenprobe zum Messwerkzeug -------------------------------------------
// Zwei Texte, die sich NUR im Ortsnamen unterscheiden, muessen nach der
// Neutralisierung 1.000 ergeben. Ohne diese Probe waere ein niedriger Wert
// auch dann gruen, wenn die Aehnlichkeitsrechnung gar nicht misst.
{
  const a = 'We plow driveways in Plainville and keep the banks back from the end of the driveway.';
  const b = 'We plow driveways in Bristol and keep the banks back from the end of the driveway.';
  const v = aehnlich(a, b);
  melde(v > 0.99, `Gegenprobe: reine Schablone erreicht ${v.toFixed(3)} (erwartet 1.000)`);
  const c = 'Snow storage is the limiting factor here and banks must be pushed back early in the season.';
  const v2 = aehnlich(a, c);
  melde(v2 < 0.5, `Gegenprobe: echter Unterschied erreicht ${v2.toFixed(3)} (erwartet deutlich unter 0.5)`);
}

// --- Jede Kombiseite muss ihren ortsspezifischen Teil wirklich tragen -------
{
  const { readFile } = await import('node:fs/promises');
  const quelle = await readFile(new URL('../src/config/towns.ts', import.meta.url), 'utf8');
  // Je Ort den ersten Merkmalssatz herausziehen und im HTML nachweisen.
  const bloecke = quelle.split(/\n  \{\n/).slice(1);
  let geprueft = 0, fehlend = [];
  for (const b of bloecke) {
    const slug = (b.match(/slug: '([a-z-]+)'/) || [])[1];
    const fahr = (b.match(/driveways:\n\s*'([^']+)'/) || [])[1];
    if (!slug || !fahr) continue;
    const h = await sichtbar(`/services/snow-plowing/${slug}`);
    geprueft++;
    if (!h || !h.includes(fahr.slice(0, 50))) fehlend.push(slug);
  }
  melde(geprueft >= 5 && fehlend.length === 0,
    `Ortsmerkmal steht auf jeder Pflug-Seite (${geprueft} geprueft, fehlend: ${fehlend.join(', ') || 'keiner'})`);
}

console.log(`\n${gruen} ok, ${rot} rot`);
process.exit(rot ? 1 : 0);
