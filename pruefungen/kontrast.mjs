/**
 * Misst den echten Kontrast der Hero-Texte gegen das, was hinter ihnen liegt.
 *
 * Warum gemessen und nicht nach Augenmass: die Helligkeit haengt vom Foto ab,
 * und das Foto wechselt mit der Saison. Ein Wert, der auf dem Rasenbild passt,
 * kann auf dem Schneevideo durchfallen. Gefordert wird 4.5:1 (WCAG AA fuer
 * normalen Text); die grosse Ueberschrift darf auf 3:1, weil sie als "large
 * text" gilt.
 */
import { createRequire } from 'node:module';
import { ZUGANG, BASIS, abs } from './zugang.mjs';
const require = createRequire('/home/WCG/aura/');
const { chromium } = require('playwright');

// pngjs liegt in einem NACHBARPROJEKT. Das ist fuer einen Pruefstand in
// Ordnung, aber es muss laut scheitern, wenn es dort verschwindet - ein
// Messwerkzeug, das still nicht laeuft, meldet nie einen Fehler und sieht
// deshalb aus wie "alles gruen".
const requireFremd = createRequire('/home/WCG/AAA_AI_Tracking_Tool/');
let PNG;
try {
  ({ PNG } = requireFremd('pngjs'));
} catch (e) {
  console.error('ABBRUCH: pngjs nicht ladbar aus /home/WCG/AAA_AI_Tracking_Tool/node_modules');
  console.error(e.message);
  process.exit(2);
}

// Adressen kommen aus zugang.mjs - dort steckt die Unterscheidung
// zwischen Pfaden MIT und OHNE /ct-Praefix.
const SCHWELLE_TEXT = 4.5;
const SCHWELLE_GROSS = 3.0;

function leuchtkraft([r, g, b]) {
  const f = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function verhaeltnis(a, b) {
  const [h, d] = leuchtkraft(a) > leuchtkraft(b) ? [a, b] : [b, a];
  return (leuchtkraft(h) + 0.05) / (leuchtkraft(d) + 0.05);
}

const browser = await chromium.launch({
  executablePath: '/home/hvnhai/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell',
});

let rot = 0, gruen = 0;
const melde = (ok, text) => { ok ? gruen++ : rot++; console.log(`${ok ? ' ok ' : 'ROT '} ${text}`); };

for (const [breite, hoehe, wo] of [[1440, 900, 'desktop'], [390, 844, 'handy']]) {
  const ctx = await browser.newContext({
    viewport: { width: breite, height: hoehe }, deviceScaleFactor: 1,
    ...(ZUGANG ? { httpCredentials: ZUGANG } : {}),
  });
  const page = await ctx.newPage();

  for (const saison of ['green', 'snow']) {
    await page.goto(BASIS + '/', { waitUntil: 'networkidle' });
    // Die Saison hart setzen, statt auf den Monat zu vertrauen - sonst misst
    // der Prueflauf im Juli nie das Schneebild.
    await page.evaluate((s) => {
      const knopf = [...document.querySelectorAll('button')]
        .find((b) => (b.getAttribute('aria-pressed') !== null)
          && b.textContent.toLowerCase().includes(s === 'snow' ? 'winter' : 'green'));
      knopf?.click();
    }, saison);
    await page.waitForTimeout(1600);

    for (const [wahl, name, schwelle] of [
      ['h1', 'Ueberschrift', SCHWELLE_GROSS],
      ['h1 + p', 'Flisstext', SCHWELLE_TEXT],
    ]) {
      const mess = await page.evaluate((w) => {
        const el = document.querySelector(w);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const farbe = getComputedStyle(el).color;
        return { r: { x: r.x, y: r.y, w: r.width, h: r.height }, farbe };
      }, wahl);
      if (!mess) { melde(false, `${wo}/${saison}: ${name} nicht gefunden`); continue; }

      // DER TEXT MUSS FUER DIE AUFNAHME WEG.
      // Erster Anlauf mass den Bildausschnitt MIT dem Text darin - der
      // hellste Pixel war dann der Text selbst, Ergebnis 1.00:1 in allen
      // acht Faellen. Acht von acht rot bei identischem Wert ist nie ein
      // Produktfehler, sondern immer das Messwerkzeug.
      // `visibility:hidden` nimmt die Pixel weg und laesst das Layout stehen,
      // die Rechtecke von oben bleiben also gueltig.
      await page.evaluate((w) => {
        const el = document.querySelector(w);
        el.dataset.zeusVorher = el.style.visibility || '';
        el.style.visibility = 'hidden';
      }, wahl);
      await page.waitForTimeout(120);

      const bild = await page.screenshot({
        clip: { x: mess.r.x, y: mess.r.y, width: Math.max(2, mess.r.w), height: Math.max(2, mess.r.h) },
      });

      await page.evaluate((w) => {
        const el = document.querySelector(w);
        el.style.visibility = el.dataset.zeusVorher || '';
        delete el.dataset.zeusVorher;
      }, wahl);
      const png = PNG.sync.read(bild);
      let hellster = [0, 0, 0], maxL = -1;
      for (let i = 0; i < png.data.length; i += 4) {
        const px = [png.data[i], png.data[i + 1], png.data[i + 2]];
        const l = leuchtkraft(px);
        if (l > maxL) { maxL = l; hellster = px; }
      }
      const m = mess.farbe.match(/\d+/g).slice(0, 3).map(Number);
      const v = verhaeltnis(m, hellster);
      melde(
        v >= schwelle,
        `${wo}/${saison} ${name}: ${v.toFixed(2)}:1 (gefordert ${schwelle}:1) `
        + `Text rgb(${m}) gegen hellsten Grund rgb(${hellster})`,
      );
    }
  }
  await ctx.close();
}
// Gegenprobe zum Messwerkzeug selbst: OHNE Ausblendung muss dasselbe
// Verfahren 1.00:1 liefern (Text gegen Text). Kommt dort etwas anderes
// heraus, misst der Pruefstand nicht das, was er zu messen glaubt.
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
    ...(ZUGANG ? { httpCredentials: ZUGANG } : {}),
  });
  const page = await ctx.newPage();
  await page.goto(BASIS + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const m = await page.evaluate(() => {
    const el = document.querySelector('h1');
    const r = el.getBoundingClientRect();
    return { r: { x: r.x, y: r.y, w: r.width, h: r.height }, farbe: getComputedStyle(el).color };
  });
  const bild = await page.screenshot({ clip: { x: m.r.x, y: m.r.y, width: m.r.w, height: m.r.h } });
  const png = PNG.sync.read(bild);
  let hell = [0, 0, 0], maxL = -1;
  for (let i = 0; i < png.data.length; i += 4) {
    const px = [png.data[i], png.data[i + 1], png.data[i + 2]];
    const l = leuchtkraft(px);
    if (l > maxL) { maxL = l; hell = px; }
  }
  const f = m.farbe.match(/\d+/g).slice(0, 3).map(Number);
  const v = verhaeltnis(f, hell);
  melde(v < 1.05, `Gegenprobe Messwerkzeug: ohne Ausblendung ${v.toFixed(2)}:1 (erwartet ~1.00)`);
  await ctx.close();
}

await browser.close();
console.log(`\n${gruen} ok, ${rot} rot`);
process.exit(rot ? 1 : 0);
