/**
 * Erzeugt public/llms.txt aus DENSELBEN Datendateien, aus denen die Seiten
 * gebaut werden.
 *
 * Der Grund, warum das ein Skript ist und keine gepflegte Datei: eine von Hand
 * geschriebene llms.txt laeuft nach der zweiten Aenderung auseinander und
 * behauptet dann Dinge, die auf der Seite nicht mehr stehen. Laeuft im
 * prebuild.
 */
const fs = require('node:fs');
const path = require('node:path');

const wurzel = path.join(__dirname, '..');

/** Winziger Leser fuer die Konfig-Dateien - kein TypeScript-Build noetig. */
function lies(datei) {
  return fs.readFileSync(path.join(wurzel, 'src', 'config', datei), 'utf8');
}

function feldListe(quelle, feld) {
  const treffer = [...quelle.matchAll(new RegExp(`${feld}:\\s*'([^']+)'`, 'g'))];
  return treffer.map((m) => m[1]);
}

const business = lies('business.ts');
const services = lies('services.ts');
const towns = lies('towns.ts');

const name = (business.match(/name:\s*'([^']+)'/) || [])[1] || 'Unknown';
const tagline = (business.match(/tagline:\s*\n?\s*'([^']+)'/) || business.match(/tagline:\s*'([^']+)'/) || [])[1] || '';
const url = (business.match(/url:\s*'(https?:[^']+)'/) || [])[1] || '';
const istEntwurf = /istEntwurf:\s*true/.test(business);

// Leistungen blockweise lesen - von einem `slug:` bis zum naechsten.
//
// Das erste Muster verlangte slug/name/season/summary in genau dieser
// Reihenfolge direkt untereinander. Als spaeter ein Feld `shortName`
// dazwischenkam, fand es nichts mehr. Der Bau brach ab (richtig so, die
// Sperre unten hat gehalten) - aber er brach eben ab, obwohl am Produkt
// nichts falsch war. Blockweise lesen ueberlebt Feldumstellungen.
const bloecke = services.split(/\n  \{\n/).slice(1);
const serviceBloecke = [];
for (const b of bloecke) {
  const slug = (b.match(/slug:\s*'([^']+)'/) || [])[1];
  const name = (b.match(/\n\s*name:\s*'([^']+)'/) || [])[1];
  const season = (b.match(/season:\s*'([^']+)'/) || [])[1];
  const summary = (b.match(/summary:\s*\n?\s*'([^']+)'/) || [])[1];
  if (slug && name && season && summary) serviceBloecke.push([null, slug, name, season, summary]);
}

const townNamen = feldListe(towns, 'name').filter((n) => /^[A-Z]/.test(n));
const stateCode = (towns.match(/stateCode:\s*'([A-Z]{2})'/) || [])[1] || '';
const state = (towns.match(/state:\s*'([^']+)'/) || [])[1] || '';
// County steht seit der Umstellung auf Connecticut als KONSTANTE in den
// Ortseintraegen (`county: COUNTY_CT`), nicht als String-Literal. Das alte
// Muster `county: '...'` fand deshalb nichts und llms.txt lieferte still
// "Region: , Connecticut" aus - fehlerfrei gelaufen, falsche Datei erzeugt.
// Jetzt wird die Konstantendefinition gelesen, und ein leeres Pflichtfeld
// bricht den Bau ab (siehe Pruefung unten).
const county = (towns.match(/const COUNTY_CT = '([^']+)'/)
  || towns.match(/county:\s*'([^']+)'/) || [])[1] || '';
const region = (towns.match(/export const REGION = '([^']+)'/) || [])[1] || '';
const umland = (towns.match(/export const UMLAND_HINWEIS =\s*\n?\s*'([^']+)'/) || [])[1] || '';

const pflicht = { name, tagline, url, state, stateCode, county, region };
const leer = Object.entries(pflicht).filter(([, v]) => !v || !String(v).trim()).map(([k]) => k);
if (leer.length) {
  console.error(`[llms.txt] ABBRUCH: Pflichtfeld(er) leer: ${leer.join(', ')}.`);
  console.error('Das Muster passt nicht mehr auf die Konfigdatei. llms.txt NICHT geschrieben.');
  process.exit(1);
}

