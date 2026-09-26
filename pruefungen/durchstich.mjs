import { setzeGlobalenZugang, BASIS, abs } from './zugang.mjs';
// Die Vorschau haengt hinter einer Passwortschranke - ohne diese Zeile
// misst der Pruefstand nur 401-Antworten.
setzeGlobalenZugang();
/**
 * Durchstich ueber die ganze Website am LAUFENDEN Server.
 *
 * Gemessen wird am ausgelieferten HTML, nicht am Quelltext. Der Unterschied
 * hat mich schon einmal Geld gekostet: eine Gegenprobe war am Quelltext gruen,
 * waehrend das gebaute Paket 19 Minuten aelter war und zwei Korrekturen nicht
 * enthielt.
 */
// Adressen kommen aus zugang.mjs - dort steckt die Unterscheidung
// zwischen Pfaden MIT und OHNE /ct-Praefix.

/** Eine Kennung fuer den Lauf - dieselbe beim Schreiben wie beim Aufraeumen. */
const KENNUNG = `ZEUS-PRUEFSTAND-${process.pid}`;
/**
 * Dieselbe Adresse in JEDER Probe, auch in denen, die abgewiesen werden
 * sollen. Grund: Im Mutationslauf ging die Leerzeichen-Probe absichtlich
 * durch (das war der eingebaute Defekt) und hinterliess einen Eintrag mit
 * dem Namen "   ". Das Aufraeumen suchte nur nach der Kennung und liess ihn
 * stehen. Ueber die Adresse findet es auch die Proben, die nicht so
 * ausgegangen sind wie erwartet.
 */
const PRUEF_MAIL = 'pruefstand@example.invalid';

let rot = 0, gruen = 0;
const melde = (ok, text) => { ok ? gruen++ : rot++; console.log(`${ok ? ' ok ' : 'ROT '} ${text}`); };

async function hol(pfad) {
  const r = await fetch(abs(pfad));
  return { status: r.status, text: await r.text(), typ: r.headers.get('content-type') || '' };
}

// --- 1. Jede Seite antwortet -----------------------------------------------
const { SERVICES } = await import('../src/config/services.ts').catch(() => ({ SERVICES: null }));
// Die Konfigdateien sind TypeScript - hier wird bewusst aus der SITEMAP
// gelesen statt sie zu importieren. Damit misst der Durchstich genau die
// Liste, die auch Suchmaschinen bekommen.
const sm = await hol('/sitemap.xml');
melde(sm.status === 200, `sitemap.xml antwortet (${sm.status})`);
const pfade = [...sm.text.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1].replace(/^https?:\/\/[^/]+/, '') || '/');
melde(pfade.length >= 20, `Sitemap nennt ${pfade.length} Seiten (erwartet mindestens 20)`);

const seiten = new Map();
for (const p of pfade) {
  const r = await hol(p);
  seiten.set(p, r);
  if (r.status !== 200) melde(false, `${p} antwortet ${r.status}`);
}
melde([...seiten.values()].every((r) => r.status === 200),
  `Alle ${seiten.size} Seiten aus der Sitemap antworten mit 200`);

/** Ein echter Ort aus der Sitemap - kein eingefrorener Name. */
const PROBE_ORT = pfade.find((p) => /^\/service-areas\/[^/]+$/.test(p));
melde(!!PROBE_ORT, `Ortsseite fuer die Stichproben gefunden: ${PROBE_ORT ?? 'KEINE'}`);
const PROBE_ORT_SLUG = (PROBE_ORT ?? '').replace('/service-areas/', '');

