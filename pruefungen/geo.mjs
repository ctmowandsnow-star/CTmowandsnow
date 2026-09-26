import { readFile } from 'node:fs/promises';
import { setzeGlobalenZugang, abs } from './zugang.mjs';
setzeGlobalenZugang();
/**
 * GEO-Pruefstand: das, was Suchmaschinen und KI-Systeme zuerst lesen - fuer
 * JEDE Seite aus der Sitemap, gemessen am ausgelieferten HTML.
 *
 * AUSLOESER (26.09.2026): Der GEO-Check von ai-geotracking.com gab der Seite
 * 51 von 100 Punkten. Drei Ursachen lagen im Code, nicht in fehlenden Daten:
 *   - Der Firmendatensatz hatte den Typ "LandscapingBusiness". Den gibt es in
 *     schema.org nicht - fuer jeden Validator war der Betrieb kein Unternehmen
 *     (Identitaet 0 von 15 Punkten), obwohl er auf allen 98 Seiten stand.
 *   - 16 von 98 Titeln lagen ueber 60 Zeichen, 86 von 98 Beschreibungen ueber
 *     160 (Startseite: 222). Google und die Modelle schneiden dort ab.
 *   - Nur 77 Seiten hatten einen Seitenknoten, keine einzige eine Angabe,
 *     wer sie verantwortet (author). Dazu stand auf Start- und Kontaktseite
 *     sichtbar "Phone number goes here once it is set".
 * Keine der fuenf bestehenden Pruefungen hat davon etwas bemerkt.
 *
 * Die Regeln stehen als Funktionen hier, damit dieselben Funktionen auch die
 * Gegenproben am Ende pruefen: ein Pruefstand, der nichts findet, muss
 * belegen, dass er etwas finden WUERDE.
 */

let rot = 0, gruen = 0;
const melde = (ok, text) => { ok ? gruen++ : rot++; console.log(`${ok ? ' ok ' : 'ROT '} ${text}`); };

// --- Konfiguration (TypeScript -> gelesen per Muster, wie die anderen Pruefstaende)
const business = await readFile(new URL('../src/config/business.ts', import.meta.url), 'utf8');
const feld = (muster) => ((business.match(muster) || [])[1] || '').trim();
const offen = (w) => !w || !w.trim() || /platzhalter|pending|example-/i.test(w);
const IST_ENTWURF = /^\s*istEntwurf:\s*true\s*,/m.test(business);
const URL_BETRIEB = feld(/^\s*url:\s*'(https?:[^']+)'/m);
const INHABER = feld(/^\s*ownerName:\s*'([^']*)'/m);
const TELEFON = feld(/^\s*phone:\s*'([^']*)'/m);
melde(!!URL_BETRIEB, `Domain aus business.ts gelesen (${URL_BETRIEB || 'NICHT GEFUNDEN'})`);
const BUSINESS_ID = `${URL_BETRIEB}/#business`;

// --- Regeln ------------------------------------------------------------------
export const TITEL_MIN = 25, TITEL_MAX = 60, BESCHR_MIN = 70, BESCHR_MAX = 160;

/**
 * Echte schema.org-Typen fuer einen Betrieb (LocalBusiness und die Untertypen,
 * die fuer Handwerk und Hausdienste in Frage kommen). Bewusst eine Liste statt
 * eines Musters: "LandscapingBusiness" SIEHT aus wie ein Typ und ist keiner.
 */
const GUELTIGE_FIRMENTYPEN = new Set([
  'LocalBusiness', 'HomeAndConstructionBusiness', 'GeneralContractor', 'Electrician', 'HVACBusiness',
  'HousePainter', 'Locksmith', 'MovingCompany', 'Plumber', 'RoofingContractor', 'ProfessionalService',
]);
const SEITENTYPEN = new Set(['WebPage', 'AboutPage', 'ContactPage', 'CollectionPage', 'ImageGallery', 'ItemPage']);
/** Saetze, die nur ein unfertiger Stand sagt. */
const PLATZHALTER = /goes here|not set yet|once it is set|placeholder|\bpending\b|lorem ipsum|\bTODO\b|\[fehlt\]|\[missing\]/i;