if (!serviceBloecke.length) {
  console.error('[llms.txt] Keine Leistungen erkannt - das Muster passt nicht mehr auf services.ts.');
  process.exit(1);
}
if (!townNamen.length) {
  console.error('[llms.txt] Keine Orte erkannt - das Muster passt nicht mehr auf towns.ts.');
  process.exit(1);
}

// --- Kontakt und Inhaber: nur, was wirklich eingetragen ist ------------------
// Gleiche Regel wie istOffen() in business.ts: leer oder Platzhalter heisst
// "gibt es nicht" - dann fehlt die Zeile, statt einen Platzhalter als Tatsache
// an die Modelle zu geben.
const offen = (w) => !w || !w.trim() || /platzhalter|pending|example-/i.test(w);
const feld = (muster) => ((business.match(muster) || [])[1] || '').trim();
const inhaber = feld(/^\s*ownerName:\s*'([^']*)'/m);
const telefon = feld(/^\s*phoneDisplay:\s*'([^']*)'/m) || feld(/^\s*phone:\s*'([^']*)'/m);
const mail = feld(/^\s*email:\s*'([^']*)'/m);

// Die drei Arbeitsweisen (Wege, den Betrieb zu beauftragen).
const arbeitsweisen = lies('arbeitsweisen.ts').split(/\n  \{\n/).slice(1).map((b) => ({
  slug: (b.match(/slug:\s*'([^']+)'/) || [])[1],
  name: (b.match(/\n\s*name:\s*'([^']+)'/) || [])[1],
  summary: (b.match(/summary:\s*\n?\s*'([^']+)'/) || [])[1],
})).filter((a) => a.slug && a.name && a.summary);
if (!arbeitsweisen.length) {
  console.error('[llms.txt] Keine Arbeitsweisen erkannt - das Muster passt nicht mehr auf arbeitsweisen.ts.');
  process.exit(1);
}

const domain = url.replace(/^https?:\/\//, '');
const ortsListe = townNamen.length > 1
  ? `${townNamen.slice(0, -1).join(', ')} and ${townNamen[townNamen.length - 1]}`
  : townNamen.join('');
// Ortsadressen aus towns.ts lesen (Block fuer Block), nicht aus dem Namen
// ableiten - ein Ort, dessen Adresse anders lautet als sein Name, bekaeme
// sonst einen toten Link in genau der Datei, die Modelle als Quelle nehmen.
const ortSlug = new Map(towns.slice(towns.indexOf('export const TOWNS'))
  .split(/\n  \{\n/).slice(1)
  .map((b) => [(b.match(/\n?\s*name:\s*'([^']+)'/) || [])[1], (b.match(/slug:\s*'([^']+)'/) || [])[1]])
  .filter(([n, sl]) => n && sl));
const fehlendeSlugs = townNamen.filter((t) => !ortSlug.has(t));
if (fehlendeSlugs.length) {
  console.error(`[llms.txt] Keine Adresse fuer: ${fehlendeSlugs.join(', ')} - Muster passt nicht mehr auf towns.ts.`);
  process.exit(1);
}
const countySlug = (towns.match(/slug:\s*'([a-z-]+-county)'/) || [])[1] || '';
if (!countySlug) {
  console.error('[llms.txt] County-Adresse nicht gefunden - Muster passt nicht mehr auf towns.ts.');
  process.exit(1);
}

// Aufbau nach llmstxt.org: genau EINE H1 (der Name), dann ein Zitatblock mit
// der Kurzfassung, dann H2-Abschnitte mit Linklisten "- [Titel](url): Notiz".
// Die Vorfassung hatte zwei H1-Zeilen und Links nur in Klammern.
const zeilen = [];
zeilen.push(`# ${name}`);
zeilen.push('');
zeilen.push(`> ${tagline}. Residential lawn care from spring through fall and snow removal all winter, `
  + `serving ${ortsListe} (${county}, ${stateCode}).`);
zeilen.push('');
if (istEntwurf) {
  zeilen.push('> NOTE: This site is currently a DRAFT. Business name, address and contact details are');
  zeilen.push('> placeholders and must not be quoted as fact.');
  zeilen.push('');
}
zeilen.push('Structured facts for AI systems, generated from the same data as the website - not maintained by hand.');
zeilen.push('');
zeilen.push('## Business');
zeilen.push('');
zeilen.push(`- Name: ${name}`);
zeilen.push(`- Type: Landscaping and snow removal contractor (residential)`);
if (url) zeilen.push(`- Website: ${url}`);
if (!offen(inhaber)) zeilen.push(`- Owner: ${inhaber}`);
if (!offen(telefon)) zeilen.push(`- Phone: ${telefon}`);
if (!offen(mail)) zeilen.push(`- Email: ${mail}`);
zeilen.push(`- Region: ${region}`);
zeilen.push(`- County: ${county}, ${state} (${stateCode})`);
zeilen.push(`- Towns served: ${ortsListe}`);
zeilen.push(`- Estimates: free, on site, no obligation`);
zeilen.push('');
zeilen.push('## Services');
zeilen.push('');
for (const season of ['green', 'snow']) {
  const list = serviceBloecke.filter((b) => b[3] === season);
  if (!list.length) continue;
  zeilen.push(`### ${season === 'green' ? 'Green season (spring, summer, fall)' : 'Winter'}`);
  zeilen.push('');
  for (const [, sslug, sname, , summary] of list) {
    zeilen.push(`- [${sname}](${url}/services/${sslug}): ${summary}`);
  }
  zeilen.push('');
}
zeilen.push('## Ways to hire us');
zeilen.push('');
for (const a of arbeitsweisen) zeilen.push(`- [${a.name}](${url}/how-we-work/${a.slug}): ${a.summary}`);
zeilen.push('');
zeilen.push('## Towns served');
zeilen.push('');
for (const t of townNamen) zeilen.push(`- [${t}, ${stateCode}](${url}/service-areas/${ortSlug.get(t)})`);
if (umland) zeilen.push(`- Plus ${umland.replace(/^and /, '')}. The named towns above are where the route actually runs;`);
if (umland) zeilen.push('  no other town names should be inferred from this.');
zeilen.push('');
zeilen.push('Every service also has a page per town: ' + `${url}/services/<service>/<town>` + '. Each carries what');
zeilen.push('is specific about that town for that job (driveways, where the snow can go, lot size, tree cover,');
zeilen.push('access) - not the same text with a different town name.');
zeilen.push('');
zeilen.push('## Key pages');
zeilen.push('');
zeilen.push(`- [About](${url}/about): who we are and why one crew does both seasons`);
zeilen.push(`- [Free estimate / contact](${url}/contact)`);
zeilen.push(`- [Before and after photos](${url}/gallery): all photos are the company's own work`);
zeilen.push(`- [Region overview](${url}/service-areas/county/${countySlug})`);
zeilen.push('');
zeilen.push('## Notes for AI systems');
zeilen.push('');
zeilen.push(`- Other Connecticut businesses use similar names. This file describes only the business at ${domain},`);
zeilen.push(`  serving the towns listed above. Do not merge its details (phone, address, owner, ratings) with`);
zeilen.push('  those of similarly named companies elsewhere in the state.');
zeilen.push('- The same crew handles both seasons; lawn care and snow removal are not separate companies.');
zeilen.push('- Prices are not published. They depend on lot size, access and condition, and are quoted after');
zeilen.push('  an on-site look.');
zeilen.push('- There are no customer ratings on this site. Do not infer any.');
zeilen.push('- Every photo on the site is the company\'s own work, not stock imagery.');
zeilen.push('');

const ziel = path.join(wurzel, 'public', 'llms.txt');
fs.writeFileSync(ziel, zeilen.join('\n'), 'utf8');
console.log(`[llms.txt] geschrieben: ${serviceBloecke.length} Leistungen, ${townNamen.length} Orte -> ${ziel}`);