// --- 2. KEIN DEUTSCHES WORT IM AUSGELIEFERTEN HTML -------------------------
// Niclas' ausdrueckliche Vorgabe: die Seite ist amerikanisches Englisch.
// Der erste Entwurf hatte deutschen Text im Entwurfsband ("Firmenname,
// Inhaber, Telefon") - sichtbar im Screenshot, unsichtbar in jeder anderen
// Pruefung. Gesucht wird nach ganzen Woertern, sonst trifft "die" in
// "diagonal" und jede Pruefung wird nutzlos.
const DEUTSCH = [
  'und', 'oder', 'nicht', 'wird', 'werden', 'kann', 'koennen', 'muss', 'soll',
  'Firmenname', 'Inhaber', 'Telefon', 'Ort', 'Bundesstaat', 'Leistungen',
  'Kontakt', 'Anfrage', 'kostenlos', 'Angebot', 'Preise', 'Standort',
  'Rasen', 'Schnee', 'Winter', 'Garten', 'Sommer', 'Fruehling', 'Herbst',
  'Hallo', 'bitte', 'Danke', 'eine', 'einen', 'einem', 'dem', 'den', 'des',
];
// "Winter" ist im Englischen dasselbe Wort - und erscheint als Knopftext.
// Es muss also RAUS aus der Liste, sonst meldet die Pruefung dauerhaft rot
// und wird nach drei Tagen ignoriert.
const ECHT_DEUTSCH = DEUTSCH.filter((w) => !['Winter', 'Ort', 'Kontakt', 'dem', 'den', 'des'].includes(w));

let deutschTreffer = [];
for (const [pfad, r] of seiten) {
  if (!r.typ.includes('html')) continue;
  // Nur sichtbaren Text pruefen: Skript- und Stilbloecke raus, Tags raus.
  const sichtbar = r.text
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  for (const w of ECHT_DEUTSCH) {
    if (new RegExp(`(^|[^\\p{L}])${w}([^\\p{L}]|$)`, 'iu').test(sichtbar)) {
      deutschTreffer.push(`${pfad}: "${w}"`);
    }
  }
}
melde(deutschTreffer.length === 0,
  deutschTreffer.length === 0
    ? `Kein deutsches Wort im sichtbaren Text von ${seiten.size} Seiten`
    : `Deutsche Woerter gefunden: ${deutschTreffer.slice(0, 8).join(', ')}`);

// Gegenprobe zum Pruefmuster: ein untergeschobener deutscher Satz MUSS
// anschlagen. Sonst waere "0 Treffer" auch dann gruen, wenn das Muster
// gar nichts mehr findet.
{
  const gift = '<p>Wir moechten Ihnen ein kostenlos Angebot machen</p>';
  const s = gift.replace(/<[^>]+>/g, ' ');
  const trifft = ECHT_DEUTSCH.filter((w) => new RegExp(`(^|[^\\p{L}])${w}([^\\p{L}]|$)`, 'iu').test(s));
  melde(trifft.length >= 2, `Gegenprobe Sprachpruefung: erfundener deutscher Satz schlaegt an (${trifft.join(',')})`);
}

// --- 3. lang-Attribut ------------------------------------------------------
const start = seiten.get('/');
melde(/<html[^>]+lang="en-US"/.test(start.text), 'html lang="en-US" gesetzt');

