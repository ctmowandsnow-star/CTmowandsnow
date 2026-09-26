import { setzeGlobalenZugang, BASIS, abs } from './zugang.mjs';
// Die Vorschau haengt hinter einer Passwortschranke - ohne diese Zeile
// misst der Pruefstand nur 401-Antworten.
setzeGlobalenZugang();
/**
 * Findet Aussagen auf der Website, die der Betrieb nie gemacht hat.
 *
 * DER FALL, DER DAS AUSGELOEST HAT: In zwei Leistungstexten stand "residential
 * and small commercial properties". Der Cousin schreibt in seiner Liste
 * ausschliesslich "Residential snow plowing" — Gewerbe kommt bei ihm nirgends
 * vor. Die Behauptung stammte von mir. Genau diese Sorte ungedeckter Aussage
 * darf nicht auf die Seite.
 *
 * Gemessen wird am AUSGELIEFERTEN HTML, nicht am Quelltext. Grund: ein erster
 * Versuch mit grep ueber src/ schlug an, weil das Wort in einem KOMMENTAR
 * stand, der erklaert, warum es nicht aufgenommen wurde. Ein Kommentar ist
 * keine Behauptung — was zaehlt, ist, was ein Besucher liest.
 */
// Adressen kommen aus zugang.mjs - dort steckt die Unterscheidung
// zwischen Pfaden MIT und OHNE /ct-Praefix.

let rot = 0, gruen = 0;
const melde = (ok, text) => { ok ? gruen++ : rot++; console.log(`${ok ? ' ok ' : 'ROT '} ${text}`); };

/**
 * Aussagen, die ohne ausdrueckliche Bestaetigung des Betriebs NICHT auf der
 * Website stehen duerfen. Jede einzelne ist in dieser Branche Standard und
 * jede einzelne ist ohne Beleg eine Falschaussage.
 */
const UNGEDECKT = [
  { muster: /\bcommercial\b/i, warum: 'Gewerbe — er nennt nur "Residential"' },
  { muster: /\bHOA\b|homeowners? association/i, warum: 'HOA/Eigentuemergemeinschaft nicht genannt' },
  { muster: /\blicensed\b/i, warum: 'Lizenz/Konzession — nicht belegt' },
  { muster: /\binsured\b|\binsurance\b/i, warum: 'Versicherung — nicht belegt' },
  { muster: /\bbonded\b/i, warum: 'Kaution/Bond — nicht belegt' },
  { muster: /\bcertified\b/i, warum: 'Zertifizierung — nicht belegt' },
  { muster: /\bguarantee[ds]?\b/i, warum: 'Garantie — nicht belegt' },
  { muster: /\b24\/7\b|around the clock, every day/i, warum: '24/7-Erreichbarkeit — nicht belegt' },
  { muster: /\b(family[- ]owned|family run)\b/i, warum: 'Familienbetrieb — nicht belegt' },
  { muster: /\b\d+\+? years (of )?(experience|in business)\b/i, warum: 'Jahre Erfahrung — nicht belegt' },
  { muster: /\bsince (19|20)\d\d\b/i, warum: 'Gruendungsjahr — nicht belegt' },
  { muster: /\b(award|award-winning|#1|number one|best in)\b/i, warum: 'Auszeichnung/Superlativ — nicht belegt' },
  { muster: /\b\d+(\.\d+)? (stars?|rating)\b|\b\d+ (reviews?|customers?|clients?)\b/i, warum: 'Bewertungen/Kundenzahl — nicht belegt' },
  { muster: /\bfree (estimate|quote)s? within \d+/i, warum: 'Zugesagte Reaktionszeit — nicht belegt' },
  { muster: /\bsatisfaction guaranteed|money[- ]back\b/i, warum: 'Zufriedenheitsgarantie — nicht belegt' },
  { muster: /\$\s?\d/, warum: 'Preisangabe — er nennt keine Preise, nur "free estimate"' },
];

const sm = await (await fetch(abs(`/sitemap.xml`))).text();
const pfade = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, '') || '/');
melde(pfade.length >= 20, `${pfade.length} Seiten aus der Sitemap zu pruefen`);

const treffer = [];
for (const p of pfade) {
  const r = await fetch(abs(p));
  if (!r.ok) continue;
  let h = await r.text();
  // Nur sichtbarer Text. Skripte raus (dort steht das JSON-LD, das dieselben
  // Saetze noch einmal traegt - doppelte Meldungen bringen nichts).
  const sicht = h.replace(/<script[\s\S]*?<\/script>/gi, ' ')
                 .replace(/<style[\s\S]*?<\/style>/gi, ' ')
                 .replace(/<[^>]+>/g, ' ')
                 .replace(/&amp;/g, '&').replace(/&#x27;/g, "'")
                 .replace(/\s+/g, ' ');
  for (const u of UNGEDECKT) {
    const m = sicht.match(u.muster);
    if (m) treffer.push(`${p}: "${m[0]}" (${u.warum})`);
  }
}
melde(treffer.length === 0,
  treffer.length === 0
    ? `Keine ungedeckte Aussage auf ${pfade.length} Seiten`
    : `${treffer.length} ungedeckte Aussage(n): ${treffer.slice(0, 6).join(' | ')}`);

// Gegenprobe zum Pruefmuster: untergeschobene Werbesaetze MUESSEN anschlagen.
// Ohne sie waere "0 Treffer" auch dann gruen, wenn die Muster nichts mehr
// finden - etwa nach einer Umstellung der Schreibweise.
{
  const gift = 'Licensed and insured, family-owned since 1998, 4.9 stars from 250 reviews. '
    + 'Commercial and HOA properties welcome. Satisfaction guaranteed, starting at $49.';
  const gefunden = UNGEDECKT.filter((u) => u.muster.test(gift));
  melde(gefunden.length >= 8,
    `Gegenprobe: erfundener Werbesatz schlaegt bei ${gefunden.length} von ${UNGEDECKT.length} Mustern an`);
}

// Und die Gegenrichtung: ein ehrlicher Satz der echten Website darf NICHT
// anschlagen. Sonst ist das Muster zu scharf und der Pruefstand wird nach
// drei Fehlalarmen abgeschaltet.
{
  const echt = 'We mow residential properties on a set weekly or biweekly schedule from spring through fall. '
    + 'The estimate is free and there is nothing owed if you pass.';
  const gefunden = UNGEDECKT.filter((u) => u.muster.test(echt));
  melde(gefunden.length === 0,
    `Gegenprobe: ehrlicher Satz loest keinen Fehlalarm aus (${gefunden.map((g) => g.warum).join(', ') || 'keiner'})`);
}

console.log(`\n${gruen} ok, ${rot} rot`);
process.exit(rot ? 1 : 0);
