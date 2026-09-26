/**
 * Faengt Tailwind-Klassen ab, die still ausfallen.
 *
 * DER FALL, DER DAS AUSGELOEST HAT (22.09.2026): `from-bark-950/92`. Tailwind 3
 * kennt nur eine feste Opazitaetsskala in Fuenferschritten - 92 ist nicht
 * darin. Die Klasse wird also gar nicht erzeugt, der Browser meldet nichts,
 * und weil `from-` fehlt, bleibt der GANZE Verlauf wirkungslos. Sichtbar war
 * das nur an einem Kontrastwert, der ploetzlich schlechter wurde.
 * Vier solcher Klassen waren im Bestand, eine davon der Hintergrund des
 * Handy-Menues - das Menue lag also durchsichtig ueber dem Foto.
 *
 * Diese Pruefung arbeitet auf zwei Wegen, weil eine Quelle nicht reicht:
 *   1. Quelltext gegen die erlaubte Skala (findet den Fehler vor dem Bau)
 *   2. Jede benutzte Klasse muss im GEBAUTEN CSS vorkommen (findet auch
 *      Tippfehler und Klassen, die aus anderen Gruenden wegfallen)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// import.meta.dirname gibt es erst ab Node 20.11 - hier laeuft 18.20.8.
const WURZEL = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKALA = new Set([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]);

let rot = 0, gruen = 0;
const melde = (ok, text) => { ok ? gruen++ : rot++; console.log(`${ok ? ' ok ' : 'ROT '} ${text}`); };

function dateien(dir, treffer = []) {
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) dateien(p, treffer);
    else if (/\.(tsx|ts|css)$/.test(e)) treffer.push(p);
  }
  return treffer;
}

// --- Weg 1: Opazitaetsskala im Quelltext -----------------------------------
const quellen = dateien(path.join(WURZEL, 'src'));
const verstoesse = [];
for (const f of quellen) {
  const text = readFileSync(f, 'utf8');
  for (const m of text.matchAll(/\b(bg|from|via|to|text|border|ring|shadow|divide|placeholder)-([a-z]+)-(\d+)\/(\d+)\b/g)) {
    const op = Number(m[4]);
    if (!SKALA.has(op)) verstoesse.push(`${path.relative(WURZEL, f)}: ${m[0]}`);
  }
}
melde(verstoesse.length === 0,
  verstoesse.length === 0
    ? 'Alle Farb-Opazitaeten liegen in der Tailwind-Skala'
    : `${verstoesse.length} Klasse(n) ausserhalb der Skala: ${verstoesse.join(', ')}`);

// Gegenprobe zum Pruefwerkzeug: ein bewusst falscher Wert MUSS auffallen.
// Ohne diese Probe waere "0 Verstoesse" auch dann gruen, wenn das Muster
// gar nicht mehr passt.
{
  const gift = 'from-bark-950/92 bg-frost-500/37';
  const gefunden = [...gift.matchAll(/\b(bg|from|via|to)-([a-z]+)-(\d+)\/(\d+)\b/g)]
    .filter((m) => !SKALA.has(Number(m[4]))).length;
  melde(gefunden === 2, `Gegenprobe: Pruefmuster erkennt 2 erfundene Verstoesse (erkannt: ${gefunden})`);
}

// --- Weg 2: benutzte Verlaufs-Klassen im gebauten CSS ----------------------
const cssDir = path.join(WURZEL, '.next', 'static', 'css');
let css = '';
try {
  for (const f of readdirSync(cssDir)) if (f.endsWith('.css')) css += readFileSync(path.join(cssDir, f), 'utf8');
} catch {
  melde(false, `Kein gebautes CSS unter ${path.relative(WURZEL, cssDir)} - erst "npm run build" laufen lassen`);
}

if (css) {
  const benutzt = new Set();
  for (const f of quellen) {
    const text = readFileSync(f, 'utf8');
    for (const m of text.matchAll(/\b(from|via|to)-[a-z]+-\d+\/\d+\b/g)) benutzt.add(m[0]);
  }
  const fehlend = [...benutzt].filter((k) => !css.includes(k.replace('/', '\\/')));
  melde(fehlend.length === 0,
    fehlend.length === 0
      ? `Alle ${benutzt.size} benutzten Verlaufs-Klassen stehen im gebauten CSS`
      : `Im CSS fehlen: ${fehlend.join(', ')}`);

  // Gegenprobe: eine Klasse, die niemand benutzt, darf auch nicht im CSS sein.
  melde(!css.includes('from-bark-950\\/92'),
    'Gegenprobe: der ausgebaute Fehlwert from-bark-950/92 steht nicht mehr im CSS');
}

console.log(`\n${gruen} ok, ${rot} rot`);
process.exit(rot ? 1 : 0);