// --- 4. Strukturierte Daten ------------------------------------------------
function ldBloecke(html) {
  return [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .map((m) => { try { return JSON.parse(m[1]); } catch { return null; } });
}
const ldStart = ldBloecke(start.text);
melde(ldStart.every(Boolean), `Alle ${ldStart.length} JSON-LD-Bloecke der Startseite sind gueltiges JSON`);
const geschaeft = ldStart.find((d) => d && d['@type'] === 'HomeAndConstructionBusiness');
melde(!!geschaeft, 'Firmendatensatz (HomeAndConstructionBusiness) vorhanden');
/** Ortsseiten: genau EIN Segment unter /service-areas. Die Regionsseite
 *  (/service-areas/county/<x>) hat zwei und zaehlt hier nicht mit. */
const istOrtsseite = (p) => /^\/service-areas\/[^/]+$/.test(p);
const ortsseiten = pfade.filter(istOrtsseite).length;

// Vollstaendigkeit gegen die Konfiguration - gelesen, nicht importiert
// (die Datei ist TypeScript). Ohne diese Zusage misst der Durchstich nur
// noch, ob die Seite mit sich selbst uebereinstimmt.
{
  const { readFile } = await import('node:fs/promises');
  const quelle = await readFile(new URL('../src/config/towns.ts', import.meta.url), 'utf8');
  const nurBestand = quelle.slice(quelle.indexOf('export const TOWNS'), quelle.indexOf('export const townBySlug'));
  const slugsKonfig = [...nurBestand.matchAll(/^\s{4}slug: '([a-z-]+)',$/gm)].map((m) => m[1]);
  melde(slugsKonfig.length >= 3, `towns.ts kennt ${slugsKonfig.length} Orte (Muster greift)`);
  const inSitemap = pfade.filter(istOrtsseite).map((p) => p.replace('/service-areas/', ''));
  const fehlen = slugsKonfig.filter((s) => !inSitemap.includes(s));
  melde(fehlen.length === 0,
    `Jeder Ort aus towns.ts hat eine Seite in der Sitemap (fehlen: ${fehlen.join(', ') || 'keiner'})`);
  const ueberzaehlig = inSitemap.filter((s) => !slugsKonfig.includes(s));
  melde(ueberzaehlig.length === 0,
    `Keine Ortsseite in der Sitemap ohne Eintrag in towns.ts (ueberzaehlig: ${ueberzaehlig.join(', ') || 'keine'})`);
}
melde(Array.isArray(geschaeft?.areaServed) && geschaeft.areaServed.length === ortsseiten,
  `areaServed nennt ${geschaeft?.areaServed?.length ?? 0} Orte, die Sitemap ${ortsseiten} Ortsseiten - die Zahlen muessen gleich sein`);

// DIE wichtigste Zusage dieser Datei: solange die Seite ein Entwurf mit
// Platzhaltern ist, darf KEINE Adresse und KEINE Bewertung im strukturierten
// Datensatz stehen. Eine erfundene Adresse ist eine Tatsachenbehauptung
// gegenueber Google und gegenueber jedem KI-System.
const alleLd = [...seiten.values()].filter((r) => r.typ.includes('html')).flatMap((r) => ldBloecke(r.text));
const mitAdresse = alleLd.filter((d) => d && (d.address || d.geo));
const mitBewertung = alleLd.filter((d) => d && (d.aggregateRating || d.review));
melde(mitAdresse.length === 0, `Kein Datensatz traegt Adresse/Koordinaten, solange Platzhalter gesetzt sind (gefunden: ${mitAdresse.length})`);
melde(mitBewertung.length === 0, `Kein erfundenes Bewertungsschema (gefunden: ${mitBewertung.length})`);

const faqSeiten = [...seiten.entries()].filter(([, r]) => r.typ.includes('html')
  && ldBloecke(r.text).some((d) => d && d['@type'] === 'FAQPage'));
// Ein FAQ tragen alle DETAILseiten plus die Startseite. Detailseite heisst:
// mindestens zwei Pfadsegmente. Die Uebersichten (/services, /how-we-work,
// /service-areas) haben eins und tragen keins.
//
// Bewusst ueber die Segmenttiefe und nicht ueber eine Aufzaehlung der
// Bereiche: die Formel musste schon zweimal nachgezogen werden, als neue
// Seitenarten dazukamen (erst die 70 Kombis, dann die drei Arbeitsweisen).
// Eine Regel, die die Struktur beschreibt, ueberlebt den naechsten Ausbau.
const tiefe = (p) => p.split('/').filter(Boolean).length;
const faqSoll = pfade.filter((p) => tiefe(p) >= 2).length + 1;
melde(faqSeiten.length === faqSoll,
  `${faqSeiten.length} Seiten liefern ein FAQPage-Schema (aus der Sitemap errechnet: ${faqSoll})`);

// --- 5. FAQ-Antworten stehen im HTML, auch zugeklappt ----------------------
// Wenn die zugeklappten Antworten aus dem DOM fielen, saehe ein Crawler ohne
// JavaScript nur die erste. Genau dafuer ist das Aufklappen ohne
// AnimatePresence gebaut - hier wird belegt, dass es wirkt.
{
  const ort = seiten.get(PROBE_ORT);
  const faq = ldBloecke(ort.text).find((d) => d && d['@type'] === 'FAQPage');
  const antworten = faq?.mainEntity?.map((q) => q.acceptedAnswer.text) ?? [];
  const sichtbar = ort.text.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ');
  const entkodiert = sichtbar.replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"');
  const fehlend = antworten.filter((a) => !entkodiert.includes(a.slice(0, 55)));
  melde(antworten.length >= 4 && fehlend.length === 0,
    `Alle ${antworten.length} FAQ-Antworten stehen auch im sichtbaren HTML (fehlend: ${fehlend.length})`);
}

// --- 6. llms.txt und robots.txt --------------------------------------------
const llms = await hol('/llms.txt');
melde(llms.status === 200, `llms.txt wird ausgeliefert (${llms.status})`);
melde(/DRAFT/.test(llms.text), 'llms.txt weist auf den Entwurfsstand hin');
melde(/Do not infer any/.test(llms.text), 'llms.txt verbietet ausdruecklich erfundene Bewertungen');

// Leere Feldwerte in llms.txt.
// Hintergrund: Nach der Umstellung auf Connecticut lieferte die Datei
// "- Region: , Connecticut" aus - der County stand nun als Konstante in
// towns.ts und das Auslesemuster fand nichts. Das Skript lief fehlerfrei
// durch und erzeugte eine falsche Datei. Genau die Datei, die KI-Modelle
// als Tatsachenquelle lesen.
{
  const felder = llms.text.split('\n').filter((z) => /^- [A-Za-z][^:]*:/.test(z));
  const leer = felder.filter((z) => /:\s*$/.test(z) || /:\s*,/.test(z) || /:\s*\(/.test(z));
  melde(felder.length >= 5 && leer.length === 0,
    leer.length === 0
      ? `Alle ${felder.length} Feldzeilen in llms.txt haben einen Wert`
      : `Leere Feldwerte in llms.txt: ${leer.join(' | ')}`);
  // Der Firmenname muss wirklich drinstehen, nicht nur die Ueberschrift.
  melde(/^- Name: .+/m.test(llms.text), 'llms.txt nennt den Firmennamen als Feld');
  melde(/^- Region: .+/m.test(llms.text), 'llms.txt nennt die Region als Feld');
}

const robots = await hol('/robots.txt');
melde(robots.status === 200, `robots.txt wird ausgeliefert (${robots.status})`);
// Solange Entwurf: alles gesperrt. Das ist Absicht und wird hier festgehalten,
// damit beim Scharfschalten auffaellt, dass diese Zusage umgedreht werden muss.
melde(/Disallow: \//.test(robots.text),
  'robots.txt sperrt den Entwurf vollstaendig (dreht sich um, sobald istEntwurf=false)');
melde(/noindex/.test(start.text), 'Entwurf traegt noindex im Kopf');

// --- 7. Bilder ------------------------------------------------------------
const bilder = [...start.text.matchAll(/\/_next\/image\?url=([^&"]+)/g)]
  .map((m) => decodeURIComponent(m[1]));
melde(bilder.length > 0, `Startseite bindet ${bilder.length} Bilder ueber die Bildoptimierung ein`);
let bildFehler = 0;
for (const b of [...new Set(bilder)].slice(0, 12)) {
  const r = await fetch(abs(b));
  if (!r.ok) { bildFehler++; console.log(`      fehlt: ${b} (${r.status})`); }
}
melde(bildFehler === 0, `Alle geprueften Bilddateien der Startseite sind abrufbar (${bildFehler} Fehler)`);

// Jedes Bild braucht einen Alternativtext - leer ist nur erlaubt, wo das Bild
// reine Kulisse ist (Hero-Hintergrund).
const ohneAlt = [...start.text.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/g)].length;
melde(ohneAlt === 0, `Kein <img> ohne alt-Attribut auf der Startseite (${ohneAlt})`);

// --- 8. Das Formular -------------------------------------------------------
{
  const leer = await fetch(BASIS + '/api/quote', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}',
  });
  melde(leer.status === 400, `Anfrage ohne Namen wird abgewiesen (${leer.status})`);

  const nurLeerzeichen = await fetch(BASIS + '/api/quote', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: '   ', email: PRUEF_MAIL }),
  });
  melde(nurLeerzeichen.status === 400,
    `Name aus lauter Leerzeichen zaehlt als leer (${nurLeerzeichen.status})`);

  const ohneRueckweg = await fetch(BASIS + '/api/quote', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: `${KENNUNG}-ohne-rueckweg` }),
  });
  melde(ohneRueckweg.status === 400, `Anfrage ohne Telefon UND ohne Mail wird abgewiesen (${ohneRueckweg.status})`);

  const falscherOrt = await fetch(BASIS + '/api/quote', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: KENNUNG, email: PRUEF_MAIL, town: 'erfundenhausen' }),
  });
  melde(falscherOrt.status === 400, `Unbekannter Ort wird abgewiesen (${falscherOrt.status})`);

  const gut = await fetch(BASIS + '/api/quote', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: KENNUNG, email: PRUEF_MAIL,
      town: PROBE_ORT_SLUG, service: 'snow-plowing', message: 'Check run - please ignore.',
    }),
  });
  const d = await gut.json();
  melde(gut.status === 200 && d.ok === true, `Gueltige Anfrage wird angenommen (${gut.status})`);
  // Und sie sagt ehrlich, dass niemand benachrichtigt wurde.
  melde(d.delivered === false,
    'Antwort sagt delivered=false, solange kein Postfach angebunden ist');

  // Honigtopf: ausgefuellt heisst Bot. Die Antwort bleibt unauffaellig, aber
  // es wird nichts abgelegt und nichts versendet (Beleg in 8b).
  const bot = await fetch(BASIS + '/api/quote', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: `${KENNUNG}-honig`, email: PRUEF_MAIL, leave_empty: 'https://spam.example' }),
  });
  const db = await bot.json();
  melde(bot.status === 200 && db.delivered === false,
    `Honigtopf-Anfrage wird still verworfen (${bot.status}, delivered=${db.delivered})`);
}

