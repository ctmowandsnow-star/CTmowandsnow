/**
 * Geht die Website so durch, wie ein Mensch sie benutzt: mit Klicks.
 *
 * WARUM ES DIESEN PRUEFSTAND GIBT: `links.mjs` rief jede Adresse per fetch ab
 * und meldete 109 von 109 gruen. Niclas hat die Seite trotzdem als "nicht
 * klickbar" zurueckgegeben. Der Grund lag genau dazwischen: In der statischen
 * Fassung zeigten die Links auf `/x/y.html`, der Next-Client-Router machte
 * daraus beim Klick aber `/x/y` - eine Adresse, die es als Datei nicht gab.
 * Klicken ging, Neuladen und direktes Aufrufen nicht.
 *
 * EINE MESSUNG, DIE NICHT DEN WEG DES NUTZERS NIMMT, KANN DIESE FEHLERKLASSE
 * PRINZIPIELL NICHT FINDEN. Deshalb hier: echte Klicks, echtes Neuladen,
 * echter Zurueck-Knopf.
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ZUGANG, BASIS, abs } from './zugang.mjs';
const require = createRequire('/home/WCG/aura/');
const { chromium } = require('playwright');

const WURZEL = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
// Adressen kommen aus zugang.mjs - dort steckt die Unterscheidung
// zwischen Pfaden MIT und OHNE /ct-Praefix.

// Zugangsdaten und Adressen kommen aus zugang.mjs.
const zugang = ZUGANG;

let rot = 0, gruen = 0;
const melde = (ok, text) => { ok ? gruen++ : rot++; console.log(`${ok ? ' ok ' : 'ROT '} ${text}`); };

const browser = await chromium.launch({
  executablePath: '/home/hvnhai/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell',
});
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  ...(zugang ? { httpCredentials: zugang } : {}),
});
const page = await ctx.newPage();
const fehlerhaft = [];
page.on('response', (r) => {
  if (r.status() >= 400 && !r.url().includes('favicon')) fehlerhaft.push(`${r.status()} ${r.url()}`);
});

async function h1() {
  return (await page.locator('h1').first().textContent().catch(() => '') || '').trim();
}

await page.goto(abs('/'), { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
melde((await h1()).length > 0, `Startseite hat eine Ueberschrift: "${(await h1()).slice(0, 45)}"`);

// --- 1. Jeder Navigationspunkt per Klick ----------------------------------
const NAV = ['Services', 'How It Works', 'Our Work', 'Service Area', 'About', 'Contact'];
for (const punkt of NAV) {
  await page.goto(abs('/'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const vorher = page.url();
  try {
    await page.click(`header nav a:has-text("${punkt}")`, { timeout: 5000 });
    await page.waitForFunction((u) => location.href !== u, vorher, { timeout: 6000 });
    await page.waitForTimeout(700);
    const t = await h1();
    melde(page.url() !== vorher && t.length > 0,
      `Klick "${punkt}" -> ${page.url().replace(BASIS, '') || '/'} ("${t.slice(0, 40)}")`);
  } catch (e) {
    melde(false, `Klick "${punkt}": ${String(e.message).split('\n')[0].slice(0, 60)}`);
  }
}

// --- 2. Tiefer Klickweg: Start -> Gebiet -> Ort -> Leistung x Ort ---------
{
  await page.goto(abs('/service-areas'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await page.click('a[href*="/service-areas/"]:not([href$="/service-areas"])', { timeout: 6000 });
  await page.waitForTimeout(1200);
  const ortUrl = page.url();
  melde(/\/service-areas\/[a-z-]+$/.test(ortUrl), `Gebiet -> Ortsseite: ${ortUrl.replace(BASIS, '')}`);

  await page.click('a[href*="/services/"]', { timeout: 6000 });
  await page.waitForTimeout(1200);
  const kombiUrl = page.url();
  melde(/\/services\/[a-z-]+\/[a-z-]+$/.test(kombiUrl) || /\/services\/[a-z-]+$/.test(kombiUrl),
    `Ortsseite -> Leistung: ${kombiUrl.replace(BASIS, '')}`);
  melde((await h1()).length > 0, `Zielseite hat eine Ueberschrift: "${(await h1()).slice(0, 45)}"`);

  // NEULADEN - der Fall, der in der statischen Fassung brach.
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  melde(page.url() === kombiUrl && (await h1()).length > 0,
    `Neuladen auf der Unterseite bleibt dort (${page.url().replace(BASIS, '')})`);

  // ZURUECK-Knopf
  await page.goBack({ waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  melde(page.url() === ortUrl, `Zurueck-Knopf fuehrt zur Ortsseite (${page.url().replace(BASIS, '')})`);
}

// --- 3. Unterseite DIREKT aufrufen (geteilter Link) -----------------------
for (const p of ['/services/snow-plowing/plainville', '/how-we-work/one-time-cleanup',
                 '/service-areas/county/hartford-county']) {
  const r = await page.goto(abs(p), { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  melde(r.status() === 200 && (await h1()).length > 0,
    `Direktaufruf ${p} -> ${r.status()} ("${(await h1()).slice(0, 38)}")`);
}

// --- 4. Saison-Umschalter ---------------------------------------------------
{
  await page.goto(abs('/'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const vorher = await h1();
  await page.click('button[aria-pressed]:has-text("Winter")', { timeout: 5000 });
  await page.waitForTimeout(1400);
  const nachher = await h1();
  melde(vorher !== nachher, `Saison-Umschalter wechselt den Inhalt ("${vorher.slice(0, 22)}" -> "${nachher.slice(0, 22)}")`);
}

// --- 5. Keine fehlerhafte Antwort auf dem ganzen Weg ----------------------
melde(fehlerhaft.length === 0,
  fehlerhaft.length === 0
    ? 'Keine Antwort mit Fehlercode auf dem gesamten Klickweg'
    : `${fehlerhaft.length} Fehlerantwort(en): ${fehlerhaft.slice(0, 4).join(' | ')}`);

// --- Gegenprobe zum Pruefstand --------------------------------------------
// Eine erfundene Adresse MUSS scheitern - sonst misst er nur sich selbst.
{
  const r = await page.goto(abs('/gibt-es-nicht-zeus'), { waitUntil: 'domcontentloaded' });
  melde(r.status() === 404, `Gegenprobe: erfundene Adresse -> ${r.status()} (erwartet 404)`);
}

await browser.close();
console.log(`\n${gruen} ok, ${rot} rot`);
process.exit(rot ? 1 : 0);