const dekodiere = (s) => s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const titelVon = (h) => dekodiere(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(h)?.[1] ?? '').trim();
const beschreibungVon = (h) => dekodiere(/<meta name="description" content="([^"]*)"/i.exec(h)?.[1] ?? '').trim();
const canonicalVon = (h) => /<link rel="canonical" href="([^"]+)"/i.exec(h)?.[1] ?? '';
const sichtbar = (h) => dekodiere(h.replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
function ldBloecke(h) {
  return [...h.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((m) => { try { return JSON.parse(m[1]); } catch { return null; } });
}

/** Alle Regeln fuer EINE Seite. Liefert die Liste der Verstoesse. */
export function pruefeSeite(html, { entwurf = IST_ENTWURF, telefon = TELEFON, inhaber = INHABER } = {}) {
  const fehler = [];
  const t = titelVon(html);
  if (t.length < TITEL_MIN || t.length > TITEL_MAX) fehler.push(`Titel ${t.length} Zeichen (${TITEL_MIN}-${TITEL_MAX}): "${t}"`);
  const d = beschreibungVon(html);
  if (d.length < BESCHR_MIN || d.length > BESCHR_MAX) fehler.push(`Beschreibung ${d.length} Zeichen (${BESCHR_MIN}-${BESCHR_MAX})`);

  const bloecke = ldBloecke(html);
  if (bloecke.some((b) => b === null)) fehler.push('ungueltiges JSON-LD');
  const gueltig = bloecke.filter(Boolean);

  const firmen = gueltig.filter((b) => b['@id'] === BUSINESS_ID);
  if (firmen.length !== 1) fehler.push(`${firmen.length} Firmendatensaetze (erwartet genau 1)`);
  for (const f of firmen) {
    const typen = [].concat(f['@type']);
    const unbekannt = typen.filter((x) => !GUELTIGE_FIRMENTYPEN.has(x));
    if (unbekannt.length) fehler.push(`Firmentyp nicht in schema.org: ${unbekannt.join(', ')}`);
    if (!f.name || !f.url || !Array.isArray(f.areaServed) || !f.areaServed.length) fehler.push('Firmendatensatz ohne name/url/areaServed');
    if (!offen(telefon) && f.telephone !== telefon) fehler.push(`telephone im Schema "${f.telephone}" statt "${telefon}"`);
    const person = f.employee || f.founder;
    if (!offen(inhaber) && person?.name !== inhaber) fehler.push(`Inhaber "${inhaber}" fehlt als Person im Schema`);
  }
  // Ein Platzhaltername darf NIE zur Person im Schema werden.
  if (offen(inhaber) && JSON.stringify(gueltig).includes('"Person"')) fehler.push('Person im Schema, obwohl kein echter Inhabername eingetragen ist');

  const seiten = gueltig.filter((b) => SEITENTYPEN.has(b['@type']));
  if (seiten.length !== 1) fehler.push(`${seiten.length} Seitenknoten (erwartet genau 1)`);
  for (const s of seiten) {
    const can = canonicalVon(html);
    if (s.url !== can) fehler.push(`Seitenknoten-url "${s.url}" != canonical "${can}"`);
    if (s.author?.['@id'] !== BUSINESS_ID) fehler.push('Seitenknoten ohne author');
    if (s.publisher?.['@id'] !== BUSINESS_ID) fehler.push('Seitenknoten ohne publisher');
  }
  if (!/<link rel="author" href="[^"]+"/.test(html)) fehler.push('kein <link rel="author">');

  const ph = sichtbar(html).match(new RegExp(`[^.]{0,50}(?:${PLATZHALTER.source})[^.]{0,30}`, 'i'));
  if (ph) fehler.push(`Platzhalter sichtbar: "${ph[0].trim()}"`);

  if (!entwurf && /<meta name="robots" content="[^"]*noindex/i.test(html)) fehler.push('noindex, obwohl die Seite live ist');
  return fehler;
}

/** llms.txt: Aufbau nach llmstxt.org + jeder Link zeigt auf eine echte Seite. */
export function pruefeLlms(text, sitemapUrls) {
  const fehler = [];
  const h1 = text.split('\n').filter((z) => /^# /.test(z));
  if (h1.length !== 1) fehler.push(`${h1.length} H1-Zeilen (llmstxt.org: genau eine)`);
  if (!/^> .{40,}/m.test(text)) fehler.push('kein Zitatblock mit Kurzfassung');
  if (!/similarly named/i.test(text)) fehler.push('Hinweis auf gleichnamige Betriebe fehlt');
  const links = [...text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]);
  const tot = links.filter((l) => !sitemapUrls.has(l));
  if (tot.length) fehler.push(`Links ohne Seite: ${tot.slice(0, 4).join(', ')}`);
  for (const pfad of ['/services/', '/service-areas/']) {
    const soll = [...sitemapUrls].filter((u) => u.includes(pfad) && u.split('/').length === 5);
    const fehlt = soll.filter((u) => !links.includes(u));
    if (fehlt.length) fehler.push(`nicht verlinkt: ${fehlt.slice(0, 4).join(', ')}`);
  }
  return fehler;
}

// --- 1. Jede Seite aus der Sitemap -----------------------------------------
const sm = await (await fetch(abs('/sitemap.xml'))).text();
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
melde(urls.length >= 20, `Sitemap nennt ${urls.length} Seiten`);
const sitemapUrls = new Set(urls);

const verstoesse = [];
let geprueft = 0;
for (const u of urls) {
  const pfad = u.replace(/^https?:\/\/[^/]+/, '') || '/';
  const r = await fetch(abs(pfad));
  if (r.status !== 200) { verstoesse.push(`${pfad}: HTTP ${r.status}`); continue; }
  geprueft++;
  for (const f of pruefeSeite(await r.text())) verstoesse.push(`${pfad}: ${f}`);
}
melde(geprueft === urls.length && verstoesse.length === 0,
  verstoesse.length === 0
    ? `${geprueft} Seiten: Titel ${TITEL_MIN}-${TITEL_MAX}, Beschreibung ${BESCHR_MIN}-${BESCHR_MAX}, gueltiger Firmentyp, `
      + 'Seitenknoten mit author, rel=author, kein Platzhalter'
    : `${verstoesse.length} Verstoesse, z. B.:\n      ${verstoesse.slice(0, 10).join('\n      ')}`);

// --- 2. llms.txt ---------------------------------------------------------------
const llms = await (await fetch(abs('/llms.txt'))).text();
const llmsFehler = pruefeLlms(llms, sitemapUrls);
melde(llmsFehler.length === 0, llmsFehler.length === 0
  ? 'llms.txt: eine H1, Kurzfassung, Namensvetter-Hinweis, alle Leistungen und Orte verlinkt, kein toter Link'
  : `llms.txt: ${llmsFehler.join(' | ')}`);

// --- 3. robots.txt, sobald die Seite live ist -----------------------------------
const robots = await (await fetch(abs('/robots.txt'))).text();
if (IST_ENTWURF) {
  melde(true, 'Entwurf: robots.txt-Freigabe wird erst beim Scharfschalten geprueft (durchstich.mjs haelt die Sperre fest)');
} else {
  const sperrt = /^\s*Disallow:\s*\/\s*$/m.test(robots);
  const kiBots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'CCBot'];
  const fehlend = kiBots.filter((b) => !new RegExp(`^User-Agent:\\s*${b}\\s*$`, 'mi').test(robots));
  melde(!sperrt && fehlend.length === 0 && /^Sitemap:\s*https?:\/\//mi.test(robots),
    `Live: robots.txt sperrt nichts, nennt alle ${kiBots.length} KI-Crawler und die Sitemap (fehlend: ${fehlend.join(', ') || 'keiner'})`);
}

