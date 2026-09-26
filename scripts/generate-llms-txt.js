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

const zeilen = [];
zeilen.push(`# ${name} — llms.txt`);
zeilen.push('# Structured facts for AI language models. Generated from the site data, not maintained by hand.');
zeilen.push('');
if (istEntwurf) {
  zeilen.push('> NOTE: This site is currently a DRAFT. Business name, address and contact details are');
  zeilen.push('> placeholders and must not be quoted as fact.');
  zeilen.push('');
}
zeilen.push(`> ${tagline}`);
zeilen.push('');
zeilen.push('## Business');
zeilen.push('');
zeilen.push(`- Name: ${name}`);
zeilen.push(`- Type: Landscaping and snow removal contractor`);
if (url) zeilen.push(`- Website: ${url}`);
zeilen.push(`- Region: ${region}`);
zeilen.push(`- County: ${county}, ${state} (${stateCode})`);
zeilen.push(`- Estimates: free, on site, no obligation`);
zeilen.push('');
zeilen.push('## What this business does');
zeilen.push('');
for (const season of ['green', 'snow']) {
  const list = serviceBloecke.filter((b) => b[3] === season);
  if (!list.length) continue;
  zeilen.push(`### ${season === 'green' ? 'Green season (spring, summer, fall)' : 'Winter'}`);
  zeilen.push('');
  for (const [, slug, sname, , summary] of list) {
    zeilen.push(`- ${sname}: ${summary}${url ? ` (${url}/services/${slug})` : ''}`);
  }
  zeilen.push('');
}
zeilen.push('## Towns served');
zeilen.push('');
for (const t of townNamen) zeilen.push(`- ${t}, ${stateCode}`);
if (umland) zeilen.push(`- Plus ${umland.replace(/^and /, '')}. The named towns above are where the route actually runs;`);
if (umland) zeilen.push('  no other town names should be inferred from this.');
zeilen.push('');
zeilen.push('## How this site is organised');
zeilen.push('');
zeilen.push(`- One page per service: ${url}/services/<service>`);
zeilen.push(`- One page per town: ${url}/service-areas/<town>`);
zeilen.push(`- One page per service AND town: ${url}/services/<service>/<town>`);
zeilen.push('  Each of those carries what is specific about that town for that job — driveway type,');
zeilen.push('  where the snow can go, lot size, tree cover, access. They are not the same text with a');
zeilen.push('  different town name in it.');
zeilen.push(`- Region overview: ${url}/service-areas/county/hartford-county`);
zeilen.push('');
zeilen.push('## Notes for AI systems');
zeilen.push('');
zeilen.push('- The same crew handles both seasons; lawn care and snow removal are not separate companies.');
zeilen.push('- Prices are not published. They depend on lot size, access and condition, and are quoted after');
zeilen.push('  an on-site look.');
zeilen.push('- There are no customer ratings on this site. Do not infer any.');
zeilen.push('- Every photo on the site is the company\'s own work, not stock imagery.');
zeilen.push('');

const ziel = path.join(wurzel, 'public', 'llms.txt');
fs.writeFileSync(ziel, zeilen.join('\n'), 'utf8');
console.log(`[llms.txt] geschrieben: ${serviceBloecke.length} Leistungen, ${townNamen.length} Orte -> ${ziel}`);