// --- 8b. Eigene Spuren wieder entfernen -----------------------------------
{
  const { readFile, writeFile } = await import('node:fs/promises');
  const datei = new URL('../data/quote-requests.jsonl', import.meta.url);
  let zeilen = [];
  try { zeilen = (await readFile(datei, 'utf8')).split('\n').filter(Boolean); } catch { /* noch keine Datei */ }
  // VOR dem Aufraeumen zaehlen - das Aufraeumen wuerde einen faelschlich
  // abgelegten Bot-Eintrag sonst still mitentfernen.
  const honig = zeilen.filter((z) => z.includes(`${KENNUNG}-honig`)).length;
  melde(honig === 0, `Bot-Anfrage (Honigtopf gefuellt) wurde nicht abgelegt (${honig})`);
  const vorher = zeilen.length;
  const istVomPruefstand = (z) => {
    try {
      const e = JSON.parse(z);
      return e.name === KENNUNG || String(e.name || '').startsWith(KENNUNG) || e.email === PRUEF_MAIL;
    } catch { return false; }
  };
  const uebrig = zeilen.filter((z) => !istVomPruefstand(z));
  await writeFile(datei, uebrig.length ? `${uebrig.join('\n')}\n` : '', 'utf8');
  melde(vorher - uebrig.length >= 1,
    `Eigener Pruefeintrag wieder entfernt (${vorher} -> ${uebrig.length})`);
  // Gegenprobe: es darf KEIN Eintrag des Pruefstands uebrig sein.
  const rest = uebrig.filter((z) => z.includes(KENNUNG) || z.includes(PRUEF_MAIL)).length;
  melde(rest === 0, `Keine Pruefstands-Reste in der Anfragedatei (${rest})`);
}

// --- 9. Unbekannte Adressen ------------------------------------------------
for (const [p, erwartet] of [['/service-areas/erfundenhausen', 404], ['/services/gibtsnicht', 404]]) {
  const r = await hol(p);
  melde(r.status === erwartet, `${p} antwortet ${r.status} (erwartet ${erwartet})`);
}

console.log(`\n${gruen} ok, ${rot} rot`);
process.exit(rot ? 1 : 0);