// --- 4. Gegenproben: jede Regel muss an einem kaputten Beispiel anschlagen ------
{
  const kopf = (titel, beschr) => `<html><head><title>${titel}</title><meta name="description" content="${beschr}"/>`
    + `<link rel="canonical" href="${URL_BETRIEB}/x"/><link rel="author" href="${URL_BETRIEB}/about"/></head><body>`;
  const firma = (typ) => `<script type="application/ld+json">${JSON.stringify({ '@type': typ, '@id': BUSINESS_ID, name: 'X', url: URL_BETRIEB, areaServed: [{ '@type': 'City', name: 'Y' }] })}</script>`;
  const seite = (autor = true) => `<script type="application/ld+json">${JSON.stringify({ '@type': 'WebPage', url: `${URL_BETRIEB}/x`, ...(autor ? { author: { '@id': BUSINESS_ID }, publisher: { '@id': BUSINESS_ID } } : {}) })}</script>`;
  const gutT = 'Snow Plowing in Plainville, CT — Example Co';
  const gutD = 'Driveways plowed during the storm and again once it stops. Free estimates in Plainville and nearby towns.';
  const sauber = `${kopf(gutT, gutD)}${firma('HomeAndConstructionBusiness')}${seite()}<p>Real text.</p></body></html>`;

  const faelle = [
    ['sauberes Beispiel ergibt 0 Verstoesse', sauber, 0],
    ['Titel mit 70 Zeichen', sauber.replace(gutT, 'CT Mow&amp;Snow — Reliable Lawn Care &amp; Snow Removal in Central Connecticut'), 1],
    ['Beschreibung mit 222 Zeichen', sauber.replace(gutD, 'x'.repeat(222)), 1],
    ['Firmentyp LandscapingBusiness', sauber.replace('HomeAndConstructionBusiness', 'LandscapingBusiness'), 1],
    ['Seitenknoten ohne author', sauber.replace(seite(), seite(false)), 1],
    ['Seite ganz ohne Seitenknoten', sauber.replace(seite(), ''), 1],
    ['sichtbarer Platzhalter', sauber.replace('Real text.', 'Tell us more. (Phone number goes here once it is set.)'), 1],
    ['kein rel=author', sauber.replace(/<link rel="author"[^>]*>/, ''), 1],
    ['noindex auf einer Live-Seite', sauber.replace('<head>', '<head><meta name="robots" content="noindex, nofollow"/>'), 1],
  ];
  // Feste, neutrale Konfiguration: sonst haengt "sauber" davon ab, ob in
  // business.ts gerade Telefon und Inhaber stehen. Im Live-Probelauf vom
  // 26.09. wurde das saubere Beispiel genau deshalb rot.
  const neutral = { entwurf: false, telefon: '', inhaber: '' };
  const mitPerson = sauber.replace('"name":"X"', '"name":"X","employee":{"@type":"Person","name":"Jane Doe"}');
  faelle.push(
    ['Inhaber eingetragen, aber keine Person im Schema', sauber, 1, { inhaber: 'Jane Doe' }],
    ['Telefon eingetragen, aber nicht im Schema', sauber, 1, { telefon: '+18605550100' }],
    ['Person im Schema ohne echten Inhabernamen', mitPerson, 1, {}],
    ['Inhaber eingetragen und als Person im Schema', mitPerson, 0, { inhaber: 'Jane Doe' }],
  );
  for (const [name, html, soll, konfig = {}] of faelle) {
    const ist = pruefeSeite(html, { ...neutral, ...konfig });
    melde(soll === 0 ? ist.length === 0 : ist.length >= soll,
      `Gegenprobe "${name}": ${ist.length} Verstoss/Verstoesse${ist.length ? ` (${ist[0]})` : ''}`);
  }

  const llmsKaputt = `# A — llms.txt\n# Structured facts\n> ${'x'.repeat(50)}\n- [Tot](${URL_BETRIEB}/gibt-es-nicht)\n`;
  const lf = pruefeLlms(llmsKaputt, sitemapUrls);
  melde(lf.some((f) => /H1/.test(f)) && lf.some((f) => /ohne Seite/.test(f)) && lf.some((f) => /gleichnamig/i.test(f)),
    `Gegenprobe llms.txt (zwei H1, toter Link, ohne Hinweis): ${lf.length} Befunde`);
}

console.log(`\n${gruen} ok, ${rot} rot`);
process.exit(rot ? 1 : 0);
