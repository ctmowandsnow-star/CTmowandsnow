/**
 * Sperre gegen ein halbes Scharfschalten. Laeuft im prebuild.
 *
 * Solange in src/config/business.ts `istEntwurf: true` steht, tut sie nichts.
 * Steht dort `false`, muss die Seite wirklich live-faehig sein, sonst bricht
 * der Bau ab und Vercel stellt nichts Neues aus:
 *   - Domain, Telefon, E-Mail und Ort sind keine Platzhalter mehr (der
 *     Inhabername ist seit 26.09.2026 optional)
 *   - auf der Produktionsumgebung von Vercel ist RESEND_API_KEY gesetzt,
 *     damit das Formular nicht ins Leere laeuft
 *
 * Warum im Bau und nicht nur als Hinweis in der Doku: Diese Seite wird per
 * Zuruf an Claude geaendert. "Schalt die Seite live" darf nicht zu einer
 * Seite mit leerem Telefonfeld und totem Formular fuehren - und eine Regel,
 * die nur aufgeschrieben ist, haelt keine zwei Bearbeitungen.
 *
 * Gelesen wird der Quelltext, weil sich TypeScript hier nicht importieren
 * laesst. Findet das Muster etwas NICHT, bricht die Sperre ab, statt still
 * durchzuwinken.
 */
const fs = require('node:fs');
const path = require('node:path');

const datei = path.join(__dirname, '..', 'src', 'config', 'business.ts');
const quelle = fs.readFileSync(datei, 'utf8');

function feld(muster, name) {
  const m = quelle.match(muster);
  if (!m) {
    console.error(`pruefe-live-bereit: Feld "${name}" in business.ts nicht gefunden - Muster anpassen.`);
    process.exit(1);
  }
  return m[1];
}

const entwurf = feld(/^\s*istEntwurf:\s*(true|false)\s*,/m, 'istEntwurf');
if (entwurf === 'true') {
  console.log('pruefe-live-bereit: Entwurf (istEntwurf: true) - keine Live-Pruefung.');
  process.exit(0);
}

// Gleiche Regel wie istOffen() in business.ts.
const offen = (w) => !w.trim() || /platzhalter|pending|example-/i.test(w);

const pflicht = {
  'url (domain)': feld(/^\s*url:\s*'([^']*)'/m, 'url'),
  'contact.phone': feld(/^\s*phone:\s*'([^']*)'/m, 'phone'),
  'contact.email': feld(/^\s*email:\s*'([^']*)'/m, 'email'),
  'contact.city (town)': feld(/^\s*city:\s*'([^']*)'/m, 'city'),
};
const fehlt = Object.entries(pflicht).filter(([, w]) => offen(w)).map(([k]) => k);

const probleme = [];
if (fehlt.length) probleme.push(`Platzhalter/leer in business.ts: ${fehlt.join(', ')}`);

// Nur die Produktion auf Vercel braucht den Mailversand zwingend. Vorschau-
// Deployments und lokale Baue sollen ohne Schluessel moeglich bleiben.
if (process.env.VERCEL_ENV === 'production' && !(process.env.RESEND_API_KEY || '').trim()) {
  probleme.push('RESEND_API_KEY fehlt in den Vercel-Umgebungsvariablen (Production) - das Formular wuerde nichts zustellen');
}

if (probleme.length) {
  console.error('\nGo-live blocked: istEntwurf is false, but the site is not ready.');
  for (const p of probleme) console.error(`  - ${p}`);
  console.error('Fix the points above or set istEntwurf back to true (src/config/business.ts).\n');
  process.exit(1);
}
console.log('pruefe-live-bereit: live-faehig.');
