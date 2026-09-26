import { setzeGlobalenZugang, BASIS, abs, PRAEFIX } from './zugang.mjs';
// Die Vorschau haengt hinter einer Passwortschranke - ohne diese Zeile
// misst der Pruefstand nur 401-Antworten.
setzeGlobalenZugang();
/**
 * Jeder interne Link auf jeder Seite muss wirklich antworten.
 *
 * Warum eigens: Der Durchstich prueft die Seiten aus der SITEMAP. Ein Link
 * kann aber auf etwas zeigen, das gar nicht in der Sitemap steht - ein
 * Tippfehler im href, ein umbenannter Slug, ein Verweis auf eine Seite, die
 * es nie gab. Das faellt erst auf, wenn jemand klickt. Und wenn Niclas die
 * Seite gerade jemandem zeigt, ist das der schlechteste Zeitpunkt dafuer.
 */
// Adressen kommen aus zugang.mjs - dort steckt die Unterscheidung
// zwischen Pfaden MIT und OHNE /ct-Praefix.
let rot = 0, gruen = 0;
const melde = (ok, text) => { ok ? gruen++ : rot++; console.log(`${ok ? ' ok ' : 'ROT '} ${text}`); };

const sm = await (await fetch(abs(`/sitemap.xml`))).text();
const seiten = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, '') || '/');
melde(seiten.length >= 90, `${seiten.length} Seiten aus der Sitemap`);

const ziele = new Map();   // pfad -> Seiten, die darauf verlinken
const bilder = new Set();
for (const p of seiten) {
  const r = await fetch(abs(p));
  if (!r.ok) { melde(false, `${p} antwortet ${r.status}`); continue; }
  const h = await r.text();
  for (const m of h.matchAll(/href="(\/[^"#?]*)"/g)) {
    const z = m[1];
    if (z.startsWith('/_next') || z.startsWith('/api')) continue;
    (ziele.get(z) || ziele.set(z, []).get(z)).push(p);
  }
  for (const m of h.matchAll(/\/_next\/image\?url=([^&"]+)/g)) bilder.add(decodeURIComponent(m[1]));
}
melde(ziele.size > 0, `${ziele.size} verschiedene interne Linkziele gefunden`);

const kaputt = [];
for (const [z, von] of ziele) {
  const r = await fetch(abs(z), { method: 'HEAD' });
  if (!r.ok) kaputt.push(`${z} (${r.status}) — verlinkt von ${von.length} Seite(n), z.B. ${von[0]}`);
}
melde(kaputt.length === 0,
  kaputt.length === 0
    ? `Alle ${ziele.size} internen Linkziele antworten`
    : `${kaputt.length} totes Linkziel(e): ${kaputt.slice(0, 5).join(' | ')}`);

// Gegenprobe: ein erfundenes Ziel MUSS als tot erkannt werden.
{
  const r = await fetch(abs(`/gibt-es-nicht-zeus-probe`), { method: 'HEAD' });
  melde(!r.ok, `Gegenprobe: erfundene Adresse antwortet ${r.status} (erwartet 404)`);
}

const bildFehler = [];
for (const b of [...bilder]) {
  const r = await fetch(abs(b), { method: 'HEAD' });
  if (!r.ok) bildFehler.push(`${b} (${r.status})`);
}
melde(bildFehler.length === 0,
  bildFehler.length === 0
    ? `Alle ${bilder.size} eingebundenen Bilder sind abrufbar`
    : `${bildFehler.length} fehlende Bilddatei(en): ${bildFehler.slice(0, 4).join(' | ')}`);

// Jede Seite muss von mindestens einer anderen erreichbar sein - sonst ist
// sie nur ueber die Sitemap auffindbar und fuer Besucher eine Waise.
{
  // Linkziele tragen das Praefix, Sitemap-Pfade nicht - vor dem Vergleich
  // auf eine Form bringen, sonst gilt jede Seite als verwaist.
  const ohne = (p) => (PRAEFIX && p.startsWith(PRAEFIX)) ? (p.slice(PRAEFIX.length) || '/') : p;
  const verlinkt = new Set([...ziele.keys()].map(ohne));
  const waisen = seiten.filter((p) => p !== '/' && !verlinkt.has(p));
  melde(waisen.length === 0,
    waisen.length === 0
      ? 'Keine verwaiste Seite - jede ist intern verlinkt'
      : `${waisen.length} Seite(n) ohne eingehenden Link: ${waisen.slice(0, 6).join(', ')}`);
}

console.log(`\n${gruen} ok, ${rot} rot`);
process.exit(rot ? 1 : 0);
